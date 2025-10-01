'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, Package, BarChart, ShoppingCart, LogOut } from 'lucide-react';
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

            {/* Mobile Drawer */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="grid gap-6 text-lg font-medium">
                    <Link
                      href="/"
                      className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                      <Package className="h-5 w-5 transition-all group-hover:scale-110" />
                      <span className="sr-only">Storefront</span>
                    </Link>
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn("flex items-center gap-4 px-2.5",
                                pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </header>
        </>
    );
}
