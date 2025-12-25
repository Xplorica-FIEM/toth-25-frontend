// pages/admin/riddles-list.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RiddlesList() {
  const router = useRouter();
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Client-only admin guard
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    fetchRiddles();
  }, []);

  const fetchRiddles = async () => {
    try {
      const res = await fetch("/api/admin/riddles");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load riddles");
      }

      setRiddles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading riddles…</p>;
  if (error) return <p style={{ padding: 40, color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>🧩 Admin – Riddles List</h1>

      {riddles.length === 0 ? (
        <p>No riddles found.</p>
      ) : (
        <ul>
          {riddles.map((r) => (
            <li key={r._id} style={{ marginBottom: 12 }}>
              <b>{r.question}</b>
              <div>Answer: {r.answer}</div>
              <div>Level: {r.level}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
 