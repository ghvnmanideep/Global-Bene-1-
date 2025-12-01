import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');

    if (form.password !== form.confirmPassword) {
      setMsg('Passwords do not match. Please try again.');
      return;
    }

    try {
      const res = await authService.register({ username: form.username, email: form.email, password: form.password });
      const { accessToken, _id, username: userName, role } = res.data;

      // Save session data to log the user in immediately
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem(
        "user",
        JSON.stringify({ _id, username: userName, role, accessToken })
      );

      // Dispatch custom event to update UI components like the sidebar
      window.dispatchEvent(new Event('authChange'));

      setMsg('✅ Registration successful! Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error registering. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-6">
          Create your Global Bene account
        </h1>

        {msg && (
          <div
            className={`mb-4 p-3 rounded text-center ${
              msg.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'
            }`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              placeholder="Pick a username"
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-600 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              At least 8 characters, uppercase, lowercase, number & symbol.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition"
          >
            Sign Up
          </button>
        </form>


        <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          Already a member?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
