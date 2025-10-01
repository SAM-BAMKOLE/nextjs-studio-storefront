'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, BarChart, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
    { href: '/admin/dashboard', icon: BarChart, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };
    
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden w-14 flex-col border-r bg-card sm:flex">
                <TooltipProvider>
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="/"
                        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        <Package className="h-4 w-4 transition-all group-hover:scale-110" />
                        <span className="sr-only">Storefront Manager</span>
                    </Link>

                    {navItems.map(item => (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8", 
                                    pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground')}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="sr-only">{item.label}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="mt-auto rounded-lg" onClick={handleLogout}>
                                <LogOut className="h-5 w-5" />
                                <span className="sr-only">Logout</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Logout</TooltipContent>
                    </Tooltip>
                </nav>
                </TooltipProvider>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-card p-2">
                {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn("flex flex-col items-center rounded-lg p-2 transition-colors", 
                        pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                    <LogOut className="h-6 w-6" />
                    <span className="text-xs">Logout</span>
                </button>
            </nav>
        </>
    );
}