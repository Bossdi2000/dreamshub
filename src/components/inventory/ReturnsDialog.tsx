import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ReturnsDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);

    const handleProcessReturn = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
        setTimeout(() => {
            toast.success("Return processed. Inventory adjusted (+1 units).");
            setOpen(false);
            setStep(1);
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md glass-card">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <RotateCcw className="text-warning" size={24} />
                        Reverse Logistics / Return
                    </DialogTitle>
                    <DialogDescription>
                        Process a customer return or defective item swap.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <form onSubmit={handleProcessReturn} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="order-id">Order Reference #</Label>
                                <Input id="order-id" placeholder="ORD-2024-XXXX" required className="bg-muted/30" />
                            </div>

                            <div className="space-y-2">
                                <Label>Return Reason</Label>
                                <Select required>
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue placeholder="Select reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="defective">Defective / Damaged</SelectItem>
                                        <SelectItem value="wrong">Wrong Item Shipped</SelectItem>
                                        <SelectItem value="change">Customer Change of Mind</SelectItem>
                                        <SelectItem value="expired">Near Expiry / Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Inventory Action</Label>
                                <Select defaultValue="restock">
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restock">Return to Saleable Stock</SelectItem>
                                        <SelectItem value="quarantine">Move to Quarantine / Damage Bin</SelectItem>
                                        <SelectItem value="discard">Mark for Disposal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-3 bg-warning/5 rounded border border-warning/10 flex gap-2">
                            <AlertCircle className="text-warning mt-0.5 flex-shrink-0" size={16} />
                            <p className="text-[10px] text-warning-foreground font-medium uppercase tracking-wider">
                                Warranty status: <strong>Active (10 months remaining)</strong>
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="gap-2">
                                Process Return
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="py-12 flex flex-col items-center text-center space-y-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <RotateCcw size={48} className="text-primary opacity-20" />
                        </motion.div>
                        <div className="space-y-1">
                            <p className="font-bold">Verifying Original Order...</p>
                            <p className="text-sm text-muted-foreground">Adjusting ledger and financial records</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
