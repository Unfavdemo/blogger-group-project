import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes (schema uses lowercase: admin, editor, reader)
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Editor routes (posts creation/editing)
    if (path.startsWith("/posts/create") || path.startsWith("/posts/edit")) {
      if (token?.role === "reader") {
        return NextResponse.redirect(new URL("/posts", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect authenticated routes
        const path = req.nextUrl.pathname;
        const publicRoutes = ["/login", "/signup", "/request-reset", "/reset-password"];
        
        if (publicRoutes.includes(path)) {
          return true; // Allow access to public routes
        }

        // Require auth for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/posts/:path*",
    "/admin/:path*",
    "/wellness/:path*",
    "/api/posts/:path*",
    "/api/comments/:path*",
    "/api/wellness/:path*",
  ],
};
