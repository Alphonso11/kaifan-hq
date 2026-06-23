-- Fix infinite recursion in RLS policies
-- The issue: policies that check users table for role create infinite recursion

-- 1. Drop all policies on users table that cause recursion
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;

-- 2. Drop all policies on other tables that check users table for super_admin role
DROP POLICY IF EXISTS "Admins can view their diwaniya registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can update their diwaniya registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can view their diwaniya bans" ON bans;
DROP POLICY IF EXISTS "Admins can insert bans for their diwaniya" ON bans;
DROP POLICY IF EXISTS "Admins can delete bans from their diwaniya" ON bans;
DROP POLICY IF EXISTS "Admins can update their diwaniya" ON diwaniyas;
DROP POLICY IF EXISTS "Super admins can insert diwaniyas" ON diwaniyas;
DROP POLICY IF EXISTS "Super admins can delete diwaniyas" ON diwaniyas;
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Admins can view their diwaniya activity logs" ON activity_logs;

-- 3. Recreate policies WITHOUT the super_admin check (simpler, no recursion)
-- Diwaniyas policies
CREATE POLICY "Admins can update their diwaniya" ON diwaniyas
  FOR UPDATE USING (admin_id = auth.uid());

-- Registrations policies
CREATE POLICY "Admins can view their diwaniya registrations" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their diwaniya registrations" ON registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND admin_id = auth.uid()
    )
  );

-- Bans policies
CREATE POLICY "Admins can view their diwaniya bans" ON bans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert bans for their diwaniya" ON bans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete bans from their diwaniya" ON bans
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND admin_id = auth.uid()
    )
  );

-- Activity logs policies
CREATE POLICY "Admins can view their diwaniya activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND admin_id = auth.uid()
    )
  );

-- Note: Super admin features will use the service role client which bypasses RLS
