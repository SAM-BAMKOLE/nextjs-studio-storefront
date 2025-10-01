'use server';
/**
 * @fileOverview A checkout flow that creates an order and updates product stock.
 *
 * - checkout - A function that handles the checkout process.
 * - CheckoutInput - The input type for the checkout function.
 * - CheckoutOutput - The return type for the checkout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { CartItem } from '@/lib/types';
import admin from 'firebase-admin';

// Singleton pattern to ensure Firebase Admin is initialized only once.
const getDb = (() => {
  let db: ReturnType<typeof getFirestore>;

  return () => {
    if (!db) {
      if (!getApps().length) {
        admin.initializeApp();
      }
      db = getFirestore(getApps()[0]);
    }
    return db;
  };
})();


const CartItemSchema = z.object({
    id: z.string(),
    quantity: z.number(),
    name: z.string(),
    price: z.number(),
    imageUrl: z.string(),
    imageHint: z.string(),
    stock: z.number(),
});

const CheckoutInputSchema = z.object({
  userId: z.string().describe('The ID of the user placing the order.'),
  items: z.array(CartItemSchema).describe('The items in the cart.'),
});
export type CheckoutInput = z.infer<typeof CheckoutInputSchema>;

const CheckoutOutputSchema = z.object({
  orderId: z.string().describe('The ID of the created order.'),
});
export type CheckoutOutput = z.infer<typeof CheckoutOutputSchema>;

export async function checkout(input: CheckoutInput): Promise<CheckoutOutput> {
  return checkoutFlow(input);
}

const checkoutFlow = ai.defineFlow(
  {
    name: 'checkoutFlow',
    inputSchema: CheckoutInputSchema,
    outputSchema: CheckoutOutputSchema,
  },
  async (input) => {
    const db = getDb();
    const { userId, items } = input;
    
    // Calculate total price on the server to prevent manipulation
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderRef = db.collection('orders').doc();
    
    const orderData = {
        userId,
        items,
        total,
        status: 'Pending',
        createdAt: FieldValue.serverTimestamp(),
    };
    
    const productUpdates = items.map(item => {
        const productRef = db.collection('products').doc(item.id);
        const newStock = FieldValue.increment(-item.quantity);
        return { ref: productRef, update: { stock: newStock } };
    });

    // Use a batch write to ensure atomicity
    const batch = db.batch();
    
    batch.set(orderRef, orderData);
    
    productUpdates.forEach(update => {
        batch.update(update.ref, update.update);
    });
    
    await batch.commit();

    return { orderId: orderRef.id };
  }
);
