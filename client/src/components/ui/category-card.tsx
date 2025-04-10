import { Link } from "wouter";
import { type Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="relative overflow-hidden group cursor-pointer h-96">
      <img 
        src={category.imageUrl} 
        alt={category.name} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-primary bg-opacity-10 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-serif text-2xl text-white mb-2">{category.name}</h3>
          <Link 
            href={`/products/category/${category.slug}`} 
            className="inline-block bg-white text-primary px-6 py-2 text-sm font-medium tracking-wide hover:bg-accent hover:text-white transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
