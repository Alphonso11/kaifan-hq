# Kaifan HQ - Development Prompt for Claude Opus

## Project Overview

You are tasked with building **Kaifan HQ**, a web-based Diwaniya management platform. A Diwaniya is a traditional Kuwaiti/Gulf social gathering space - essentially a private social club or man cave where hosts receive guests for social gatherings.

## Core Purpose

Create a system where:

- **Guests** can view if a Diwaniya is open and register to attend
- **Admins** (Diwaniya owners) can manage their space, control access, and manage guest lists
- **Super Admin** (system owner) has full system control and oversight

---

## Technical Stack

### Frontend

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or React Context
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend

- **API**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (with NextAuth.js as alternative)
- **Real-time**: Supabase Real-time subscriptions
- **ORM**: Prisma (optional) or Supabase client

### Infrastructure

- **Hosting**: Vercel (frontend + API)
- **Database**: Supabase (free tier)
- **Environment**: Node.js 18+

---

## Database Schema

### Users Table

```sql
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('guest', 'admin', 'super_admin')) DEFAULT 'guest',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  banned BOOLEAN DEFAULT false,
  ban_reason TEXT
)
```

### Diwaniyas Table

```sql
diwaniyas (
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Registrations Table

```sql
registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diwaniya_id UUID REFERENCES diwaniyas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  registered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  admin_notes TEXT,
  UNIQUE(diwaniya_id, user_id)
)
```

### Bans Table

```sql
bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diwaniya_id UUID REFERENCES diwaniyas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  banned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_permanent BOOLEAN DEFAULT false,
  UNIQUE(diwaniya_id, user_id)
)
```

### Activity Logs Table (Optional but Recommended)

```sql
activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diwaniya_id UUID REFERENCES diwaniyas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## User Roles & Permissions

### Guest (Default Role)

**Capabilities:**

- View public Diwaniyas list
- See Diwaniya status (open/closed)
- Register to attend open Diwaniyas
- View own registration status
- Edit own profile
- View own registration history

**Restrictions:**

- Cannot register if banned
- Cannot register to closed Diwaniyas
- Cannot see other guests' information
- One active registration per Diwaniya

### Admin (Diwaniya Owner)

**Capabilities:**

- All guest capabilities for their Diwaniya
- Toggle Diwaniya open/closed status
- View all registrations for their Diwaniya
- Approve/Reject/Pend guest registrations
- Ban/Unban users from their Diwaniya
- Edit Diwaniya details (name, description, capacity, image)
- View guest history and statistics
- Add admin notes to registrations
- Export guest lists

**Restrictions:**

- Cannot manage other Diwaniyas
- Cannot change user roles
- Cannot delete their own Diwaniya (requires super admin)

### Super Admin (System Owner)

**Capabilities:**

- All admin capabilities across ALL Diwaniyas
- Create new Diwaniyas
- Assign/revoke admin roles
- Delete Diwaniyas
- Global user management
- View system-wide analytics
- Access all activity logs
- System configuration
- Manage global bans

---

## Feature Requirements

### Phase 1: Core Authentication & Setup

1. **Authentication System**

   - Email/password registration
   - Email verification
   - Login/logout
   - Password reset
   - Session management
   - Role-based access control (RBAC)

2. **User Profile**
   - View/edit profile
   - Upload avatar
   - Change password
   - View registration history

### Phase 2: Guest Features

1. **Diwaniya Discovery**

   - Public list of Diwaniyas
   - Search and filter
   - View Diwaniya details
   - Real-time status indicator (open/closed)

2. **Registration Flow**
   - Register for open Diwaniyas
   - Add optional notes
   - View registration status
   - Cancel pending registration
   - Receive status notifications

### Phase 3: Admin Dashboard

1. **Diwaniya Management**

   - Dashboard overview (stats, recent activity)
   - Toggle open/closed status with one click
   - Edit Diwaniya details
   - Set capacity limits
   - Upload images

2. **Guest Management**

   - View all registrations (with filters: pending/approved/rejected)
   - Approve/reject/pend with batch actions
   - Add admin notes to registrations
   - Search guests
   - View guest profiles
   - Export guest list (CSV)

3. **Ban System**
   - Ban users with reason
   - Set permanent or temporary bans
   - View banned users list
   - Unban users
   - Ban prevents future registrations

### Phase 4: Super Admin Panel

1. **System Overview**

   - Dashboard with system-wide metrics
   - Total users, Diwaniyas, registrations
   - Activity graphs and charts

2. **Diwaniya Management**

   - Create new Diwaniyas
   - Assign admins
   - Delete Diwaniyas
   - View all Diwaniyas

3. **User Management**

   - View all users
   - Change user roles
   - Global ban system
   - View user activity

4. **Activity Monitoring**
   - System-wide activity logs
   - Filter by action type, user, Diwaniya
   - Export logs

### Phase 5: Real-time & Notifications

1. **Real-time Updates**

   - Live Diwaniya status changes
   - Live registration updates for admins
   - Real-time capacity counter

2. **Notifications**
   - Email notifications for:
     - Registration status changes
     - Diwaniya opens/closes
     - Ban notifications
   - In-app notification center
   - Notification preferences

---

## Project Structure

```
kaifan-hq/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── guest/
│   │   │   │   ├── page.tsx                    # Guest dashboard
│   │   │   │   ├── diwaniyas/
│   │   │   │   │   ├── page.tsx                # Browse Diwaniyas
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx            # Diwaniya details
│   │   │   │   ├── registrations/
│   │   │   │   │   └── page.tsx                # My registrations
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx                # Profile settings
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                    # Admin dashboard
│   │   │   │   ├── registrations/
│   │   │   │   │   └── page.tsx                # Manage registrations
│   │   │   │   ├── guests/
│   │   │   │   │   └── page.tsx                # Guest list
│   │   │   │   ├── bans/
│   │   │   │   │   └── page.tsx                # Banned users
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx                # Diwaniya settings
│   │   │   ├── super-admin/
│   │   │   │   ├── page.tsx                    # Super admin dashboard
│   │   │   │   ├── diwaniyas/
│   │   │   │   │   ├── page.tsx                # All Diwaniyas
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx            # Create Diwaniya
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx                # User management
│   │   │   │   └── logs/
│   │   │   │       └── page.tsx                # Activity logs
│   │   │   └── layout.tsx                      # Dashboard layout
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...]/route.ts              # Auth endpoints
│   │   │   ├── diwaniyas/
│   │   │   │   ├── route.ts                    # List/create
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts                # Get/update/delete
│   │   │   │       ├── toggle-status/route.ts
│   │   │   │       └── registrations/route.ts
│   │   │   ├── registrations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── status/route.ts
│   │   │   ├── bans/
│   │   │   │   └── route.ts
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── layout.tsx                          # Root layout
│   │   └── page.tsx                            # Landing page
│   ├── components/
│   │   ├── ui/                                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── nav.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   └── protected-route.tsx
│   │   ├── diwaniya/
│   │   │   ├── diwaniya-card.tsx
│   │   │   ├── diwaniya-list.tsx
│   │   │   ├── status-badge.tsx
│   │   │   └── status-toggle.tsx
│   │   ├── registration/
│   │   │   ├── registration-form.tsx
│   │   │   ├── registration-table.tsx
│   │   │   └── status-actions.tsx
│   │   └── admin/
│   │       ├── stats-card.tsx
│   │       ├── guest-table.tsx
│   │       └── ban-dialog.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Browser client
│   │   │   ├── server.ts                       # Server client
│   │   │   └── middleware.ts                   # Auth middleware
│   │   ├── utils.ts                            # Utility functions
│   │   ├── constants.ts                        # App constants
│   │   └── validations.ts                      # Zod schemas
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-diwaniyas.ts
│   │   ├── use-registrations.ts
│   │   └── use-realtime.ts
│   ├── types/
│   │   ├── database.ts                         # Supabase types
│   │   ├── user.ts
│   │   ├── diwaniya.ts
│   │   └── registration.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   └── icons/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql                                # Sample data
├── .env.local.example
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Development Guidelines

### Code Quality

- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Implement proper error handling
- Add loading states for all async operations
- Write meaningful commit messages
- Comment complex logic

### Security

- Implement Row Level Security (RLS) in Supabase
- Validate all inputs with Zod
- Sanitize user inputs
- Use environment variables for secrets
- Implement rate limiting on API routes
- Use HTTPS in production
- Implement CSRF protection
- Secure file uploads

### Performance

- Use Next.js Image component
- Implement pagination for lists
- Use React Server Components where possible
- Optimize database queries
- Implement caching strategies
- Lazy load components
- Use proper indexing in database

### UX/UI

- Mobile-first responsive design
- Loading skeletons for better UX
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Keyboard navigation support
- Accessibility (ARIA labels, semantic HTML)
- Dark mode support (optional)

### Testing (Phase 5+)

- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Test role-based access

---

## API Endpoints Structure

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Diwaniyas

- `GET /api/diwaniyas` - List all public Diwaniyas
- `POST /api/diwaniyas` - Create Diwaniya (super admin)
- `GET /api/diwaniyas/[id]` - Get Diwaniya details
- `PATCH /api/diwaniyas/[id]` - Update Diwaniya (admin)
- `DELETE /api/diwaniyas/[id]` - Delete Diwaniya (super admin)
- `POST /api/diwaniyas/[id]/toggle-status` - Open/close (admin)

### Registrations

- `GET /api/registrations` - List user's registrations
- `POST /api/registrations` - Create registration (guest)
- `GET /api/diwaniyas/[id]/registrations` - List Diwaniya registrations (admin)
- `PATCH /api/registrations/[id]/status` - Update status (admin)
- `DELETE /api/registrations/[id]` - Cancel registration (guest)

### Bans

- `GET /api/diwaniyas/[id]/bans` - List banned users (admin)
- `POST /api/bans` - Ban user (admin)
- `DELETE /api/bans/[id]` - Unban user (admin)

### Users

- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile
- `GET /api/users` - List all users (super admin)
- `PATCH /api/users/[id]/role` - Change role (super admin)

---

## Supabase Setup Instructions

### 1. Create Supabase Project

- Go to supabase.com and create new project
- Note your project URL and anon key

### 2. Run Migration

Execute the schema SQL to create all tables

### 3. Enable Row Level Security

```sql
-- Users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Diwaniyas RLS
ALTER TABLE diwaniyas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view diwaniyas" ON diwaniyas FOR SELECT USING (true);
CREATE POLICY "Admins can update their diwaniya" ON diwaniyas FOR UPDATE USING (
  admin_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Registrations RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view their diwaniya registrations" ON registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM diwaniyas
    WHERE id = diwaniya_id AND (
      admin_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    )
  )
);

-- Add more RLS policies as needed
```

### 4. Enable Real-time

Enable real-time for tables: diwaniyas, registrations

### 5. Configure Authentication

- Enable email provider
- Configure email templates
- Set up redirect URLs

---

## Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Kaifan HQ

# Email (optional, for custom emails)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

---

## Initial Tasks Checklist

### Setup Phase

- [ ] Initialize Next.js project with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Set up shadcn/ui components
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Set up Git and initial commit

### Phase 1: Authentication

- [ ] Implement Supabase Auth setup
- [ ] Create login page
- [ ] Create signup page
- [ ] Create password reset flow
- [ ] Implement protected routes
- [ ] Create user profile page
- [ ] Add role-based access control

### Phase 2: Core Features

- [ ] Create Diwaniya list page
- [ ] Create Diwaniya details page
- [ ] Implement registration flow
- [ ] Add real-time status updates
- [ ] Create guest dashboard
- [ ] Show registration status

### Phase 3: Admin Features

- [ ] Create admin dashboard
- [ ] Implement status toggle
- [ ] Create registration management table
- [ ] Add approve/reject actions
- [ ] Implement ban system
- [ ] Add guest management
- [ ] Create Diwaniya settings page

### Phase 4: Super Admin

- [ ] Create super admin dashboard
- [ ] Implement user management
- [ ] Add Diwaniya creation
- [ ] Create activity logs viewer
- [ ] Add system statistics

### Phase 5: Polish

- [ ] Add email notifications
- [ ] Implement in-app notifications
- [ ] Add loading states
- [ ] Error handling
- [ ] Mobile responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization

---

## Success Criteria

### Functional Requirements

✅ Users can register and login
✅ Guests can view and register for open Diwaniyas
✅ Admins can manage their Diwaniya and guests
✅ Super admin has full system control
✅ Real-time updates work correctly
✅ Ban system prevents access
✅ Email notifications are sent

### Non-Functional Requirements

✅ Mobile responsive (works on phones/tablets)
✅ Fast page loads (<3 seconds)
✅ Secure (RLS, input validation)
✅ Accessible (WCAG 2.1 AA compliance)
✅ Scalable (handles 1000+ users)

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format

# Generate Supabase types
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

---

## Important Notes

1. **Start Simple**: Build core features first, then add polish
2. **Security First**: Always implement RLS and input validation
3. **User Experience**: Focus on clear, intuitive flows
4. **Mobile First**: Design for mobile, enhance for desktop
5. **Real-time**: Leverage Supabase real-time for live updates
6. **Error Handling**: Always handle errors gracefully
7. **Documentation**: Comment complex logic and update README
8. **Git Workflow**: Commit often with clear messages

---

## Questions to Answer During Development

1. Should guests need approval before seeing Diwaniya details?
2. Should there be a waitlist when capacity is reached?
3. Should admins be able to send messages to registered guests?
4. Should there be a public/private toggle for Diwaniyas?
5. Should guests be able to rate/review Diwaniyas after attending?
6. Should there be a check-in system for attendance tracking?
7. Should super admin approve new admin assignments?

---

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

---

## Final Notes

This is a comprehensive guide to build Kaifan HQ. Start with Phase 1 (Authentication) and work your way through each phase. Don't try to build everything at once - focus on getting one feature working well before moving to the next.

The key to success is:

1. **Build incrementally**
2. **Test as you go**
3. **Keep code clean and organized**
4. **Focus on user experience**
5. **Security and performance from the start**

Good luck building Kaifan HQ! 🚀
