-- Delete the test business and associated user
-- Replace 'dapaahsylvester5@gmail.com' with the actual email if different

-- Delete from auth.users (this will cascade delete sessions, etc.)
DELETE FROM auth.users WHERE email = 'dapaahsylvester5@gmail.com';

-- Delete from businesses table
DELETE FROM businesses WHERE email = 'dapaahsylvester5@gmail.com';

-- Reset the signup request back to pending if you want to try again
UPDATE business_signup_requests 
SET status = 'pending', approved_at = NULL, approved_by = NULL
WHERE email = 'dapaahsylvester5@gmail.com';
