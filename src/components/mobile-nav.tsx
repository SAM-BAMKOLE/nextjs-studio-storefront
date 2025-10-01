'use client';

import * as React from "react"
import Link from "next/link"
import { Menu, Package } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav() {
  const { isAdmin } = useAuth()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Package className="mr-2 h-4 w-4" />
          <span className="font-bold">Storefront Manager</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-3">
                <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-muted-foreground"
                >
                Products
                </Link>
                <Link
                href="/my-orders"
                onClick={() => setOpen(false)}
                className="text-muted-foreground"
                >
                My Orders
                </Link>
                {isAdmin && (
                <Link
                    href="/admin/dashboard"
                    onClick={() => setOpen(false)}
                    className="text-primary"
                >
                    Admin
                </Link>
                )}
            </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
