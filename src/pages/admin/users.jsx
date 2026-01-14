// pages/admin/users.jsx - Admin Users Management Page
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getAdminUsers } from "@/utils/api";

function AdminUsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const usersRes = await getAdminUsers(page, itemsPerPage);
      console.log("Users response:", usersRes);
      if (usersRes.ok && usersRes.data.users) {
        setUsers(usersRes.data.users);
        setTotalPages(usersRes.data.pagination.totalPages);
        setTotalUsers(usersRes.data.pagination.totalUsers);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <AdminLayout activeTab="users">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-100">Users Management</h1>
        <p className="text-amber-200/70">Total: {totalUsers}</p>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mb-4"></div>
          <p className="text-amber-400 font-mono text-lg animate-pulse">Loading Users...</p>
          <p className="text-amber-200/60 text-sm mt-2">Fetching user data</p>
        </div>
      ) : (
        <>
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden mb-6">
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
                  {users?.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-amber-200/50 font-mono">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-amber-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors font-mono text-sm"
              >
                &larr; Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Only show current page, first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm transition-colors ${
                          currentPage === pageNum
                            ? "bg-amber-500 text-stone-900 font-bold"
                            : "bg-stone-800 text-amber-200 hover:bg-stone-700 border border-stone-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-amber-200/50">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-amber-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors font-mono text-sm"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default function AdminUsers() {
  return (
    <ProtectedRoute >
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
