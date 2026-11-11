import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  X,
  GraduationCap,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/");

      setUsers(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      setDetailsLoading(true);
      setSelectedUser(null);

      const response = await api.get(`/users/${userId}`);

      setSelectedUser(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to load user details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (user.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const studentCount = users.filter(
    (user) => user.role === "STUDENT"
  ).length;

  const instructorCount = users.filter(
    (user) => user.role === "INSTRUCTOR"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const getRoleStyle = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";

      case "INSTRUCTOR":
        return "bg-blue-100 text-blue-700";

      case "STUDENT":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-600" />
          <p className="mt-3 font-medium text-gray-600">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Users
            </h1>

            <p className="mt-2 text-gray-600">
              View and monitor registered platform users.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            <RefreshCw size={18} />
            Refresh Users
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {users.length}
                </h2>
              </div>

              <Users size={28} className="text-orange-600" />
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Students
                </p>

                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {studentCount}
                </h2>
              </div>

              <GraduationCap size={28} className="text-green-600" />
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Instructors
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                  {instructorCount}
                </h2>
              </div>

              <UserCheck size={28} className="text-blue-600" />
            </div>
          </div>

          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Administrators
                </p>

                <h2 className="mt-2 text-3xl font-bold text-purple-600">
                  {adminCount}
                </h2>
              </div>

              <ShieldCheck size={28} className="text-purple-600" />
            </div>
          </div>

        </div>

        <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <h2 className="text-xl font-bold text-gray-900">
              Registered Users
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <Search size={18} className="text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search name or email"
                  className="w-full outline-none sm:w-56"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-orange-500"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="INSTRUCTOR">Instructors</option>
                <option value="ADMIN">Administrators</option>
              </select>

            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center">
              <Users
                size={45}
                className="mx-auto text-orange-400"
              />

              <h3 className="mt-3 font-semibold text-gray-800">
                No Users Found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                No users match your search or selected role.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">

                <thead>
                  <tr className="border-b border-gray-200 bg-orange-50">
                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      User ID
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Name
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Role
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-orange-50"
                    >
                      <td className="px-4 py-4 text-sm text-gray-600">
                        #{user.id}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-gray-800">
                        {user.name || "N/A"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => viewUserDetails(user.id)}
                          className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-200"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>

      {(selectedUser || detailsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                User Details
              </h2>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={21} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-7 w-7 animate-spin text-orange-600" />
              </div>
            ) : (
              <div className="space-y-4">

                <div>
                  <p className="text-sm text-gray-500">
                    User ID
                  </p>

                  <p className="font-semibold text-gray-800">
                    {selectedUser.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Name
                  </p>

                  <p className="font-semibold text-gray-800">
                    {selectedUser.name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="font-semibold text-gray-800">
                    {selectedUser.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Role
                  </p>

                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Account Status
                  </p>

                  <p className="font-semibold text-gray-800">
                    {selectedUser.is_active
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                {selectedUser.created_at && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Created At
                    </p>

                    <p className="font-semibold text-gray-800">
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                )}

              </div>
            )}

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManageUsers;
