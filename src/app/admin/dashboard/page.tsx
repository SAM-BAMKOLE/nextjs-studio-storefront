'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Package, Users, Activity } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { interpretSalesData } from '@/ai/flows/sales-data-interpretation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { collection, getDocs, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    topProduct: { name: string; unitsSold: number } | null;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesDataString, setSalesDataString] = useState('');
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [aiQuery, setAiQuery] = useState('Summarize the sales performance.');
    const [insight, setInsight] = useState('');
    const [insightLoading, setInsightLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            setDashboardLoading(true);
            try {
                // Fetch orders and users
                const ordersCollection = collection(db, 'orders');
                const usersCollection = collection(db, 'users');
                
                const [ordersSnapshot, userCountSnapshot, productsSnapshot] = await Promise.all([
                    getDocs(ordersCollection),
                    getCountFromServer(query(usersCollection, where('role', '==', 'user'))),
                    getDocs(collection(db, 'products')),
                ]);

                const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);
                const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

                // Calculate stats
                const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
                const totalOrders = orders.length;
                const totalCustomers = userCountSnapshot.data().count;

                // Calculate top product
                const productSales: { [key: string]: number } = {};
                orders.forEach(order => {
                    order.items.forEach(item => {
                        productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
                    });
                });
                
                let topProduct: { name: string; unitsSold: number } | null = null;
                if (Object.keys(productSales).length > 0) {
                    const topProductId = Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b);
                    const topProductDoc = products.find(p => p.id === topProductId);
                    if (topProductDoc) {
                        topProduct = {
                            name: topProductDoc.name,
                            unitsSold: productSales[topProductId],
                        };
                    }
                }
                
                setStats({
                    totalRevenue,
                    totalOrders,
                    totalCustomers,
                    topProduct,
                });
                
                const salesByMonth = orders.reduce((acc, order) => {
                    const month = order.createdAt.toDate().toLocaleString('default', { month: 'long' });
                    acc[month] = (acc[month] || 0) + order.total;
                    return acc;
                }, {} as {[key: string]: number});
                
                const fullSalesData = {
                    totalRevenue,
                    totalOrders,
                    totalCustomers,
                    topProducts: topProduct ? [topProduct] : [],
                    salesByMonth
                };

                setSalesDataString(JSON.stringify(fullSalesData, null, 2));

            } catch (e: any) {
                console.error("Failed to fetch dashboard data:", e);
                setError('Failed to load dashboard data. ' + e.message);
            } finally {
                setDashboardLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleGetInsight = async () => {
        setInsightLoading(true);
        setError('');
        setInsight('');
        try {
            const result = await interpretSalesData({
                salesData: salesDataString,
                query: aiQuery,
            });
            setInsight(result.insight);
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setInsightLoading(false);
        }
    };
    
    const StatCard = ({ title, value, icon, loading, subtext }: { title: string; value: string | number; icon: React.ReactNode; loading: boolean; subtext?: string }) => (
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {icon}
          </CardHeader>
          <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{value}</div>
                  {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
                </>
              )}
          </CardContent>
      </Card>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard 
                  title="Total Revenue"
                  value={`$${stats?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                  icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                  loading={dashboardLoading}
                />
                <StatCard 
                  title="Orders"
                  value={`+${stats?.totalOrders || '0'}`}
                  icon={<Package className="h-4 w-4 text-muted-foreground" />}
                  loading={dashboardLoading}
                />
                <StatCard 
                  title="Customers"
                  value={`+${stats?.totalCustomers || '0'}`}
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  loading={dashboardLoading}
                />
                <StatCard 
                  title="Top Product"
                  value={stats?.topProduct?.name || 'N/A'}
                  icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                  loading={dashboardLoading}
                  subtext={stats?.topProduct ? `${stats.topProduct.unitsSold} units sold` : ''}
                />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Sales Data Interpretation Tool</CardTitle>
                    <CardDescription>Use AI to get insights from your sales data. The data below is dynamically generated from your store's activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Sales Data (JSON)</h3>
                        <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                            <code>{dashboardLoading ? 'Loading sales data...' : salesDataString}</code>
                        </pre>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Your Question</h3>
                        <Textarea 
                            placeholder="e.g., What are the sales trends this month?"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleGetInsight} disabled={insightLoading || dashboardLoading}>
                        {insightLoading ? 'Generating Insight...' : 'Get Insight'}
                    </Button>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {insight && (
                        <Alert>
                            <AlertTitle>AI-Powered Insight</AlertTitle>
                            <AlertDescription>{insight}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
