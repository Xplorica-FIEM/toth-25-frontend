import { User, Building2, Phone, Hash, Compass } from 'lucide-react';

export default function Persona() {
  return (
    <div className="min-h-screen relative">
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1574432919085-15e4f655360d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwc2Nyb2xsJTIwbGlicmFyeXxlbnwxfHx8fDE3NjU5OTMzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
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
            Complete your adventurer's profile
          </p>
        </div>

        {/* Persona Form */}
        <div className="w-full max-w-md">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl" />
            
            {/* Form container */}
            <div className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl border border-amber-700/50 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-amber-100 mb-2">Your Details</h2>
                <p className="text-amber-100/60">Tell us about yourself, adventurer</p>
              </div>

              <form className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-amber-100/90 mb-2">
                    Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60 group-hover:text-amber-400/80 transition-colors" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40 border border-amber-700/40 rounded-lg text-amber-100 placeholder-amber-400/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-amber-600/50 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Department Field */}
                <div>
                  <label htmlFor="department" className="block text-amber-100/90 mb-2">
                    Department
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60 group-hover:text-amber-400/80 transition-colors" />
                    <select
                      id="department"
                      name="department"
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40 border border-amber-700/40 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-amber-600/50 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-stone-900">Select department</option>
                      <option value="Computer Science" className="bg-stone-900">Computer Science</option>
                      <option value="Electrical Engineering" className="bg-stone-900">Electrical Engineering</option>
                      <option value="Mechanical Engineering" className="bg-stone-900">Mechanical Engineering</option>
                      <option value="Civil Engineering" className="bg-stone-900">Civil Engineering</option>
                      <option value="Electronics & Communication" className="bg-stone-900">Electronics & Communication</option>
                      <option value="Information Technology" className="bg-stone-900">Information Technology</option>
                      <option value="Chemical Engineering" className="bg-stone-900">Chemical Engineering</option>
                      <option value="Biotechnology" className="bg-stone-900">Biotechnology</option>
                    </select>
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label htmlFor="phone" className="block text-amber-100/90 mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60 group-hover:text-amber-400/80 transition-colors" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40 border border-amber-700/40 rounded-lg text-amber-100 placeholder-amber-400/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-amber-600/50 transition-all"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                {/* Class Roll No Field */}
                <div>
                  <label htmlFor="rollNo" className="block text-amber-100/90 mb-2">
                    Class Roll No
                  </label>
                  <div className="relative group">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-amber-400/60 group-hover:text-amber-400/80 transition-colors" />
                    <input
                      type="text"
                      id="rollNo"
                      name="rollNo"
                      className="w-full pl-11 pr-4 py-3 bg-amber-950/40 border border-amber-700/40 rounded-lg text-amber-100 placeholder-amber-400/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 hover:border-amber-600/50 transition-all"
                      placeholder="Enter your roll number"
                      required
                    />
                  </div>
                </div>

                {/* Decorative divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent my-6" />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-105"
                >
                  Save Profile
                </button>
              </form>

              {/* Decorative corner accents */}
              <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-amber-600/20 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-amber-600/20 rounded-bl-xl" />
            </div>
          </div>
        </div>

        {/* Footer ornament */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-amber-400/40">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/40" />
            <Compass className="size-4" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/40" />
          </div>
        </div>
      </div>
    </div>
  );
}