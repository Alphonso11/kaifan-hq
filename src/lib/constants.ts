export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Kaifan HQ";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const USER_ROLES = {
  GUEST: "guest",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export const REGISTRATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  GUEST: {
    DASHBOARD: "/guest",
    DIWANIYAS: "/guest/diwaniyas",
    REGISTRATIONS: "/guest/registrations",
    PROFILE: "/guest/profile",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    REGISTRATIONS: "/admin/registrations",
    GUESTS: "/admin/guests",
    BANS: "/admin/bans",
    SETTINGS: "/admin/settings",
  },
  SUPER_ADMIN: {
    DASHBOARD: "/super-admin",
    DIWANIYAS: "/super-admin/diwaniyas",
    NEW_DIWANIYA: "/super-admin/diwaniyas/new",
    USERS: "/super-admin/users",
    LOGS: "/super-admin/logs",
  },
} as const;
