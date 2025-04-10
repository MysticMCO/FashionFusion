import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag
} from "lucide-react";

export default function CartPage() {
  const { items, updateItemQuantity, removeItem, totalAmount } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  // Convert items object to array for rendering
  const cartItems = Object.values(items);
  const shippingCost = 10.00; // For display purposes
  
  // Handle promo code application (demo only)
  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplyingPromo(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsApplyingPromo(false);
      if (promoCode.toLowerCase() === "welcome10") {
        alert("Promo code applied successfully!");
      } else {
        alert("Invalid promo code");
      }
    }, 1000);
  };
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl mb-8">Shopping Cart</h1>
        
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items Table */}
            <div className="lg:col-span-2">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="h-20 w-20 bg-neutral">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 mx-2 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            {formatPrice(item.price * item.quantity)}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="ml-2 text-gray-500 hover:text-red-500" 
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Continue Shopping */}
              <div className="mt-8">
                <Button variant="outline" asChild>
                  <Link href="/products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div>
              <div className="bg-neutral p-6 rounded-md">
                <h2 className="font-serif text-xl mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
                  </div>
                  {/* Promo code would modify this in a real app */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium">{formatPrice(0)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">{formatPrice(totalAmount + shippingCost)}</span>
                  </div>
                </div>
                
                {/* Promo Code */}
                <form onSubmit={handleApplyPromoCode} className="mb-6">
                  <p className="text-sm mb-2">Have a promo code?</p>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input 
                        className="pl-10" 
                        placeholder="Enter code" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="secondary" 
                      className="ml-2"
                      disabled={isApplyingPromo}
                    >
                      Apply
                    </Button>
                  </div>
                </form>
                
                {/* Checkout Button */}
                <Button 
                  className="w-full bg-primary hover:bg-accent" 
                  size="lg"
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-300" />
            </div>
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
