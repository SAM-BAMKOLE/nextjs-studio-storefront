'use client';
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ProductActions } from '@/components/admin/product-actions';
import { collection, getDocs, writeBatch, doc, getCountFromServer, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const mockProducts: Omit<Product, 'id'>[] = [
  { name: 'Wireless Headphones', description: 'High-fidelity sound, 24-hour battery.', price: 199.99, stock: 15, imageUrl: PlaceHolderImages[0].imageUrl, imageHint: PlaceHolderImages[0].imageHint },
  { name: 'Durable Backpack', description: 'Water-resistant, multiple compartments.', price: 89.99, stock: 30, imageUrl: PlaceHolderImages[1].imageUrl, imageHint: PlaceHolderImages[1].imageHint },
  { name: 'Smart Watch', description: 'Fitness tracking, notifications, and more.', price: 249.99, stock: 25, imageUrl: PlaceHolderImages[2].imageUrl, imageHint: PlaceHolderImages[2].imageHint },
  { name: 'Coffee Maker', description: 'Brews up to 12 cups. Programmable timer.', price: 129.99, stock: 10, imageUrl: PlaceHolderImages[3].imageUrl, imageHint: PlaceHolderImages[3].imageHint },
  { name: 'Ergonomic Office Chair', description: 'Full back support, adjustable height.', price: 350.00, stock: 8, imageUrl: PlaceHolderImages[4].imageUrl, imageHint: PlaceHolderImages[4].imageHint },
  { name: 'Running Shoes', description: 'Lightweight and responsive for daily runs.', price: 130.00, stock: 50, imageUrl: PlaceHolderImages[5].imageUrl, imageHint: PlaceHolderImages[5].imageHint },
  { name: 'Bluetooth Speaker', description: 'Portable, waterproof, 12-hour playtime.', price: 79.99, stock: 40, imageUrl: PlaceHolderImages[6].imageUrl, imageHint: PlaceHolderImages[6].imageHint },
  { name: 'Modern Laptop', description: '13-inch display, 16GB RAM, 512GB SSD.', price: 1200.00, stock: 12, imageUrl: PlaceHolderImages[7].imageUrl, imageHint: PlaceHolderImages[7].imageHint },
];


export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();
    const { toast } = useToast();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const productsCollection = collection(db, 'products');
            const productsSnapshot = await getDocs(productsCollection);
            const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productsList);
        } catch (error) {
            console.error("Error fetching products: ", error);
            toast({
                variant: 'destructive',
                title: 'Error fetching products',
                description: 'Could not load products from the database.',
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const seedDatabase = async () => {
            if (!isAdmin) return;
    
            try {
                const productsCollection = collection(db, 'products');
                const snapshot = await getCountFromServer(query(productsCollection));
        
                if (snapshot.data().count === 0) {
                    console.log('No products found as admin, seeding database...');
                    const batch = writeBatch(db);
                    mockProducts.forEach((product) => {
                        const docRef = doc(productsCollection);
                        batch.set(docRef, product);
                    });
                    await batch.commit();
                    console.log('Database seeded successfully.');
                    toast({
                        title: 'Database Seeded',
                        description: 'Initial products have been added to the store.',
                    });
                    return true; // Indicates that seeding was performed
                } else {
                    console.log('Products already exist, skipping seeding.');
                }
            } catch (error) {
                console.error("Error seeding database: ", error);
                toast({
                    variant: 'destructive',
                    title: 'Error Seeding Database',
                    description: 'Could not add initial products.',
                });
            }
            return false; // Indicates no seeding was performed
        }

        const initializeProducts = async () => {
            setLoading(true);
            const seeded = await seedDatabase();
            // Always fetch products, regardless of seeding
            await fetchProducts();
            setLoading(false);
        };

        initializeProducts();
    }, [isAdmin, toast]);

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
