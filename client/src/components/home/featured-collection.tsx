import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import ProductCard from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function FeaturedCollection() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });
  
  // Loader placeholders
  const renderSkeletons = () => (
    Array(3).fill(0).map((_, i) => (
      <div key={i}>
        <Skeleton className="h-[400px] w-full mb-4" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))
  );
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl mb-6 text-center">Summer Collection 2023</h2>
        <p className="text-gray-700 text-center max-w-2xl mx-auto mb-12">
          Explore our latest collection featuring lightweight fabrics and relaxed silhouettes, perfect for the warm seasons ahead.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? renderSkeletons() : (
            products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/products/category/summer" 
            className="inline-block bg-primary text-white px-8 py-3 font-medium text-sm tracking-wide hover:bg-accent transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
