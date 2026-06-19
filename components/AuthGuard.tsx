"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for public routes
    const publicRoutes = ["/login", "/register", "/"];
    if (publicRoutes.includes(pathname) || pathname.startsWith("/register/")) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Check authentication
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("is_logged_in");
        const token = localStorage.getItem("access_token");
        const user = localStorage.getItem("user");

        if (isLoggedIn === "true" && token && user) {
          // Validate user data
          const userData = JSON.parse(user);
          if (userData && userData.username) {
            setIsAuthenticated(true);
          } else {
            // Invalid user data, clear and redirect
            localStorage.removeItem("is_logged_in");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            router.push("/login");
            return;
          }
        } else {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear corrupted data and redirect
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Add logout function to window for easy access
  useEffect(() => {
    const publicRoutes = ["/login", "/register", "/"];
    if (isAuthenticated && !publicRoutes.includes(pathname)) {
      (window as any).logout = () => {
        localStorage.removeItem("is_logged_in");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      };
    }
  }, [isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#64748b",
        fontSize: 14
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>Memuat aplikasi...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}