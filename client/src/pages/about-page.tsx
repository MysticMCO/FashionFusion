import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteSetting } from "@shared/schema";

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<string>("");
  const [pageTitle, setPageTitle] = useState<string>("About Us");
  
  // Fetch settings from the API
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/group/about"],
    queryFn: async () => {
      const res = await fetch("/api/settings/group/about");
      if (!res.ok) throw new Error("Failed to fetch about settings");
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
    if (settings) {
      const aboutContentSetting = settings.find(s => s.key === "about_content");
      const aboutTitleSetting = settings.find(s => s.key === "about_title");
      
      if (aboutContentSetting) {
        setAboutContent(aboutContentSetting.value || "");
      }
      
      if (aboutTitleSetting) {
        setPageTitle(aboutTitleSetting.value || "About Us");
      }
    }
  }, [settings]);
  
  const siteTitle = seoSettings?.find(s => s.key === "site_title")?.value || "@byaimymmdoh";
  
  return (
    <>
      <Helmet>
        <title>{pageTitle} | {siteTitle}</title>
        <meta name="description" content={`Learn more about ${siteTitle} - our story, mission, and values.`} />
      </Helmet>
      
      <Container className="py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{pageTitle}</h1>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : aboutContent ? (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: aboutContent }} />
            ) : (
              <div className="prose max-w-none">
                <p>Welcome to @byaimymmdoh, a leading brand in women's fashion. We're dedicated to bringing you the finest selection of casual, formal, soiree, and wedding dresses designed with elegance and attention to detail.</p>
                <p>Our mission is to help women express their unique style through our thoughtfully designed collections that blend timeless elegance with contemporary trends.</p>
                <p>Founded with a passion for empowering women through fashion, we've grown into a trusted name in the industry, known for our commitment to quality and customer satisfaction.</p>
                <p>We invite you to explore our collections and discover the perfect pieces to enhance your wardrobe.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}