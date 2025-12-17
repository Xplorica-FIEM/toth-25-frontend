import { Compass, User, Mail, Building2, Hash, Calendar, Phone, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users');
      const data = await response.json();
      
      if (response.ok) {
        console.log('User data:', data.users); // Add this to check field names
        setUsers(data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      alert('Could not connect to server');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1633785584922-503ad0e982f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwdHJlYXN1cmUlMjBnb2xkfGVufDF8fHx8MTc2NTc1MTk4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <Compass className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-amber-100">Registered Users</h1>
          </div>
          <p className="text-amber-100/70 text-lg">
            Total Members: {users.length}
          </p>
          <Link
            href="/rohan/Registration"
            className="inline-block mt-4 px-6 py-2 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-500 transition-all"
          >
            Add New User
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-amber-100 text-xl">
            Loading users...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/20 text-red-100 p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Users Grid */}
        {!loading && !error && users.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Table Container */}
              <div className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl border border-amber-700/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead className="bg-amber-900/50 border-b border-amber-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            ID
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Full Name
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Department
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Roll No
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Joined Date
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center text-amber-100 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-amber-700/30">
                      {users.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-amber-900/30 transition-colors group/row"
                        >
                          <td className="px-6 py-4 text-amber-100/90">
                            <span className="font-mono text-sm">{user.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center group-hover/row:bg-amber-400/30 transition-colors">
                                <User className="w-5 h-5 text-amber-400" />
                              </div>
                              <span className="text-amber-100 font-medium">{user.fullName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-amber-100/80">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-amber-100/80">
                            {user.phoneNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-amber-400/20 text-amber-100 rounded-full text-sm">
                              {user.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-amber-100/90 font-mono">
                            {user.deptRollNo}
                          </td>
                          <td className="px-6 py-4 text-amber-100/70 text-sm">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleDelete(user.id, user.fullName)}
                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all group/delete"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer - Stats */}
                <div className="bg-amber-900/30 border-t border-amber-700/50 px-6 py-4">
                  <div className="flex items-center justify-between text-amber-100/70 text-sm">
                    <span>Showing {users.length} {users.length === 1 ? 'user' : 'users'}</span>
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <div className="text-center text-amber-100/70 text-lg">
            No users registered yet. Be the first to join!
          </div>
        )}
      </div>
    </div>
  );
}
