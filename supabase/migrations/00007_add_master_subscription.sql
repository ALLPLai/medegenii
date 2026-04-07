-- Add 'master' to subscription_status allowed values
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_subscription_status_check;
ALTER TABLE doctors ADD CONSTRAINT doctors_subscription_status_check
  CHECK (subscription_status IN ('trial','active','past_due','cancelled','master'));

-- Set master access for contact.allpl@gmail.com
UPDATE doctors SET subscription_status = 'master' WHERE email = 'contact.allpl@gmail.com';
