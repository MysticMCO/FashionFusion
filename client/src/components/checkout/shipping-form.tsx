import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteSetting } from "@shared/schema";

// Define shipping methods schema
export const shippingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  shippingMethod: z.string()
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

type ShippingFormProps = {
  onSubmit: (data: ShippingFormValues) => void;
  defaultValues?: Partial<ShippingFormValues>;
};

export default function ShippingForm({ onSubmit, defaultValues = {} }: ShippingFormProps) {
  const [shippingMethods, setShippingMethods] = useState<{id: string, name: string, description: string, price: number}[]>([
    { id: "standard", name: "Standard Shipping", description: "3-5 business days", price: 10 },
    { id: "express", name: "Express Shipping", description: "1-2 business days", price: 15 }
  ]);
  
  // Fetch shipping methods from settings
  const { data: shippingSettings } = useQuery({
    queryKey: ["/api/settings/group/shipping"],
    queryFn: async () => {
      const res = await fetch("/api/settings/group/shipping");
      if (!res.ok) throw new Error("Failed to fetch shipping settings");
      return res.json() as Promise<SiteSetting[]>;
    }
  });
  
  useEffect(() => {
    if (shippingSettings) {
      try {
        const shippingMethodsSetting = shippingSettings.find(s => s.key === "shipping_methods");
        if (shippingMethodsSetting && shippingMethodsSetting.value) {
          const methods = JSON.parse(shippingMethodsSetting.value);
          if (Array.isArray(methods) && methods.length > 0) {
            setShippingMethods(methods);
          }
        }
      } catch (error) {
        console.error("Error parsing shipping methods:", error);
      }
    }
  }, [shippingSettings]);
  
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Egypt",
      shippingMethod: "standard",
      ...defaultValues
    }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Street address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="State/Province" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Postal code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                  <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="shippingMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Shipping Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-3"
                >
                  {shippingMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{method.name} - ${method.price}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="submit">
            Continue to Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}