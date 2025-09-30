'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name[0];
}

export function UserNav() {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return <div className="flex items-center space-x-4">
        <div className="w-20 h-9 bg-muted rounded-md animate-pulse"></div>
        <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
    </div>
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/cart">
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
             <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full">
              {itemCount}
            </span>
          )}
        </Button>
      </Link>
      {user && userProfile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userProfile.displayName || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/my-orders"><DropdownMenuItem>My Orders</DropdownMenuItem></Link>
              {isAdmin && <Link href="/admin/dashboard"><DropdownMenuItem>Dashboard</DropdownMenuItem></Link>}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="space-x-2">
            <Link href="/login">
                <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
                <Button>Sign Up</Button>
            </Link>
        </div>
      )}
    </div>
  )
}
