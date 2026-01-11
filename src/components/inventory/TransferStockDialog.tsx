import React, { useState, useMemo } from "react";
import { ArrowRightLeft, Info } from "lucide-react";
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
import { useInventory } from "@/context/InventoryContext";

export function TransferStockDialog({ children }: { children: React.ReactNode }) {
    const { products, warehouses, movements, transferStock } = useInventory();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        productId: "",
        fromId: "",
        toId: "",
        quantity: 0,
        reason: ""
    });

    const sourceStock = useMemo(() => {
        if (!formData.productId || !formData.fromId) return 0;
        return (movements || [])
            .filter(m => m && m.product_id === formData.productId && (m.from_location_id === formData.fromId || m.to_location_id === formData.fromId))
            .reduce((acc, m) => {
                if (m.to_location_id === formData.fromId) return acc + (m.quantity || 0);
                if (m.from_location_id === formData.fromId) return acc + (m.quantity || 0);
                return acc;
            }, 0);
    }, [formData.productId, formData.fromId, movements]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.quantity > sourceStock) {
            toast.error(`Insufficient stock at source. Available: ${sourceStock}`);
            return;
        }
        if (formData.fromId === formData.toId) {
            toast.error("Source and Target locations must be different");
            return;
        }

        setLoading(true);
        try {
            await transferStock(
                formData.productId,
                formData.fromId,
                formData.toId,
                formData.quantity,
                formData.reason
            );
            setOpen(false);
            setFormData({ productId: "", fromId: "", toId: "", quantity: 0, reason: "" });
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-xl glass-card">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <ArrowRightLeft className="text-primary" size={24} />
                        Internal Stock Transfer
                    </DialogTitle>
                    <DialogDescription>
                        Move stock between warehouses, store rooms, or departments.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                            <Label>Select Product</Label>
                            <Select
                                value={formData.productId}
                                onValueChange={(v) => setFormData({ ...formData, productId: v })}
                                required
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Search product..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {(products || []).filter(p => !!p).map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {(p.name || "Unnamed Product")} (Global: {p.stock || 0})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Source Facility</Label>
                                <Select
                                    value={formData.fromId}
                                    onValueChange={(v) => setFormData({ ...formData, fromId: v })}
                                    required
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(warehouses || []).filter(w => !!w).map(w => (
                                            <SelectItem key={w.id} value={w.id}>
                                                {w.name || "Unknown Facility"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formData.fromId && (
                                    <p className="text-[10px] font-bold text-muted-foreground mt-1">
                                        Available in this facility: <span className="text-primary">{sourceStock} Units</span>
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 text-center hidden md:flex flex-col justify-center">
                                <ArrowRightLeft className="mx-auto text-muted-foreground opacity-30" size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Facility</Label>
                                <Select
                                    value={formData.toId}
                                    onValueChange={(v) => setFormData({ ...formData, toId: v })}
                                    required
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select target" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(warehouses || []).filter(w => !!w).map(w => (
                                            <SelectItem key={w.id} value={w.id}>
                                                {w.name || "Unknown Facility"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qty">Transfer Quantity</Label>
                                <Input
                                    id="qty"
                                    type="number"
                                    placeholder="0"
                                    required
                                    className="bg-background"
                                    value={formData.quantity || ""}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs flex items-start gap-2 text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10">
                        <Info size={14} className="text-primary mt-0.5" />
                        <p>
                            Stock will be moved immediately. This operation is recorded in the enterprise ledger for audit.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Movement</Label>
                        <Input
                            id="reason"
                            placeholder="e.g. Stock Rebalancing, Seasonal Display Update"
                            required
                            className="bg-muted/30"
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="gap-2 px-8" disabled={loading}>
                            {loading ? "Processing..." : "Confirm Transfer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
