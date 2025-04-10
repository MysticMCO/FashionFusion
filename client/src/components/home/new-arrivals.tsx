import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import ProductCard from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function NewArrivals() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/new"],
  });
  
  // Loader placeholders
  const renderSkeletons = () => (
    Array(4).fill(0).map((_, i) => (
      <div key={i}>
        <Skeleton className="h-80 w-full mb-4" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))
  );
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-serif text-3xl">New Arrivals</h2>
          <Link href="/products/category/new-arrivals" className="text-sm font-medium hover:text-accent transition-colors flex items-center">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? renderSkeletons() : (
            products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
