'use client';
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback for display if firestore is not configured
        setProducts([]);
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

  if (products.length === 0 && !loading) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center col-span-full">
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                It looks like there are no products in the store yet.
            </p>
        </div>
      )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
