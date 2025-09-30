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

// Mock data
const mockOrders: (Omit<Order, 'createdAt' | 'userId'> & { customer: string, createdAt: Date })[] = [
    { id: 'ORD-001', customer: 'John Doe', items: [], total: 289.98, status: 'Shipped', createdAt: new Date('2023-03-15') },
    { id: 'ORD-002', customer: 'Jane Smith', items: [], total: 129.99, status: 'Delivered', createdAt: new Date('2023-03-14') },
    { id: 'ORD-003', customer: 'Bob Johnson', items: [], total: 79.99, status: 'Pending', createdAt: new Date('2023-03-16') },
    { id: 'ORD-004', customer: 'Alice Williams', items: [], total: 350.00, status: 'Cancelled', createdAt: new Date('2023-03-12') },
];

type OrderStatus = Order['status'];

export default function OrdersPage() {
    const [orders, setOrders] = useState<(Omit<Order, 'createdAt' | 'userId'> & { customer: string, createdAt: Date })[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        // TODO: Fetch orders from Firestore
        setLoading(true);
        setOrders(mockOrders);
        setLoading(false);
    }, []);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        // TODO: Update order status in Firestore
        console.log(`Updating order ${orderId} to ${newStatus}`);
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast({
            title: 'Order Status Updated',
            description: `Order ${orderId} has been updated to ${newStatus}.`
        });
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
                                    <TableCell>{order.customer}</TableCell>
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
