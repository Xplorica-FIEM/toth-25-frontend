// pages/admin/users.jsx - Admin Users Management Page
import { useState, useEffect } from "react";
import { Trash2, Shield } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getAdminUsers, deleteUser, toggleAdminStatus } from "@/utils/api";
import Loader from "../loadinganimation";

function AdminUsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRes = await getAdminUsers();
      if (usersRes.ok && usersRes.data.data) setUsers(usersRes.data.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await deleteUser(userId);
      if (response.ok) {
        alert("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleToggleAdmin = async (userId) => {
    if (!confirm("Are you sure you want to toggle admin status?")) return;
    try {
      const response = await toggleAdminStatus(userId);
      if (response.ok) {
        alert("Admin status updated");
        fetchUsers();
      }
    } catch (error) {
      alert("Failed to update admin status");
    }
  };

  if (loading) {
    return (
      <AdminLayout activeTab="users">
        <div className="flex items-center justify-center h-96">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="users">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-100">Users Management</h1>
        <p className="text-amber-200/70">Total: {users?.length || 0}</p>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-800">
              <tr>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Department</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Roll No</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-stone-800/50">
                  <td className="px-6 py-4 text-amber-100">{user.fullName}</td>
                  <td className="px-6 py-4 text-amber-200/70 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-amber-200/70 text-sm">{user.department}</td>
                  <td className="px-6 py-4 text-amber-200/70 text-sm">{user.classRollNo}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isAdmin
                          ? "bg-purple-900/30 text-purple-300 border border-purple-700"
                          : "bg-stone-800 text-amber-200 border border-stone-700"
                      }`}
                    >
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAdmin(user.id)}
                        className="p-2 text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Toggle Admin"
                      >
                        <Shield className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminUsers() {
  return (
    <ProtectedRoute adminOnly>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
