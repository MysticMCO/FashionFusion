import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingBag,
  PackageOpen,
  Tag,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function AdminSidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/admin",
    },
    {
      name: "Products",
      icon: <ShoppingBag className="h-5 w-5" />,
      path: "/admin/products",
    },
    {
      name: "Categories",
      icon: <Tag className="h-5 w-5" />,
      path: "/admin/categories",
    },
    {
      name: "Orders",
      icon: <PackageOpen className="h-5 w-5" />,
      path: "/admin/orders",
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/admin/settings",
    },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b">
        <Link href="/admin" className="text-sidebar-primary font-serif text-xl">
          Admin Dashboard
        </Link>
        <Button 
          variant="ghost" 
          className="text-sidebar-primary" 
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>
      
      {/* Sidebar */}
      <aside className={cn(
        "bg-sidebar text-sidebar-primary h-screen flex-col",
        "fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 ease-in-out transform",
        "md:translate-x-0 md:static md:flex",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-sidebar-border hidden md:block">
          <Link href="/admin" className="text-xl font-serif">
            @byaimymmdoh
          </Link>
          <p className="text-sm text-sidebar-primary opacity-60">Admin Panel</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-primary",
                    location === item.path 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/20 hover:text-sidebar-primary",
                    "mb-1"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-primary hover:bg-sidebar-accent/20 mb-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="ml-3">View Store</span>
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-primary hover:bg-sidebar-accent/20"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Log Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
