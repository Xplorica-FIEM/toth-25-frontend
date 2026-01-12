// pages/dashboard.jsx - Trails of the Hunt Mobile-First Dashboard
import Head from "next/head";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardBody from "@/components/Dashboard/Body";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard | TOTH '26 | Xplorica</title>
        <meta name="description" content="Your adventure dashboard for Trails of the Hunt 2026 organized by Xplorica." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main className="min-h-screen bg-stone-950">
        <DashboardBody />
      </main>
    </ProtectedRoute>
  );
}
