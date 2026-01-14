// pages/forgot-password.jsx - Password Reset Request
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Head from 'next/head';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || 'Failed to send reset email' });
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 flex items-center justify-center p-4">
      <Head>
        <title>Forgot Password - TOTH '26</title>
        <meta name="description" content="Request a password reset link for your Xplorica TOTH account." />
      </Head>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Card */}
        <div className="bg-stone-800/80 backdrop-blur-sm border-2 border-amber-700/50 rounded-2xl shadow-2xl p-8">
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-3xl font-bold text-amber-400 mb-2">Forgot Password?</h1>
                <p className="text-stone-300">Enter your email to receive a password reset link</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-amber-400 text-sm font-bold mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      className={`w-full bg-stone-700/50 text-amber-100 border-2 ${
                        errors.email ? 'border-red-500' : 'border-amber-700/30'
                      } rounded-lg py-3 px-12 focus:outline-none focus:border-amber-500 transition-all`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2">{errors.email}</p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold py-4 px-6 rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* Success Message */
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2">Check Your Email</h2>
              <p className="text-stone-300 mb-6">
                If an account exists with <strong className="text-amber-400">{email}</strong>, 
                you will receive a password reset link shortly.
              </p>
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 text-sm text-stone-300">
                <p className="mb-2">📧 <strong>Didn't receive the email?</strong></p>
                <ul className="list-disc list-inside space-y-1 text-stone-400">
                  <li>Check your spam folder</li>
                  <li>Make sure the email address is correct</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Send another reset link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
