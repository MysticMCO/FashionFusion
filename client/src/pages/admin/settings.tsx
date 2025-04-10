import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SiteSetting } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("seo");
  
  // Fetch all settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });
  
  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async (setting: Partial<SiteSetting> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/admin/settings/${setting.id}`, setting);
      if (!res.ok) throw new Error("Failed to update setting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Setting updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update setting",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Create setting mutation
  const createSettingMutation = useMutation({
    mutationFn: async (setting: Omit<SiteSetting, "id">) => {
      const res = await apiRequest("POST", "/api/admin/settings", setting);
      if (!res.ok) throw new Error("Failed to create setting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Setting created",
        description: "New setting has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create setting",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleUpdateSetting = (setting: SiteSetting) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = formData.get("value") as string;
    
    if (value !== setting.value) {
      updateSettingMutation.mutate({ id: setting.id, value });
    }
  };
  
  const renderSettingInput = (setting: SiteSetting) => {
    const isMutating = updateSettingMutation.isPending;
    
    const inputProps = {
      id: `setting-${setting.id}`,
      name: "value",
      defaultValue: setting.value || "",
      className: "w-full",
      disabled: isMutating
    };
    
    switch(setting.type) {
      case "textarea":
        return <Textarea {...inputProps} rows={4} />;
      case "url":
        return <Input {...inputProps} type="url" />;
      case "email":
        return <Input {...inputProps} type="email" />;
      case "json":
        // For settings like shipping_methods or payment_methods that are stored as JSON
        try {
          const parsedValue = setting.value ? JSON.parse(setting.value) : "";
          return (
            <Textarea 
              {...inputProps}
              rows={8}
              defaultValue={setting.value ? JSON.stringify(parsedValue, null, 2) : ""}
              className="font-mono text-sm"
            />
          );
        } catch (error) {
          return (
            <div>
              <Textarea 
                {...inputProps}
                rows={8}
                className="font-mono text-sm border-red-500"
              />
              <p className="text-xs text-red-500 mt-1">Invalid JSON format</p>
            </div>
          );
        }
      case "image":
        return (
          <div className="space-y-2">
            <Input {...inputProps} />
            {setting.value && (
              <div className="mt-2 border rounded-md p-2">
                <img 
                  src={setting.value} 
                  alt={setting.label} 
                  className="w-full max-h-48 object-contain" 
                />
              </div>
            )}
          </div>
        );
      default:
        return <Input {...inputProps} />;
    }
  };
  
  const groupedSettings = settings?.reduce<Record<string, SiteSetting[]>>((groups, setting) => {
    const group = setting.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(setting);
    return groups;
  }, {}) || {};
  
  const settingGroups = Object.keys(groupedSettings).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage global settings, SEO metadata, and content for the website.
        </p>
      </div>
      
      <Tabs defaultValue="seo" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {settingGroups.map(group => (
            <TabsTrigger key={group} value={group} className="capitalize">
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {settingGroups.map(group => (
          <TabsContent key={group} value={group} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{group} Settings</CardTitle>
                <CardDescription>
                  Manage {group} related settings and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {groupedSettings[group].map(setting => (
                  <form key={setting.id} onSubmit={handleUpdateSetting(setting)} className="space-y-2">
                    <div className="grid gap-1">
                      <Label htmlFor={`setting-${setting.id}`}>{setting.label}</Label>
                      {renderSettingInput(setting)}
                      <p className="text-xs text-muted-foreground mt-1">
                        Setting key: {setting.key}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </form>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}