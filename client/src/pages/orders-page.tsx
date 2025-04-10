import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Order } from "@shared/schema";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Eye, PackageOpen } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProtectedRoute } from "@/lib/protected-route";
import { Helmet } from "react-helmet";

type OrderWithItems = Order & { 
  items: Array<{ 
    id: number;
    name: string;
    price: number;
    quantity: number;
  }> 
};

function OrdersPageContent() {
  const [, navigate] = useLocation();
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    }
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
  
  // Handle view order details
  const handleViewOrder = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };
  
  // Filter orders by status
  const activeOrders = orders?.filter(o => o.status !== 'completed' && o.status !== 'cancelled') || [];
  const completedOrders = orders?.filter(o => o.status === 'completed') || [];
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled') || [];
  
  return (
    <>
      <Helmet>
        <title>My Orders | @byaimymmdoh</title>
      </Helmet>
      
      <Container className="py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Orders</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders && orders.length > 0 ? (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active" className="relative">
                Active Orders
                {activeOrders.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {activeOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedOrders.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {completedOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                {cancelledOrders.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {cancelledOrders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeOrders.length > 0 ? (
                    <OrdersTable 
                      orders={activeOrders} 
                      getStatusClasses={getStatusClasses} 
                      onViewOrder={handleViewOrder} 
                    />
                  ) : (
                    <EmptyOrdersState 
                      message="You don't have any active orders at the moment."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedOrders.length > 0 ? (
                    <OrdersTable 
                      orders={completedOrders} 
                      getStatusClasses={getStatusClasses} 
                      onViewOrder={handleViewOrder} 
                    />
                  ) : (
                    <EmptyOrdersState 
                      message="You don't have any completed orders yet."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cancelled">
              <Card>
                <CardHeader>
                  <CardTitle>Cancelled Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {cancelledOrders.length > 0 ? (
                    <OrdersTable 
                      orders={cancelledOrders} 
                      getStatusClasses={getStatusClasses} 
                      onViewOrder={handleViewOrder} 
                    />
                  ) : (
                    <EmptyOrdersState 
                      message="You don't have any cancelled orders."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="bg-primary/5 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                  <PackageOpen className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">No Orders Found</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You haven't placed any orders yet. Browse our latest collections and find something you love.
                </p>
                <Button onClick={() => navigate("/products")} className="mt-4">
                  Shop Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
}

// Orders table component
function OrdersTable({ 
  orders, 
  getStatusClasses,
  onViewOrder
}: { 
  orders: Order[],
  getStatusClasses: (status: string) => string,
  onViewOrder: (orderId: number) => void
}) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusClasses(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onViewOrder(order.id)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Details</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Empty state component
function EmptyOrdersState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <div className="bg-primary/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <PackageOpen className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute path="/orders" component={OrdersPageContent} />
  );
}