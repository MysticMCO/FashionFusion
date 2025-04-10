import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProtectedRoute } from "@/lib/protected-route";
import ShippingForm, { ShippingFormValues } from "@/components/checkout/shipping-form";
import PaymentForm, { PaymentFormValues } from "@/components/checkout/payment-form";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  ShoppingBag 
} from "lucide-react";

// Step types
type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  return (
    <ProtectedRoute path="/checkout" component={CheckoutPageContent} />
  );
}

function CheckoutPageContent() {
  const [, navigate] = useLocation();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  
  // Checkout state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  // Calculate costs
  const cartItems = Object.values(items);
  const subtotal = totalAmount;
  const shippingCost = shippingData?.shippingMethod === 'standard' ? 10 :
                      shippingData?.shippingMethod === 'express' ? 15 : 25;
  const total = subtotal + (shippingCost || 10);
  
  // Handle shipping form submission
  const handleShippingSubmit = (data: ShippingFormValues) => {
    setShippingData(data);
    setCurrentStep('payment');
  };
  
  // Handle payment form submission
  const handlePaymentSubmit = async (data: PaymentFormValues) => {
    if (!shippingData) return;
    
    setIsProcessingPayment(true);
    setPaymentError(null);
    
    try {
      // Prepare order data
      const orderData = {
        userId: user?.id,
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerEmail: shippingData.email,
        customerPhone: shippingData.phone,
        shippingAddress: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}, ${shippingData.postalCode}, ${shippingData.country}`,
        total: total,
        status: "pending",
        paymentStatus: "pending",
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      // Create order
      const orderResponse = await apiRequest("POST", "/api/orders", orderData);
      const orderResult = await orderResponse.json();
      
      // Create payment intent with Paymob
      const paymentResponse = await apiRequest("POST", "/api/payment/paymob/create", {
        amount: total,
        orderId: orderResult.id
      });
      const paymentResult = await paymentResponse.json();
      
      // Simulate successful payment (in a real app, this would redirect to Paymob)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Confirm payment
      const confirmResponse = await apiRequest("POST", "/api/payment/paymob/confirm", {
        paymentIntentId: paymentResult.paymentIntent.id,
        orderId: orderResult.id
      });
      
      // Handle successful payment
      setOrderId(orderResult.id);
      setOrderComplete(true);
      clearCart();
      setCurrentStep('confirmation');
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Order summary display
  const OrderSummary = () => (
    <div className="bg-neutral p-6 rounded-md">
      <h3 className="font-serif text-lg mb-4">Order Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div className="max-h-64 overflow-auto space-y-3 mb-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white rounded mr-3 overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>{formatPrice(shippingCost || 10)}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // If cart is empty, redirect to products
  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-6" />
        <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
        <p className="mb-8 text-gray-600">Add some products to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl mb-6">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="mb-8">
          <Tabs value={currentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="shipping"
                disabled={currentStep !== 'shipping' && !orderComplete}
                onClick={() => !orderComplete && setCurrentStep('shipping')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Shipping
              </TabsTrigger>
              <TabsTrigger 
                value="payment"
                disabled={!shippingData || orderComplete}
                onClick={() => shippingData && !orderComplete && setCurrentStep('payment')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment
              </TabsTrigger>
              <TabsTrigger 
                value="confirmation"
                disabled={!orderComplete}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmation
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2">
                  <TabsContent value="shipping" className="mt-0">
                    <div className="mb-6">
                      <h2 className="font-serif text-2xl mb-4">Shipping Information</h2>
                      <p className="text-gray-600">
                        Please enter your shipping details to continue.
                      </p>
                    </div>
                    
                    <ShippingForm 
                      onSubmit={handleShippingSubmit}
                      defaultValues={{
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || "",
                        email: user?.email || "",
                        shippingMethod: "standard"
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="payment" className="mt-0">
                    <div className="mb-6">
                      <h2 className="font-serif text-2xl mb-4">Payment Method</h2>
                      <p className="text-gray-600">
                        Please select your preferred payment method to complete your order.
                      </p>
                    </div>
                    
                    {paymentError && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Payment Error</AlertTitle>
                        <AlertDescription>
                          {paymentError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <PaymentForm 
                      onSubmit={handlePaymentSubmit}
                      isProcessing={isProcessingPayment}
                    />
                  </TabsContent>
                  
                  <TabsContent value="confirmation" className="mt-0">
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                      </div>
                      <h2 className="font-serif text-2xl mb-4">Order Confirmed!</h2>
                      <p className="text-gray-600 mb-2">
                        Thank you for your purchase. Your order has been placed successfully.
                      </p>
                      <p className="text-gray-600 mb-8">
                        Order number: <span className="font-medium">#{orderId}</span>
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button onClick={() => navigate(`/orders/${orderId}`)}>
                          View Order Details
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/products")}>
                          Continue Shopping
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
                
                {/* Right Column - Order Summary */}
                <div>
                  <OrderSummary />
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
