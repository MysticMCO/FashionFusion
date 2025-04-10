import { createContext, ReactNode, useContext, useState, useEffect, useMemo } from "react";
import { CartItem } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";

// Cart context type
type CartContextType = {
  items: Record<string, CartItem>;
  itemCount: number;
  totalAmount: number;
  addItem: (product: any, quantity?: number) => void;
  updateItemQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  isLoading: boolean;
};

// Create cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Record<string, CartItem>>({});
  
  // Get cart from server
  const { data: cartData, isLoading } = useQuery<Record<string, CartItem>>({
    queryKey: ["/api/cart"],
    onSuccess: (data) => {
      setItems(data || {});
    },
  });
  
  // Sync cart with server
  const syncCartMutation = useMutation({
    mutationFn: async (cartItems: Record<string, CartItem>) => {
      const res = await apiRequest("POST", "/api/cart", cartItems);
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate item count and total amount
  const itemCount = useMemo(() => 
    Object.values(items).reduce((count, item) => count + item.quantity, 0),
    [items]
  );
  
  const totalAmount = useMemo(() => 
    Object.values(items).reduce((total, item) => total + (item.price * item.quantity), 0),
    [items]
  );
  
  // Update server when cart changes
  useEffect(() => {
    if (cartData && Object.keys(items).length > 0) {
      syncCartMutation.mutate(items);
    }
  }, [items]);
  
  // Add item to cart
  const addItem = (product: any, quantity: number = 1) => {
    setItems((prevItems) => {
      const itemId = product.id.toString();
      const existingItem = prevItems[itemId];
      
      if (existingItem) {
        // Update quantity if item exists
        return {
          ...prevItems,
          [itemId]: {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
          },
        };
      } else {
        // Add new item
        return {
          ...prevItems,
          [itemId]: {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
          },
        };
      }
    });
    
    toast({
      title: "Item added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };
  
  // Update item quantity
  const updateItemQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }
    
    setItems((prevItems) => {
      const itemKey = itemId.toString();
      if (!prevItems[itemKey]) return prevItems;
      
      return {
        ...prevItems,
        [itemKey]: {
          ...prevItems[itemKey],
          quantity,
        },
      };
    });
  };
  
  // Remove item from cart
  const removeItem = (itemId: number) => {
    setItems((prevItems) => {
      const itemKey = itemId.toString();
      if (!prevItems[itemKey]) return prevItems;
      
      const { [itemKey]: removedItem, ...rest } = prevItems;
      
      toast({
        title: "Item removed",
        description: `${removedItem.name} removed from your cart.`,
      });
      
      return rest;
    });
  };
  
  // Clear cart
  const clearCart = () => {
    setItems({});
    syncCartMutation.mutate({});
  };
  
  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
