import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, SlidersHorizontal, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ProductsPage() {
  const { slug } = useParams();
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortOption, setSortOption] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch all products or products by category
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: slug ? ["/api/products/category", slug] : ["/api/products"],
    queryFn: async () => {
      const res = await fetch(slug ? `/api/products/category/${slug}` : "/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
  
  // Fetch current category if slug is provided
  const { data: currentCategory } = useQuery<Category>({
    queryKey: ["/api/categories", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await fetch(`/api/categories/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
    enabled: !!slug,
  });
  
  // Reset selected categories when navigating to a category page
  useEffect(() => {
    if (slug) {
      setSelectedCategories([]);
    }
  }, [slug]);
  
  // Filter and sort products
  const filteredProducts = products
    ? products
        .filter(product => {
          // Filter by price
          const price = product.salePrice || product.price;
          const priceInRange = price >= priceRange[0] && price <= priceRange[1];
          
          // Filter by selected categories (only if not on a category page)
          const categoryMatch = 
            !slug || selectedCategories.length === 0 
              ? true 
              : selectedCategories.includes(product.categoryId.toString());
              
          return priceInRange && categoryMatch;
        })
        .sort((a, b) => {
          // Sort by selected option
          switch (sortOption) {
            case "price-low":
              return (a.salePrice || a.price) - (b.salePrice || b.price);
            case "price-high":
              return (b.salePrice || b.price) - (a.salePrice || a.price);
            case "name-asc":
              return a.name.localeCompare(b.name);
            case "name-desc":
              return b.name.localeCompare(a.name);
            case "newest":
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
    : [];
    
  // Skeleton loader for products
  const renderProductSkeletons = () => (
    Array(8).fill(0).map((_, i) => (
      <div key={i}>
        <Skeleton className="h-80 w-full mb-4" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))
  );
  
  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl mb-2">
            {currentCategory?.name || "All Products"}
          </h1>
          {currentCategory?.description && (
            <p className="text-gray-600">{currentCategory.description}</p>
          )}
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Mobile filter toggle */}
          <Button 
            variant="outline" 
            className="md:hidden flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          {/* Sort options */}
          <div className="flex items-center ml-auto">
            <p className="text-sm text-gray-600 mr-2">Sort by:</p>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Filters sidebar */}
          <div className={`w-full md:w-64 md:pr-8 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="mb-4 flex items-center justify-between md:hidden">
              <h2 className="font-medium">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Price range filter */}
            <div className="mb-6">
              <Accordion type="single" collapsible defaultValue="price">
                <AccordionItem value="price">
                  <AccordionTrigger>Price Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 px-1">
                      <Slider
                        defaultValue={priceRange}
                        max={500}
                        step={10}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex justify-between mt-2 text-sm">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* Categories filter (only show if not on a category page) */}
            {!slug && (
              <div className="mb-6">
                <Accordion type="single" collapsible defaultValue="categories">
                  <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {categories?.map(category => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category.id}`} 
                              checked={selectedCategories.includes(category.id.toString())}
                              onCheckedChange={() => handleCategoryChange(category.id.toString())}
                            />
                            <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            
            {/* Availability filter */}
            <div className="mb-6">
              <Accordion type="single" collapsible>
                <AccordionItem value="availability">
                  <AccordionTrigger>Availability</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="instock" />
                        <Label htmlFor="instock">In Stock</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="onsale" />
                        <Label htmlFor="onsale">On Sale</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* Clear filters button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setPriceRange([0, 500]);
                setSelectedCategories([]);
              }}
            >
              Clear Filters
            </Button>
          </div>
          
          {/* Products grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderProductSkeletons()}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No products found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
