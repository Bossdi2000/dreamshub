import React, { useState, useEffect } from "react";
import { Plus, Upload, X, Image as ImageIcon, Save } from "lucide-react";
import { useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useInventory, Product } from "@/context/InventoryContext";

interface ProductFormDialogProps {
    children?: React.ReactNode;
    product?: Product;
    mode?: 'add' | 'edit' | 'view';
    open?: boolean;
    setOpen?: (open: boolean) => void;
}

export function ProductFormDialog({ children, product, mode = 'add', open: externalOpen, setOpen: setExternalOpen }: ProductFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

    const { addProduct, updateProduct, categories } = useInventory();

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        model: "",
        stock: 0,
        category: "",
        buying_price: 0,
        selling_price: 0,
        description: "",
        serials: "",
        image: "" as string | null,
        expiryDate: "",
        manufacturedDate: "",
        colors: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product && (mode === 'edit' || mode === 'view')) {
            setFormData({
                name: product.name || "",
                sku: product.sku || "",
                model: product.model || "",
                stock: product.stock || 0,
                category: (product.category || "").toLowerCase(),
                buying_price: product.buying_price || 0,
                selling_price: product.selling_price || 0,
                description: product.description || "",
                serials: Array.isArray(product.serials) ? product.serials.join(", ") : "",
                image: (product.image && (typeof product.image === 'string') && (product.image.startsWith('http') || product.image.startsWith('data:'))) ? product.image : null,
                expiryDate: product.expiryDate || "",
                manufacturedDate: product.manufacturedDate || "",
                colors: Array.isArray(product.colors) ? product.colors.join(", ") : ""
            });
        } else if (mode === 'add') {
            setFormData({
                name: "",
                sku: "",
                model: "",
                stock: 0,
                category: "",
                buying_price: 0,
                selling_price: 0,
                description: "",
                serials: "",
                image: null,
                expiryDate: "",
                manufacturedDate: "",
                colors: ""
            });
        }
    }, [product, mode, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            sku: formData.sku,
            category: formData.category ? (formData.category.charAt(0).toUpperCase() + formData.category.slice(1)) : "Uncategorized",
            buying_price: Number(formData.buying_price),
            selling_price: Number(formData.selling_price),
            stock: Number(formData.stock),
            status: Number(formData.stock) > 10 ? 'In Stock' : Number(formData.stock) > 0 ? 'Low Stock' : 'Out of Stock',
            image: formData.image || '📦',
            model: formData.model,
            serials: (formData.serials || "").split(',').map(s => s.trim()).filter(s => s !== ""),
            description: formData.description,
            colors: (formData.colors || "").split(',').map(s => s.trim()).filter(s => s !== ""),
            expiryDate: formData.expiryDate || null,
            manufacturedDate: formData.manufacturedDate || null
        };

        if (mode === 'edit' && product) {
            updateProduct(product.id, payload);
        } else {
            addProduct(payload);
        }

        setOpen(false);
    };

    const isView = mode === 'view';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-2xl glass-card border-primary/20 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {isView ? 'Product Details' : mode === 'add' ? 'Register New Product' : 'Edit Product Details'}
                    </DialogTitle>
                    <DialogDescription>
                        {isView
                            ? 'Full specifications and historical data for this asset.'
                            : mode === 'add'
                                ? 'Add a new item to the enterprise catalog. All additions create a ledger entry.'
                                : 'Update product information and pricing. Changes will be reflected across all terminals.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. iPhone 15 Pro"
                                required
                                disabled={isView}
                                className="bg-muted/30"
                                value={formData.name}
                                autoComplete="off"
                                autoCapitalize="words"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">Internal SKU</Label>
                            <Input
                                id="sku"
                                placeholder="EL-XXXX-XXXX"
                                required
                                disabled={isView}
                                className="bg-muted/30 font-mono"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Model Number</Label>
                            <Input
                                id="model"
                                placeholder="e.g. A2848"
                                disabled={isView}
                                className="bg-muted/30"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="base-qty">Initial Stock (Main Store)</Label>
                            <Input
                                id="base-qty"
                                type="number"
                                placeholder="0"
                                disabled={isView}
                                className="bg-muted/30 font-bold text-primary"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                            />
                            {!isView && <p className="text-[10px] text-muted-foreground italic">New inventory is automatically logged to the Main Store hub.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mfg-date">Manufacturing Date</Label>
                            <Input
                                id="mfg-date"
                                type="date"
                                disabled={isView}
                                className="bg-muted/30"
                                value={formData.manufacturedDate}
                                onChange={(e) => setFormData({ ...formData, manufacturedDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exp-date">Expiry Date</Label>
                            <Input
                                id="exp-date"
                                type="date"
                                disabled={isView}
                                className="bg-muted/30"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serials" className="text-xs">Serial Numbers (Comma separated for batch)</Label>
                        <Textarea
                            id="serials"
                            placeholder="SN-12345, SN-12346, SN-12347..."
                            disabled={isView}
                            className="bg-muted/30 min-h-[60px] text-xs font-mono"
                            value={formData.serials}
                            onChange={(e) => setFormData({ ...formData, serials: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Department / Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(v) => setFormData({ ...formData, category: v })}
                                required
                                disabled={isView}
                            >
                                <SelectTrigger className="bg-muted/30">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(categories || []).filter(c => !!c).map(cat => (
                                        <SelectItem key={`cat-${cat.id}-${cat.name}`} value={(cat.name || "Uncategorized").toLowerCase()}>
                                            {cat.name || "Uncategorized"}
                                        </SelectItem>
                                    ))}
                                    {(categories || []).length === 0 && (
                                        <>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                            <SelectItem value="food">Food & Beverage</SelectItem>
                                            <SelectItem value="fashion">Fashion</SelectItem>
                                            <SelectItem value="cosmetics">Cosmetics</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="buy_price">Buy Price (₦)</Label>
                            <Input
                                id="buy_price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                disabled={isView}
                                className="bg-muted/30 font-semibold text-danger/80"
                                value={formData.buying_price}
                                onChange={(e) => setFormData({ ...formData, buying_price: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sell_price">Sell Price (₦)</Label>
                            <Input
                                id="sell_price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                disabled={isView}
                                className="bg-muted/30 font-semibold text-success"
                                value={formData.selling_price}
                                onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="colors">Available Colors (Comma separated)</Label>
                            <Input
                                id="colors"
                                placeholder="Red, Blue, Green..."
                                disabled={isView}
                                className="bg-muted/30"
                                value={formData.colors}
                                autoComplete="off"
                                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea
                            id="desc"
                            placeholder="Technical specifications or handling instructions..."
                            disabled={isView}
                            className="bg-muted/30 min-h-[80px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div
                        className={`relative border-2 border-dashed border-border rounded-xl p-4 text-center ${!isView ? 'hover:bg-muted/5 cursor-pointer group' : ''} transition-colors min-h-[120px] flex flex-col items-center justify-center`}
                        onClick={() => !isView && fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        {formData.image && (formData.image.startsWith('http') || formData.image.startsWith('data:')) ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                                {!isView && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage();
                                        }}
                                    >
                                        <X size={14} />
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <Upload className={`mx-auto text-muted-foreground ${!isView ? 'group-hover:text-primary' : ''} transition-colors mb-2`} size={24} />
                                <p className="text-sm font-medium">Product Image</p>
                                {!isView && <p className="text-xs text-muted-foreground mt-1">Click to browse or drag and drop</p>}
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{isView ? 'Close' : 'Cancel'}</Button>
                        {!isView && (
                            <Button type="submit" className="gap-2">
                                {mode === 'add' ? <Plus size={18} /> : <Save size={18} />}
                                {mode === 'add' ? 'Register Product' : 'Save Changes'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
