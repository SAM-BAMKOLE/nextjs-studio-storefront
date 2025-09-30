'use client';
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProductActions } from '@/components/admin/product-actions';

// MOCK DATA - Replace with Firestore fetching logic
const mockProducts: Product[] = [
  { id: '1', name: 'Wireless Headphones', description: 'High-fidelity sound, 24-hour battery.', price: 199.99, stock: 15, imageUrl: PlaceHolderImages[0].imageUrl, imageHint: PlaceHolderImages[0].imageHint },
  { id: '2', name: 'Durable Backpack', description: 'Water-resistant, multiple compartments.', price: 89.99, stock: 30, imageUrl: PlaceHolderImages[1].imageUrl, imageHint: PlaceHolderImages[1].imageHint },
  { id: '3', name: 'Smart Watch', description: 'Fitness tracking, notifications, and more.', price: 249.99, stock: 0, imageUrl: PlaceHolderImages[2].imageUrl, imageHint: PlaceHolderImages[2].imageHint },
  { id: '4', name: 'Coffee Maker', description: 'Brews up to 12 cups. Programmable timer.', price: 129.99, stock: 10, imageUrl: PlaceHolderImages[3].imageUrl, imageHint: PlaceHolderImages[3].imageHint },
];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch products from Firestore
        setLoading(true);
        setProducts(mockProducts);
        setLoading(false);
    }, []);

    const handleProductUpdate = (product: Product) => {
        setProducts(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? product : p);
            }
            return [...prev, product];
        })
    }
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <ProductActions onProductSaved={handleProductUpdate} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Product Inventory</CardTitle>
                    <CardDescription>Manage your products and their stock levels.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={product.imageUrl}
                                            data-ai-hint={product.imageHint}
                                            width="64"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <ProductActions product={product} onProductSaved={handleProductUpdate} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
