import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.isAdmin) {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/api/users/admin-login', { email, password });
            login(data);
            toast.success(`Welcome, ${data.name}! Redirecting to dashboard…`);
            navigate('/admin/dashboard');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Something went wrong';
            if (error.response?.status === 403) {
                toast.error('Access Denied: This portal is for administrators only.');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Portal | Sri Chola Book Shop</title>
            </Helmet>

            <div className="min-h-screen flex">
                {/* Left — decorative panel */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden items-center justify-center p-12">
                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-indigo-500/10 blur-[100px]" />
                    </div>

                    {/* Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10 text-center"
                    >
                        {/* Shield icon */}
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl scale-150" />
                                <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-2xl shadow-2xl">
                                    <ShieldCheck className="h-16 w-16 text-slate-900" />
                                </div>
                            </div>
                        </div>

                        <h2 className="font-serif text-4xl font-bold text-white mb-4">
                            Administrator Portal
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xs mx-auto">
                            Secure access for Sri Chola Book Shop administrators.
                        </p>

                        <div className="mt-10 flex justify-center gap-6 text-slate-500 text-sm">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <Lock className="h-4 w-4 text-amber-400" />
                                </div>
                                <span>Encrypted</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                                </div>
                                <span>Role-verified</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right — login form */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                    >
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                    <ShieldCheck className="h-6 w-6 text-amber-600" />
                                </div>
                                <span className="text-sm font-semibold text-amber-600 uppercase tracking-widest">
                                    Admin Portal
                                </span>
                            </div>
                            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                                Administrator Sign In
                            </h1>
                            <p className="text-muted-foreground">
                                Restricted access — verified admins only.
                            </p>
                        </div>

                        {/* Alert banner */}
                        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-8 text-sm text-amber-700 dark:text-amber-400">
                            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                            <span>This page is for authorised administrators only. Unauthorised access attempts are logged.</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Admin Email */}
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Admin Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="admin-email"
                                        type="email"
                                        placeholder="admin@sricholabooks.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="admin-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="admin-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                variant="gold"
                                size="lg"
                                className="w-full gap-2 mt-2"
                                disabled={loading}
                                id="admin-sign-in-btn"
                            >
                                {loading ? 'Verifying...' : 'Sign In'}
                                {!loading && <ArrowRight className="h-5 w-5" />}
                            </Button>
                        </form>

                        <p className="text-center mt-8 text-xs text-muted-foreground">
                            Are you a customer?{' '}
                            <a href="/login" className="text-primary hover:underline font-medium">
                                Go to Customer Login
                            </a>
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
