import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Sliders, Save, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
    return (
        <MainLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">System Configuration</h1>
                    <p className="text-muted-foreground mt-1">
                        Global enterprise settings, automation triggers, and security protocols.
                    </p>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <Save size={18} />
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-1">
                    {[
                        { label: 'General', icon: Sliders, active: true },
                        { label: 'Security & Auth', icon: Shield, active: false },
                        { label: 'Notifications', icon: Bell, active: false },
                        { label: 'Inventory Logic', icon: Database, active: false },
                        { label: 'Integrations / API', icon: Globe, active: false },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${item.active
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-primary" />
                            Automation & Intelligence
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Auto-Block Expired Stock</Label>
                                    <p className="text-xs text-muted-foreground max-w-md">
                                        Automatically move food and cosmetic items to "Quarantine" 24 hours before expiry.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Predictive Replenishment</Label>
                                    <p className="text-xs text-muted-foreground max-w-md">
                                        Suggest reorders based on sales velocity and seasonal trends.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Real-time Stock Deductions</Label>
                                    <p className="text-xs text-muted-foreground max-w-md">
                                        Enable immediate ledger updates for all POS and online transactions.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Database size={20} className="text-primary" />
                            Enterprise Data
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mall-name">Mall Identity Name</Label>
                                <Input id="mall-name" defaultValue="Marshall Ethel" className="bg-muted/30 border-transparent h-9" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="base-currency">Default Currency</Label>
                                <Input id="base-currency" defaultValue="NGN (₦)" className="bg-muted/30 border-transparent h-9" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vat-rate">Tax/VAT Rate (%)</Label>
                                <Input id="vat-rate" defaultValue="0.5" type="number" step="0.01" className="bg-muted/30 border-transparent h-9" />
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-3 bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <Info size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-primary/80 leading-relaxed">
                                Changes to core enterprise data will be recorded in the <span className="font-bold underline">Immutable Audit Log</span>.
                                Roles with "Auditor" permissions will be notified.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6 border-danger/10"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-lg font-bold mb-4 text-danger flex items-center gap-2">
                            <Shield size={20} />
                            Danger Zone
                        </h3>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold">Reset Inventory Ledger</p>
                                <p className="text-xs text-muted-foreground">This will archive all movements and reset stock levels to zero.</p>
                            </div>
                            <Button variant="outline" className="text-danger border-danger/20 hover:bg-danger/5">Clear All Records</Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;
