import { ProductGrid } from "@/components/product-grid";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Products
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our latest collection of high-quality products.
        </p>
      </section>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductGrid />
      </Suspense>
    </>
  );
}
