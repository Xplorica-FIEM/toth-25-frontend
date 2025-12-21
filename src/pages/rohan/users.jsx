"use client";

import { useEffect, useState } from "react";
import { Trash2, Compass } from "lucide-react";
import Link from "next/link";

export default function Users() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users`);
        const data = await res.json();

        if (!res.ok) throw new Error();

        setUsers(data.users || []);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [BACKEND_URL]);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    const res = await fetch(`${BACKEND_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-black/80 p-8">
      <div className="text-center mb-6">
        <Compass className="mx-auto text-amber-400" size={38} />
        <h1 className="text-amber-100 text-2xl">Users</h1>

        <Link
          href="/rohan/Registration"
          className="inline-block mt-3 bg-amber-400 px-4 py-2 rounded text-black"
        >
          Add User
        </Link>
      </div>

      {loading && <p className="text-center text-amber-100">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="max-w-4xl mx-auto space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center bg-amber-900/60 p-4 rounded"
            >
              <div>
                <p className="text-amber-100">{u.fullName}</p>
                <p className="text-amber-100/70 text-sm">{u.email}</p>
              </div>

              <button
                onClick={() => deleteUser(u.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
