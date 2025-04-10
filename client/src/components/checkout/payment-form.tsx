import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CreditCard, ShieldCheck, Link as LinkIcon } from "lucide-react";

// Payment form schema
const paymentFormSchema = z.object({
  paymentMethod: z.enum(["credit_card", "paymob"]),
  cardNumber: z.string().optional()
    .refine(val => !val || val.replace(/\s/g, '').length === 16, {
      message: "Card number must be 16 digits",
    }),
  cardName: z.string().optional(),
  expiryDate: z.string().optional()
    .refine(val => !val || /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), {
      message: "Expiry date must be in MM/YY format",
    }),
  cvv: z.string().optional()
    .refine(val => !val || (val.length >= 3 && val.length <= 4), {
      message: "CVV must be 3 or 4 digits",
    }),
  saveCard: z.boolean().optional(),
}).refine((data) => {
  // If credit_card is selected, validate card fields
  if (data.paymentMethod === 'credit_card') {
    return !!data.cardNumber && !!data.cardName && !!data.expiryDate && !!data.cvv;
  }
  return true;
}, {
  message: "Card details are required for credit card payments",
  path: ["paymentMethod"],
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => void;
  isProcessing?: boolean;
}

export default function PaymentForm({ 
  onSubmit, 
  isProcessing = false 
}: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: "paymob",
      saveCard: false,
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
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="paymob" id="paymob" />
                    <div className="grid gap-1 flex-1">
                      <label htmlFor="paymob" className="font-medium cursor-pointer">
                        Pay with Paymob
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Secure payment processing
                      </p>
                    </div>
                    <div className="flex items-center font-medium">
                      <img 
                        src="https://accept.paymobsolutions.com/imgs/logosc.png" 
                        alt="Paymob" 
                        className="h-8" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <div className="grid gap-1 flex-1">
                      <label htmlFor="credit_card" className="font-medium cursor-pointer">
                        Credit Card
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Pay with Visa, Mastercard, etc.
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-5 w-5" />
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Credit Card Fields - Only show if credit_card is selected */}
        {watchPaymentMethod === "credit_card" && (
          <div className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234 5678 9012 3456" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/YY" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="saveCard"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="saveCard">
                      Save card for future purchases
                    </Label>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
        
        {/* Security Notice */}
        <div className="bg-neutral p-4 rounded-md flex items-start space-x-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium">Secure Payment</p>
            <p className="text-gray-600">
              Your payment information is encrypted and never stored on our servers.
              All transactions are secure and processed by our payment provider.
            </p>
            <p className="mt-2 flex items-center text-blue-600">
              <LinkIcon className="h-3 w-3 mr-1" />
              <a href="https://paymob.com" target="_blank" rel="noopener noreferrer">
                Learn more about our payment security
              </a>
            </p>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-accent"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing Payment..." : "Complete Purchase"}
        </Button>
      </form>
    </Form>
  );
}
