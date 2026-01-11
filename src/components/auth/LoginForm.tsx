import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useHistory } from '@/context/HistoryContext';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addLog } = useHistory();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate auth logic
        setTimeout(() => {
            setLoading(false);

            // Get users from localStorage or use defaults
            const savedUsers = localStorage.getItem('system_users');
            const users = savedUsers ? JSON.parse(savedUsers) : [
                { id: '1', name: 'Alice Johnson', email: 'superadmin@dreamshub.com', password: 'password', role: 'SuperAdmin' },
                { id: '2', name: 'Bob Smith', email: 'admin@dreamshub.com', password: 'password', role: 'Admin' }
            ];

            const user = users.find((u: any) => u.email === email && u.password === password);

            if (user) {
                const role = user.role;

                toast.success(`Welcome back, ${user.name}!`);

                // Simultaneous role-specific tokens
                localStorage.setItem(`auth_token_${role}`, 'mock_token');
                localStorage.setItem('auth_token', 'mock_token'); // Legacy indicator
                localStorage.setItem('user_role', role);

                // Add to history
                addLog({
                    type: 'Auth',
                    action: 'System Login',
                    target: role === 'SuperAdmin' ? 'Dashboard Access' : 'Products Access',
                    user: email,
                    role: role,
                    level: 'Success',
                    path: role === 'SuperAdmin' ? '/admin' : '/products'
                });

                if (role === 'SuperAdmin') {
                    navigate('/admin');
                } else {
                    navigate('/products');
                }
            } else {
                toast.error('Invalid credentials. Check with your SuperAdmin if you cannot log in.');
            }
        }, 1000);
    };



    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
        >
            <div className="glass-card p-8 shadow-2xl relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                        <Package size={32} className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Enterprise Login</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Secure access to Dreams Hub Inventory & Logistics
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Work Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@dreamshub.com"
                                className="pl-10 bg-muted/30 border-transparent focus:border-primary/20"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                id="password"
                                type="password"
                                className="pl-10 bg-muted/30 border-transparent focus:border-primary/20"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-11 gap-2 mt-2 bg-primary hover:bg-primary/90 transition-opacity border-none shadow-lg shadow-primary/20" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                        {!loading && <ArrowRight size={18} />}
                    </Button>
                </form>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield size={14} /> Encrypted Session</span>
                <span>v0.4.2-enterprise</span>
            </div>
        </motion.div>
    );
};
