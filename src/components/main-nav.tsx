'use client';
import * as React from "react"
import Link from "next/link"
import { Package } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

export function MainNav() {
  const { isAdmin } = useAuth();

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Package className="h-6 w-6" />
        <span className="inline-block font-bold">Storefront Manager</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Products
        </Link>
        <Link
          href="/my-orders"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          My Orders
        </Link>
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Admin
          </Link>
        )}
      </nav>
    </div>
  )
}
