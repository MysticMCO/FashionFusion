import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, CheckCircle, Truck, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const trackingFormSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  email: z.string().email("Please enter a valid email address")
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

export default function OrderTrackingPage() {
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch site title for SEO
  const { data: seoSettings } = useQuery({
    queryKey: ["/api/settings/group/seo"],
    queryFn: async () => {
      const res = await fetch("/api/settings/group/seo");
      if (!res.ok) throw new Error("Failed to fetch SEO settings");
      return res.json();
    }
  });
  
  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      orderId: "",
      email: ""
    }
  });
  
  const siteTitle = seoSettings?.find((s: any) => s.key === "site_title")?.value || "@byaimymmdoh";
  
  const onSubmit = async (values: TrackingFormValues) => {
    setIsSearching(true);
    
    try {
      // In a real implementation, this would be an API call to fetch the order
      // For demonstration, we're simulating a successful order lookup
      setTimeout(() => {
        const mockOrder = {
          id: values.orderId,
          status: "processing",
          paymentStatus: "paid",
          createdAt: new Date().toISOString(),
          customerName: "Customer",
          customerEmail: values.email,
          shippingAddress: "123 Customer Address",
          total: 249.99,
          items: [
            {
              id: 1,
              name: "Elegant Evening Dress",
              price: 199.99,
              quantity: 1
            },
            {
              id: 2,
              name: "Fashion Accessory",
              price: 49.99,
              quantity: 1
            }
          ]
        };
        
        setOrderDetails(mockOrder);
        setIsSearching(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find order. Please check your order ID and email.",
        variant: "destructive"
      });
      setIsSearching(false);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ShoppingBag className="h-6 w-6 text-yellow-500" />;
      case "processing":
        return <Package className="h-6 w-6 text-blue-500" />;
      case "shipped":
        return <Truck className="h-6 w-6 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Pending";
      case "processing":
        return "Order Processing";
      case "shipped":
        return "Order Shipped";
      case "delivered":
        return "Order Delivered";
      default:
        return "Unknown Status";
    }
  };
  
  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "pending":
        return "Payment Pending";
      case "paid":
        return "Payment Completed";
      case "failed":
        return "Payment Failed";
      default:
        return "Unknown Payment Status";
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Track Your Order | {siteTitle}</title>
        <meta name="description" content="Track your order status and delivery information" />
      </Helmet>
      
      <Container className="py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Track Your Order</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="mb-6">Enter your order ID and email address to track your order.</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="orderId">Order ID</Label>
                        <FormControl>
                          <Input placeholder="Enter your order ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">Email</Label>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Track Order"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {orderDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Order #{orderDetails.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="bg-primary/10 rounded-full p-3">
                    {getStatusIcon(orderDetails.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{getStatusText(orderDetails.status)}</h3>
                    <p className="text-muted-foreground">
                      {getPaymentStatusText(orderDetails.paymentStatus)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                    <p>{orderDetails.customerName}</p>
                    <p>{orderDetails.shippingAddress}</p>
                    <p>{orderDetails.customerEmail}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Order Information</h3>
                    <p>Date: {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                    <p>Total: ${orderDetails.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {orderDetails.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
}