// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IoArrowBack } from 'react-icons/io5';
import axios from 'axios';

type ViewMode = 'entry' | 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<ViewMode>('entry');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  useEffect(() => {
    setError(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(
          Array.isArray(err.response.data.message)
            ? err.response.data.message[0]
            : err.response.data.message,
        );
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      <motion.div
        className="absolute bg-white rounded-full z-10"
        initial={{ width: 50, height: 50, scale: 0 }}
        animate={{ scale: mode !== 'entry' ? 250 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ pointerEvents: 'none' }}
      />
      <AnimatePresence>
        {mode === 'entry' && (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="z-0 flex flex-col items-center w-full max-w-md px-6 text-center">
            <h1 className="text-4xl font-bold mb-2">Trippier</h1>
            <p className="text-lg mb-8 opacity-80">Plan your next adventure</p>
            <button
              onClick={() => setMode('login')}
              className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg mb-4 hover:bg-gray-100 transition-colors">
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-gray-100 transition-colors">
              Create Account
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mode !== 'entry' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-black">
            <button
              onClick={() => setMode('entry')}
              className="absolute top-10 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <IoArrowBack size={32} />
            </button>
            <div className="w-full max-w-md">
              <h2 className="text-3xl font-bold mb-2 text-center mt-12">
                {mode === 'login' ? 'Welcome Back' : 'Join Us'}
              </h2>
              <p className="text-center text-gray-500 mb-8">
                {mode === 'login' ? 'Sign in to continue' : 'Create your account to start'}
              </p>
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === 'register' && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl text-lg mt-4 hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
