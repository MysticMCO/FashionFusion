import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export const paymentSchema = z.object({
  paymentMethod: z.enum(["cod", "paymob"]),
  cardholderName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

type PaymentFormProps = {
  onSubmit: (data: PaymentFormValues) => void;
  isProcessing: boolean;
};

export default function PaymentForm({ onSubmit, isProcessing }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "cod",
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });
  
  const watchPaymentMethod = form.watch("paymentMethod");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Select Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setPaymentMethod(value);
                  }}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                    <Label
                      htmlFor="cod"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="space-y-1 text-left">
                          <p className="text-sm font-medium leading-none">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="paymob" id="paymob" className="peer sr-only" />
                    <Label
                      htmlFor="paymob"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="space-y-1 text-left">
                          <p className="text-sm font-medium leading-none">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            Pay with PayMob
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className={cn(watchPaymentMethod === "cod" ? "hidden" : "block")}>
          <Separator className="my-4" />
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="cardholderName"
                  rules={{
                    required: watchPaymentMethod === "paymob"
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name on card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardNumber"
                  rules={{
                    required: watchPaymentMethod === "paymob"
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234 5678 9012 3456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    rules={{
                      required: watchPaymentMethod === "paymob"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cvv"
                    rules={{
                      required: watchPaymentMethod === "paymob"
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-sm mt-4 text-muted-foreground">
            <p>Your payment will be processed securely via PayMob.</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Complete Order</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}