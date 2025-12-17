import { Compass, User, Mail, Lock, Building2, Hash, Phone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    department: '',
    deptRollNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration successful! 🎉' });
        setFormData({
          fullName: '',
          email: '',
          password: '',
          phoneNumber: '',
          department: '',
          deptRollNo: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not connect to server. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="relative z-10 min-h-screen px-6 py-12 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <Compass className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-amber-100">Ancient Treasures</h1>
          </div>
          <p className="text-amber-100/70 text-lg">
            Embark on a legendary journey
          </p>
        </div>

        {/* Registration Form */}
        <div className="group relative w-full max-w-md">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md p-8 rounded-2xl flex flex-col gap-5 shadow-2xl hover:shadow-amber-500/20 border border-amber-700/50 hover:border-amber-600/70 transition-all duration-300">
          
          {/* Success/Error Message */}
          {message.text && (
            <div className={`p-3 rounded-lg text-center ${
              message.type === 'success' ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
            }`}>
              {message.text}
            </div>
          )}

          {/* Full Name */}
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-amber-400 transition-colors" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="pl-10 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full hover:bg-white/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-amber-400 transition-colors" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="pl-10 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full hover:bg-white/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-amber-400 transition-colors" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="pl-10 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full hover:bg-white/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
            />
          </div>

          {/* Phone Number */}
          <div className="relative group">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-amber-400 transition-colors" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="pl-10 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full hover:bg-white/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
            />
          </div>

          {/* Department */}
          <div className="relative group">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-amber-400 transition-colors" />
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="Department"
              className="pl-10 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full hover:bg-white/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
            />
          </div>

          {/* Department Roll No */}
          <div className="relative group">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-amber-400 transition-colors" />
            <input
              type="text"
              name="deptRollNo"
              value={formData.deptRollNo}
              onChange={handleChange}
              required
              placeholder="Department Roll No"
              className="pl-10 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full hover:bg-white/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-400 text-black font-semibold py-3 rounded-lg hover:bg-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
    
          {/* Login Link */}
          <p className="text-white/70 text-sm text-center mt-2">
            Already have an account? <a href="/login" className="text-amber-400 hover:underline">Login</a>
          </p>

          {/* Continue without Registration Button */}
          <Link
            href="/rohan/homepg"
            className="bg-white/20 text-white font-semibold py-3 rounded-lg hover:bg-white/30 transition-all text-center border border-white/30"
          >
            Continue without registration
          </Link>
        </form>
      </div>
      </div>
    </div>
  );
}
