import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCheckout } from '@/context/CheckoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, CreditCard, Receipt as ReceiptIcon, User, Phone, Package, Search, Scan, Printer, Landmark, Banknote, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

import { useInventory } from '@/context/InventoryContext';

const Checkout = () => {
    const context = useCheckout();
    const inventory = useInventory();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    if (!context || !inventory) {
        return <div className="p-20 text-center font-bold">Loading Terminal Context...</div>;
    }

    const {
        cart = [], addToCart, removeFromCart, updateCartItem,
        customer = { name: '', phone: '', address: '' }, setCustomer, subtotal = 0, total = 0, checkout,
        paymentMethod = 'cash', setPaymentMethod, resetCheckout
    } = context;

    const { products = [] } = inventory;

    const filteredCatalog = useMemo(() => {
        if (!Array.isArray(products)) return [];
        const search = (searchTerm || '').toLowerCase();
        return products.filter(item => {
            if (!item) return false;
            const name = String(item.name || '').toLowerCase();
            const model = String(item.model || '').toLowerCase();
            const sku = String(item.sku || '').toLowerCase();
            return name.includes(search) || model.includes(search) || sku.includes(search);
        });
    }, [products, searchTerm]);

    const handleCheckout = async () => {
        try {
            const success = await checkout();
            if (success) navigate('/receipt');
        } catch (e) {
            toast.error("Checkout Failed");
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto pb-20 px-4 space-y-10">
                {/* Header */}
                <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm">
                    <div>
                        <h1 className="text-3xl font-black text-primary">TERMINAL POS</h1>
                        <p className="text-sm text-muted-foreground font-mono">ID: TRM-0042 | {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Search & Catalog */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                            placeholder="Search by name, model or barcode..."
                            className="pl-12 h-14 text-lg rounded-xl shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 overflow-y-auto max-h-[280px] p-2 bg-muted/20 rounded-xl border border-dashed">
                        {filteredCatalog.map(product => (
                            <div
                                key={product?.id || Math.random()}
                                onClick={() => product && addToCart(product)}
                                className="bg-card p-2.5 rounded-lg border hover:border-primary cursor-pointer transition-colors shadow-sm group"
                            >
                                <p className="font-bold text-xs line-clamp-1">{product?.name || 'Item'}</p>
                                <p className="text-[8px] text-muted-foreground uppercase">{product?.model || 'N/A'}</p>
                                <div className="mt-1.5 flex justify-between items-center">
                                    <span className="text-[11px] font-black text-primary">₦{(product?.selling_price || 0).toLocaleString()}</span>
                                    <Plus size={12} className="text-muted-foreground group-hover:text-primary" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Cart */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Package size={20} className="text-primary" />
                        Active Cart ({(cart || []).length})
                    </h2>

                    {(!cart || cart.length === 0) ? (
                        <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10 text-muted-foreground">
                            <Package size={40} className="mx-auto mb-2 opacity-20" />
                            <p className="font-medium">No items in cart</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {cart.map((item) => (
                                <div key={item?.cartId} className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-2xl border shadow-sm">
                                    <div className="flex-1">
                                        <p className="font-black text-base">{item?.name}</p>
                                        <p className="text-xs text-muted-foreground uppercase">{item?.model || 'General'}</p>
                                    </div>
                                    <div className="w-full md:w-48">
                                        <Label className="text-[9px] font-black uppercase mb-1 block">Serial Number</Label>
                                        <Input
                                            size={32}
                                            className="h-9 text-xs"
                                            value={item?.selectedSerial || ''}
                                            onChange={(e) => updateCartItem(item.cartId, 'selectedSerial', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <Label className="text-[9px] font-black uppercase mb-1 block">Price (₦)</Label>
                                        <Input
                                            type="number"
                                            className="h-9 text-xs font-bold text-primary"
                                            value={item?.selling_price || 0}
                                            onChange={(e) => updateCartItem(item.cartId, 'selling_price', Number(e.target.value))}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive h-10 w-10 flex-shrink-0"
                                        onClick={() => removeFromCart(item.cartId)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Checkout Section - Only show if cart has items */}
                {cart && cart.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10 border-t">
                        <div className="space-y-6">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <User size={18} /> Customer Details
                            </h3>
                            <div className="space-y-4 bg-muted/10 p-6 rounded-3xl border">
                                <Input
                                    placeholder="Full Name"
                                    value={customer?.name || ''}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Phone Number"
                                    value={customer?.phone || ''}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                />
                                <textarea
                                    placeholder="Address"
                                    className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={customer?.address || ''}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <CreditCard size={18} /> Summary & Payment
                            </h3>
                            <div className="bg-primary p-8 rounded-3xl text-primary-foreground shadow-xl shadow-primary/20">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Payable</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">VAT Included</span>
                                </div>
                                <div className="text-5xl font-black mb-8">
                                    ₦{(Number(total) || 0).toLocaleString()}
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-8">
                                    {['cash', 'card', 'transfer'].map(m => (
                                        <Button
                                            key={m}
                                            variant={paymentMethod === m ? 'secondary' : 'outline'}
                                            className={`capitalize text-[10px] font-black h-12 ${paymentMethod === m ? 'bg-white text-primary' : 'bg-transparent text-white border-white/20'}`}
                                            onClick={() => setPaymentMethod(m as any)}
                                        >
                                            {m}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    className="w-full h-16 text-lg font-black bg-white text-primary hover:bg-white/90 shadow-2xl"
                                    onClick={handleCheckout}
                                >
                                    FINALIZE & PRINT RECEIPT
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

const ImageIcon = ({ className }: { className?: string }) => (
    <Package className={className} />
);

export default Checkout;
