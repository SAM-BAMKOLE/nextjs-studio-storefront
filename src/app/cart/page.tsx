import { CartView } from "@/components/cart-view";

export default function CartPage() {
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Shopping Cart
            </h1>
            <CartView />
        </>
    );
}
