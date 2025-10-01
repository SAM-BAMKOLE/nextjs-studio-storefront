'use client';
import { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { collection, doc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDoc } from 'firebase/firestore';

type OrderStatus = Order['status'];

type OrderWithCustomerName = Omit<Order, 'createdAt'> & { customerName: string; createdAt: Date };

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderWithCustomerName[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const ordersCollection = collection(db, 'orders');
                const q = query(ordersCollection, orderBy('createdAt', 'desc'));
                const ordersSnapshot = await getDocs(q);
                
                const ordersList = await Promise.all(ordersSnapshot.docs.map(async (orderDoc) => {
                    const orderData = orderDoc.data() as Order;
                    let customerName = 'Unknown User';
                    
                    if (orderData.userId) {
                        const userDocRef = doc(db, 'users', orderData.userId);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            customerName = userDoc.data().displayName || 'Unknown User';
                        }
                    }

                    return {
                        ...orderData,
                        id: orderDoc.id,
                        customerName,
                        createdAt: orderData.createdAt.toDate(),
                    };
                }));

                setOrders(ordersList);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to fetch orders',
                    description: 'Could not load orders from the database.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [toast]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const originalOrders = [...orders];
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: newStatus });
            toast({
                title: 'Order Status Updated',
                description: `Order ${orderId} has been updated to ${newStatus}.`
            });
        } catch (error) {
            console.error(`Error updating order ${orderId}:`, error);
            setOrders(originalOrders);
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: `Could not update order ${orderId}.`
            });
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Orders</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Customer Orders</CardTitle>
                    <CardDescription>View and manage all customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
