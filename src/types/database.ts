export type UserRole = "guest" | "admin" | "super_admin";
export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface User extends Record<string, unknown> {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  banned: boolean;
  ban_reason: string | null;
  can_host: boolean;
}

export interface Diwaniya extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  description: string | null;
  admin_id: string;
  is_open: boolean;
  current_capacity: number;
  max_capacity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiwaniyaWithAdmin extends Diwaniya {
  admin: Pick<User, "id" | "name" | "email">;
}

export interface Registration extends Record<string, unknown> {
  id: string;
  diwaniya_id: string;
  user_id: string;
  status: RegistrationStatus;
  registered_at: string;
  updated_at: string;
  notes: string | null;
  admin_notes: string | null;
}

export interface RegistrationWithDetails extends Registration {
  user: Pick<User, "id" | "name" | "email" | "phone">;
  diwaniya: Pick<Diwaniya, "id" | "name" | "slug">;
}

export interface Ban extends Record<string, unknown> {
  id: string;
  diwaniya_id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  banned_at: string;
  expires_at: string | null;
  is_permanent: boolean;
}

export interface BanWithDetails extends Ban {
  user: Pick<User, "id" | "name" | "email">;
  banned_by_user: Pick<User, "id" | "name">;
  diwaniya: Pick<Diwaniya, "id" | "name" | "slug">;
}

export interface ActivityLog extends Record<string, unknown> {
  id: string;
  diwaniya_id: string | null;
  user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ActivityLogWithDetails extends ActivityLog {
  user: Pick<User, "id" | "name" | "email"> | null;
  diwaniya: Pick<Diwaniya, "id" | "name" | "slug"> | null;
}

export interface InviteLink extends Record<string, unknown> {
  id: string;
  diwaniya_id: string;
  token: string;
  created_by: string | null;
  created_at: string;
  expires_at: string;
}

export interface DiwaniyaAccess extends Record<string, unknown> {
  id: string;
  diwaniya_id: string;
  user_id: string;
  created_at: string;
}

// Database schema type for Supabase
// Using a more permissive type structure that allows Supabase queries to work properly
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
        Relationships: [];
      };
      diwaniyas: {
        Row: Diwaniya;
        Insert: Omit<Diwaniya, "id" | "created_at" | "updated_at" | "current_capacity">;
        Update: Partial<Omit<Diwaniya, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "diwaniyas_admin_id_fkey";
            columns: ["admin_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      registrations: {
        Row: Registration;
        Insert: Omit<Registration, "id" | "registered_at" | "updated_at">;
        Update: Partial<Omit<Registration, "id" | "registered_at">>;
        Relationships: [
          {
            foreignKeyName: "registrations_diwaniya_id_fkey";
            columns: ["diwaniya_id"];
            referencedRelation: "diwaniyas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      bans: {
        Row: Ban;
        Insert: Omit<Ban, "id" | "banned_at">;
        Update: Partial<Omit<Ban, "id" | "banned_at">>;
        Relationships: [
          {
            foreignKeyName: "bans_diwaniya_id_fkey";
            columns: ["diwaniya_id"];
            referencedRelation: "diwaniyas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bans_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bans_banned_by_fkey";
            columns: ["banned_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, "id" | "created_at">;
        Update: Partial<Omit<ActivityLog, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "activity_logs_diwaniya_id_fkey";
            columns: ["diwaniya_id"];
            referencedRelation: "diwaniyas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      invite_links: {
        Row: InviteLink;
        Insert: Omit<InviteLink, "id" | "created_at">;
        Update: Partial<Omit<InviteLink, "id" | "created_at">>;
        Relationships: [];
      };
      diwaniya_access: {
        Row: DiwaniyaAccess;
        Insert: Omit<DiwaniyaAccess, "id" | "created_at">;
        Update: Partial<Omit<DiwaniyaAccess, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_diwaniya: {
        Args: {
          p_name: string;
          p_slug: string;
          p_location?: string | null;
          p_description?: string | null;
          p_max_capacity?: number | null;
        };
        Returns: string;
      };
      create_invite_link: {
        Args: { p_diwaniya_id: string };
        Returns: string;
      };
      use_invite: {
        Args: { p_token: string };
        Returns: string | null;
      };
    };
    Enums: {
      user_role: UserRole;
      registration_status: RegistrationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
