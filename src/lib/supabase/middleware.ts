import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ["/guest", "/admin", "/super-admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Auth routes - redirect to dashboard if already authenticated
  const authRoutes = ["/login", "/signup", "/forgot-password"];
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    // Get user role from database
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = (userData as { role: string } | null)?.role;

    if (userRole === "super_admin") {
      url.pathname = "/super-admin";
    } else if (userRole === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/guest";
    }
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (user && isProtectedRoute) {
    const { data: userData } = await supabase
      .from("users")
      .select("role, banned")
      .eq("id", user.id)
      .single();

    const typedUserData = userData as { role: string; banned: boolean } | null;

    // Check if user is banned
    if (typedUserData?.banned) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "banned");
      await supabase.auth.signOut();
      return NextResponse.redirect(url);
    }

    // Check role-based access
    if (path.startsWith("/super-admin") && typedUserData?.role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = typedUserData?.role === "admin" ? "/admin" : "/guest";
      return NextResponse.redirect(url);
    }

    if (
      path.startsWith("/admin") &&
      !["admin", "super_admin"].includes(typedUserData?.role || "")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/guest";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
