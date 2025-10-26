/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck: Deno runtime with ESM imports - TypeScript errors expected
// This file is for Supabase Edge Functions (Deno runtime)
// TypeScript errors are expected here as these are Deno-specific imports

import { Hono } from "https://esm.sh/hono@3.12.8";
import { cors } from "https://esm.sh/hono@3.12.8/cors";
import { logger } from "https://esm.sh/hono@3.12.8/logger";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const app = new Hono();

// Supabase client for admin operations
const supabase = createClient(
  (globalThis as unknown as { Deno?: { env?: { get: (key: string) => string } } }).Deno?.env?.get('SUPABASE_URL') ?? '',
  (globalThis as unknown as { Deno?: { env?: { get: (key: string) => string } } }).Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

// Helper function to get business_id from auth token
async function getBusinessIdFromAuth(c: any): Promise<string | null> {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      console.log('⚠️  No auth header found');
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('⚠️  No user found from token');
      return null;
    }
    
    const businessId = user.user_metadata?.business_id;
    console.log('✅ Business ID from auth:', businessId);
    return businessId || null;
  } catch (error) {
    console.error('❌ Error getting business ID:', error);
    return null;
  }
}

// KV Store functions with better error handling
const kv = {
  set: async (key: string, value: unknown): Promise<void> => {
    try {
      const { error } = await supabase.from("kv_store_86b98184").upsert({
        key,
        value
      });
      if (error) {
        console.error("KV Store set error:", error);
        throw new Error(`Failed to save data: ${error.message}`);
      }
    } catch (error) {
      console.error("KV Store set error:", error);
      throw error;
    }
  },

  get: async (key: string): Promise<unknown> => {
    try {
      const { data, error } = await supabase.from("kv_store_86b98184").select("value").eq("key", key).maybeSingle();
      if (error) {
        console.error("KV Store get error:", error);
        throw new Error(`Failed to retrieve data: ${error.message}`);
      }
      return data?.value;
    } catch (error) {
      console.error("KV Store get error:", error);
      throw error;
    }
  },

  del: async (key: string): Promise<void> => {
    try {
      const { error } = await supabase.from("kv_store_86b98184").delete().eq("key", key);
      if (error) {
        console.error("KV Store delete error:", error);
        throw new Error(`Failed to delete data: ${error.message}`);
      }
    } catch (error) {
      console.error("KV Store delete error:", error);
      throw error;
    }
  },

  getByPrefix: async (prefix: string): Promise<{ key: string, value: unknown }[]> => {
    try {
      const { data, error } = await supabase.from("kv_store_86b98184").select("key, value").like("key", prefix + "%");
      if (error) {
        console.error("KV Store getByPrefix error:", error);
        throw new Error(`Failed to retrieve data: ${error.message}`);
      }
      return data ?? [];
    } catch (error) {
      console.error("KV Store getByPrefix error:", error);
      throw error;
    }
  }
};

// AUTHENTICATION ENDPOINTS
// Create admin account
app.post("/make-server-86b98184/auth/create-admin", async (c) => {
  try {
    const { email, password, name, role = 'admin' } = await c.req.json();
    
    // Create user in Supabase Auth with email confirmation disabled
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: role,
        name: name,
        active: true
      }
    });

    if (authError) {
      return c.json({ success: false, error: authError.message }, 400);
    }

    // If super_admin, also create record in super_admins table
    if (role === 'super_admin') {
      const { error: superAdminError } = await supabase
        .from('super_admins')
        .insert({
          id: authData.user.id,
          email: email,
          name: name,
          role: 'super_admin'
        });

      if (superAdminError) {
        console.log("Warning: Could not create super_admin record:", superAdminError.message);
      }
    }

  return c.json({ 
    success: true, 
    message: `${role} account created successfully`,
    user: {
      id: authData.user.id,
      email: authData.user.email,
      role: role,
      name: name
    }
  });
} catch (error) {
  console.log("Error creating admin:", error);
  return c.json({ success: false, error: error.message }, 500);
}
});

// Login endpoint
app.post("/make-server-86b98184/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return c.json({ success: false, error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ success: false, error: "No user found" }, 400);
    }

    // Construct user object with role from metadata
    const user = {
      id: authData.user.id,
      email: authData.user.email || '',
      role: authData.user.user_metadata?.role || 'admin',
      name: authData.user.user_metadata?.name || '',
      shopId: authData.user.user_metadata?.shopId,
      shopName: authData.user.user_metadata?.shopName,
      cashierId: authData.user.user_metadata?.cashierId,
      active: authData.user.user_metadata?.active !== false
    };

    return c.json({ 
      success: true, 
      user: user,
      accessToken: authData.session?.access_token
    });
  } catch (error) {
    console.log("Error during login:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user role endpoint
app.post("/make-server-86b98184/auth/update-user-role", async (c) => {
  try {
    const { email, role } = await c.req.json();
    
    // Update user metadata in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      email, // This should be the user ID, but we'll find by email first
      {
        user_metadata: {
          role: role
        }
      }
    );

    if (authError) {
      return c.json({ success: false, error: authError.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: "User role updated successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role
      }
    });
  } catch (error) {
    console.log("Error updating user role:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Debug cashier endpoint
app.post("/make-server-86b98184/auth/debug-cashier", async (c) => {
  try {
    const { shopId, cashierId } = await c.req.json();
    
    // Get all cashiers
    const cashiers = await kv.getByPrefix("cashier_");
    const availableCashierIds = cashiers.map(c => c.value.id);
    
    // Find specific cashier
    const cashier = cashiers.find(c => 
      c.value.id === cashierId && c.value.shopId === shopId
    );
    
    if (!cashier) {
      return c.json({ 
        found: false, 
        availableCashierIds,
        message: "Cashier not found"
      });
    }
    
    return c.json({ 
      found: true, 
      cashier: cashier.value,
      availableCashierIds
    });
  } catch (error) {
    console.log("Error debugging cashier:", error);
    return c.json({ 
      found: false, 
      supabaseError: error.message,
      availableCashierIds: []
    }, 500);
  }
});

// Update cashier login time
app.post("/make-server-86b98184/cashiers/:id/login", async (c) => {
  try {
    const cashierId = c.req.param("id");
    const cashier = await kv.get(`cashier_${cashierId}`);
    
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }
    
    const updatedCashier = {
      ...cashier,
      lastLogin: new Date().toISOString(),
      loginCount: (cashier.loginCount || 0) + 1
    };
    
    await kv.set(`cashier_${cashierId}`, updatedCashier);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating login:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save sale data (with business_id)
app.post("/make-server-86b98184/sales", async (c) => {
  try {
    const saleData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);
    
    if (!businessId) {
      return c.json({ success: false, error: "Business ID required" }, 400);
    }
    
    // Check for duplicate sales (same customer, same total, same day, same business)
    const existingSales = await kv.getByPrefix("sale_");
    const today = new Date().toISOString().split('T')[0];
    const duplicateSale = existingSales.find(sale => {
      const saleValue = sale.value;
      return saleValue.businessId === businessId && // Same business
             saleValue.date === today &&
             saleValue.customer?.name === saleData.customer?.name &&
             saleValue.customer?.phone === saleData.customer?.phone &&
             saleValue.total === saleData.total &&
             Math.abs(new Date(saleValue.timestamp).getTime() - Date.now()) < 5000 // Within 5 seconds
    });
    
    if (duplicateSale) {
      console.log("Duplicate sale detected, skipping creation");
      return c.json({ success: true, sale: duplicateSale.value, duplicate: true });
    }
    
    const saleKey = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add timestamp, date, and business info
    const enrichedSale = {
      ...saleData,
      businessId, // Link to business
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      id: saleKey
    };
    
    await kv.set(saleKey, enrichedSale);

    // ✅ AUTO-REDUCE STOCK for each item sold
    if (saleData.items && Array.isArray(saleData.items)) {
      for (const item of saleData.items) {
        if (item.id) {
          try {
            // Get current product
            const { data: product, error: fetchError } = await supabase
              .from('products')
              .select('*')
              .eq('id', item.id)
              .eq('business_id', businessId) // Ensure it's this business's product
              .single();

            if (!fetchError && product) {
              const newStock = Math.max(0, product.stock - item.quantity); // Don't go negative
              const lowStockThreshold = Math.ceil((product.original_stock || product.stock) * 0.2);

              // Update status based on new stock level
              let newStatus = 'Active';
              if (newStock === 0) {
                newStatus = 'Out of Stock';
              } else if (newStock <= lowStockThreshold) {
                newStatus = 'Low Stock';
              }

              // Update product stock and status
              const { error: updateError } = await supabase
                .from('products')
                .update({
                  stock: newStock,
                  status: newStatus,
                  updated_at: new Date().toISOString()
                })
                .eq('id', item.id)
                .eq('business_id', businessId);

              if (updateError) {
                console.error(`⚠️ Failed to reduce stock for product ${item.id}:`, updateError);
              } else {
                console.log(`✅ Stock reduced for ${item.name || item.id}: ${product.stock} → ${newStock} (Status: ${newStatus})`);
              }
            }
          } catch (stockError) {
            console.error(`⚠️ Error reducing stock for item ${item.id}:`, stockError);
            // Continue processing other items even if one fails
          }
        }
      }
    }

    // Auto-save customer if provided (with better duplicate prevention)
    if (saleData.customer && saleData.customer.name) {
      const existingCustomers = await kv.getByPrefix("customer_");
      const customerExists = existingCustomers.find(c => {
        const existing = c.value;
        const newCustomer = saleData.customer;

        // First check: exact name match (case insensitive)
        if (existing.name && newCustomer.name &&
            existing.name.toLowerCase().trim() === newCustomer.name.toLowerCase().trim()) {
          return true;
        }

        // Second check: phone match (if both have phone)
        if (existing.phone && newCustomer.phone &&
            existing.phone.replace(/\D/g, '') === newCustomer.phone.replace(/\D/g, '')) {
          return true;
        }

        // Third check: email match (if both have email)
        if (existing.email && newCustomer.email &&
            existing.email.toLowerCase().trim() === newCustomer.email.toLowerCase().trim()) {
          return true;
        }

        return false;
      });

      // Only create customer if it doesn't exist
      if (!customerExists) {
        const customerKey = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const customerData = {
          ...saleData.customer,
          id: customerKey,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await kv.set(customerKey, customerData);
        console.log(`New customer created: ${customerKey}`);
      } else {
        console.log(`Customer already exists, skipping creation`);
      }
    }
    
    console.log(`Sale saved: ${saleKey}`);
    return c.json({ success: true, sale: enrichedSale });
  } catch (error) {
    console.log("Error saving sale:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get sales data
app.get("/make-server-86b98184/sales", async (c) => {
  try {
    const sales = await kv.getByPrefix("sale_");
    const salesList = sales.map(s => ({ id: s.key.replace('sale_', ''), ...s.value }));
    salesList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ success: true, sales: salesList });
  } catch (error) {
    console.log("Error fetching sales:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get sales by date range (query parameters)
app.get("/make-server-86b98184/sales/range", async (c) => {
  try {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    
    if (!startDate || !endDate) {
      return c.json({ success: false, error: "startDate and endDate are required" }, 400);
    }
    
    const sales = await kv.getByPrefix("sale_");
    const filteredSales = sales.filter(sale => {
      const saleDate = sale.value.date;
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    // Group by date
    const groupedSales = {};
    filteredSales.forEach(sale => {
      const date = sale.value.date;
      if (!groupedSales[date]) {
        groupedSales[date] = [];
      }
      groupedSales[date].push(sale.value);
    });
    
    // Convert to array format
    const data = Object.keys(groupedSales).map(date => ({
      date,
      sales: groupedSales[date]
    }));
    
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching sales range:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get sales by date range (path parameters) - for dataService compatibility
app.get("/make-server-86b98184/sales-range/:startDate/:endDate", async (c) => {
  try {
    const startDate = c.req.param("startDate");
    const endDate = c.req.param("endDate");
    
    if (!startDate || !endDate) {
      return c.json({ success: false, error: "startDate and endDate are required" }, 400);
    }
    
    const sales = await kv.getByPrefix("sale_");
    const filteredSales = sales.filter(sale => {
      const saleDate = sale.value.date;
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    // Group by date
    const groupedSales = {};
    filteredSales.forEach(sale => {
      const date = sale.value.date;
      if (!groupedSales[date]) {
        groupedSales[date] = [];
      }
      groupedSales[date].push(sale.value);
    });
    
    // Convert to array format
    const data = Object.keys(groupedSales).map(date => ({
      date,
      sales: groupedSales[date]
    }));
    
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching sales range:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get sales for a specific date (filtered by business)
app.get("/make-server-86b98184/sales/:date", async (c) => {
  try {
    const date = c.req.param("date");
    const businessId = await getBusinessIdFromAuth(c);
    
    const sales = await kv.getByPrefix("sale_");
    let daySales = sales.filter(sale => sale.value.date === date);
    
    // Filter by business_id
    if (businessId) {
      daySales = daySales.filter(sale => sale.value.businessId === businessId);
    }
    
    const totalAmount = daySales.reduce((sum, sale) => sum + (sale.value.total || 0), 0);
    const totalTransactions = daySales.length;
    
    const data = {
      date,
      totalAmount,
      totalTransactions,
      lastUpdated: new Date().toISOString(),
      sales: daySales.map(s => s.value)
    };
    
    console.log(`🛒 Filtered ${totalTransactions} sales for business ${businessId} on ${date}`);
    
    return c.json({ success: true, data });
  } catch (error) {
    console.log("Error fetching sales for date:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PRODUCTS MANAGEMENT
// Get all products (filtered by business)
app.get("/make-server-86b98184/products", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);
    
    if (!businessId) {
      return c.json({ success: false, error: "Business ID required" }, 400);
    }
    
    // Query products from database with business_id filter
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log("Error fetching products from database:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`📦 Found ${products?.length || 0} products for business ${businessId}`);
    
    return c.json({ success: true, products: products || [] });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save product (with business_id)
app.post("/make-server-86b98184/products", async (c) => {
  try {
    const productData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);
    
    if (!businessId) {
      return c.json({ success: false, error: "Business ID required" }, 400);
    }
    
    // Calculate low stock threshold (20% of original stock)
    const stock = parseInt(productData.stock) || 0;
    const originalStock = parseInt(productData.original_stock) || stock; // Use provided or default to current stock
    const lowStockThreshold = Math.ceil(originalStock * 0.2); // 20% of original

    // Determine status based on stock level
    let status = 'Active';
    if (stock === 0) {
      status = 'Out of Stock';
    } else if (stock <= lowStockThreshold) {
      status = 'Low Stock';
    }

    // Insert product into database with business_id
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        business_id: businessId,
        original_stock: originalStock,
        stock: stock,
        status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.log("Error creating product in database:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`✅ Product created for business ${businessId}:`, product.id);
    
    return c.json({ success: true, product });
  } catch (error) {
    console.log("Error saving product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update product
app.put("/make-server-86b98184/products/:id", async (c) => {
  try {
    const productId = c.req.param("id");
    const productData = await c.req.json();
    const productKey = `product_${productId}`;
    
    const existingProduct = await kv.get(productKey);
    if (!existingProduct) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    
    const updatedProduct = {
      ...existingProduct,
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(productKey, updatedProduct);
    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log("Error updating product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete product
app.delete("/make-server-86b98184/products/:id", async (c) => {
  try {
    const productId = c.req.param("id");
    await kv.del(`product_${productId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// WORKERS MANAGEMENT
// Get all workers (filtered by business)
app.get("/make-server-86b98184/workers", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required. Please login as admin." }, 401);
    }

    // Query workers for this specific business
    const { data: workers, error } = await supabase
      .from('workers')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log("Error fetching workers from database:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`👥 Found ${workers?.length || 0} workers for business ${businessId}`);

    // Check which workers have cashier logins
    const workerIds = workers?.map(w => w.id) || [];
    const { data: cashiers } = await supabase
      .from('cashiers')
      .select('worker_id')
      .in('worker_id', workerIds);

    const cashierWorkerIds = new Set(cashiers?.map(c => c.worker_id) || []);

    // Transform to match expected format
    const formattedWorkers = workers?.map(worker => ({
      ...worker,
      hireDate: worker.hire_date,
      shopId: worker.shop_id,
      shopName: worker.shop_name,
      hasLogin: cashierWorkerIds.has(worker.id)
    })) || [];

    return c.json({ success: true, workers: formattedWorkers });
  } catch (error) {
    console.log("Error fetching workers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save worker (with business_id)
app.post("/make-server-86b98184/workers", async (c) => {
  try {
    const workerData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required. Please login as admin." }, 401);
    }

    // Validate required fields
    if (!workerData.name || !workerData.phone || !workerData.position || !workerData.shop_id || !workerData.shop_name || !workerData.salary || !workerData.hire_date) {
      return c.json({ success: false, error: "Missing required fields (name, phone, position, shop_id, shop_name, salary, hire_date)" }, 400);
    }

    // Insert worker into database with business_id
    const { data: worker, error } = await supabase
      .from('workers')
      .insert({
        ...workerData,
        business_id: businessId,  // Tie worker to this admin's business
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log("Error creating worker in database:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`✅ Worker created for business ${businessId}, shop ${workerData.shop_id}:`, worker.id);

    return c.json({ success: true, worker });
  } catch (error) {
    console.log("Error saving worker:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update worker
app.put("/make-server-86b98184/workers/:id", async (c) => {
  try {
    const workerId = c.req.param("id");
    const workerData = await c.req.json();
    const workerKey = `worker_${workerId}`;
    
    const existingWorker = await kv.get(workerKey);
    if (!existingWorker) {
      return c.json({ success: false, error: "Worker not found" }, 404);
    }
    
    const updatedWorker = {
      ...existingWorker,
      ...workerData,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(workerKey, updatedWorker);
    return c.json({ success: true, worker: updatedWorker });
  } catch (error) {
    console.log("Error updating worker:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update payroll record
app.put("/make-server-86b98184/payroll/:id", async (c) => {
  try {
    const payrollId = c.req.param("id");
    const payrollData = await c.req.json();
    const payrollKey = `payroll_${payrollId}`;
    
    const existingPayroll = await kv.get(payrollKey);
    if (!existingPayroll) {
      return c.json({ success: false, error: "Payroll record not found" }, 404);
    }
    
    const updatedPayroll = {
      ...existingPayroll,
      ...payrollData,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(payrollKey, updatedPayroll);
    return c.json({ success: true, payroll: updatedPayroll });
  } catch (error) {
    console.log("Error updating payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete worker
app.delete("/make-server-86b98184/workers/:id", async (c) => {
  try {
    const workerId = c.req.param("id");
    await kv.del(`worker_${workerId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting worker:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CUSTOMERS MANAGEMENT
// Get all customers (filtered by business)
app.get("/make-server-86b98184/customers", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);
    
    const customers = await kv.getByPrefix("customer_");
    let customerList = customers.map(c => ({ id: c.key.replace('customer_', ''), ...c.value }));
    
    // Filter by business_id
    if (businessId) {
      customerList = customerList.filter(c => c.businessId === businessId);
      console.log(`👤 Filtered ${customerList.length} customers for business ${businessId}`);
    }
    
    return c.json({ success: true, customers: customerList });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save customer (with business_id)
app.post("/make-server-86b98184/customers", async (c) => {
  try {
    const customerData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);
    
    if (!businessId) {
      return c.json({ success: false, error: "Business ID required" }, 400);
    }
    
    const customerKey = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enrichedCustomer = {
      ...customerData,
      id: customerKey,
      businessId, // Link to business
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(customerKey, enrichedCustomer);
    console.log(`✅ Customer created for business ${businessId}:`, customerKey);
    
    return c.json({ success: true, customer: enrichedCustomer });
  } catch (error) {
    console.log("Error saving customer:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete customer
app.delete("/make-server-86b98184/customers/:id", async (c) => {
  try {
    const customerId = c.req.param("id");
    await kv.del(`customer_${customerId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting customer:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PAYROLL MANAGEMENT
// Get all payroll records (filtered by business)
app.get("/make-server-86b98184/payroll", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);
    
    const payroll = await kv.getByPrefix("payroll_");
    let payrollList = payroll.map(p => ({ id: p.key.replace('payroll_', ''), ...p.value }));
    
    // Filter by business_id
    if (businessId) {
      payrollList = payrollList.filter(p => p.businessId === businessId);
      console.log(`💰 Filtered ${payrollList.length} payroll records for business ${businessId}`);
    }
    
    return c.json({ success: true, payroll: payrollList });
  } catch (error) {
    console.log("Error fetching payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save payroll record (with business_id)
app.post("/make-server-86b98184/payroll", async (c) => {
  try {
    const payrollData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);
    
    if (!businessId) {
      return c.json({ success: false, error: "Business ID required" }, 400);
    }
    
    const payrollKey = `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enrichedPayroll = {
      ...payrollData,
      id: payrollKey,
      businessId, // Link to business
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(payrollKey, enrichedPayroll);
    console.log(`✅ Payroll record created for business ${businessId}:`, payrollKey);
    
    return c.json({ success: true, payroll: enrichedPayroll });
  } catch (error) {
    console.log("Error saving payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete payroll record
app.delete("/make-server-86b98184/payroll/:id", async (c) => {
  try {
    const payrollId = c.req.param("id");
    await kv.del(`payroll_${payrollId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete sale/order
app.delete("/make-server-86b98184/sales/:id", async (c) => {
  try {
    const saleId = c.req.param("id");
    await kv.del(`sale_${saleId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting sale:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete cashier login
app.delete("/make-server-86b98184/cashiers/:id", async (c) => {
  try {
    const cashierId = c.req.param("id");
    await kv.del(`cashier_${cashierId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting cashier:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CASHIER AUTH MANAGEMENT
// Get all cashiers
app.get("/make-server-86b98184/cashiers", async (c) => {
  try {
    const cashiers = await kv.getByPrefix("cashier_");
    const cashierList = cashiers.map(c => ({ id: c.key.replace('cashier_', ''), ...c.value }));
    return c.json({ success: true, cashiers: cashierList });
  } catch (error) {
    console.log("Error fetching cashiers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create cashier login
app.post("/make-server-86b98184/auth/create-cashier", async (c) => {
  try {
    const { workerId, workerName, shopId, shopName } = await c.req.json();

    console.log('📝 Creating cashier login for:', { workerId, workerName, shopId, shopName });

    // Validate required fields
    if (!workerId || !workerName || !shopId || !shopName) {
      return c.json({ success: false, error: "Missing required fields (workerId, workerName, shopId, shopName)" }, 400);
    }

    // Get business ID from auth token (this admin owns this worker)
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user?.user_metadata?.business_id) {
      return c.json({ success: false, error: "Could not get business ID from auth token" }, 401);
    }

    const businessId = user.user_metadata.business_id;
    console.log('✅ Creating cashier for business:', businessId);

    // Generate cashier credentials
    const cashierId = `CSH${Math.random().toString().substr(2, 6)}`;
    const password = Math.random().toString(36).substr(2, 8);
    const email = `${cashierId.toLowerCase()}@${shopId.toLowerCase().replace(/\s/g, '')}.local`;

    console.log('🔑 Generated credentials:', { cashierId, email, shopId, shopName });
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'cashier',
        name: workerName,
        cashierId: cashierId,
        shopId: shopId,  // Use actual shop ID from worker
        shopName: shopName,  // Use actual shop name from worker
        business_id: businessId, // Link to business admin
        active: true
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return c.json({ success: false, error: authError.message }, 400);
    }
    
    console.log('✅ Cashier auth user created:', authData.user.id);

    // Store cashier in database
    const { data: cashierRecord, error: cashierError } = await supabase
      .from('cashiers')
      .insert({
        id: cashierId,
        worker_id: workerId,
        worker_name: workerName,
        shop_id: shopId,  // Use actual shop ID from worker
        shop_name: shopName,  // Use actual shop name from worker
        email: email,
        auth_user_id: authData.user.id,
        active: true,
        last_login: null,
        login_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (cashierError) {
      console.error('⚠️ Error storing cashier in database:', cashierError);
      // Continue anyway - auth user was created
    } else {
      console.log('✅ Cashier stored in database:', cashierRecord.id);
    }

    // Also store in KV for legacy compatibility
    const cashierData = {
      id: cashierId,
      workerId,
      workerName,
      shopId: shopId,  // Use actual shop ID from worker
      shopName: shopName,  // Use actual shop name from worker
      businessId: businessId,  // Store business link
      password,
      email,
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0,
      authUserId: authData.user.id
    };

    await kv.set(`cashier_${cashierId}`, cashierData);
    
    console.log('✅ Cashier created successfully:', cashierId);
    
    return c.json({
      success: true,
      credentials: {
        cashierId,
        shopId: shopId,  // Return actual shop ID (e.g., SHOP001)
        shopName: shopName,  // Return actual shop name (e.g., Main Branch)
        password,
        email
      },
      cashier: cashierData
    });
  } catch (error) {
    console.error("❌ Error creating cashier:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Toggle cashier status
app.post("/make-server-86b98184/cashiers/:id/:action", async (c) => {
  try {
    const cashierId = c.req.param("id");
    const action = c.req.param("action");
    
    const cashier = await kv.get(`cashier_${cashierId}`);
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }
    
    const updatedCashier = {
      ...cashier,
      active: action === 'activate'
    };
    await kv.set(`cashier_${cashierId}`, updatedCashier);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error toggling cashier status:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reset cashier password
app.post("/make-server-86b98184/cashiers/:id/reset-password", async (c) => {
  try {
    const cashierId = c.req.param("id");
    const newPassword = Math.random().toString(36).substr(2, 8);
    
    const cashier = await kv.get(`cashier_${cashierId}`);
    if (!cashier) {
      return c.json({ success: false, error: "Cashier not found" }, 404);
    }
    
    // Update password in Supabase Auth if authUserId exists
    if (cashier.authUserId) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        cashier.authUserId,
        { password: newPassword }
      );
      
      if (updateError) {
        console.error('❌ Error updating auth password:', updateError);
      } else {
        console.log('✅ Auth password updated for:', cashier.email);
      }
    }
    
    const updatedCashier = {
      ...cashier,
      password: newPassword
    };
    await kv.set(`cashier_${cashierId}`, updatedCashier);
    
    return c.json({ success: true, newPassword });
  } catch (error) {
    console.log("Error resetting password:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get cashiers by business ID
app.get("/make-server-86b98184/businesses/:businessId/cashiers", async (c) => {
  try {
    const businessId = c.req.param("businessId");
    console.log('📋 Fetching cashiers for business:', businessId);
    
    // Get all cashiers and filter by businessId
    const allCashiers = await kv.getByPrefix("cashier_");
    const businessCashiers = allCashiers
      .filter(c => c.value.businessId === businessId)
      .map(c => ({ id: c.key.replace('cashier_', ''), ...c.value }));
    
    console.log(`✅ Found ${businessCashiers.length} cashiers for business ${businessId}`);
    
    return c.json({ success: true, cashiers: businessCashiers });
  } catch (error) {
    console.error("❌ Error fetching business cashiers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CREDIT SALES MANAGEMENT (Book Sales for Ghana Market)
// Get all credit customers (filtered by business)
app.get("/make-server-86b98184/credit-customers", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .order('current_balance', { ascending: false });

    if (error) {
      console.log("Error fetching credit customers:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`💳 Found ${customers?.length || 0} credit customers for business ${businessId}`);

    return c.json({ success: true, customers: customers || [] });
  } catch (error) {
    console.log("Error fetching credit customers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create or update credit customer
app.post("/make-server-86b98184/credit-customers", async (c) => {
  try {
    const customerData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    // Check if customer already exists by phone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone', customerData.phone)
      .maybeSingle();

    if (existingCustomer) {
      // Update existing customer
      const { data: customer, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id)
        .select()
        .single();

      if (error) {
        return c.json({ success: false, error: error.message }, 500);
      }

      return c.json({ success: true, customer, existing: true });
    } else {
      // Create new customer
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          business_id: businessId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return c.json({ success: false, error: error.message }, 500);
      }

      console.log(`✅ Credit customer created for business ${businessId}`);

      return c.json({ success: true, customer, existing: false });
    }
  } catch (error) {
    console.log("Error saving credit customer:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create credit sale (book sale)
app.post("/make-server-86b98184/credit-sales", async (c) => {
  try {
    const saleData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    // Generate receipt ID
    const receiptId = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create credit sale
    const { data: creditSale, error } = await supabase
      .from('credit_sales')
      .insert({
        business_id: businessId,
        customer_id: saleData.customer_id,
        receipt_id: receiptId,
        cashier_id: saleData.cashier_id,
        cashier_name: saleData.cashier_name,
        items: saleData.items,
        total_amount: saleData.total_amount,
        amount_paid: saleData.amount_paid || 0,
        amount_owed: saleData.total_amount - (saleData.amount_paid || 0),
        payment_status: saleData.amount_paid >= saleData.total_amount ? 'Paid' : (saleData.amount_paid > 0 ? 'Partial' : 'Unpaid'),
        due_date: saleData.due_date,
        notes: saleData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log("Error creating credit sale:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    // Reduce stock for each item (same as regular sales)
    if (saleData.items && Array.isArray(saleData.items)) {
      for (const item of saleData.items) {
        if (item.id) {
          try {
            const { data: product } = await supabase
              .from('products')
              .select('*')
              .eq('id', item.id)
              .eq('business_id', businessId)
              .single();

            if (product) {
              const newStock = Math.max(0, product.stock - item.quantity);
              const lowStockThreshold = Math.ceil((product.original_stock || product.stock) * 0.2);

              let newStatus = 'Active';
              if (newStock === 0) {
                newStatus = 'Out of Stock';
              } else if (newStock <= lowStockThreshold) {
                newStatus = 'Low Stock';
              }

              await supabase
                .from('products')
                .update({
                  stock: newStock,
                  status: newStatus,
                  updated_at: new Date().toISOString()
                })
                .eq('id', item.id)
                .eq('business_id', businessId);

              console.log(`✅ Stock reduced for ${item.name || item.id}: ${product.stock} → ${newStock}`);
            }
          } catch (stockError) {
            console.error(`⚠️ Error reducing stock for item ${item.id}:`, stockError);
          }
        }
      }
    }

    console.log(`✅ Credit sale created: ${receiptId}`);

    return c.json({ success: true, creditSale });
  } catch (error) {
    console.log("Error creating credit sale:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get all credit sales (filtered by business)
app.get("/make-server-86b98184/credit-sales", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);
    const customerId = c.req.query('customer_id');

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    let query = supabase
      .from('credit_sales')
      .select(`
        *,
        customers:customer_id (
          id,
          name,
          phone,
          current_balance
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    // Filter by customer if provided
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: creditSales, error } = await query;

    if (error) {
      console.log("Error fetching credit sales:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`💳 Found ${creditSales?.length || 0} credit sales for business ${businessId}`);

    return c.json({ success: true, creditSales: creditSales || [] });
  } catch (error) {
    console.log("Error fetching credit sales:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get credit sales for a specific customer
app.get("/make-server-86b98184/credit-sales/:customerId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    const { data: creditSales, error } = await supabase
      .from('credit_sales')
      .select('*')
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log("Error fetching customer credit sales:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, creditSales: creditSales || [] });
  } catch (error) {
    console.log("Error fetching customer credit sales:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Record credit payment
app.post("/make-server-86b98184/credit-payments", async (c) => {
  try {
    const paymentData = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    // Create payment record
    const { data: payment, error } = await supabase
      .from('credit_payments')
      .insert({
        business_id: businessId,
        customer_id: paymentData.customer_id,
        credit_sale_id: paymentData.credit_sale_id || null,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
        received_by: paymentData.received_by,
        notes: paymentData.notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log("Error recording credit payment:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log(`✅ Credit payment recorded: GHS ${paymentData.amount}`);

    // Note: Customer balance and sale status will be updated automatically by database triggers

    return c.json({ success: true, payment });
  } catch (error) {
    console.log("Error recording credit payment:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get payment history for a customer
app.get("/make-server-86b98184/credit-payments/:customerId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    const { data: payments, error } = await supabase
      .from('credit_payments')
      .select(`
        *,
        credit_sales:credit_sale_id (
          receipt_id,
          total_amount
        )
      `)
      .eq('business_id', businessId)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log("Error fetching credit payments:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, payments: payments || [] });
  } catch (error) {
    console.log("Error fetching credit payments:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get credit summary statistics
app.get("/make-server-86b98184/credit-summary", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);

    if (!businessId) {
      return c.json({ success: false, error: "Authentication required" }, 401);
    }

    // Get total credit owed
    const { data: customers } = await supabase
      .from('customers')
      .select('current_balance')
      .eq('business_id', businessId);

    const totalOwed = customers?.reduce((sum, c) => sum + (c.current_balance || 0), 0) || 0;

    // Get overdue sales (past due date and not fully paid)
    const today = new Date().toISOString().split('T')[0];
    const { data: overdueSales } = await supabase
      .from('credit_sales')
      .select('amount_owed')
      .eq('business_id', businessId)
      .neq('payment_status', 'Paid')
      .lt('due_date', today);

    const totalOverdue = overdueSales?.reduce((sum, s) => sum + (s.amount_owed || 0), 0) || 0;

    // Count customers with outstanding balance
    const customersWithDebt = customers?.filter(c => (c.current_balance || 0) > 0).length || 0;

    const summary = {
      totalOwed,
      totalOverdue,
      customersWithDebt,
      customersTotal: customers?.length || 0
    };

    return c.json({ success: true, summary });
  } catch (error) {
    console.log("Error fetching credit summary:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CORRECTIONS MANAGEMENT
// Get all corrections (filtered by business)
app.get("/make-server-86b98184/corrections", async (c) => {
  try {
    const businessId = await getBusinessIdFromAuth(c);

    const corrections = await kv.getByPrefix("correction_");
    let correctionList = corrections.map(c => ({ id: c.key.replace('correction_', ''), ...c.value }));

    // Filter by business_id
    if (businessId) {
      correctionList = correctionList.filter(c => c.businessId === businessId);
    }

    correctionList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    console.log(`📝 Filtered ${correctionList.length} corrections for business ${businessId}`);

    return c.json({ success: true, corrections: correctionList });
  } catch (error) {
    console.log("Error fetching corrections:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Submit correction (with business_id)
app.post("/make-server-86b98184/corrections", async (c) => {
  try {
    const correction = await c.req.json();
    const businessId = await getBusinessIdFromAuth(c);
    
    if (!businessId) {
      return c.json({ success: false, error: "Business ID required" }, 400);
    }
    
    const correctionId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const correctionData = {
      ...correction,
      id: correctionId,
      businessId, // Link to business
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    await kv.set(`correction_${correctionId}`, correctionData);
    console.log(`✅ Correction created for business ${businessId}:`, correctionId);
    
    return c.json({ success: true, correction: correctionData });
  } catch (error) {
    console.log("Error saving correction:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DAILY REPORTS
// Get daily report
app.get("/make-server-86b98184/reports/daily/:date", async (c) => {
  try {
    const date = c.req.param("date");
    const sales = await kv.getByPrefix("sale_");
    const daySales = sales.filter(sale => sale.value.date === date);
    
    const totalSales = daySales.length;
    const totalAmount = daySales.reduce((sum, sale) => sum + sale.value.total, 0);
    
    const report = {
      date,
      totalSales,
      totalAmount,
      sales: daySales.map(s => s.value)
    };
    
    return c.json({ success: true, report });
  } catch (error) {
    console.log("Error generating daily report:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PROFIT ANALYSIS
app.get("/make-server-86b98184/profit-analysis/:period", async (c) => {
  try {
    const period = c.req.param("period");
    const sales = await kv.getByPrefix("sale_");
    const products = await kv.getByPrefix("product_");
    
    // Calculate date range based on period
    let startDate, endDate;
    const today = new Date();
    
    switch (period) {
      case 'daily':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'weekly':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(today);
        break;
      case 'monthly':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date(today);
        break;
      default:
        startDate = new Date(today);
        endDate = new Date(today);
    }
    
    // Filter sales by period
    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.value.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    // Calculate revenue
    const totalRevenue = periodSales.reduce((sum, sale) => sum + (sale.value.total || 0), 0);
    
    // Calculate costs (simplified - assuming 60% cost margin)
    const totalCost = totalRevenue * 0.6;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Product-wise profit analysis
    const productProfits = [];
    const productMap = new Map();
    
    // Initialize product map
    products.forEach(product => {
      productMap.set(product.value.id, {
        name: product.value.name,
        costPrice: product.value.costPrice || 0,
        sellingPrice: product.value.price || 0
      });
    });
    
    // Calculate product profits
    periodSales.forEach(sale => {
      if (sale.value.items) {
        sale.value.items.forEach(item => {
          const product = productMap.get(item.productId);
          if (product) {
            const existing = productProfits.find(p => p.name === product.name);
            if (existing) {
              existing.quantity += item.quantity;
              existing.revenue += item.quantity * item.price;
              existing.cost += item.quantity * product.costPrice;
            } else {
              productProfits.push({
                name: product.name,
                quantity: item.quantity,
                revenue: item.quantity * item.price,
                cost: item.quantity * product.costPrice
              });
            }
          }
        });
      }
    });
    
    // Calculate margins for each product
    productProfits.forEach(product => {
      product.profit = product.revenue - product.cost;
      product.margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
    });
    
    // Sort by revenue
    productProfits.sort((a, b) => b.revenue - a.revenue);
    
    const analysis = {
      period,
      overall: {
        revenue: totalRevenue,
        cost: totalCost,
        profit: profit,
        margin: profitMargin
      },
      productProfits: productProfits
    };
    
    return c.json({ success: true, analysis });
  } catch (error) {
    console.log("Error generating profit analysis:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DASHBOARD SUMMARY
app.get("/make-server-86b98184/dashboard-summary", async (c) => {
  try {
    const sales = await kv.getByPrefix("sale_");
    const products = await kv.getByPrefix("product_");
    const customers = await kv.getByPrefix("customer_");
    const workers = await kv.getByPrefix("worker_");
    const corrections = await kv.getByPrefix("correction_");
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Filter today's sales
    const todaySales = sales.filter(sale => sale.value.date === today);
    const yesterdaySales = sales.filter(sale => sale.value.date === yesterday);
    
    // Calculate today's metrics
    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.value.total || 0), 0);
    const todayTransactions = todaySales.length;
    
    // Calculate yesterday's metrics
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + (sale.value.total || 0), 0);
    const yesterdayTransactions = yesterdaySales.length;
    
    // Calculate growth
    const salesGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
    const transactionGrowth = yesterdayTransactions > 0 ? ((todayTransactions - yesterdayTransactions) / yesterdayTransactions) * 100 : 0;
    
    // Get weekly data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const daySales = sales.filter(sale => sale.value.date === date);
      const dayRevenue = daySales.reduce((sum, sale) => sum + (sale.value.total || 0), 0);
      weeklyData.push({
        date,
        amount: dayRevenue,
        transactions: daySales.length
      });
    }
    
    // Calculate inventory value
    const inventoryValue = products.reduce((sum, product) => {
      const value = (product.value.price || 0) * (product.value.quantity || 0);
      return sum + value;
    }, 0);
    
    // Count low stock products (quantity < 10)
    const lowStockProducts = products.filter(product => (product.value.quantity || 0) < 10).length;
    
    // Count pending corrections
    const pendingCorrections = corrections.filter(correction => correction.value.status === 'pending').length;
    
    const summary = {
      today: {
        sales: todayRevenue,
        transactions: todayTransactions
      },
      growth: {
        sales: salesGrowth,
        transactions: transactionGrowth
      },
      counts: {
        products: products.length,
        customers: customers.length,
        workers: workers.length,
        lowStockProducts,
        pendingCorrections
      },
      inventory: {
        value: inventoryValue
      },
      weeklyData
    };
    
    return c.json({ success: true, summary });
  } catch (error) {
    console.log("Error generating dashboard summary:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// SHOP SETTINGS
app.get("/make-server-86b98184/shop-settings", async (c) => {
  try {
    const settings = await kv.get("shop_settings");
    return c.json({ success: true, settings: settings || {} });
  } catch (error) {
    console.log("Error fetching shop settings:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/make-server-86b98184/shop-settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set("shop_settings", settings);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving shop settings:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ALL REPORTS
app.get("/make-server-86b98184/all-reports", async (c) => {
  try {
    const reports = await kv.getByPrefix("report_");
    const reportList = reports.map(r => ({ id: r.key.replace('report_', ''), ...r.value }));
    return c.json({ success: true, reports: reportList });
  } catch (error) {
    console.log("Error fetching reports:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GENERATE AUTO REPORT
app.post("/make-server-86b98184/generate-auto-report", async (c) => {
  try {
    const { date, shopInfo } = await c.req.json();
    const reportDate = date || new Date().toISOString().split('T')[0];
    
    const sales = await kv.getByPrefix("sale_");
    const daySales = sales.filter(sale => sale.value.date === reportDate);
    
    const report = {
      date: reportDate,
      totalSales: daySales.length,
      totalAmount: daySales.reduce((sum, sale) => sum + sale.value.total, 0),
      sales: daySales.map(s => s.value),
      generatedAt: new Date().toISOString(),
      shopInfo: shopInfo || {}
    };
    
    const reportKey = `report_${reportDate}_${Date.now()}`;
    await kv.set(reportKey, report);
    
    return c.json({ success: true, report });
  } catch (error) {
    console.log("Error generating auto report:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DAILY REPORT CSV
app.get("/make-server-86b98184/daily-report/:date", async (c) => {
  try {
    const date = c.req.param("date");
    const sales = await kv.getByPrefix("sale_");
    const daySales = sales.filter(sale => sale.value.date === date);
    
    // Generate CSV content
    const csvHeader = "Date,Transaction ID,Customer,Items,Total,Payment Method\n";
    const csvRows = daySales.map(sale => {
      const items = sale.value.items?.map((item: { name: string; quantity: number }) => `${item.name} (${item.quantity})`).join('; ') || '';
      return `${sale.value.date},${sale.value.id},${sale.value.customer?.name || 'N/A'},${items},${sale.value.total},${sale.value.paymentMethod || 'Cash'}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="daily-report-${date}.csv"`
      }
    });
  } catch (error) {
    console.log("Error generating daily report CSV:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// UPDATE INVENTORY
app.post("/make-server-86b98184/update-inventory", async (c) => {
  try {
    const { productId, quantityChange } = await c.req.json();
    const productKey = `product_${productId}`;
    
    const product = await kv.get(productKey);
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    
    const updatedProduct = {
      ...product,
      quantity: Math.max(0, (product.quantity || 0) + quantityChange),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(productKey, updatedProduct);
    return c.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log("Error updating inventory:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// SMS INTEGRATION (Arkesel)
// Send SMS via Arkesel
app.post("/make-server-86b98184/send-sms", async (c) => {
  try {
    const { phone, message } = await c.req.json();

    if (!phone || !message) {
      return c.json({ success: false, error: "Phone number and message are required" }, 400);
    }

    // Get API key from environment
    const apiKey = (globalThis as any).Deno?.env?.get('ARKESEL_API_KEY');

    if (!apiKey) {
      console.error('⚠️ ARKESEL_API_KEY not set in environment');
      return c.json({ success: false, error: "SMS service not configured" }, 500);
    }

    // Clean and format phone number for Ghana
    let cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits

    // Convert 0XX format to 233XX format
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '233' + cleanPhone.substring(1);
    }

    // Ensure it starts with 233
    if (!cleanPhone.startsWith('233')) {
      cleanPhone = '233' + cleanPhone;
    }

    console.log(`📱 Sending SMS to: ${cleanPhone}`);
    console.log(`📝 Message: ${message.substring(0, 50)}...`);

    // Send SMS via Arkesel API
    const arkeselUrl = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${apiKey}&to=${cleanPhone}&from=Rekon360&sms=${encodeURIComponent(message)}`;

    const response = await fetch(arkeselUrl, {
      method: 'GET'
    });

    const result = await response.text();
    console.log('📨 Arkesel response:', result);

    // Arkesel returns various responses - check for success indicators
    if (result.includes('successfully') || result.includes('Success') || response.ok) {
      console.log('✅ SMS sent successfully');
      return c.json({
        success: true,
        message: "SMS sent successfully",
        phone: cleanPhone
      });
    } else {
      console.error('❌ SMS send failed:', result);
      return c.json({
        success: false,
        error: result || "Failed to send SMS"
      }, 500);
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Clear all data endpoint
app.post("/make-server-86b98184/clear-all-data", async (c) => {
  try {
    console.log("🔥 Clearing all KV store data...");

    // Get all keys from KV store
    const allKeys = await kv.getByPrefix("");
    console.log("Found", allKeys.length, "keys to delete");

    // Delete all keys
    for (const item of allKeys) {
      await kv.del(item.key);
      console.log("✅ Deleted key:", item.key);
    }

    console.log("✅ All KV store data cleared!");
    return c.json({ success: true, message: "All data cleared successfully", deletedCount: allKeys.length });
  } catch (error) {
    console.log("Error clearing all data:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Export for Deno
if (typeof Deno !== 'undefined') {
  Deno.serve(app.fetch);
}

export default app;
 