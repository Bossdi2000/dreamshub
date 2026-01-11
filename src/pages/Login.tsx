import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

const Login = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background blobs for premium feel */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-5%] left-[-10%] w-[30%] h-[30%] bg-gold/10 blur-[100px] rounded-full" />

            <div className="z-10 w-full flex flex-col items-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex flex-col items-center"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-gold">Dreams</span>
                        <span className="px-2 py-0.5 bg-gold border border-gold/20 text-gold-foreground rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20">Hub</span>
                    </div>
                </motion.div>

                <LoginForm />
            </div>

            {/* Footer decoration */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
                <span>Precision control</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Enterprise scale</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Audit ready</span>
            </div>
        </div>
    );
};

export default Login;
