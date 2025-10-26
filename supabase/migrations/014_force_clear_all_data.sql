-- Force clear all data - make absolutely sure everything is deleted

-- Delete all products
DELETE FROM products;

-- Delete all customers  
DELETE FROM customers;

-- Delete all workers
DELETE FROM workers;

-- Delete all sales and related records
DELETE FROM sale_items;
DELETE FROM corrections;
DELETE FROM sales;

-- Delete all payroll
DELETE FROM payroll;

-- Delete all cashiers
DELETE FROM cashiers;

-- Verify all tables are empty
DO $$
BEGIN
  RAISE NOTICE 'Products count: %', (SELECT COUNT(*) FROM products);
  RAISE NOTICE 'Customers count: %', (SELECT COUNT(*) FROM customers);
  RAISE NOTICE 'Workers count: %', (SELECT COUNT(*) FROM workers);
  RAISE NOTICE 'Sales count: %', (SELECT COUNT(*) FROM sales);
END $$;
