import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Truck, 
  RotateCcw, 
  ShieldCheck,
  Star,
  StarHalf,
  ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import ProductCard from "@/components/ui/product-card";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
  });
  
  // Fetch related products
  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/category", product?.categoryId],
    queryFn: async () => {
      if (!product) return [];
      const res = await fetch(`/api/products/category/${product.categoryId}`);
      if (!res.ok) throw new Error("Failed to fetch related products");
      return res.json();
    },
    enabled: !!product,
  });
  
  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };
  
  // Filter out current product from related products
  const filteredRelatedProducts = relatedProducts?.filter(p => p.id !== product?.id).slice(0, 4) || [];
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/products" className="hover:text-accent">Products</Link>
          {!isLoading && product && (
            <>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span className="text-muted-foreground">{product.name}</span>
            </>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="h-[600px] w-full rounded-md" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-full max-w-[300px]" />
              <Skeleton className="h-6 w-full max-w-[200px]" />
              <Skeleton className="h-6 w-full max-w-[150px]" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              {product.secondaryImages && product.secondaryImages.length > 0 ? (
                <Carousel>
                  <CarouselContent>
                    <CarouselItem>
                      <div className="overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-[600px] object-cover" 
                        />
                      </div>
                    </CarouselItem>
                    {product.secondaryImages.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="overflow-hidden">
                          <img 
                            src={img} 
                            alt={`${product.name} - view ${index + 1}`} 
                            className="w-full h-[600px] object-cover" 
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <div className="overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-[600px] object-cover" 
                  />
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="font-serif text-3xl mb-2">{product.name}</h1>
              
              {/* Price */}
              <div className="mb-4">
                {product.salePrice ? (
                  <div className="flex items-center">
                    <span className="text-xl font-medium text-accent mr-3">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              {/* Reviews Placeholder */}
              <div className="flex items-center mb-6">
                <div className="flex mr-2">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <StarHalf className="h-4 w-4 fill-current text-yellow-400" />
                </div>
                <span className="text-sm text-gray-600">(24 reviews)</span>
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <p className="font-medium mb-2">Quantity</p>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                    className="w-16 mx-2 text-center" 
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <div className="mb-6 grid grid-cols-1 gap-4">
                <Button 
                  className="w-full bg-primary hover:bg-accent"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              {/* Product Features */}
              <div className="border-t border-b py-6 space-y-4 mb-6">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 mr-3 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <RotateCcw className="h-5 w-5 mr-3 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Easy Returns</p>
                    <p className="text-sm text-gray-600">30 day return policy</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 mr-3 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Secure Shopping</p>
                    <p className="text-sm text-gray-600">Your data is protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Product Tabs */}
        {!isLoading && product && (
          <div className="mt-16">
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start border-b rounded-none mb-8">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="py-4">
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                  <p className="mt-4">
                    Our commitment to quality ensures that each piece is crafted with attention to detail and made to last. 
                    This item embodies our signature minimalist aesthetic while providing comfort and versatility for your wardrobe.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="details" className="py-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-4">Product Details</h3>
                  <ul className="space-y-2">
                    <li><strong>Material:</strong> Premium quality fabric</li>
                    <li><strong>Care:</strong> Machine wash cold, hang to dry</li>
                    <li><strong>Origin:</strong> Ethically made</li>
                    <li><strong>Sizing:</strong> True to size</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="py-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
                  <p>Reviews coming soon. Be the first to leave a review!</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* Related Products */}
        {!isLoading && filteredRelatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredRelatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
