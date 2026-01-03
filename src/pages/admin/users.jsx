// pages/admin/users.jsx - Admin Users Management Page
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getAdminUsers } from "@/utils/api";

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
      console.log("Users response:", usersRes);
      if (usersRes.ok && usersRes.data.users) {
        setUsers(usersRes.data.users);
      } else {
        console.error("Failed to fetch users:", usersRes.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

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
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Phone Number</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Department</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Roll No</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-stone-800/50">
                  <td className="px-6 py-4 text-amber-100">{user.fullName}</td>
                  <td className="px-6 py-4 text-amber-200/70 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-amber-200/70 text-sm">{user.phoneNumber}</td>
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
