import { useQuery } from "@tanstack/react-query";
import { type Category } from "@shared/schema";
import CategoryCard from "@/components/ui/category-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Loader placeholders
  const renderSkeletons = () => (
    Array(3).fill(0).map((_, i) => (
      <div key={i} className="h-96">
        <Skeleton className="h-full w-full" />
      </div>
    ))
  );
  
  return (
    <section className="py-16 bg-neutral">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl mb-12 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? renderSkeletons() : (
            categories?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
