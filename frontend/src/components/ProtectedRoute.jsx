import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
          setAuthenticated(false);
          setUser(null);
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser || !parsedUser.role) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          setAuthenticated(false);
          setUser(null);
          return;
        }

        setUser(parsedUser);
        setAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        setAuthenticated(false);
        setUser(null);
      } finally {
        setChecking(false);
      }
    };

    checkAuthentication();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-9 w-9 animate-spin text-orange-600" />

          <p className="mt-3 font-medium text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    const dashboardRoutes = {
      STUDENT: "/student/dashboard",
      INSTRUCTOR: "/instructor/dashboard",
      ADMIN: "/admin/dashboard",
    };

    return (
      <Navigate
        to={dashboardRoutes[user.role] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
