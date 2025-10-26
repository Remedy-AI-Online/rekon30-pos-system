-- Delete the test business and associated user
-- This will be run once to clean up the test data

-- Delete from auth.users (this will cascade delete sessions, etc.)
DELETE FROM auth.users WHERE email = 'dapaahsylvester5@gmail.com';

-- Delete from businesses table
DELETE FROM businesses WHERE email = 'dapaahsylvester5@gmail.com';

-- Reset the signup request back to pending so you can approve it again
UPDATE business_signup_requests 
SET status = 'pending', approved_at = NULL, approved_by = NULL
WHERE email = 'dapaahsylvester5@gmail.com';
