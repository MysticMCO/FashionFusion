import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin } from "lucide-react";
import { SiteSetting } from "@shared/schema";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(5, "Message must be at least 5 characters")
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
  
  // Fetch contact settings from the API
  const { data: contactSettings, isLoading } = useQuery({
    queryKey: ["/api/settings/group/contact"],
    queryFn: async () => {
      const res = await fetch("/api/settings/group/contact");
      if (!res.ok) throw new Error("Failed to fetch contact settings");
      return res.json() as Promise<SiteSetting[]>;
    }
  });
  
  // Fetch site title for SEO
  const { data: seoSettings } = useQuery({
    queryKey: ["/api/settings/group/seo"],
    queryFn: async () => {
      const res = await fetch("/api/settings/group/seo");
      if (!res.ok) throw new Error("Failed to fetch SEO settings");
      return res.json() as Promise<SiteSetting[]>;
    }
  });
  
  useEffect(() => {
    if (contactSettings) {
      const emailSetting = contactSettings.find(s => s.key === "contact_email");
      const phoneSetting = contactSettings.find(s => s.key === "contact_phone");
      const addressSetting = contactSettings.find(s => s.key === "contact_address");
      
      if (emailSetting) setEmail(emailSetting.value || "");
      if (phoneSetting) setPhone(phoneSetting.value || "");
      if (addressSetting) setAddress(addressSetting.value || "");
    }
  }, [contactSettings]);
  
  const siteTitle = seoSettings?.find(s => s.key === "site_title")?.value || "@byaimymmdoh";
  
  const onSubmit = (values: ContactFormValues) => {
    // In a real implementation, we would send the form data to a server
    console.log(values);
    toast({
      title: "Message Sent",
      description: "Thank you for your message. We will get back to you soon.",
    });
    form.reset();
  };
  
  return (
    <>
      <Helmet>
        <title>Contact Us | {siteTitle}</title>
        <meta name="description" content={`Contact ${siteTitle} for any questions about our products or services.`} />
      </Helmet>
      
      <Container className="py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Mail className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <p className="text-muted-foreground">{email || "info@byaimymmdoh.com"}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Phone className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <p className="text-muted-foreground">{phone || "+20 1234567890"}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-muted-foreground whitespace-pre-line">
                  {address || "123 Fashion Avenue\nCairo, Egypt"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Message subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your message" rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full md:w-auto">Send Message</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}