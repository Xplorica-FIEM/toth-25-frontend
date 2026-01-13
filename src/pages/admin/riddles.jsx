"use client";

// pages/admin/riddles.jsx - Admin Riddles Management Page

// import Head from "next/head";
import ProtectedRoute from "@/components/ProtectedRoute";
import RiddlesPageBody from "@/components/Admin/Riddles/Body";

export default function AdminRiddles() {
  return (
    <>
      {/* <Head>
        <title>All Riddles | Admin | TOTH '26</title>
      </Head> */}

      <ProtectedRoute>
        <RiddlesPageBody />
      </ProtectedRoute>
      
    </>
  );
}
