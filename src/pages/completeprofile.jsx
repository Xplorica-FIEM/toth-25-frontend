import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Compass, AlertCircle } from "lucide-react";
import { completeProfile } from "@/utils/api";
import { saveToken, saveUser } from "@/utils/auth";
import { DEPARTMENTS } from "@/constants/departments";

export default function CompleteProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [classRollNo, setClassRollNo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email, redirect back to register
      router.push("/register");
    }
  }, [router]);

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!fullName || !classRollNo || !department) {
      setError("Full name, class roll number, and department are required");
      return;
    }

    setLoading(true);

    try {
      const response = await completeProfile(
        email,
        fullName,
        classRollNo,
        phoneNumber,
        department
      );

      if (!response.ok) {
        throw new Error(response.data.error || "Failed to complete profile");
      }

      setSuccess(response.data.message || "Profile completed successfully!");

      // Extract token and user from response.data
      const { token, user } = response.data;

      // Save token and user
      saveToken(token);
      saveUser(user);

      // Clear email from localStorage
      localStorage.removeItem("email");

      // Redirect based on admin status
      setTimeout(() => {
        if (user.isAdmin) {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80 px-6">
      <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <Compass className="mx-auto text-amber-400" size={48} />
          <h1 className="text-amber-100 text-2xl mt-2">Complete Your Profile</h1>
          <p className="text-amber-200/70 text-sm mt-2">
            Fill in the details to unlock your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/20 rounded text-red-200 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-3 bg-green-500/20 rounded text-green-200 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCompleteProfile} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="text"
            placeholder="Class / Roll No"
            value={classRollNo}
            onChange={(e) => setClassRollNo(e.target.value)}
            required
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="text"
            placeholder="Phone Number (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            maxLength={10}
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="w-full p-3 rounded bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="" disabled>Select Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 rounded text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Completing..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

