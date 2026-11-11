import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  GraduationCap,
  LogOut,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Award,
  Users,
  BarChart3,
  UserCircle,
} from "lucide-react";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();

    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const studentLinks = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Courses",
      path: "/courses",
      icon: BookOpen,
    },
    {
      name: "My Courses",
      path: "/student/my-courses",
      icon: GraduationCap,
    },
    {
      name: "Results",
      path: "/student/results",
      icon: Award,
    },
  ];

  const instructorLinks = [
    {
      name: "Dashboard",
      path: "/instructor/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Courses",
      path: "/instructor/manage-courses",
      icon: BookOpen,
    },
    {
      name: "Manage Assessments",
      path: "/instructor/manage-assessments",
      icon: ClipboardList,
    },
    {
      name: "Create Assessment",
      path: "/instructor/create-assessment",
      icon: GraduationCap,
    },
    {
      name: "Assessment Results",
      path: "/instructor/assessment-results",
      icon: Award,
    },
  ];

  const adminLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Users",
      path: "/admin/manage-users",
      icon: Users,
    },
    {
      name: "Manage Courses",
      path: "/admin/manage-courses",
      icon: BookOpen,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  const getLinks = () => {
    if (user?.role === "STUDENT") {
      return studentLinks;
    }

    if (user?.role === "INSTRUCTOR") {
      return instructorLinks;
    }

    if (user?.role === "ADMIN") {
      return adminLinks;
    }

    return [];
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUser(null);
    setMobileMenuOpen(false);

    toast.success("Logged out successfully");

    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const links = getLinks();

  const getRoleName = (role) => {
    if (!role) return "";

    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to={user ? links[0]?.path || "/login" : "/login"}
            onClick={closeMobileMenu}
            className="flex items-center gap-2"
          >
            <div className="rounded-lg bg-orange-600 p-2 text-white">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Smart Learning
              </h1>

              <p className="text-xs font-medium text-orange-600">
                Learning Platform
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {!user && (
              <Link
                to="/courses"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
              >
                Courses
              </Link>
            )}

            {links.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
                >
                  <Icon size={17} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {user && (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                  <UserCircle
                    size={22}
                    className="text-orange-600"
                  />

                  <div>
                    <p className="max-w-32 truncate text-sm font-semibold text-gray-800">
                      {user.name || user.email || "User"}
                    </p>

                    <p className="text-xs text-orange-600">
                      {getRoleName(user.role)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-700 hover:bg-orange-50 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-orange-100 py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              {!user && (
                <Link
                  to="/courses"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <BookOpen size={19} />
                  Courses
                </Link>
              )}

              {links.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <Icon size={19} />
                    {link.name}
                  </Link>
                );
              })}

              {user && (
                <>
                  <div className="my-2 border-t border-orange-100" />

                  <div className="flex items-center gap-3 px-4 py-2">
                    <UserCircle
                      size={25}
                      className="text-orange-600"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {user.name || user.email || "User"}
                      </p>

                      <p className="text-xs text-orange-600">
                        {getRoleName(user.role)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg bg-orange-600 px-4 py-3 text-left font-semibold text-white hover:bg-orange-700"
                  >
                    <LogOut size={19} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;