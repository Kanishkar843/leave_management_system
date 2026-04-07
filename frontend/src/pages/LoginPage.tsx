import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore(s => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const user = login(email, password);
    setLoading(false);
    
    if (user) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const demoAccounts = [
    { role: 'Principal', email: 'principal@college.edu', password: 'admin123' },
    { role: 'HOD', email: 'hod.cs@college.edu', password: 'hod123' },
    { role: 'Faculty', email: 'faculty1@college.edu', password: 'fac123' },
    { role: 'Student', email: 'student1@college.edu', password: 'stu123' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left - Hero */}
      <motion.div
        className="hidden flex-1 items-center justify-center gradient-primary p-12 lg:flex"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-md text-center">
          <motion.h1
            className="font-heading text-4xl font-bold text-primary-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Student Leave Management System
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-primary-foreground/80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Streamline leave applications with role-based approvals, real-time tracking, and intuitive gesture controls.
          </motion.p>
        </div>
      </motion.div>

      {/* Right - Login */}
      <motion.div
        className="flex flex-1 items-center justify-center p-6"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="font-heading text-3xl font-bold">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={loading}>
              {loading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="mb-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <motion.button
                  key={acc.role}
                  className="glass-card p-3 text-left text-xs transition-colors hover:border-primary/40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(''); }}
                >
                  <span className="font-heading font-semibold text-sm">{acc.role}</span>
                  <span className="block text-muted-foreground mt-0.5 truncate">{acc.email}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
