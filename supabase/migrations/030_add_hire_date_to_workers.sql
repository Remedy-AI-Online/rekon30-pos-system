-- Add hireDate column to workers table
ALTER TABLE workers ADD COLUMN IF NOT EXISTS hire_date DATE;

-- Add comment to the column
COMMENT ON COLUMN workers.hire_date IS 'Date when the worker was hired';
