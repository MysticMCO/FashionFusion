import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { type Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  
  return (
    <div className="group cursor-pointer">
      <Link href={`/product/${product.slug}`}>
        <div className="relative overflow-hidden mb-4">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="default" 
              className="w-full bg-white text-primary hover:bg-accent hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
          {product.isNew && (
            <span className="absolute top-4 right-4 bg-accent text-white px-3 py-1 text-xs font-medium">
              New
            </span>
          )}
          {product.salePrice && product.salePrice < product.price && (
            <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-xs font-medium">
              Sale
            </span>
          )}
        </div>
      </Link>
      <Link href={`/product/${product.slug}`}>
        <h3 className="font-medium mb-1">{product.name}</h3>
      </Link>
      <p className="text-gray-700 text-sm mb-2">{product.description.substring(0, 30)}...</p>
      <div className="flex items-center">
        {product.salePrice ? (
          <>
            <p className="font-medium text-accent">{formatPrice(product.salePrice)}</p>
            <p className="ml-2 text-gray-500 line-through text-sm">{formatPrice(product.price)}</p>
          </>
        ) : (
          <p className="font-medium">{formatPrice(product.price)}</p>
        )}
      </div>
    </div>
  );
}
