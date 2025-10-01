'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, runTransaction, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';

export function CartView() {
    const { state, dispatch, totalPrice, isCartReady } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleUpdateQuantity = (id: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const handleCheckout = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'Please log in to proceed to checkout.',
            });
            router.push('/login');
            return;
        }

        setIsCheckingOut(true);

        try {
            await runTransaction(db, async (transaction) => {
                const productRefs = state.items.map(item => doc(db, 'products', item.id));
                const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                for (let i = 0; i < productDocs.length; i++) {
                    if (!productDocs[i].exists()) {
                        throw new Error(`Product ${state.items[i].name} not found!`);
                    }
                    const currentStock = productDocs[i].data().stock;
                    if (currentStock < state.items[i].quantity) {
                        throw new Error(`Not enough stock for ${state.items[i].name}. Only ${currentStock} left.`);
                    }
                }
                
                // All reads are done. Now perform writes.
                const orderRef = doc(collection(db, 'orders'));
                transaction.set(orderRef, {
                    userId: user.uid,
                    items: state.items,
                    total: totalPrice,
                    status: 'Pending',
                    createdAt: serverTimestamp(),
                });

                for (let i = 0; i < productDocs.length; i++) {
                    const productDoc = productDocs[i];
                    const item = state.items[i];
                    const newStock = productDoc.data().stock - item.quantity;
                    transaction.update(productRefs[i], { stock: newStock });
                }
            });

            toast({
                title: 'Order Placed!',
                description: "Your order has been successfully placed.",
            });

            dispatch({ type: 'CLEAR_CART' });
            router.push('/my-orders');

        } catch (error: any) {
            console.error("Error placing order: ", error);
            toast({
                variant: 'destructive',
                title: 'Checkout Error',
                description: error.message || 'There was a problem placing your order. Note: This may be a permission issue if Firestore rules are not set correctly.',
            });
        } finally {
            setIsCheckingOut(false);
        }
    }

    if (!isCartReady) {
        return (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (state.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center mt-8">
                <div className="text-3xl">🛒</div>
                <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    Looks like you haven&apos;t added anything to your cart yet.
                </p>
                <Link href="/">
                    <Button>Browse Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {state.items.map(item => (
                            <div key={item.id} className="grid grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_1fr_auto] items-start gap-4">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    data-ai-hint={item.imageHint}
                                    width={100}
                                    height={100}
                                    className="rounded-md object-cover aspect-square"
                                />
                                <div className="flex flex-col h-full">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                                    <div className="flex items-center space-x-2 mt-auto sm:hidden">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                            <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm">{item.quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end h-full">
                                    <p className="font-medium text-right">${(item.price * item.quantity).toFixed(2)}</p>
                                     <div className="hidden sm:flex items-center space-x-2 mt-auto">
                                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                            <MinusCircle className="h-4 w-4" />
                                        </Button>
                                        <span>{item.quantity}</span>
                                        <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="mt-1 sm:mt-auto" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleCheckout} disabled={isCheckingOut}>
                            {isCheckingOut ? 'Placing Order...' : 'Proceed to Checkout'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
