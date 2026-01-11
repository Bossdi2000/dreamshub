import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useHistory } from './HistoryContext';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
    id: string | number;
    name: string;
    sku: string;
    category: string;
    selling_price: number;
    buying_price: number;
    stock: number;
    status: string;
    image: string;
    model: string;
    serials: string[];
    description?: string;
    colors?: string[];
    sizes?: string[];
    expiryDate?: string | null;
    manufacturedDate?: string | null;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    has_expiry: boolean;
    has_serials: boolean;
}

export interface Batch {
    id: string;
    product_id: string;
    batch_number: string;
    expiry_date: string | null;
    manufactured_date: string | null;
    product_name?: string;
}

export interface Warehouse {
    id: string;
    name: string;
    type: 'Warehouse' | 'Store Front' | 'Backroom';
    is_active: boolean;
}

export interface Movement {
    id: string;
    product_id: string;
    product_name?: string;
    from_location_id?: string;
    to_location_id?: string;
    from_location_name?: string;
    to_location_name?: string;
    quantity: number;
    movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RESERVE' | 'RETURN';
    reason: string | null;
    created_at: string;
}

interface InventoryContextType {
    products: Product[];
    categories: Category[];
    movements: Movement[];
    warehouses: Warehouse[];
    batches: Batch[];
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (id: string | number, product: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string | number) => Promise<void>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string | number) => Promise<void>;
    addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => Promise<void>;
    updateWarehouse: (id: string, updates: Partial<Warehouse>) => Promise<void>;
    deleteWarehouse: (id: string) => Promise<void>;
    transferStock: (productId: string, fromId: string, toId: string, qty: number, reason: string) => Promise<void>;
    loading: boolean;
    refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);

    const { addLog } = useHistory();

    const refreshInventory = async () => {
        try {
            setLoading(true);

            // 1. Fetch Warehouses
            const { data: whData, error: whError } = await (supabase as any).from('warehouses').select('*');
            if (!whError) setWarehouses(whData || []);

            // 2. Fetch Categories
            const { data: catData, error: catError } = await (supabase as any).from('categories').select('*');
            let currentCategories: Category[] = [];
            if (!catError) {
                currentCategories = catData || [];
                setCategories(currentCategories);
            }

            // 3. Fetch Products with related data
            let prodData: any[] = [];
            const { data, error: prodError } = await (supabase as any)
                .from('products')
                .select(`
                    id,
                    name,
                    sku,
                    buying_price,
                    selling_price,
                    image_url,
                    description,
                    categories (id, name)
                `);

            if (prodError) {
                const { data: basicData, error: basicError } = await (supabase as any)
                    .from('products')
                    .select('id, name, sku, buying_price, selling_price, image_url, description');
                if (!basicError) prodData = basicData || [];
            } else {
                prodData = data || [];
            }

            // 4. Fetch Stock & Movements
            const { data: movData, error: movError } = await (supabase as any).from('inventory_movements').select('*').order('created_at', { ascending: false });
            const movementsWithNames = (movData || []).map((m: any) => ({
                ...m,
                product_name: prodData.find(p => p.id === m.product_id)?.name || 'Unknown Product',
                from_location_name: whData?.find(w => w.id === m.from_location_id)?.name,
                to_location_name: whData?.find(w => w.id === m.to_location_id)?.name
            }));
            setMovements(movementsWithNames);

            const stockMap: Record<string, number> = {};
            movementsWithNames.forEach(m => {
                const qty = Number(m.quantity) || 0;
                stockMap[m.product_id] = (stockMap[m.product_id] || 0) + qty;
            });

            // 5. Fetch Serial Numbers
            const { data: serialData } = await (supabase as any).from('serial_numbers').select('*');
            const serialMap: Record<string, string[]> = {};
            (serialData || []).forEach((s: any) => {
                if (!serialMap[s.product_id]) serialMap[s.product_id] = [];
                serialMap[s.product_id].push(s.serial_number);
            });

            // 6. Fetch Batches
            const { data: bData } = await (supabase as any).from('batches').select(`
                *,
                products (name)
            `);
            const mappedBatches: Batch[] = (bData || []).map((b: any) => ({
                ...b,
                product_name: b.products?.name
            }));
            setBatches(mappedBatches);

            const productBatchMap: Record<string, Batch> = {};
            mappedBatches.forEach(b => {
                if (b.product_id && (!productBatchMap[b.product_id] || (b.expiry_date && (!productBatchMap[b.product_id].expiry_date || b.expiry_date < (productBatchMap[b.product_id].expiry_date || ''))))) {
                    productBatchMap[b.product_id] = b;
                }
            });

            // 7. Map everything back to Product objects
            const mappedProducts: Product[] = prodData.map((p: any) => {
                const stock = stockMap[p.id] || 0;
                let model = 'N/A';
                let cleanDesc = p.description || '';

                if (cleanDesc && cleanDesc.includes('[MODEL:')) {
                    const modelMatch = cleanDesc.match(/\[MODEL:\s*([^\]]+)\]/);
                    if (modelMatch) {
                        model = modelMatch[1];
                        cleanDesc = cleanDesc.replace(/\[MODEL:.*?\]/, '').trim();
                    }
                }

                const catName = Array.isArray(p.categories)
                    ? p.categories[0]?.name
                    : (p.categories as any)?.name || 'Uncategorized';

                return {
                    id: p.id,
                    name: p.name || 'Unnamed Product',
                    sku: p.sku || 'N/A',
                    category: catName || 'Uncategorized',
                    selling_price: Number(p.selling_price) || 0,
                    buying_price: Number(p.buying_price) || 0,
                    stock: stock,
                    status: stock > 10 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock',
                    image: p.image_url || '📦',
                    model: model,
                    description: cleanDesc,
                    serials: serialMap[p.id] || [],
                    expiryDate: productBatchMap[p.id]?.expiry_date || null,
                    manufacturedDate: productBatchMap[p.id]?.manufactured_date || null
                };
            });
            setProducts(mappedProducts);

        } catch (error: any) {
            console.error('Inventory Sync Critical Error:', error);
            toast.error('Cloud Sync Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshInventory();
    }, []);

    const addProduct = async (newProduct: Omit<Product, 'id'>) => {
        try {
            setLoading(true);
            const { data: mainStore } = await (supabase as any)
                .from('warehouses')
                .select('id')
                .eq('name', 'Main Store')
                .maybeSingle();

            if (!mainStore) throw new Error("Default warehouse 'Main Store' missing");

            let categoryId = null;
            if (newProduct.category) {
                const { data: catData } = await (supabase as any)
                    .from('categories')
                    .select('id')
                    .ilike('name', newProduct.category)
                    .maybeSingle();

                if (catData) {
                    categoryId = catData.id;
                } else {
                    const { data: newCat } = await (supabase as any)
                        .from('categories')
                        .insert({ name: newProduct.category, description: 'Added via product creation' })
                        .select()
                        .single();
                    categoryId = newCat?.id;
                }
            }

            const description = newProduct.model
                ? `[MODEL: ${newProduct.model}] ${newProduct.description || ''}`
                : newProduct.description || '';

            const { data: productData, error: productError } = await (supabase as any).from('products').insert({
                name: newProduct.name,
                sku: newProduct.sku,
                buying_price: newProduct.buying_price,
                selling_price: newProduct.selling_price,
                image_url: newProduct.image,
                category_id: categoryId,
                description: description
            }).select().single();

            if (productError || !productData) throw new Error(productError?.message || "Failed to create product");

            if ((newProduct.expiryDate || newProduct.manufacturedDate)) {
                await (supabase as any).from('batches').insert({
                    product_id: productData.id,
                    batch_number: `B-${Date.now()}`,
                    expiry_date: newProduct.expiryDate || null,
                    manufactured_date: newProduct.manufacturedDate || null
                });
            }

            if (newProduct.stock > 0) {
                await (supabase as any).from('inventory_movements').insert({
                    product_id: productData.id,
                    to_location_id: mainStore.id,
                    quantity: newProduct.stock,
                    movement_type: 'IN',
                    reason: 'Initial Inventory Load'
                });
            }

            if (newProduct.serials && newProduct.serials.length > 0) {
                const serialsToInsert = newProduct.serials.map(sn => ({
                    product_id: productData.id,
                    serial_number: sn,
                    status: 'Available',
                    current_location_id: mainStore.id
                }));
                await (supabase as any).from('serial_numbers').insert(serialsToInsert);
            }

            addLog({
                type: 'Inventory',
                action: 'Product Created',
                target: newProduct.name,
                user: localStorage.getItem('user_role') || 'Admin',
                role: localStorage.getItem('user_role') || 'Admin',
                level: 'Success',
                path: '/products'
            });

            toast.success(`${newProduct.name} registered successfully`);
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id: string | number, updates: Partial<Product>) => {
        try {
            setLoading(true);
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.sku) dbUpdates.sku = updates.sku;
            if (updates.buying_price !== undefined) dbUpdates.buying_price = updates.buying_price;
            if (updates.selling_price !== undefined) dbUpdates.selling_price = updates.selling_price;
            if (updates.image) dbUpdates.image_url = updates.image;

            if (updates.model || updates.description) {
                const model = updates.model || '';
                const desc = updates.description || '';
                dbUpdates.description = model ? `[MODEL: ${model}] ${desc}` : desc;
            }

            if (updates.category) {
                const { data: catData } = await (supabase as any)
                    .from('categories')
                    .select('id')
                    .ilike('name', updates.category)
                    .maybeSingle();
                if (catData) dbUpdates.category_id = catData.id;
            }

            const { error: prodError } = await (supabase as any).from('products').update(dbUpdates).eq('id', id);
            if (prodError) throw prodError;

            if (updates.expiryDate || updates.manufacturedDate) {
                const { data: existingBatch } = await (supabase as any).from('batches').select('id').eq('product_id', id).maybeSingle();
                if (existingBatch) {
                    await (supabase as any).from('batches').update({
                        expiry_date: updates.expiryDate || null,
                        manufactured_date: updates.manufacturedDate || null
                    }).eq('id', existingBatch.id);
                } else {
                    await (supabase as any).from('batches').insert({
                        product_id: id,
                        batch_number: `B-${Date.now()}`,
                        expiry_date: updates.expiryDate || null,
                        manufactured_date: updates.manufacturedDate || null
                    });
                }
            }

            toast.success('Product updated');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string | number) => {
        // Ensure we're comparing oranges to oranges (strings)
        const idToMatch = String(id);
        const productToDelete = products.find(p => String(p.id) === idToMatch);
        const productName = productToDelete?.name || 'Unknown Product';

        if (!window.confirm(`Are you sure you want to delete "${productName}"? All historical movements and serial records will be purged.`)) {
            console.log('Delete cancelled by user');
            return;
        }

        // Optimistic UI update
        const previousProducts = [...products];
        setProducts(prevProducts => prevProducts.filter(p => String(p.id) !== idToMatch));

        try {
            setLoading(true);
            console.log('=== DELETE OPERATION START ===', { id, idToMatch, productName });

            // 1. Verify existence in database
            const { data: checkData, error: checkError } = await (supabase as any)
                .from('products')
                .select('id')
                .eq('id', idToMatch)
                .maybeSingle();

            if (checkError) {
                console.error('Database check error:', checkError);
                throw new Error(`Connection error: ${checkError.message}`);
            }

            if (!checkData) {
                console.warn('Product not found in database, might be already deleted.');
                // Even if not in DB, we want it gone from UI, which we already did.
                // But we should refresh to be sure.
                await refreshInventory();
                return;
            }

            // 2. Cascade deletion of related records
            // We use a series of deletions to handle keys
            console.log('Deleting related records for:', idToMatch);

            // Delete movements
            await (supabase as any).from('inventory_movements').delete().eq('product_id', idToMatch);

            // Delete serial numbers
            await (supabase as any).from('serial_numbers').delete().eq('product_id', idToMatch);

            // Delete batches (if table exists)
            try {
                await (supabase as any).from('batches').delete().eq('product_id', idToMatch);
            } catch (e) {
                console.warn('Could not delete from batches (might not exist):', e);
            }

            // 3. Final Delete - The Product itself
            const { error: prodError, data: deletedData } = await (supabase as any)
                .from('products')
                .delete()
                .eq('id', idToMatch)
                .select();

            if (prodError) {
                console.error('❌ DATABASE DELETE FAILED:', prodError);
                throw prodError;
            }

            if (!deletedData || deletedData.length === 0) {
                console.error('⚠️ No rows deleted from products table');
                throw new Error('Deletion failed: Product remains in database due to unknown constraint.');
            }

            console.log('✅ Product successfully purged:', productName);

            addLog({
                type: 'Inventory',
                action: 'Product Deleted',
                target: productName,
                user: localStorage.getItem('user_role') || 'Admin',
                role: localStorage.getItem('user_role') || 'Admin',
                level: 'Warning',
                path: '/products'
            });

            toast.success(`${productName} deleted successfully`);
            await refreshInventory();

        } catch (error: any) {
            console.error('Delete product error:', error);
            // Revert optimistic update
            setProducts(previousProducts);
            toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (category: Omit<Category, 'id'>) => {
        try {
            setLoading(true);
            const { error } = await (supabase as any).from('categories').insert(category);
            if (error) throw error;
            toast.success('Category created');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        try {
            setLoading(true);
            const { error } = await (supabase as any).from('categories').update(updates).eq('id', id);
            if (error) throw error;
            toast.success('Category updated');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id: string | number) => {
        try {
            setLoading(true);
            const { error } = await (supabase as any).from('categories').delete().eq('id', id);
            if (error) throw error;
            toast.success('Category deleted');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addWarehouse = async (warehouse: Omit<Warehouse, 'id'>) => {
        try {
            setLoading(true);
            const { error } = await (supabase as any).from('warehouses').insert(warehouse);
            if (error) throw error;
            toast.success('Facility added');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
        try {
            setLoading(true);
            const { error } = await (supabase as any).from('warehouses').update(updates).eq('id', id);
            if (error) throw error;
            toast.success('Facility updated');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteWarehouse = async (id: string) => {
        try {
            setLoading(true);
            const { error } = await (supabase as any).from('warehouses').delete().eq('id', id);
            if (error) throw error;
            toast.success('Facility removed');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const transferStock = async (productId: string, fromId: string, toId: string, qty: number, reason: string) => {
        try {
            setLoading(true);
            const { error } = await (supabase as any).from('inventory_movements').insert([
                {
                    product_id: productId,
                    from_location_id: fromId,
                    quantity: -qty,
                    movement_type: 'TRANSFER',
                    reason: `Transfer OUT: ${reason}`
                },
                {
                    product_id: productId,
                    to_location_id: toId,
                    quantity: qty,
                    movement_type: 'TRANSFER',
                    reason: `Transfer IN: ${reason}`
                }
            ]);
            if (error) throw error;
            toast.success('Stock transfer recorded');
            await refreshInventory();
        } catch (error: any) {
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <InventoryContext.Provider value={{
            products, categories, movements, warehouses, batches,
            addProduct, updateProduct, deleteProduct,
            addCategory, updateCategory, deleteCategory,
            addWarehouse, updateWarehouse, deleteWarehouse,
            transferStock, loading, refreshInventory
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error('useInventory must be used within an InventoryProvider');
    return context;
};
