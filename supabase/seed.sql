-- Kaifan HQ Seed Data
-- Run this after the initial migration to add sample data

-- Insert a super admin user (you'll need to match this with a real Supabase auth user)
-- The ID should match the auth.uid() from Supabase Auth
-- Replace 'YOUR_SUPER_ADMIN_UUID' with actual UUID after creating the auth user

-- Example seed data (uncomment and modify as needed):

/*
-- Insert super admin
INSERT INTO users (id, email, name, role) VALUES
('YOUR_SUPER_ADMIN_UUID', 'admin@kaifan-hq.com', 'Super Admin', 'super_admin');

-- Insert sample admin
INSERT INTO users (id, email, name, role) VALUES
('SAMPLE_ADMIN_UUID', 'host@example.com', 'Diwaniya Host', 'admin');

-- Insert sample guests
INSERT INTO users (id, email, name, phone, role) VALUES
('GUEST_1_UUID', 'guest1@example.com', 'Ahmed Ali', '+965 9900 1234', 'guest'),
('GUEST_2_UUID', 'guest2@example.com', 'Mohammed Khalid', '+965 9900 5678', 'guest'),
('GUEST_3_UUID', 'guest3@example.com', 'Fahad Nasser', '+965 9900 9012', 'guest');

-- Insert sample diwaniya
INSERT INTO diwaniyas (id, name, slug, location, description, admin_id, is_open, max_capacity) VALUES
('DIWANIYA_1_UUID', 'Kaifan Majlis', 'kaifan-majlis', 'Block 5, Street 10, Kaifan', 'A traditional Kuwaiti gathering space for friends and family. Join us for chai, conversation, and community.', 'SAMPLE_ADMIN_UUID', true, 30);

-- Insert sample registrations
INSERT INTO registrations (diwaniya_id, user_id, status, notes) VALUES
('DIWANIYA_1_UUID', 'GUEST_1_UUID', 'approved', 'Looking forward to attending!'),
('DIWANIYA_1_UUID', 'GUEST_2_UUID', 'pending', 'First time visitor'),
('DIWANIYA_1_UUID', 'GUEST_3_UUID', 'approved', NULL);

-- Insert sample activity logs
INSERT INTO activity_logs (diwaniya_id, user_id, action, details) VALUES
('DIWANIYA_1_UUID', 'SAMPLE_ADMIN_UUID', 'diwaniya_opened', '{"previous_status": false}'),
('DIWANIYA_1_UUID', 'GUEST_1_UUID', 'registration_created', '{"status": "pending"}'),
('DIWANIYA_1_UUID', 'SAMPLE_ADMIN_UUID', 'registration_approved', '{"user_id": "GUEST_1_UUID"}');
*/

-- Instructions:
-- 1. Create users in Supabase Auth first
-- 2. Get their UUIDs from the auth.users table
-- 3. Uncomment and replace the UUIDs above
-- 4. Run this script in the Supabase SQL Editor
