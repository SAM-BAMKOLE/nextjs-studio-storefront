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
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define a type for the order with a Date object for createdAt
type OrderWithDate = Omit<Order, 'createdAt'> & { createdAt: Date | null };

export default function MyOrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<OrderWithDate[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                setOrdersLoading(true);
                try {
                    const q = query(
                        collection(db, 'orders'),
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    );
                    const querySnapshot = await getDocs(q);
                    const userOrders = querySnapshot.docs.map(doc => {
                        const data = doc.data() as Order;
                        // Correctly convert Timestamp to Date
                        const createdAtDate = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
                        return {
                            ...data,
                            id: doc.id,
                            createdAt: createdAtDate,
                        } as OrderWithDate;
                    });
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setOrdersLoading(false);
                }
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
                            {ordersLoading ? renderSkeleton() : orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                                    <h3 className="text-lg font-semibold">No orders yet</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        You haven&apos;t placed any orders yet.
                                    </p>
                                </div>
                            ) : (
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
                                                <TableCell className="font-medium truncate max-w-[100px]">{order.id}</TableCell>
                                                <TableCell>{order.createdAt?.toLocaleDateString() || 'N/A'}</TableCell>
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
