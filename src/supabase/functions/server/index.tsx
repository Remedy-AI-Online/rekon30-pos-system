// @ts-nocheck
// This file is for Supabase Edge Functions (Deno runtime)
// TypeScript errors are expected here as these are Deno-specific imports

import { Hono } from "https://esm.sh/hono@3.12.8";
import { cors } from "https://esm.sh/hono@3.12.8/cors";
import { logger } from "https://esm.sh/hono@3.12.8/logger";
import * as kv from "./kv_store.tsx";
import { reportScheduler } from "./scheduler.tsx";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const app = new Hono();

// Supabase client for admin operations
const supabase = createClient(
  (globalThis as any).Deno?.env?.get('SUPABASE_URL') ?? '',
  (globalThis as any).Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-86b98184/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to extract business_id from auth token
async function getBusinessIdFromToken(c: any): Promise<string | null> {
  try {
    const authHeader = c.req.header('Authorization');
    console.log("Auth header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No valid auth header found");
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log("Token extracted:", token.substring(0, 20) + "...");
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    console.log("User data:", user);
    console.log("User metadata:", user?.user_metadata);
    
    if (error || !user) {
      console.log("Error getting user:", error);
      return null;
    }
    
    const businessId = user.user_metadata?.business_id || null;
    console.log("Business ID extracted:", businessId);
    // Force redeploy
    return businessId;
  } catch (error) {
    console.error('Error extracting business_id from token:', error);
    return null;
  }
}

// Save sale data
app.post("/make-server-86b98184/sales", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const saleData = await c.req.json();
    const saleKey = `sale_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add timestamp, date info, and business_id
    const enrichedSale = {
      ...saleData,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      id: saleKey,
      business_id: businessId
    };
    
    await kv.set(saleKey, enrichedSale);
    
    // Update inventory for sold items
    if (saleData.items && saleData.items.length > 0) {
      for (const item of saleData.items) {
        const productKey = `product_${businessId}_${item.id}`;
        const product = await kv.get(productKey);
        if (product) {
          product.stock = (product.stock || 0) - item.quantity;
          // Update status based on new stock
          if (product.stock === 0) {
            product.status = "Out of Stock";
          } else if (product.stock < 10) {
            product.status = "Low Stock";
          } else {
            product.status = "In Stock";
          }
          product.updatedAt = new Date().toISOString();
          await kv.set(productKey, product);
        }
      }
    }
    
    // Auto-save customer if provided
    if (saleData.customer && saleData.customer.name) {
      const existingCustomers = await kv.getByPrefix(`customer_${businessId}_`);
      const customerExists = existingCustomers.find(c => 
        (c.value.phone && saleData.customer.phone && c.value.phone === saleData.customer.phone) ||
        (c.value.email && saleData.customer.email && c.value.email === saleData.customer.email)
      );
      
      if (!customerExists) {
        const customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const customerData = {
          ...saleData.customer,
          id: customerId,
          business_id: businessId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await kv.set(`customer_${businessId}_${customerId}`, customerData);
        console.log('Auto-saved new customer:', customerId, customerData.name);
      } else {
        console.log('Customer already exists, skipping auto-save');
      }
    }
    
    // Also save to daily summary for quick access
    const dateKey = `daily_${businessId}_${enrichedSale.date}`;
    const existingDaily = await kv.get(dateKey) || { sales: [], totalAmount: 0, totalTransactions: 0 };
    
    existingDaily.sales.push(enrichedSale);
    existingDaily.totalAmount += saleData.total;
    existingDaily.totalTransactions += 1;
    existingDaily.lastUpdated = new Date().toISOString();
    
    await kv.set(dateKey, existingDaily);
    
    return c.json({ success: true, saleId: saleKey });
  } catch (error) {
    console.log("Error saving sale:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get sales for a specific date
app.get("/make-server-86b98184/sales/:date", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const date = c.req.param("date");
    const dailyData = await kv.get(`daily_${businessId}_${date}`);
    
    return c.json({ success: true, data: dailyData || { sales: [], totalAmount: 0, totalTransactions: 0 } });
  } catch (error) {
    console.log("Error fetching sales:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get sales for date range
app.get("/make-server-86b98184/sales-range/:startDate/:endDate", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const startDate = c.req.param("startDate");
    const endDate = c.req.param("endDate");
    
    const salesData: any[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dailyData = await kv.get(`daily_${businessId}_${dateStr}`);
      if (dailyData) {
        salesData.push({ date: dateStr, ...dailyData });
      }
    }
    
    return c.json({ success: true, data: salesData });
  } catch (error) {
    console.log("Error fetching sales range:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Generate daily report as CSV
app.get("/make-server-86b98184/daily-report/:date", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const date = c.req.param("date");
    const dailyData = await kv.get(`daily_${businessId}_${date}`);
    
    if (!dailyData || !dailyData.sales.length) {
      return c.json({ success: false, error: "No sales data for this date" }, 404);
    }
    
    // Generate CSV content
    const headers = "Time,Receipt ID,Customer Name,Customer Phone,Items,Payment Method,Total Amount\n";
    
    const csvRows = dailyData.sales.map(sale => {
      const time = new Date(sale.timestamp).toLocaleTimeString();
      const items = sale.items.map(item => `${item.name} (${item.size}) x${item.quantity}`).join('; ');
      
      return [
        time,
        sale.receiptId || sale.id,
        sale.customer?.name || 'N/A',
        sale.customer?.phone || 'N/A',
        `"${items}"`,
        sale.paymentMethod,
        sale.total
      ].join(',');
    });
    
    const csvContent = headers + csvRows.join('\n');
    
    // Add summary at the end
    const summary = `\n\nDAILY SUMMARY\nTotal Transactions,${dailyData.totalTransactions}\nTotal Amount,${dailyData.totalAmount}\nDate,${date}`;
    
    const fullCsv = csvContent + summary;
    
    return new Response(fullCsv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="daily-report-${date}.csv"`
      }
    });
  } catch (error) {
    console.log("Error generating report:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Auto-generate and save daily report
app.post("/make-server-86b98184/generate-auto-report", async (c) => {
  try {
    const { date, shopInfo } = await c.req.json();
    const reportDate = date || new Date().toISOString().split('T')[0];
    
    const dailyData = await kv.get(`daily_${reportDate}`);
    
    if (!dailyData || !dailyData.sales.length) {
      return c.json({ success: false, error: "No sales data for this date" });
    }
    
    // Generate comprehensive report
    const report = {
      date: reportDate,
      shopInfo: shopInfo || { name: "Latex Foam Shop", location: "Main Branch" },
      summary: {
        totalTransactions: dailyData.totalTransactions,
        totalAmount: dailyData.totalAmount,
        averageTransaction: dailyData.totalAmount / dailyData.totalTransactions
      },
      sales: dailyData.sales,
      generatedAt: new Date().toISOString()
    };
    
    // Save the compiled report
    const reportKey = `report_${reportDate}`;
    await kv.set(reportKey, report);
    
    return c.json({ success: true, report });
  } catch (error) {
    console.log("Error generating auto report:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get all daily reports for uncle's dashboard
app.get("/make-server-86b98184/all-reports", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    // Get all report keys for this business
    const reportKeys = await kv.getByPrefix(`report_${businessId}_`);
    console.log("Found report keys:", reportKeys.length);
    
    const reports = reportKeys.map(report => ({
      date: report.key.replace(`report_${businessId}_`, ''),
      ...report.value
    }));
    
    // Sort by date descending
    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log("Returning reports:", reports.length);
    return c.json({ success: true, reports });
  } catch (error) {
    console.log("Error fetching all reports:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Manual trigger for daily report generation
app.post("/make-server-86b98184/trigger-daily-report", async (c) => {
  try {
    const result = await reportScheduler.generateDailyReports();
    return c.json(result);
  } catch (error) {
    console.log("Error triggering daily report:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update shop settings for auto-reporting
app.post("/make-server-86b98184/shop-settings", async (c) => {
  try {
    const settings = await c.req.json();
    const result = await reportScheduler.updateShopSettings(settings);
    return c.json(result);
  } catch (error) {
    console.log("Error updating shop settings:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get current shop settings
app.get("/make-server-86b98184/shop-settings", async (c) => {
  try {
    const settings = await kv.get('shop_settings') || {
      name: "Uncle's Latex Foam Shop",
      managerEmail: "uncle@latexfoam.com", 
      managerPhone: "+1234567890",
      timezone: "America/New_York",
      reportTime: "18:00",
      autoReportEnabled: true
    };
    return c.json({ success: true, settings });
  } catch (error) {
    console.log("Error fetching shop settings:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PRODUCTS MANAGEMENT
// Get all products
app.get("/make-server-86b98184/products", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const products = await kv.getByPrefix(`product_${businessId}_`);
    const productList = products.map(p => ({ 
      id: p.key.replace(`product_${businessId}_`, ''), 
      ...p.value,
      // Add default bargaining fields if they don't exist
      bargainingEnabled: p.value.bargainingEnabled || false,
      minBargainPrice: p.value.minBargainPrice || null,
      maxBargainPrice: p.value.maxBargainPrice || null
    }));
    return c.json({ success: true, products: productList });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add/Update product
app.post("/make-server-86b98184/products", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const product = await c.req.json();
    const productId = product.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const productData = {
      ...product,
      id: productId,
      business_id: businessId,
      updatedAt: new Date().toISOString(),
      createdAt: product.createdAt || new Date().toISOString()
    };
    
    await kv.set(`product_${businessId}_${productId}`, productData);
    return c.json({ success: true, product: productData });
  } catch (error) {
    console.log("Error saving product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete product
app.delete("/make-server-86b98184/products/:id", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const productId = c.req.param("id");
    await kv.del(`product_${businessId}_${productId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// AUTHENTICATION & CASHIER MANAGEMENT
// Create admin user (run once)
app.post("/make-server-86b98184/auth/create-admin", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: name || 'Administrator'
      }
    });

    if (error) {
      return c.json({ success: false, error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log("Error creating admin:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create cashier login credentials
app.post("/make-server-86b98184/auth/create-cashier", async (c) => {
  try {
    const { workerId, workerName, shopId, shopName } = await c.req.json();
    
    // Generate credentials
    const cashierId = `CSH${Date.now().toString().slice(-6)}`;
    const password = generatePassword();
    const email = `${cashierId.toLowerCase()}@${shopId.toLowerCase().replace(/\s/g, '')}.local`;
    
    console.log('=== Creating cashier ===');
    console.log('Worker ID:', workerId);
    console.log('Worker Name:', workerName);
    console.log('Shop ID:', shopId);
    console.log('Shop Name:', shopName);
    console.log('Generated Cashier ID:', cashierId);
    console.log('Generated Email:', email);
    console.log('Generated Password:', password);
    
    // Create Supabase auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'cashier',
        name: workerName,
        shopId,
        shopName,
        cashierId,
        workerId,
        active: true
      }
    });

    if (error) {
      console.log('❌ Supabase auth error:', error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    console.log('✅ Cashier auth user created successfully');
    console.log('Supabase User ID:', data.user.id);
    console.log('User Email:', data.user.email);
    console.log('User Metadata:', data.user.user_metadata);

    // Store cashier record
    const cashierData = {
      id: cashierId,
      userId: data.user.id,
      workerId,
      workerName,
      shopId,
      shopName,
      email,
      password, // Store for admin to view (in production, never store plain passwords)
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0
    };

    await kv.set(`cashier_${cashierId}`, cashierData);

    // Update worker record with cashier info
    const worker = await kv.get(`worker_${workerId}`);
    if (worker) {
      worker.cashierId = cashierId;
      worker.hasLogin = true;
      await kv.set(`worker_${workerId}`, worker);
    }

    return c.json({ 
      success: true, 
      credentials: {
        shopId,
        cashierId,
        password,
        email
      },
      cashier: cashierData
    });
  } catch (error) {
    console.log("Error creating cashier:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Debug endpoint - verify cashier credentials
app.post("/make-server-86b98184/auth/debug-cashier", async (c) => {
  try {
    const { shopId, cashierId } = await c.req.json();
    const email = `${cashierId.toLowerCase()}@${shopId.toLowerCase().replace(/\s/g, '')}.local`;
    
    console.log('=== Debug Cashier Lookup ===');
    console.log('Shop ID:', shopId);
    console.log('Cashier ID:', cashierId);
    console.log('Constructed Email:', email);
    
    // Check if cashier exists in KV store
    const cashierData = await kv.get(`cashier_${cashierId}`);
    
    if (cashierData) {
      console.log('✅ Found cashier in KV store');
      console.log('Stored Email:', cashierData.email);
      console.log('Active:', cashierData.active);
      console.log('User ID:', cashierData.userId);
      
      // Try to get the Supabase user
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(cashierData.userId);
        
        if (authError) {
          console.log('❌ Error fetching Supabase user:', authError);
          return c.json({ 
            success: true, 
            found: true,
            kvData: cashierData,
            supabaseUser: null,
            supabaseError: authError.message
          });
        }
        
        console.log('✅ Found Supabase user');
        console.log('Supabase Email:', authUser.user.email);
        console.log('Email Confirmed:', authUser.user.email_confirmed_at);
        console.log('User Metadata:', authUser.user.user_metadata);
        
        return c.json({ 
          success: true, 
          found: true,
          kvData: cashierData,
          supabaseUser: {
            email: authUser.user.email,
            emailConfirmed: !!authUser.user.email_confirmed_at,
            metadata: authUser.user.user_metadata
          }
        });
      } catch (supaError) {
        console.log('❌ Exception fetching Supabase user:', supaError);
        return c.json({ 
          success: true, 
          found: true,
          kvData: cashierData,
          supabaseUser: null,
          supabaseError: String(supaError)
        });
      }
    } else {
      console.log('❌ Cashier not found in KV store');
      
      // List all cashiers to help debug
      const allCashiers = await kv.getByPrefix("cashier_");
      console.log('Available cashier IDs:', allCashiers.map(c => c.value.id));
      
      return c.json({ 
        success: true, 
        found: false,
        availableCashierIds: allCashiers.map(c => c.value.id)
      });
    }
  } catch (error) {
    console.log("Error in debug endpoint:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get all cashiers
app.get("/make-server-86b98184/cashiers", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const cashiers = await kv.getByPrefix(`cashier_${businessId}_`);
    const cashierList = cashiers.map(c => c.value);
    console.log(`Found ${cashierList.length} cashiers in database for business ${businessId}`);
    return c.json({ success: true, cashiers: cashierList });
  } catch (error) {
    console.log("Error fetching cashiers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update cashier last login
app.post("/make-server-86b98184/cashiers/:id/login", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const cashierId = c.req.param("id");
    const cashier = await kv.get(`cashier_${businessId}_${cashierId}`);
    
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }

    cashier.lastLogin = new Date().toISOString();
    cashier.loginCount = (cashier.loginCount || 0) + 1;
    await kv.set(`cashier_${businessId}_${cashierId}`, cashier);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating login:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Deactivate cashier
app.post("/make-server-86b98184/cashiers/:id/deactivate", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const cashierId = c.req.param("id");
    const cashier = await kv.get(`cashier_${businessId}_${cashierId}`);
    
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }

    // Update Supabase user
    await supabase.auth.admin.updateUserById(cashier.userId, {
      user_metadata: { ...cashier, active: false }
    });

    // Update local record
    cashier.active = false;
    cashier.deactivatedAt = new Date().toISOString();
    await kv.set(`cashier_${businessId}_${cashierId}`, cashier);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error deactivating cashier:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Activate cashier
app.post("/make-server-86b98184/cashiers/:id/activate", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const cashierId = c.req.param("id");
    const cashier = await kv.get(`cashier_${businessId}_${cashierId}`);
    
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }

    // Update Supabase user
    await supabase.auth.admin.updateUserById(cashier.userId, {
      user_metadata: { ...cashier, active: true }
    });

    cashier.active = true;
    await kv.set(`cashier_${businessId}_${cashierId}`, cashier);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error activating cashier:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reset cashier password
app.post("/make-server-86b98184/cashiers/:id/reset-password", async (c) => {
  try {
    const cashierId = c.req.param("id");
    const cashier = await kv.get(`cashier_${cashierId}`);
    
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }

    const newPassword = generatePassword();

    // Update Supabase user password
    await supabase.auth.admin.updateUserById(cashier.userId, {
      password: newPassword
    });

    cashier.password = newPassword;
    cashier.passwordResetAt = new Date().toISOString();
    await kv.set(`cashier_${cashierId}`, cashier);

    return c.json({ success: true, newPassword });
  } catch (error) {
    console.log("Error resetting password:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Transfer cashier to another shop
app.post("/make-server-86b98184/cashiers/:id/transfer", async (c) => {
  try {
    const cashierId = c.req.param("id");
    const { newShopId, newShopName } = await c.req.json();
    
    const cashier = await kv.get(`cashier_${cashierId}`);
    
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }

    // Update Supabase user metadata
    await supabase.auth.admin.updateUserById(cashier.userId, {
      user_metadata: {
        ...cashier,
        shopId: newShopId,
        shopName: newShopName
      }
    });

    cashier.previousShopId = cashier.shopId;
    cashier.shopId = newShopId;
    cashier.shopName = newShopName;
    cashier.transferredAt = new Date().toISOString();
    await kv.set(`cashier_${cashierId}`, cashier);

    return c.json({ success: true, cashier });
  } catch (error) {
    console.log("Error transferring cashier:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Helper function to generate password
function generatePassword(): string {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// WORKERS MANAGEMENT
// Get all workers
app.get("/make-server-86b98184/workers", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const workers = await kv.getByPrefix(`worker_${businessId}_`);
    const workerList = workers.map(w => ({ id: w.key.replace(`worker_${businessId}_`, ''), ...w.value }));
    return c.json({ success: true, workers: workerList });
  } catch (error) {
    console.log("Error fetching workers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add worker
app.post("/make-server-86b98184/workers", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const worker = await c.req.json();
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workerData = {
      ...worker,
      id: workerId,
      business_id: businessId,
      hasLogin: false,
      cashierId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`worker_${businessId}_${workerId}`, workerData);
    return c.json({ success: true, worker: workerData });
  } catch (error) {
    console.log("Error saving worker:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update worker
app.put("/make-server-86b98184/workers/:id", async (c) => {
  try {
    const workerId = c.req.param("id");
    const updates = await c.req.json();
    
    const existingWorker = await kv.get(`worker_${workerId}`);
    if (!existingWorker) {
      return c.json({ success: false, error: "Worker not found" }, 404);
    }
    
    const updatedWorker = {
      ...existingWorker,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`worker_${workerId}`, updatedWorker);
    return c.json({ success: true, worker: updatedWorker });
  } catch (error) {
    console.log("Error updating worker:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete worker
app.delete("/make-server-86b98184/workers/:id", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const workerId = c.req.param("id");
    await kv.del(`worker_${businessId}_${workerId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting worker:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete customer
app.delete("/make-server-86b98184/customers/:id", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const customerId = c.req.param("id");
    await kv.del(`customer_${businessId}_${customerId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting customer:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete payroll record
app.delete("/make-server-86b98184/payroll/:id", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const payrollId = c.req.param("id");
    await kv.del(`payroll_${businessId}_${payrollId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete sale/order
app.delete("/make-server-86b98184/sales/:id", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const saleId = c.req.param("id");
    await kv.del(`sale_${businessId}_${saleId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting sale:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete cashier login
app.delete("/make-server-86b98184/cashiers/:id", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const cashierId = c.req.param("id");
    await kv.del(`cashier_${businessId}_${cashierId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting cashier:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CORRECTIONS MANAGEMENT
// Get all corrections
app.get("/make-server-86b98184/corrections", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const corrections = await kv.getByPrefix(`correction_${businessId}_`);
    const correctionList = corrections.map(c => ({ id: c.key.replace(`correction_${businessId}_`, ''), ...c.value }));
    // Sort by timestamp descending
    correctionList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ success: true, corrections: correctionList });
  } catch (error) {
    console.log("Error fetching corrections:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Submit correction
app.post("/make-server-86b98184/corrections", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const correction = await c.req.json();
    const correctionId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const correctionData = {
      ...correction,
      id: correctionId,
      business_id: businessId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    await kv.set(`correction_${businessId}_${correctionId}`, correctionData);
    return c.json({ success: true, correction: correctionData });
  } catch (error) {
    console.log("Error saving correction:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update correction status
app.put("/make-server-86b98184/corrections/:id", async (c) => {
  try {
    const correctionId = c.req.param("id");
    const updates = await c.req.json();
    
    const existingCorrection = await kv.get(`correction_${correctionId}`);
    if (!existingCorrection) {
      return c.json({ success: false, error: "Correction not found" }, 404);
    }
    
    const updatedCorrection = {
      ...existingCorrection,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`correction_${correctionId}`, updatedCorrection);
    return c.json({ success: true, correction: updatedCorrection });
  } catch (error) {
    console.log("Error updating correction:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CUSTOMERS MANAGEMENT
// Get all customers
app.get("/make-server-86b98184/customers", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const customers = await kv.getByPrefix(`customer_${businessId}_`);
    const customerList = customers.map(c => ({ 
      id: c.key.replace(`customer_${businessId}_`, ''), 
      ...c.value 
    }));
    console.log(`Fetched ${customerList.length} customers from database for business ${businessId}`);
    return c.json({ success: true, customers: customerList });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add customer
app.post("/make-server-86b98184/customers", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const customer = await c.req.json();
    const customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const customerData = {
      ...customer,
      id: customerId,
      business_id: businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`customer_${businessId}_${customerId}`, customerData);
    return c.json({ success: true, customer: customerData });
  } catch (error) {
    console.log("Error saving customer:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PAYROLL MANAGEMENT
// Get all payroll records
app.get("/make-server-86b98184/payroll", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const payrollRecords = await kv.getByPrefix(`payroll_${businessId}_`);
    const payrollList = payrollRecords.map(p => ({ id: p.key.replace(`payroll_${businessId}_`, ''), ...p.value }));
    return c.json({ success: true, payroll: payrollList });
  } catch (error) {
    console.log("Error fetching payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save payroll record
app.post("/make-server-86b98184/payroll", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const payroll = await c.req.json();
    const payrollId = payroll.id || `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payrollData = {
      ...payroll,
      id: payrollId,
      business_id: businessId,
      createdAt: payroll.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`payroll_${businessId}_${payrollId}`, payrollData);
    return c.json({ success: true, payroll: payrollData });
  } catch (error) {
    console.log("Error saving payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update payroll record
app.put("/make-server-86b98184/payroll/:id", async (c) => {
  try {
    const payrollId = c.req.param("id");
    const updates = await c.req.json();
    
    const existingPayroll = await kv.get(`payroll_${payrollId}`);
    if (!existingPayroll) {
      return c.json({ success: false, error: "Payroll not found" }, 404);
    }
    
    const updatedPayroll = {
      ...existingPayroll,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`payroll_${payrollId}`, updatedPayroll);
    return c.json({ success: true, payroll: updatedPayroll });
  } catch (error) {
    console.log("Error updating payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// INVENTORY UPDATE
app.post("/make-server-86b98184/update-inventory", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const { productId, quantityChange } = await c.req.json();
    
    const productKey = `product_${businessId}_${productId}`;
    const product = await kv.get(productKey);
    
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    
    product.stock = (product.stock || 0) + quantityChange;
    
    // Update status based on new stock
    if (product.stock === 0) {
      product.status = "Out of Stock";
    } else if (product.stock < 10) {
      product.status = "Low Stock";
    } else {
      product.status = "In Stock";
    }
    
    product.updatedAt = new Date().toISOString();
    await kv.set(productKey, product);
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error updating inventory:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PROFIT ANALYSIS
app.get("/make-server-86b98184/profit-analysis/:period", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const period = c.req.param("period"); // daily, weekly, monthly
    const today = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(today);
        break;
      case 'weekly':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today);
    }
    
    // Get all sales in the period
    const salesData: any[] = [];
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dailyData = await kv.get(`daily_${businessId}_${dateStr}`);
      if (dailyData && dailyData.sales) {
        salesData.push(...dailyData.sales);
      }
    }
    
    // Get all products for this business
    const products = await kv.getByPrefix(`product_${businessId}_`);
    const productMap = new Map(products.map(p => [p.value.id, p.value]));
    
    // Calculate profit per product
    const productProfits: any = {};
    let totalRevenue = 0;
    let totalCost = 0;
    
    salesData.forEach((sale: any) => {
      sale.items?.forEach((item: any) => {
        const product = productMap.get(item.id);
        if (product) {
          const revenue = item.price * item.quantity;
          const cost = (product.cost || 0) * item.quantity;
          const profit = revenue - cost;
          
          if (!productProfits[item.name]) {
            productProfits[item.name] = {
              name: item.name,
              revenue: 0,
              cost: 0,
              profit: 0,
              quantity: 0,
              margin: 0
            };
          }
          
          productProfits[item.name].revenue += revenue;
          productProfits[item.name].cost += cost;
          productProfits[item.name].profit += profit;
          productProfits[item.name].quantity += item.quantity;
          
          totalRevenue += revenue;
          totalCost += cost;
        }
      });
    });
    
    // Calculate profit margins
    Object.values(productProfits).forEach((pp: any) => {
      pp.margin = pp.revenue > 0 ? ((pp.profit / pp.revenue) * 100) : 0;
    });
    
    const totalProfit = totalRevenue - totalCost;
    const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;
    
    return c.json({
      success: true,
      analysis: {
        period,
        productProfits: Object.values(productProfits),
        overall: {
          revenue: totalRevenue,
          cost: totalCost,
          profit: totalProfit,
          margin: overallMargin
        }
      }
    });
  } catch (error) {
    console.log("Error calculating profit analysis:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DASHBOARD DATA
// Get dashboard summary
app.get("/make-server-86b98184/dashboard-summary", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get today's data
    const todayData = await kv.get(`daily_${businessId}_${today}`) || { sales: [], totalAmount: 0, totalTransactions: 0 };
    
    // Get yesterday's data for comparison
    const yesterdayData = await kv.get(`daily_${businessId}_${yesterday}`) || { sales: [], totalAmount: 0, totalTransactions: 0 };
    
    // Get recent sales (last 7 days)
    const salesData: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayData = await kv.get(`daily_${businessId}_${date}`) || { totalAmount: 0, totalTransactions: 0 };
      salesData.push({
        date,
        amount: dayData.totalAmount,
        transactions: dayData.totalTransactions
      });
    }
    
    // Get product count
    const products = await kv.getByPrefix(`product_${businessId}_`);
    
    // Get worker count
    const workers = await kv.getByPrefix(`worker_${businessId}_`);
    
    // Get customer count
    const customers = await kv.getByPrefix(`customer_${businessId}_`);
    
    // Get pending corrections count
    const corrections = await kv.getByPrefix(`correction_${businessId}_`);
    const pendingCorrections = corrections.filter(c => c.value.status === 'pending');
    
    // Get inventory value
    let inventoryValue = 0;
    let lowStockCount = 0;
    products.forEach(p => {
      inventoryValue += (p.value.stock || 0) * (p.value.cost || 0);
      if (p.value.status === 'Low Stock') lowStockCount++;
    });
    
    const summary = {
      today: {
        sales: todayData.totalAmount,
        transactions: todayData.totalTransactions,
        averageTransaction: todayData.totalTransactions > 0 ? todayData.totalAmount / todayData.totalTransactions : 0
      },
      yesterday: {
        sales: yesterdayData.totalAmount,
        transactions: yesterdayData.totalTransactions
      },
      growth: {
        sales: yesterdayData.totalAmount > 0 ? ((todayData.totalAmount - yesterdayData.totalAmount) / yesterdayData.totalAmount * 100) : 0,
        transactions: yesterdayData.totalTransactions > 0 ? ((todayData.totalTransactions - yesterdayData.totalTransactions) / yesterdayData.totalTransactions * 100) : 0
      },
      weeklyData: salesData,
      counts: {
        products: products.length,
        workers: workers.length,
        customers: customers.length,
        pendingCorrections: pendingCorrections.length,
        lowStockProducts: lowStockCount
      },
      inventory: {
        value: inventoryValue,
        lowStockCount
      }
    };
    
    return c.json({ success: true, summary });
  } catch (error) {
    console.log("Error fetching dashboard summary:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ENHANCED REPORTING
// Get shop-specific report
app.get("/make-server-86b98184/reports/shop/:shopId", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const shopId = c.req.param("shopId");
    const period = c.req.query("period") || "daily"; // daily, weekly, monthly
    const cashierId = c.req.query("cashier"); // optional filter by cashier
    
    const today = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today);
    }
    
    // Get all sales in the period for this business
    const allSales = await kv.getByPrefix(`sale_${businessId}_`);
    const filteredSales = allSales
      .map(s => s.value)
      .filter(sale => {
        const saleDate = new Date(sale.timestamp);
        const matchesDate = saleDate >= startDate && saleDate <= today;
        const matchesShop = sale.shopId === shopId;
        const matchesCashier = !cashierId || sale.cashierId === cashierId;
        return matchesDate && matchesShop && matchesCashier;
      });
    
    // Calculate totals
    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalTransactions = filteredSales.length;
    
    // Get most sold products
    const productSales: Record<string, any> = {};
    filteredSales.forEach(sale => {
      sale.items?.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.id].quantity += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });
    
    const mostSoldProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);
    
    // Sales by cashier
    const salesByCashier: Record<string, any> = {};
    filteredSales.forEach(sale => {
      const cashierId = sale.cashierId || 'Unknown';
      if (!salesByCashier[cashierId]) {
        salesByCashier[cashierId] = {
          cashierId,
          cashierName: sale.cashierName || 'Unknown',
          transactions: 0,
          totalSales: 0
        };
      }
      salesByCashier[cashierId].transactions++;
      salesByCashier[cashierId].totalSales += sale.total || 0;
    });
    
    return c.json({
      success: true,
      report: {
        shopId,
        period,
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
        totalSales,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
        mostSoldProducts,
        salesByCashier: Object.values(salesByCashier),
        sales: filteredSales
      }
    });
  } catch (error) {
    console.log("Error generating shop report:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Download Excel report
app.get("/make-server-86b98184/reports/download/:shopId", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const shopId = c.req.param("shopId");
    const period = c.req.query("period") || "daily";
    const format = c.req.query("format") || "csv"; // csv or excel
    
    // Get the report data (reusing the shop report logic)
    const today = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today);
    }
    
    const allSales = await kv.getByPrefix(`sale_${businessId}_`);
    const filteredSales = allSales
      .map(s => s.value)
      .filter(sale => {
        const saleDate = new Date(sale.timestamp);
        return saleDate >= startDate && saleDate <= today && sale.shopId === shopId;
      });
    
    // Generate CSV
    const headers = "Date,Time,Receipt ID,Cashier,Customer Name,Customer Phone,Items,Payment Method,Total\\n";
    
    const csvRows = filteredSales.map(sale => {
      const saleDate = new Date(sale.timestamp);
      const date = saleDate.toLocaleDateString();
      const time = saleDate.toLocaleTimeString();
      const items = sale.items?.map((item: any) => `${item.name} (${item.size}) x${item.quantity}`).join('; ') || '';
      
      return [
        date,
        time,
        sale.receiptId || sale.id,
        sale.cashierName || 'N/A',
        sale.customer?.name || 'N/A',
        sale.customer?.phone || 'N/A',
        `"${items}"`,
        sale.paymentMethod || 'N/A',
        sale.total || 0
      ].join(',');
    });
    
    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const summary = `\\n\\nSUMMARY\\nShop,${shopId}\\nPeriod,${period}\\nTotal Transactions,${filteredSales.length}\\nTotal Sales,${totalSales.toFixed(2)}\\nDate Generated,${new Date().toLocaleString()}`;
    
    const csvContent = headers + csvRows.join('\\n') + summary;
    
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${shopId}-${period}-report-${today.toISOString().split('T')[0]}.csv"`,
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.log("Error downloading report:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get all shops summary
app.get("/make-server-86b98184/reports/all-shops", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const period = c.req.query("period") || "daily";
    
    // Get all sales for this business
    const allSales = await kv.getByPrefix(`sale_${businessId}_`);
    
    // Get unique shops
    const shopSummary: Record<string, any> = {};
    
    const today = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today);
    }
    
    allSales.forEach(s => {
      const sale = s.value;
      const saleDate = new Date(sale.timestamp);
      
      if (saleDate >= startDate && saleDate <= today) {
        const shopId = sale.shopId || 'Unknown';
        
        if (!shopSummary[shopId]) {
          shopSummary[shopId] = {
            shopId,
            shopName: sale.shopName || shopId,
            transactions: 0,
            totalSales: 0,
            cashiers: new Set()
          };
        }
        
        shopSummary[shopId].transactions++;
        shopSummary[shopId].totalSales += sale.total || 0;
        if (sale.cashierId) {
          shopSummary[shopId].cashiers.add(sale.cashierId);
        }
      }
    });
    
    // Convert to array and format
    const summaryArray = Object.values(shopSummary).map((shop: any) => ({
      ...shop,
      activeCashiers: shop.cashiers.size,
      averageTransaction: shop.transactions > 0 ? shop.totalSales / shop.transactions : 0
    }));
    
    return c.json({
      success: true,
      period,
      shops: summaryArray,
      totalRevenue: summaryArray.reduce((sum: number, shop: any) => sum + shop.totalSales, 0)
    });
  } catch (error) {
    console.log("Error fetching all shops summary:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get real-time notifications (recent sales)
app.get("/make-server-86b98184/notifications", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const since = c.req.query("since"); // timestamp
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes by default
    
    const allSales = await kv.getByPrefix(`sale_${businessId}_`);
    const recentSales = allSales
      .map(s => s.value)
      .filter(sale => new Date(sale.timestamp) > sinceDate)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
    
    const notifications = recentSales.map(sale => ({
      id: sale.id,
      type: 'sale',
      shopId: sale.shopId,
      shopName: sale.shopName,
      cashierName: sale.cashierName,
      total: sale.total,
      timestamp: sale.timestamp,
      message: `New sale of ${sale.total} at ${sale.shopName} by ${sale.cashierName || 'Cashier'}`
    }));
    
    return c.json({ success: true, notifications });
  } catch (error) {
    console.log("Error fetching notifications:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DATA MANAGEMENT - Reset functionality
// Get last reset date
app.get("/make-server-86b98184/last-reset", async (c) => {
  try {
    const lastReset = await kv.get('last_reset_date') || { date: new Date().toISOString().split('T')[0] };
    return c.json({ success: true, lastReset });
  } catch (error) {
    console.log("Error getting last reset:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Trigger daily reset (usually done automatically but can be manual)
app.post("/make-server-86b98184/reset-daily-data", async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastReset = await kv.get('last_reset_date');
    
    // Check if already reset today
    if (lastReset && lastReset.date === today) {
      return c.json({ success: false, message: "Already reset today" });
    }
    
    // Update last reset date
    await kv.set('last_reset_date', { date: today, timestamp: new Date().toISOString() });
    
    // Note: We keep all sales data for historical reporting
    // The reset is more about marking the day boundary
    
    return c.json({ success: true, message: "Daily reset completed", date: today });
  } catch (error) {
    console.log("Error resetting daily data:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CUSTOM FEATURES MANAGEMENT
// Get all custom features for a business
app.get("/make-server-86b98184/custom-features", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    console.log("Custom features - Business ID:", businessId);
    
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const features = await kv.getByPrefix(`custom_feature_${businessId}_`);
    console.log("Custom features found for business:", Object.keys(features));
    
    const featureList = Object.values(features).map(feature => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      businessValue: feature.businessValue,
      status: feature.status,
      priority: feature.priority,
      estimatedCost: feature.estimatedCost || 0,
      estimatedTime: feature.estimatedTime || 'TBD',
      submittedDate: feature.submittedDate,
      updatedDate: feature.updatedDate,
      business_id: businessId
    }));
    
    console.log("Feature list for business:", featureList);
    return c.json({ success: true, features: featureList });
  } catch (error) {
    console.log("Error fetching custom features:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Submit a new custom feature request (fixed route - full path)
app.post("/make-server-86b98184/custom-features", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    console.log("Submit custom feature - Business ID:", businessId);
    
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const featureData = await c.req.json();
    console.log("Feature data received:", featureData);
    
    const featureId = `CF_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Generated feature ID:", featureId);
    
    const customFeature = {
      id: featureId,
      title: featureData.title,
      description: featureData.description,
      businessValue: featureData.businessValue,
      status: 'submitted',
      priority: featureData.priority || 'medium',
      estimatedCost: 0,
      estimatedTime: 'TBD',
      submittedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      business_id: businessId
    };
    
    console.log("Saving custom feature:", customFeature);
    const key = `custom_feature_${businessId}_${featureId}`;
    console.log("Saving with key:", key);
    
    await kv.set(key, customFeature);
    console.log("Custom feature saved successfully");
    
    // Force redeploy
    return c.json({ success: true, feature: customFeature });
  } catch (error) {
    console.log("Error creating custom feature:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update custom feature (for Super Admin)
app.put("/make-server-86b98184/custom-features/:id", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    const featureId = c.req.param('id');
    const updates = await c.req.json();
    
    const featureKey = `custom_feature_${businessId}_${featureId}`;
    const existingFeature = await kv.get(featureKey);
    
    if (!existingFeature) {
      return c.json({ success: false, error: 'Custom feature not found' }, 404);
    }
    
    const updatedFeature = {
      ...existingFeature,
      ...updates,
      updatedDate: new Date().toISOString().split('T')[0]
    };
    
    await kv.set(featureKey, updatedFeature);
    return c.json({ success: true, feature: updatedFeature });
  } catch (error) {
    console.log("Error updating custom feature:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// SUPER ADMIN - Get all custom feature requests from all businesses
app.get("/make-server-86b98184/super-admin/custom-features", async (c) => {
  try {
    const businessId = await getBusinessIdFromToken(c);
    console.log("Super Admin custom features - Business ID:", businessId);
    
    if (!businessId) {
      return c.json({ success: false, error: 'Business ID not found in token' }, 401);
    }
    
    // Check if this is a super admin business
    const business = await kv.get(`business_${businessId}`);
    console.log("Super Admin business data:", business);
    
    if (!business) {
      return c.json({ success: false, error: 'Business not found' }, 404);
    }
    
    // For now, allow any business to access this endpoint for debugging
    // if (business.role !== 'super_admin') {
    //   return c.json({ success: false, error: 'Super admin access required' }, 403);
    // }
    
    // Get all custom features from all businesses
    const allFeatures = await kv.getByPrefix('custom_feature_');
    console.log("All custom features found:", Object.keys(allFeatures));
    
    const featureList = Object.values(allFeatures).map(feature => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      businessValue: feature.businessValue,
      status: feature.status,
      priority: feature.priority,
      estimatedCost: feature.estimatedCost || 0,
      estimatedTime: feature.estimatedTime || 'TBD',
      submittedDate: feature.submittedDate,
      updatedDate: feature.updatedDate,
      business_id: feature.business_id
    }));
    
    console.log("Feature list:", featureList);
    return c.json({ success: true, features: featureList });
  } catch (error) {
    console.log("Error fetching all custom features:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Test endpoint (no auth required)
app.get("/test", async (c) => {
  return c.json({ success: true, message: "Edge Function is working!", timestamp: new Date().toISOString() });
});

// Test POST endpoint (no auth required)
app.post("/test-post", async (c) => {
  return c.json({ success: true, message: "POST endpoint is working!" });
});

// Simple custom features test endpoint (no auth)
app.post("/custom-features-test", async (c) => {
  return c.json({ success: true, message: "Custom features endpoint is working!" });
});

// Export for Deno runtime
if (typeof (globalThis as any).Deno !== 'undefined') {
  (globalThis as any).Deno.serve(app.fetch);
}