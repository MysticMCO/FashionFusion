import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Order, OrderItem } from "@shared/schema";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";
import { Loader2, ArrowLeft, CheckCircle2, Package, Truck, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProtectedRoute } from "@/lib/protected-route";

type OrderWithItems = Order & { 
  items: OrderItem[]
};

function OrderDetailsContent() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const orderId = id ? parseInt(id) : 0;
  
  // Fetch order details
  const { data: order, isLoading, error } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch order details");
      }
      return res.json();
    },
    enabled: !!orderId
  });
  
  // Status badge styling
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Order status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ShoppingBag className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Function to get readable status text
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // If loading
  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Container>
    );
  }
  
  // If error or order not found
  if (error || !order) {
    return (
      <Container className="py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4 py-8">
              <h2 className="text-xl font-semibold">Order Not Found</h2>
              <p className="text-muted-foreground">
                We couldn't find the order you're looking for. It may have been removed or you might not have permission to view it.
              </p>
              <Button onClick={() => navigate("/orders")} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Order #{orderId} | @byaimymmdoh</title>
      </Helmet>
      
      <Container className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Order #{orderId}</h1>
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {getStatusText(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Order Items Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-semibold">
                    <div>Total</div>
                    <div>{formatPrice(order.total)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Information Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Order ID</div>
                  <div>#{order.id}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Date Placed</div>
                  <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Payment Status</div>
                  <Badge variant="outline" className={
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div>{order.customerName}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div>{order.customerEmail}</div>
                </div>
                
                {order.customerPhone && (
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div>{order.customerPhone}</div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <div className="text-sm text-muted-foreground">Shipping Address</div>
                  <div className="whitespace-pre-line">{order.shippingAddress}</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Need Help Card */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions or concerns about your order, please contact our customer service.
                </p>
                <Button variant="outline" onClick={() => navigate("/contact")} className="w-full">
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}

export default function OrderDetailsPage() {
  return (
    <ProtectedRoute path="/orders/:id" component={OrderDetailsContent} />
  );
}