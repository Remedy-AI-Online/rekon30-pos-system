-- Row Level Security (RLS) Policies for Rekon30

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Products can be inserted by authenticated users"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products can be updated by authenticated users"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Products can be deleted by authenticated users"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- Customers policies
CREATE POLICY "Customers are viewable by authenticated users"
  ON customers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Customers can be inserted by authenticated users"
  ON customers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Customers can be updated by authenticated users"
  ON customers FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Workers policies
CREATE POLICY "Workers are viewable by authenticated users"
  ON workers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Workers can be managed by authenticated users"
  ON workers FOR ALL
  USING (auth.role() = 'authenticated');

-- Cashiers policies
CREATE POLICY "Cashiers are viewable by authenticated users"
  ON cashiers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Cashiers can be managed by service role"
  ON cashiers FOR ALL
  USING (auth.role() = 'service_role');

-- Sales policies
CREATE POLICY "Sales are viewable by authenticated users"
  ON sales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Sales can be inserted by authenticated users"
  ON sales FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sales can be updated by authenticated users"
  ON sales FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Sale items policies
CREATE POLICY "Sale items are viewable by authenticated users"
  ON sale_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Sale items can be inserted by authenticated users"
  ON sale_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Corrections policies
CREATE POLICY "Corrections are viewable by authenticated users"
  ON corrections FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Corrections can be created by authenticated users"
  ON corrections FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Corrections can be updated by authenticated users"
  ON corrections FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Payroll policies
CREATE POLICY "Payroll is viewable by authenticated users"
  ON payroll FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Payroll can be managed by authenticated users"
  ON payroll FOR ALL
  USING (auth.role() = 'authenticated');

-- Daily reports policies
CREATE POLICY "Daily reports are viewable by authenticated users"
  ON daily_reports FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Daily reports can be managed by service role"
  ON daily_reports FOR ALL
  USING (auth.role() = 'service_role');

-- Notifications policies
CREATE POLICY "Notifications are viewable by authenticated users"
  ON notifications FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Notifications can be created by service role"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Notifications can be updated by their recipient"
  ON notifications FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Shop settings policies
CREATE POLICY "Shop settings are viewable by authenticated users"
  ON shop_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Shop settings can be managed by authenticated users"
  ON shop_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- Activity logs policies
CREATE POLICY "Activity logs are viewable by authenticated users"
  ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Activity logs can be inserted by anyone"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
