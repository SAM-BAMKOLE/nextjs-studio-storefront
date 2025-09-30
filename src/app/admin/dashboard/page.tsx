'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Package, Users, Activity } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { interpretSalesData } from '@/ai/flows/sales-data-interpretation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data, in a real app this would be fetched from Firestore/Analytics
const salesData = {
    totalRevenue: 52310.55,
    totalOrders: 852,
    totalCustomers: 430,
    topProducts: [
        { name: "Smart Watch", unitsSold: 150 },
        { name: "Wireless Headphones", unitsSold: 120 },
        { name: "Durable Backpack", unitsSold: 95 },
    ],
    salesByMonth: {
        "January": 12000,
        "February": 15000,
        "March": 25310.55,
    }
};

export default function DashboardPage() {
    const [query, setQuery] = useState('Summarize the sales performance for March.');
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetInsight = async () => {
        setLoading(true);
        setError('');
        setInsight('');
        try {
            const result = await interpretSalesData({
                salesData: JSON.stringify(salesData, null, 2),
                query: query,
            });
            setInsight(result.insight);
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${salesData.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{salesData.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">+18.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{salesData.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">+10.2% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Product</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesData.topProducts[0].name}</div>
                        <p className="text-xs text-muted-foreground">{salesData.topProducts[0].unitsSold} units sold</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Sales Data Interpretation Tool</CardTitle>
                    <CardDescription>Use AI to get insights from your sales data. The data below is pre-filled for this demo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Sales Data (JSON)</h3>
                        <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                            <code>{JSON.stringify(salesData, null, 2)}</code>
                        </pre>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Your Question</h3>
                        <Textarea 
                            placeholder="e.g., What are the sales trends this month?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleGetInsight} disabled={loading}>
                        {loading ? 'Generating Insight...' : 'Get Insight'}
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
