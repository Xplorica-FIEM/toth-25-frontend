import { Compass, Map, UserPlus, Users, Home, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Record() {
  const router = useRouter();
  const currentPath = router.pathname;

  const routes = [
    {
      name: 'Home Page',
      path: '/rohan/homepg',
      icon: Home,
      description: 'Main landing page'
    },
    {
      name: 'Registration',
      path: '/rohan/register',
      icon: UserPlus,
      description: 'Register new users'
    },
    {
      name: 'Users List',
      path: '/rohan/users',
      icon: Users,
      description: 'View all registered users'
    },
    {
      name: 'Records',
      path: '/rohan/record',
      icon: Map,
      description: 'All routes and navigation'
    },
    {
      name: 'Loading Animation',
      path: '/rohan/loadinganimation',
      icon: FileText,
      description: 'Loading animation demo'
    }
  ];

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
            <Compass className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl font-bold text-amber-100">Site Navigation</h1>
          </div>
          <p className="text-amber-100/70 text-lg">
            Explore all available routes
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-amber-400/20 rounded-lg">
            <p className="text-amber-100 text-sm">
              <span className="font-semibold">Current Page:</span> {currentPath}
            </p>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {routes.map((route, index) => {
            const Icon = route.icon;
            const isCurrentPage = currentPath === route.path;

            return (
              <Link
                key={index}
                href={route.path}
                className={`group relative bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-lg hover:bg-white/20 transition-all border-2 ${
                  isCurrentPage 
                    ? 'border-amber-400 bg-white/20' 
                    : 'border-transparent hover:border-amber-400/50'
                }`}
              >
                {/* Current Page Badge */}
                {isCurrentPage && (
                  <div className="absolute top-4 right-4 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                    CURRENT
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    isCurrentPage 
                      ? 'bg-amber-400' 
                      : 'bg-amber-400/20 group-hover:bg-amber-400'
                  }`}>
                    <Icon className={`w-7 h-7 transition-colors ${
                      isCurrentPage 
                        ? 'text-black' 
                        : 'text-amber-400 group-hover:text-black'
                    }`} />
                  </div>

                  {/* Route Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-100 mb-1 group-hover:text-amber-300 transition-colors">
                      {route.name}
                    </h3>
                    <p className="text-amber-100/60 text-sm mb-2">
                      {route.description}
                    </p>
                    <code className="text-xs text-amber-400/80 bg-black/30 px-2 py-1 rounded">
                      {route.path}
                    </code>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg 
                    className="w-6 h-6 text-amber-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
            <p className="text-amber-100/70 text-sm">
              💡 <span className="font-semibold">Tip:</span> Click on any card to navigate to that page. 
              The current page is highlighted with a badge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
