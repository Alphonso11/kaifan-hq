-- Kaifan HQ Initial Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('guest', 'admin', 'super_admin')) DEFAULT 'guest',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned BOOLEAN DEFAULT false,
  ban_reason TEXT
);

-- Diwaniyas Table
CREATE TABLE IF NOT EXISTS diwaniyas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255),
  description TEXT,
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_open BOOLEAN DEFAULT false,
  current_capacity INT DEFAULT 0,
  max_capacity INT DEFAULT 50,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diwaniya_id UUID REFERENCES diwaniyas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  admin_notes TEXT,
  UNIQUE(diwaniya_id, user_id)
);

-- Bans Table
CREATE TABLE IF NOT EXISTS bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diwaniya_id UUID REFERENCES diwaniyas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  UNIQUE(diwaniya_id, user_id)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diwaniya_id UUID REFERENCES diwaniyas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diwaniyas_admin_id ON diwaniyas(admin_id);
CREATE INDEX IF NOT EXISTS idx_diwaniyas_slug ON diwaniyas(slug);
CREATE INDEX IF NOT EXISTS idx_diwaniyas_is_open ON diwaniyas(is_open);
CREATE INDEX IF NOT EXISTS idx_registrations_diwaniya_id ON registrations(diwaniya_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_bans_diwaniya_id ON bans(diwaniya_id);
CREATE INDEX IF NOT EXISTS idx_bans_user_id ON bans(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_diwaniya_id ON activity_logs(diwaniya_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diwaniyas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Diwaniyas RLS Policies
CREATE POLICY "Anyone can view diwaniyas" ON diwaniyas
  FOR SELECT USING (true);

CREATE POLICY "Admins can update their diwaniya" ON diwaniyas
  FOR UPDATE USING (
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can insert diwaniyas" ON diwaniyas
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can delete diwaniyas" ON diwaniyas
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Registrations RLS Policies
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view their diwaniya registrations" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
      )
    )
  );

CREATE POLICY "Users can insert own registrations" ON registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own pending registrations" ON registrations
  FOR DELETE USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can update their diwaniya registrations" ON registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
      )
    )
  );

-- Bans RLS Policies
CREATE POLICY "Admins can view their diwaniya bans" ON bans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
      )
    )
  );

CREATE POLICY "Users can view own bans" ON bans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert bans for their diwaniya" ON bans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
      )
    )
  );

CREATE POLICY "Admins can delete bans from their diwaniya" ON bans
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND (
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
      )
    )
  );

-- Activity Logs RLS Policies
CREATE POLICY "Super admins can view all activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can view their diwaniya activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diwaniyas
      WHERE id = diwaniya_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Function to update current_capacity
CREATE OR REPLACE FUNCTION update_diwaniya_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE diwaniyas SET current_capacity = current_capacity + 1 WHERE id = NEW.diwaniya_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE diwaniyas SET current_capacity = current_capacity + 1 WHERE id = NEW.diwaniya_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE diwaniyas SET current_capacity = current_capacity - 1 WHERE id = NEW.diwaniya_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE diwaniyas SET current_capacity = current_capacity - 1 WHERE id = OLD.diwaniya_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update capacity on registration changes
DROP TRIGGER IF EXISTS update_capacity_on_registration ON registrations;
CREATE TRIGGER update_capacity_on_registration
  AFTER INSERT OR UPDATE OR DELETE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_diwaniya_capacity();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diwaniyas_updated_at
  BEFORE UPDATE ON diwaniyas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
