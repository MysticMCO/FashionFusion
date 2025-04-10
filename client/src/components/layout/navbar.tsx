import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Search, 
  User, 
  ShoppingBag, 
  Menu, 
  ChevronDown, 
  X, 
  LogOut
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";
import { type Category } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopSubmenuOpen, setShopSubmenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { itemCount } = useCart();

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Links for navigation
  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Shop", path: "/products", hasSubmenu: true },
    { title: "Collections", path: "/products/category/new-arrivals" },
    { title: "About", path: "/about" },
    { title: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 bg-white z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-medium">
            @byaimymmdoh
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => 
              link.hasSubmenu ? (
                <div key={link.title} className="relative group">
                  <Link 
                    href={link.path} 
                    className={`text-sm font-medium hover:text-accent transition-colors flex items-center ${
                      location === link.path ? 'text-accent' : 'text-primary'
                    }`}
                  >
                    {link.title} <ChevronDown className="ml-1 h-4 w-4" />
                  </Link>
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-sm invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                    <div className="py-2">
                      <Link href="/products/category/new-arrivals" className="block px-4 py-2 text-sm hover:bg-neutral transition-colors">
                        New Arrivals
                      </Link>
                      {categories?.map((category) => (
                        <Link 
                          key={category.id} 
                          href={`/products/category/${category.slug}`}
                          className="block px-4 py-2 text-sm hover:bg-neutral transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  key={link.title} 
                  href={link.path} 
                  className={`text-sm font-medium hover:text-accent transition-colors ${
                    location === link.path ? 'text-accent' : 'text-primary'
                  }`}
                >
                  {link.title}
                </Link>
              )
            )}
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-primary hover:text-accent transition-colors" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-primary hover:text-accent transition-colors" aria-label="Account">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.username}
                  </div>
                  {user.isAdmin && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link href="/orders">
                    <DropdownMenuItem className="cursor-pointer">
                      My Orders
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:text-red-500" 
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth" className="text-primary hover:text-accent transition-colors" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <button className="text-primary hover:text-accent transition-colors relative" aria-label="Cart">
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Shopping Cart</SheetTitle>
                  <SheetDescription>
                    {itemCount === 0 
                      ? "Your cart is empty" 
                      : `You have ${itemCount} items in your cart`}
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  {itemCount > 0 && (
                    <Button asChild className="w-full">
                      <Link href="/cart">View Cart</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-primary hover:text-accent transition-colors" 
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-sm border-t border-gray-100">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => 
              link.hasSubmenu ? (
                <div key={link.title}>
                  <button 
                    className="text-sm font-medium hover:text-accent transition-colors flex items-center justify-between w-full"
                    onClick={() => setShopSubmenuOpen(!shopSubmenuOpen)}
                  >
                    {link.title} <ChevronDown className={`h-4 w-4 transition-transform ${shopSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {shopSubmenuOpen && (
                    <div className="mt-2 ml-4">
                      <Link href="/products/category/new-arrivals" className="block py-2 text-sm hover:text-accent transition-colors">
                        New Arrivals
                      </Link>
                      {categories?.map((category) => (
                        <Link 
                          key={category.id} 
                          href={`/products/category/${category.slug}`}
                          className="block py-2 text-sm hover:text-accent transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  key={link.title} 
                  href={link.path} 
                  className="text-sm font-medium hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
