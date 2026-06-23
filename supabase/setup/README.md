# Rebuilding the Kaifan HQ database

The old database is gone. These scripts recreate it in a fresh Supabase project.

The backup (`db_cluster-12-01-2026@15-38-30.backup`) was a full Supabase
**cluster** dump — it contained Supabase's own managed schemas (`auth`,
`storage`, `realtime`, `vault`) and roles, which a new Supabase project
**already provides**. So we do **not** replay the whole dump. We only recreate
the app's `public` schema and restore the app data.

The actual app data in the backup was tiny: **2 user accounts and nothing
else** (no diwaniyas, registrations, bans, or activity logs).

| user | name | role |
| --- | --- | --- |
| `jakeallonzo@gmail.com` | Amo Abbas | **super_admin** |
| `malis39014@emaxasp.com` | Asian fatty | guest |

## Steps

1. **Create a new project** at [supabase.com](https://supabase.com) (or reuse an
   empty one). Note its **Project URL**, **anon key**, and **service_role key**
   from Project Settings → API.

2. **Run the schema.** Open Database → **SQL Editor**, paste all of
   [`01_schema.sql`](./01_schema.sql), and run it. This creates the 5 tables,
   3 trigger functions, triggers, indexes, and RLS policies.

3. **Restore the users.** In the SQL Editor, paste all of
   [`02_restore_data.sql`](./02_restore_data.sql) and run it. This recreates the
   2 accounts with their **original IDs, passwords, and roles** — the old logins
   keep working and Amo Abbas stays super_admin.

4. **Point the app at the new project.** Edit `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-new-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<new anon key>
   SUPABASE_SERVICE_ROLE_KEY=<new service_role key>
   ```

   Then restart `npm run dev`. Log in as the super_admin and create your first
   Diwaniya from the super-admin panel.

## Alternative: skip the auth-schema restore

If you'd rather not insert into the `auth` schema directly, you can instead:

1. Run `01_schema.sql` only.
2. Create the two users from the dashboard (Authentication → **Add user**) or
   just have them sign up through the app. The `handle_new_user` trigger
   auto-creates their `public.users` profile as `guest`, with a **new** UUID and
   a **new** password.
3. Promote the super_admin by email:

   ```sql
   update public.users set role = 'super_admin', name = 'Amo Abbas'
   where email = 'jakeallonzo@gmail.com';
   ```

This is fine because nothing in the backup referenced the old user IDs — only
the role assignment matters. Trade-off: new UUIDs and the users set new
passwords instead of keeping the originals.
