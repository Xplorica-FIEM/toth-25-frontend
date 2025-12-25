import {
  Compass,
  Map,
  UserPlus,
  Users,
  Home,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Record() {
  const router = useRouter();
  const currentPath = router.pathname;

  const routes = [
    {
      name: "Home Page",
      path: "/homepg",
      icon: Home,
      description: "Main landing page",
    },
    {
      name: "Registration",
      path: "/register",
      icon: UserPlus,
      description: "Register new users",
    },
    {
      name: "Users List",
      path: "/admin/usersTable",
      icon: Users,
      description: "View all registered users",
    },
    {
      name: "Records",
      path: "/record",
      icon: Map,
      description: "All available routes",
    },
    {
      name: "Loading Animation",
      path: "/loadinganimation",
      icon: FileText,
      description: "Loader preview",
    },
    {
      name: "All Riddles (mod)",
      path: "/admin/riddle-list",
      icon: Compass,
      description: "Moderator riddles panel",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1633785584922-503ad0e982f5?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Compass className="w-10 h-10 text-amber-400" />
            <h1 className="text-3xl font-bold text-amber-100">
              Site Navigation
            </h1>
          </div>
          <p className="text-amber-100/70">
            Explore all available routes
          </p>

          <div className="mt-4 inline-block px-4 py-2 bg-amber-400/20 rounded-lg">
            <p className="text-amber-100 text-sm">
              <span className="font-semibold">Current Page:</span>{" "}
              {currentPath}
            </p>
          </div>
        </div>

        {/* Routes */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = currentPath === route.path;

            return (
              <Link
                key={route.path}
                href={route.path}
                className={`relative group p-6 rounded-2xl backdrop-blur-md border transition-all
                  ${
                    isActive
                      ? "bg-amber-400/20 border-amber-400"
                      : "bg-white/10 border-transparent hover:border-amber-400/50 hover:bg-white/20"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute top-4 right-4 text-xs font-bold bg-amber-400 text-black px-3 py-1 rounded-full">
                    CURRENT
                  </span>
                )}

                <div className="flex gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition
                      ${
                        isActive
                          ? "bg-amber-400"
                          : "bg-amber-400/20 group-hover:bg-amber-400"
                      }
                    `}
                  >
                    <Icon
                      className={`w-7 h-7 transition
                        ${
                          isActive
                            ? "text-black"
                            : "text-amber-400 group-hover:text-black"
                        }
                      `}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-amber-100 mb-1">
                      {route.name}
                    </h3>
                    <p className="text-amber-100/60 text-sm mb-2">
                      {route.description}
                    </p>
                    <code className="text-xs text-amber-400 bg-black/30 px-2 py-1 rounded">
                      {route.path}
                    </code>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-white/10 rounded-xl p-5">
            <p className="text-amber-100/70 text-sm">
              💡 Click any card to navigate. The current page is highlighted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
