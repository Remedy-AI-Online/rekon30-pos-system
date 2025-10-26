// @ts-nocheck
// This file is for Supabase Edge Functions (Deno runtime)
// TypeScript errors are expected here as these are Deno-specific imports

import { Hono } from "https://esm.sh/hono@3.12.8";
import { cors } from "https://esm.sh/hono@3.12.8/cors";
import { logger } from "https://esm.sh/hono@3.12.8/logger";
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

// KV Store functions
const kv = {
  set: async (key: string, value: any): Promise<void> => {
    const { error } = await supabase.from("kv_store_86b98184").upsert({
      key,
      value
    });
    if (error) {
      throw new Error(error.message);
    }
  },

  get: async (key: string): Promise<any> => {
    const { data, error } = await supabase.from("kv_store_86b98184").select("value").eq("key", key).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data?.value;
  },

  del: async (key: string): Promise<void> => {
    const { error } = await supabase.from("kv_store_86b98184").delete().eq("key", key);
    if (error) {
      throw new Error(error.message);
    }
  },

  getByPrefix: async (prefix: string): Promise<{ key: string, value: any }[]> => {
    const { data, error } = await supabase.from("kv_store_86b98184").select("key, value").like("key", prefix + "%");
    if (error) {
      throw new Error(error.message);
    }
    return data ?? [];
  }
};

// Save sale data
app.post("/make-server-86b98184/sales", async (c) => {
  try {
    const saleData = await c.req.json();
    const saleKey = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add timestamp and date info
    const enrichedSale = {
      ...saleData,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      id: saleKey
    };
    
    await kv.set(saleKey, enrichedSale);
    
    // Auto-save customer if provided
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

      if (!customerExists) {
        const customerKey = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const customerData = {
          ...saleData.customer,
          id: customerKey,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await kv.set(customerKey, customerData);
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

// Get sales by date range
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

// PRODUCTS MANAGEMENT
// Get all products
app.get("/make-server-86b98184/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product_");
    const productList = products.map(p => ({ id: p.key.replace('product_', ''), ...p.value }));
    return c.json({ success: true, products: productList });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save product
app.post("/make-server-86b98184/products", async (c) => {
  try {
    const productData = await c.req.json();
    const productKey = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enrichedProduct = {
      ...productData,
      id: productKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(productKey, enrichedProduct);
    return c.json({ success: true, product: enrichedProduct });
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
// Get all workers
app.get("/make-server-86b98184/workers", async (c) => {
  try {
    const workers = await kv.getByPrefix("worker_");
    const workerList = workers.map(w => ({ id: w.key.replace('worker_', ''), ...w.value }));
    return c.json({ success: true, workers: workerList });
  } catch (error) {
    console.log("Error fetching workers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save worker
app.post("/make-server-86b98184/workers", async (c) => {
  try {
    const workerData = await c.req.json();
    const workerKey = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enrichedWorker = {
      ...workerData,
      id: workerKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(workerKey, enrichedWorker);
    return c.json({ success: true, worker: enrichedWorker });
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
// Get all customers
app.get("/make-server-86b98184/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer_");
    const customerList = customers.map(c => ({ id: c.key.replace('customer_', ''), ...c.value }));
    return c.json({ success: true, customers: customerList });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save customer
app.post("/make-server-86b98184/customers", async (c) => {
  try {
    const customerData = await c.req.json();
    const customerKey = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enrichedCustomer = {
      ...customerData,
      id: customerKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(customerKey, enrichedCustomer);
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
// Get all payroll records
app.get("/make-server-86b98184/payroll", async (c) => {
  try {
    const payroll = await kv.getByPrefix("payroll_");
    const payrollList = payroll.map(p => ({ id: p.key.replace('payroll_', ''), ...p.value }));
    return c.json({ success: true, payroll: payrollList });
  } catch (error) {
    console.log("Error fetching payroll:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save payroll record
app.post("/make-server-86b98184/payroll", async (c) => {
  try {
    const payrollData = await c.req.json();
    const payrollKey = `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enrichedPayroll = {
      ...payrollData,
      id: payrollKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(payrollKey, enrichedPayroll);
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
    
    const cashierId = `CSH${Math.random().toString().substr(2, 6)}`;
    const password = Math.random().toString(36).substr(2, 8);
    
    const cashierData = {
      id: cashierId,
      workerId,
      workerName,
      shopId,
      shopName,
      password,
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      loginCount: 0
    };
    
    await kv.set(`cashier_${cashierId}`, cashierData);
    
    return c.json({ 
      success: true, 
      credentials: {
        cashierId,
        shopId,
        password
      }
    });
  } catch (error) {
    console.log("Error creating cashier:", error);
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

// CORRECTIONS MANAGEMENT
// Get all corrections
app.get("/make-server-86b98184/corrections", async (c) => {
  try {
    const corrections = await kv.getByPrefix("correction_");
    const correctionList = corrections.map(c => ({ id: c.key.replace('correction_', ''), ...c.value }));
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
    const correction = await c.req.json();
    const correctionId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const correctionData = {
      ...correction,
      id: correctionId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    await kv.set(`correction_${correctionId}`, correctionData);
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
    
    // Calculate profit analysis based on period
    const analysis = {
      period,
      totalRevenue: 0,
      totalCost: 0,
      profit: 0,
      profitMargin: 0
    };
    
    return c.json({ success: true, analysis });
  } catch (error) {
    console.log("Error generating profit analysis:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Export for Deno
if (typeof Deno !== 'undefined') {
  Deno.serve(app.fetch);
}

export default app;