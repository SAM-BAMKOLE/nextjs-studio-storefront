'use client';
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { collection, getDocs, writeBatch, query, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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


async function seedDatabase() {
    try {
        const productsCollection = collection(db, 'products');
        const snapshot = await getCountFromServer(query(productsCollection));

        if (snapshot.data().count === 0) {
            console.log('No products found, seeding database...');
            const batch = writeBatch(db);
            mockProducts.forEach((product) => {
                const docRef = doc(productsCollection);
                batch.set(docRef, product);
            });
            await batch.commit();
            console.log('Database seeded successfully.');
        } else {
            console.log('Products already exist, skipping seeding.');
        }
    } catch (error) {
        console.error("Error seeding database: ", error);
        // This might fail if firestore is not enabled, which is fine.
    }
}


export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      await seedDatabase();
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Display mock products as a fallback if firestore fails
        const mockProductsWithIds = mockProducts.map((p, i) => ({ ...p, id: `mock-${i}` }));
        setProducts(mockProductsWithIds);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="h-48 w-full animate-pulse rounded-lg bg-muted-foreground/20"></div>
                    <div className="space-y-1">
                        <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted-foreground/20"></div>
                        <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted-foreground/20"></div>
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
