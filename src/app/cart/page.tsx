import { SiteHeader } from "@/components/site-header";
import { CartView } from "@/components/cart-view";

export default function CartPage() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="container flex-1 py-8">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                    Shopping Cart
                </h1>
                <CartView />
            </div>
        </div>
    );
}
