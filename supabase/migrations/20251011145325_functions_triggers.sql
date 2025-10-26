-- Database Functions and Triggers for Rekon30

-- Function to update product stock after sale
CREATE OR REPLACE FUNCTION update_product_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease stock for the product
  UPDATE products
  SET stock = stock - NEW.quantity,
      status = CASE
        WHEN stock - NEW.quantity <= 0 THEN 'Out of Stock'
        WHEN stock - NEW.quantity < low_stock_threshold THEN 'Low Stock'
        ELSE 'Active'
      END
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock when sale item is added
CREATE TRIGGER trigger_update_stock_after_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_after_sale();

-- Function to update customer total purchases
CREATE OR REPLACE FUNCTION update_customer_purchases()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET total_purchases = total_purchases + NEW.total,
        loyalty_points = loyalty_points + FLOOR(NEW.total / 10) -- 1 point per $10
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer purchases
CREATE TRIGGER trigger_update_customer_purchases
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_purchases();

-- Function to create low stock notification
CREATE OR REPLACE FUNCTION check_low_stock_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= NEW.low_stock_threshold AND OLD.stock > NEW.low_stock_threshold THEN
    INSERT INTO notifications (type, title, message, data, user_role)
    VALUES (
      'low_stock',
      'Low Stock Alert',
      'Product "' || NEW.name || '" is running low on stock (' || NEW.stock || ' remaining)',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_name', NEW.name,
        'current_stock', NEW.stock,
        'threshold', NEW.low_stock_threshold
      ),
      'admin'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for low stock notifications
CREATE TRIGGER trigger_low_stock_notification
  AFTER UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock_notification();

-- Function to create sale notification
CREATE OR REPLACE FUNCTION create_sale_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, title, message, data, user_role)
  VALUES (
    'sale',
    'New Sale',
    'Sale of $' || NEW.total || ' at ' || NEW.shop_name,
    jsonb_build_object(
      'sale_id', NEW.id,
      'receipt_id', NEW.receipt_id,
      'total', NEW.total,
      'shop_id', NEW.shop_id,
      'shop_name', NEW.shop_name,
      'cashier_name', NEW.cashier_name,
      'timestamp', NEW.timestamp
    ),
    'admin'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sale notifications
CREATE TRIGGER trigger_sale_notification
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION create_sale_notification();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_action TEXT;
BEGIN
  -- Get user info from auth context
  v_user_id := auth.uid();
  v_user_email := auth.email();
  
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
  END IF;
  
  -- Insert activity log
  INSERT INTO activity_logs (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    v_user_id,
    v_user_email,
    v_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'UPDATE' THEN
        jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      WHEN TG_OP = 'INSERT' THEN
        to_jsonb(NEW)
      WHEN TG_OP = 'DELETE' THEN
        to_jsonb(OLD)
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add activity logging triggers to important tables
CREATE TRIGGER log_products_activity
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_sales_activity
  AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_workers_activity
  AFTER INSERT OR UPDATE OR DELETE ON workers
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_cashiers_activity
  AFTER INSERT OR UPDATE OR DELETE ON cashiers
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Function to generate daily report
CREATE OR REPLACE FUNCTION generate_daily_report(report_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  v_report JSONB;
  v_total_sales DECIMAL;
  v_total_transactions INTEGER;
  v_total_items INTEGER;
  v_top_products JSONB;
  v_cashier_performance JSONB;
BEGIN
  -- Calculate totals
  SELECT
    COALESCE(SUM(total), 0),
    COUNT(*),
    COALESCE(SUM((SELECT SUM(quantity) FROM sale_items WHERE sale_id = sales.id)), 0)
  INTO v_total_sales, v_total_transactions, v_total_items
  FROM sales
  WHERE date = report_date;
  
  -- Get top products
  SELECT jsonb_agg(product_data)
  INTO v_top_products
  FROM (
    SELECT jsonb_build_object(
      'product_name', si.product_name,
      'quantity', SUM(si.quantity),
      'revenue', SUM(si.total_price)
    ) as product_data
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.date = report_date
    GROUP BY si.product_name
    ORDER BY SUM(si.quantity) DESC
    LIMIT 10
  ) top_prods;
  
  -- Get cashier performance
  SELECT jsonb_agg(cashier_data)
  INTO v_cashier_performance
  FROM (
    SELECT jsonb_build_object(
      'cashier_name', s.cashier_name,
      'transactions', COUNT(*),
      'total_sales', SUM(s.total)
    ) as cashier_data
    FROM sales s
    WHERE s.date = report_date
    GROUP BY s.cashier_name
    ORDER BY SUM(s.total) DESC
  ) cashier_perf;
  
  -- Build report
  v_report := jsonb_build_object(
    'date', report_date,
    'total_sales', v_total_sales,
    'total_transactions', v_total_transactions,
    'total_items_sold', v_total_items,
    'average_transaction', CASE WHEN v_total_transactions > 0 THEN v_total_sales / v_total_transactions ELSE 0 END,
    'top_products', COALESCE(v_top_products, '[]'::jsonb),
    'cashier_performance', COALESCE(v_cashier_performance, '[]'::jsonb)
  );
  
  -- Upsert into daily_reports
  INSERT INTO daily_reports (
    date,
    total_sales,
    total_transactions,
    total_items_sold,
    average_transaction,
    top_products,
    cashier_performance
  ) VALUES (
    report_date,
    v_total_sales,
    v_total_transactions,
    v_total_items,
    CASE WHEN v_total_transactions > 0 THEN v_total_sales / v_total_transactions ELSE 0 END,
    COALESCE(v_top_products, '[]'::jsonb),
    COALESCE(v_cashier_performance, '[]'::jsonb)
  )
  ON CONFLICT (date)
  DO UPDATE SET
    total_sales = EXCLUDED.total_sales,
    total_transactions = EXCLUDED.total_transactions,
    total_items_sold = EXCLUDED.total_items_sold,
    average_transaction = EXCLUDED.average_transaction,
    top_products = EXCLUDED.top_products,
    cashier_performance = EXCLUDED.cashier_performance,
    generated_at = NOW();
  
  RETURN v_report;
END;
$$ LANGUAGE plpgsql;
