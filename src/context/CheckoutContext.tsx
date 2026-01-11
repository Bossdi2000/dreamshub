import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { useHistory } from './HistoryContext';
import { supabase } from '@/integrations/supabase/client';
import { useInventory } from './InventoryContext';

interface CartItem {
    cartId: string;
    id: string | number;
    name: string;
    selling_price: number;
    buying_price: number;
    qty: number;
    model: string;
    selectedSerial?: string;
    image?: string;
    serials?: string[];
}

interface Customer {
    name: string;
    phone: string;
    address: string;
}

interface CheckoutContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (cartId: string) => void;
    updateCartItem: (cartId: string, field: keyof CartItem, value: any) => void;
    clearCart: () => void;
    customer: Customer;
    setCustomer: (customer: Customer) => void;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: 'cash' | 'card' | 'transfer';
    setPaymentMethod: (method: 'cash' | 'card' | 'transfer') => void;
    resetCheckout: () => void;
    checkout: () => Promise<boolean>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('active_cart');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse cart:", e);
            return [];
        }
    });
    const [customer, setCustomerState] = useState<Customer>(() => {
        try {
            const saved = localStorage.getItem('last_customer');
            const parsed = saved ? JSON.parse(saved) : null;
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
            return { name: '', phone: '', address: '' };
        } catch (e) {
            console.error("Failed to parse customer:", e);
            return { name: '', phone: '', address: '' };
        }
    });
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');

    // Persistence Effect - Save minimal cart data (exclude images to avoid quota issues)
    React.useEffect(() => {
        try {
            const cartToSave = cart.map(({ image, serials, ...rest }) => rest);
            localStorage.setItem('active_cart', JSON.stringify(cartToSave));
        } catch (e) {
            console.warn("Failed to persist cart to localStorage:", e);
            // If storage is full, try clearing old data
            try {
                localStorage.removeItem('active_cart');
            } catch { }
        }
    }, [cart]);

    React.useEffect(() => {
        try {
            localStorage.setItem('last_customer', JSON.stringify(customer));
        } catch (e) {
            console.warn("Failed to persist customer to localStorage:", e);
        }
    }, [customer]);

    const setCustomer = (newCustomer: Customer) => {
        setCustomerState(newCustomer);
        try {
            localStorage.setItem('last_customer', JSON.stringify(newCustomer));
        } catch (e) {
            console.warn("Failed to persist customer:", e);
        }
    };
    const { addLog } = useHistory();
    const { refreshInventory, warehouses } = useInventory();

    const addToCart = (product: any) => {
        if (!product) {
            toast.error("invalid product data");
            return;
        }

        const newItem: CartItem = {
            cartId: Math.random().toString(36).substr(2, 9),
            id: product.id,
            name: product.name || 'Unknown Item',
            selling_price: Number(product.selling_price) || 0,
            buying_price: Number(product.buying_price) || 0,
            qty: 1,
            model: product.model || 'N/A',
            selectedSerial: product.serials?.[0] || '',
            image: product.image_url || product.image || '',
            serials: product.serials || []
        };

        setCart(prev => [...prev, newItem]);
        toast.success(`${newItem.name} added to terminal`);
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
        toast.info("Item removed from cart");
    };

    const updateCartItem = (cartId: string, field: keyof CartItem, value: any) => {
        setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, [field]: value } : item));
    };

    const clearCart = () => {
        setCart([]);
        setPaymentMethod('cash');
    };

    const resetCheckout = () => {
        setCart([]);
        setCustomerState({ name: '', phone: '', address: '' });
        setPaymentMethod('cash');
        localStorage.removeItem('active_cart');
        localStorage.removeItem('last_customer');
    };

    const checkout = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return false;
        }

        const toastId = toast.loading(`Processing ${paymentMethod.toUpperCase()} transaction...`);

        try {
            // Find the Main Store to deduct from
            const mainStore = warehouses.find(w => w.name === 'Main Store') || warehouses?.[0];

            if (!mainStore) {
                toast.error("No warehouse found for stock deduction", { id: toastId });
                return false;
            }

            // Perform stock deduction for each item
            for (const item of cart) {
                const { error: moveError } = await (supabase as any)
                    .from('inventory_movements')
                    .insert({
                        product_id: item.id,
                        from_location_id: mainStore.id,
                        quantity: -item.qty,
                        movement_type: 'OUT',
                        reason: `Sale: ${item.name} (${item.model || 'N/A'}) - Payment: ${paymentMethod.toUpperCase()}`,
                        created_at: new Date().toISOString()
                    });

                if (moveError) {
                    console.error("Movement Error:", moveError);
                    throw new Error(`Failed to deduct stock for ${item.name}`);
                }
            }

            // Sync inventory state to reflect changes
            await refreshInventory();

            // Add to history
            addLog({
                type: 'Transaction',
                action: `Sale Completion`,
                target: customer.name || 'Walk-in Customer',
                user: localStorage.getItem('user_role') || 'Unknown',
                role: localStorage.getItem('user_role') || 'User',
                level: 'Success',
                amount: subtotal,
                path: '/checkout',
                metadata: { items: cart, paymentMethod }
            });

            toast.success(`Transaction successful via ${paymentMethod.toUpperCase()}`, { id: toastId });
            return true;
        } catch (error: any) {
            console.error("Checkout Error:", error);
            toast.error(`Transaction failed: ${error.message}`, { id: toastId });
            return false;
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.qty), 0);
    const tax = 0;
    const total = subtotal;

    return (
        <CheckoutContext.Provider value={{
            cart, addToCart, removeFromCart, updateCartItem, clearCart, resetCheckout,
            customer, setCustomer, subtotal, tax, total, checkout,
            paymentMethod, setPaymentMethod
        }}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) throw new Error('useCheckout must be used within a CheckoutProvider');
    return context;
};
