'use client';
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// MOCK DATA - Replace with Firestore fetching logic
const mockOrders: Omit<Order, 'createdAt'>[] = [
    { id: 'ORD-001', userId: 'mockUser', items: [], total: 289.98, status: 'Shipped' },
    { id: 'ORD-002', userId: 'mockUser', items: [], total: 129.99, status: 'Delivered' },
    { id: 'ORD-003', userId: 'mockUser', items: [], total: 79.99, status: 'Pending' },
];

export default function MyOrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<(Omit<Order, 'createdAt'> & { createdAt?: any })[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            // TODO: Fetch orders for the current user from Firestore
            const fetchOrders = async () => {
                setOrdersLoading(true);
                // Example: const userOrders = await getOrdersFromFirestore(user.uid);
                // Add a mock date for display
                const ordersWithDate = mockOrders.map((o, i) => ({
                    ...o,
                    createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000)
                }));
                setOrders(ordersWithDate);
                setOrdersLoading(false);
            };
            fetchOrders();
        }
    }, [user]);

    const renderSkeleton = () => (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );

    if (loading || !user) {
        return (
            <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    <div className="container relative py-8">
                        <Skeleton className="h-12 w-1/4 mb-4" />
                        {renderSkeleton()}
                    </div>
                </main>
            </div>
        );
    }
    
    return (
        <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
                <div className="container relative py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Orders</CardTitle>
                            <CardDescription>View your past orders and their status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ordersLoading ? renderSkeleton() : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.id}</TableCell>
                                                <TableCell>{order.createdAt?.toLocaleDateString()}</TableCell>
                                                <TableCell><Badge variant={order.status === 'Shipped' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
