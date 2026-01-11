import { useState, useMemo } from "react";
import { ShoppingCart, Plus, Trash2, CreditCard, Search, Package } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useInventory } from "@/context/InventoryContext";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
    productId: string | number;
    name: string;
    qty: number;
    price: number;
    image: string;
    maxStock: number;
}

export function NewOrderDialog({ children }: { children: React.ReactNode }) {
    const { products, warehouses, refreshInventory } = useInventory();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return products
            .filter(p => p.stock > 0 && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 5);
    }, [products, searchQuery]);

    const addToCart = (product: typeof products[0]) => {
        const existing = cartItems.find(item => item.productId === product.id);
        if (existing) {
            if (existing.qty < product.stock) {
                setCartItems(prev => prev.map(item =>
                    item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
                ));
            } else {
                toast.error(`Max stock (${product.stock}) reached for ${product.name}`);
            }
        } else {
            setCartItems(prev => [...prev, {
                productId: product.id,
                name: product.name,
                qty: 1,
                price: product.price,
                image: product.image,
                maxStock: product.stock
            }]);
        }
        setSearchQuery("");
    };

    const updateQty = (productId: string | number, newQty: number) => {
        const item = cartItems.find(i => i.productId === productId);
        if (!item) return;
        if (newQty < 1) {
            removeItem(productId);
        } else if (newQty > item.maxStock) {
            toast.error(`Max stock is ${item.maxStock}`);
        } else {
            setCartItems(prev => prev.map(i => i.productId === productId ? { ...i, qty: newQty } : i));
        }
    };

    const removeItem = (productId: string | number) => {
        setCartItems(prev => prev.filter(i => i.productId !== productId));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.075; // 7.5% VAT Nigeria
    const total = subtotal + tax;

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            toast.error("Add at least one product to the order");
            return;
        }

        setLoading(true);
        try {
            // Find Main Store
            const mainStore = warehouses.find(w => w.name === 'Main Store');
            if (!mainStore) throw new Error("Main Store not configured");

            const orderId = `ORD-${Date.now()}`;

            // Create OUT movements for each item
            for (const item of cartItems) {
                await (supabase as any).from('inventory_movements').insert({
                    product_id: item.productId,
                    from_location_id: mainStore.id,
                    quantity: -item.qty,
                    movement_type: 'OUT',
                    reason: `Sales Order: ${orderId}`
                });
            }

            toast.success(`Order ${orderId} completed. Stock deducted from Main Store.`);
            setCartItems([]);
            setOpen(false);
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message || "Order failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl glass-card border-none overflow-hidden p-0">
                <div className="flex flex-col md:flex-row min-h-[500px]">
                    {/* Left Side: Order Builder */}
                    <div className="flex-1 p-6 border-r border-border">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <ShoppingCart className="text-primary" size={24} />
                                New Sales Order
                            </DialogTitle>
                            <DialogDescription>
                                Search your live catalog and build an order.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <Input
                                    placeholder="Search products by name..."
                                    className="bg-muted/30 pl-10"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />

                                {filteredProducts.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                        {filteredProducts.map(p => (
                                            <button
                                                type="button"
                                                key={p.id}
                                                onClick={() => addToCart(p)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm overflow-hidden">
                                                    {p.image.startsWith('http') || p.image.startsWith('data:')
                                                        ? <img src={p.image} className="w-full h-full object-contain" />
                                                        : p.image}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate">{p.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">₦{p.price.toLocaleString()} • {p.stock} in stock</p>
                                                </div>
                                                <Plus size={16} className="text-primary" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 mt-6">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order Items ({cartItems.length})</p>

                                {cartItems.length === 0 ? (
                                    <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-xl">
                                        <Package className="mx-auto text-muted-foreground/30 mb-2" size={32} />
                                        <p className="text-xs text-muted-foreground italic">Search and add products above</p>
                                    </div>
                                ) : (
                                    cartItems.map(item => (
                                        <div key={item.productId} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg border border-border/50 group">
                                            <div className="w-10 h-10 rounded bg-background flex items-center justify-center text-lg overflow-hidden">
                                                {item.image.startsWith('http') || item.image.startsWith('data:')
                                                    ? <img src={item.image} className="w-full h-full object-contain" />
                                                    : item.image}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">₦{item.price.toLocaleString()} × {item.qty}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={item.qty}
                                                    min={1}
                                                    max={item.maxStock}
                                                    onChange={e => updateQty(item.productId, parseInt(e.target.value) || 0)}
                                                    className="w-16 h-8 text-center"
                                                />
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger" onClick={() => removeItem(item.productId)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Summary & Checkout */}
                    <div className="w-full md:w-80 bg-muted/30 p-6 flex flex-col">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 pt-2">Order Summary</h3>

                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">VAT (7.5%)</span>
                                <span className="font-medium">₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold uppercase tracking-tighter">Total Amount</span>
                                <span className="text-2xl font-black text-primary">₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Payment Method</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="h-12 border-primary/20 bg-primary/5 text-primary">
                                        <CreditCard size={18} className="mr-2" />
                                        Card
                                    </Button>
                                    <Button variant="outline" className="h-12 border-border/50">Cash</Button>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-base font-bold"
                                onClick={handleCreateOrder}
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading ? "Processing..." : "Complete Transaction"}
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground opacity-60">
                                By confirming, stock will be immediately deducted from the <strong>Main Store</strong> ledger.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
