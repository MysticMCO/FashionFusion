import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category, Product, insertProductSchema } from "@shared/schema";
import AdminSidebar from "@/components/admin/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Extended schema with additional validation
const productFormSchema = insertProductSchema.extend({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  salePrice: z.coerce.number().optional(),
  additionalImages: z.string().optional(),
}).refine((data) => {
  if (data.salePrice && data.salePrice >= data.price) {
    return false;
  }
  return true;
}, {
  message: "Sale price must be less than regular price",
  path: ["salePrice"],
});

export default function AdminEditProduct() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const productId = parseInt(id);
  
  // Fetch product data
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      return res.json();
    },
    enabled: !!productId && !isNaN(productId),
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Setup form
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      salePrice: undefined,
      imageUrl: "",
      secondaryImages: [],
      categoryId: 0,
      inStock: true,
      isNew: false,
      isFeatured: false,
    },
  });
  
  // Update form values when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        additionalImages: product.secondaryImages?.join(", ") || "",
      });
    }
  }, [product, form]);
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      // Handle secondary images array
      let formattedData = { ...data };
      
      if (data.additionalImages) {
        // Convert comma-separated string to array
        formattedData.secondaryImages = data.additionalImages
          .split(',')
          .map(url => url.trim())
          .filter(url => url.length > 0);
      }
      
      // Remove the additionalImages field
      delete (formattedData as any).additionalImages;
      
      // Update product
      const res = await apiRequest("PUT", `/api/admin/products/${productId}`, formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    updateProductMutation.mutate(data);
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted/30">
      <AdminSidebar />
      
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => navigate("/admin/products")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            <h1 className="text-3xl font-serif">Edit Product</h1>
            <p className="text-muted-foreground">
              Update the product information and save your changes.
            </p>
          </div>
          
          {isLoadingProduct ? (
            <div className="space-y-6 p-6 bg-white rounded-md border">
              <Skeleton className="h-8 w-80" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-40" />
            </div>
          ) : product ? (
            <div className="bg-white p-6 rounded-md border">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="product-url-slug" {...field} />
                          </FormControl>
                          <FormDescription>
                            Used for the product URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description" 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01" 
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01" 
                              min="0"
                              {...field}
                              value={field.value === undefined ? "" : field.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === "" ? undefined : parseFloat(value));
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty if there is no sale
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Images */}
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="additionalImages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Images URLs (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter image URLs separated by commas" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter multiple image URLs separated by commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Options and Flags */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">In Stock</FormLabel>
                            <FormDescription>
                              Product is available for purchase
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">New Product</FormLabel>
                            <FormDescription>
                              Mark as a new arrival
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured</FormLabel>
                            <FormDescription>
                              Show in featured collections
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={updateProductMutation.isPending}
                    >
                      {updateProductMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate("/admin/products")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-md border text-center">
              <h2 className="text-xl font-medium mb-2">Product not found</h2>
              <p className="text-muted-foreground mb-4">
                The product you're trying to edit doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate("/admin/products")}>
                Back to Products
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
