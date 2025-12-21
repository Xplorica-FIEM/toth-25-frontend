import { User, Building2, Phone, Hash, Compass } from "lucide-react";
import { useRouter } from "next/router";

export default function Persona() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/rohan/homepg"); // ✅ Next.js routing
  };

  return (
    <div className="min-h-screen relative">
      {/* Background with overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574432919085-15e4f655360d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')`,
        }}
      />
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-12 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <Compass className="size-12 text-amber-400 animate-pulse" />
            <h1 className="text-amber-100">Ancient Treasures</h1>
          </div>
          <p className="text-amber-100/70">
            Complete your adventurer&apos;s profile
          </p>
        </div>

        {/* Persona Form */}
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl" />

            <div className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl border border-amber-700/50 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-amber-100 mb-2">Your Details</h2>
                <p className="text-amber-100/60">
                  Tell us about yourself, adventurer
                </p>
              </div>

              {/* ✅ FORM */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                  <label className="block text-amber-100/90 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40
                                 border border-amber-700/40 rounded-lg
                                 text-amber-100
                                 placeholder:text-amber-400/40
                                 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-amber-100/90 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60" />
                    <select
                      required
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40
                                 border border-amber-700/40 rounded-lg
                                 text-amber-100"
                    >
                      <option value="" disabled>
                        Select department
                      </option>
                      <option>Computer Science</option>
                      <option>Electrical Engineering</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Electronics & Communication</option>
                      <option>Information Technology</option>
                      <option>Computer Application</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-amber-100/90 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40
                                 border border-amber-700/40 rounded-lg
                                 text-amber-100
                                 placeholder:text-amber-400/40"
                    />
                  </div>
                </div>

                {/* Roll No */}
                <div>
                  <label className="block text-amber-100/90 mb-2">
                    Class Roll No
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your roll number"
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40
                                 border border-amber-700/40 rounded-lg
                                 text-amber-100
                                 placeholder:text-amber-400/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700
                             hover:from-amber-500 hover:to-amber-600
                             text-white rounded-xl transition-all
                             hover:scale-105 shadow-lg"
                >
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center gap-2 text-amber-400/40">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/40" />
          <Compass className="size-4" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/40" />
        </div>
      </div>
    </div>
  );
}
