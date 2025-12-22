"use client";

import { useEffect, useState } from "react";
import { Trash2, Compass, Plus } from "lucide-react";
import Link from "next/link";

export default function Users() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users`);
        const data = await res.json();

        if (!res.ok) throw new Error();

        setUsers(data.users || []);
      } catch {
        setMessage({ type: "error", text: "Failed to load users from the realm." });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [BACKEND_URL]);

  const deleteUser = async (id) => {
    if (!confirm("Banish this user from the realm?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setMessage({ type: "success", text: "User banished successfully." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        throw new Error();
      }
    } catch {
      setMessage({ type: "error", text: "Banishing ritual failed." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div className="min-h-screen relative bg-stone-900 text-amber-100 p-6">
      {/* ---------------- HEADER ---------------- */}
      <header className="text-center mb-12">
        <Compass className="mx-auto size-14 text-amber-400 animate-pulse" />
        <h1 className="text-4xl font-bold mt-4">User Guild</h1>
        <p className="text-amber-100/70 mt-2">
          Manage the adventurers registered in the system
        </p>
      </header>

      {/* ---------------- FEEDBACK BANNER ---------------- */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg text-center ${
            message.type === "success"
              ? "bg-green-500/20 text-green-100"
              : "bg-red-500/20 text-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ---------------- ACTIONS ---------------- */}
      <div className="flex justify-end mb-6">
        <Link
          href="/Registration"
          className="bg-amber-600 px-5 py-3 rounded-lg flex gap-2 text-white hover:bg-amber-700 transition-colors"
        >
          <Plus /> Add User
        </Link>
      </div>

      {/* ---------------- TABLE VAULT ---------------- */}
      <div className="bg-amber-900/60 rounded-xl overflow-hidden min-h-[200px] relative border border-amber-700/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-amber-100/70">
            <span className="animate-pulse">Consulting the archives...</span>
          </div>
        ) : users.length === 0 ? (
          <p className="p-6 text-center text-amber-100/70">
            No adventurers found.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-amber-800/40">
              <tr>
                <th className="p-4 text-amber-200">Name</th>
                <th className="p-4 text-amber-200">Email Scroll</th>
                <th className="p-4 text-amber-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="border-t border-amber-700/30 hover:bg-amber-800/20 transition-colors">
                  <td className="p-4 font-medium">{u.fullName}</td>
                  {/* Styled like the 'Answer' in the riddle list */}
                  <td className="p-4 text-green-400 font-mono text-sm">
                    {u.email}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900/20 rounded"
                      title="Delete User"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}