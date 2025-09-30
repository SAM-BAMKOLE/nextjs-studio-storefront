'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { Edit } from 'lucide-react';

interface ProductActionsProps {
    product?: Product;
    onProductSaved: (product: Product) => void;
}

export function ProductActions({ product, onProductSaved }: ProductActionsProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [stock, setStock] = useState(product?.stock || 0);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const isEditing = !!product;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const savedProduct: Product = {
            id: product?.id || new Date().toISOString(), // Mock ID generation
            name,
            description,
            price,
            stock,
            imageUrl: product?.imageUrl || 'https://picsum.photos/seed/new/600/400',
            imageHint: product?.imageHint || 'new product'
        };

        // TODO: In a real app, call a server action or API to save to Firestore
        console.log('Saving product:', savedProduct);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onProductSaved(savedProduct);

        toast({
            title: `Product ${isEditing ? 'updated' : 'created'}`,
            description: `${name} has been saved successfully.`,
        });

        setLoading(false);
        setOpen(false);
        if (!isEditing) {
            setName('');
            setDescription('');
            setPrice(0);
            setStock(0);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                ) : (
                    <Button>Add Product</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Make changes to your product here.' : 'Add a new product to your store.'} Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">Stock</Label>
                            <Input id="stock" type="number" value={stock} onChange={e => setStock(parseInt(e.target.value))} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
