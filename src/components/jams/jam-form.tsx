"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Jam, Visibility } from "@/types/jam";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { jamApi } from "@/lib/api/jam";
import { useState } from "react";

// Schema for jam form validation
const jamFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  slug: z.string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  theme: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  isFeatured: z.boolean().default(false),
  visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  isTrending: z.boolean().default(false),
}).refine(data => {
  return data.startDate < data.endDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type JamFormValues = z.infer<typeof jamFormSchema>;

interface JamFormProps {
  jam?: Jam;
  onSuccess?: (jam: Jam) => void;
}

export function JamForm({ jam, onSuccess }: JamFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const isEditing = !!jam;
  
  // Default form values
  const defaultValues: Partial<JamFormValues> = {
    name: jam?.name || "",
    slug: jam?.slug || "",
    description: jam?.description || "",
    theme: jam?.theme || "",
    startDate: jam?.startDate ? new Date(jam.startDate) : new Date(),
    endDate: jam?.endDate ? new Date(jam.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days later
    isFeatured: jam?.isFeatured || false,
    visibility: jam?.visibility || Visibility.PUBLIC,
    logoUrl: jam?.logoUrl || "",
    bannerUrl: jam?.bannerUrl || "",
    isTrending: jam?.isTrending || false,
  };
  
  // Form instance
  const form = useForm<JamFormValues>({
    resolver: zodResolver(jamFormSchema),
    defaultValues,
  });
  
  // Form submission handler
  const onSubmit = async (values: JamFormValues) => {
    try {
      setLoading(true);
      
      // Handle empty strings for URLs
      if (values.logoUrl === '') values.logoUrl = undefined;
      if (values.bannerUrl === '') values.bannerUrl = undefined;
      
      let updatedJam: Jam;
      
      if (isEditing) {
        updatedJam = await jamApi.updateJam(jam.id, values);
      } else {
        updatedJam = await jamApi.createJam(values);
      }
      
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(updatedJam);
      } else {
        router.push(`/jams/${updatedJam.slug}`);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving jam:", error);
      // Add error handling here (toast notifications, etc.)
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Game Jam" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your jam as it will appear to everyone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-jam" {...field} />
                  </FormControl>
                  <FormDescription>
                    The URL-friendly name which will be used in your jam's web address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what your jam is about, rules, goals, etc."
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide details about your jam, including rules and theme explanation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <Input placeholder="Space Adventure" {...field} />
                </FormControl>
                <FormDescription>
                  The theme of the jam (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the jam begins
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the jam ends
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL to the jam's logo image (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bannerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/banner.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL to the jam's banner image (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Visibility.PUBLIC}>Public - Anyone can view this jam</SelectItem>
                    <SelectItem value={Visibility.UNLISTED}>Unlisted - Only accessible with direct link</SelectItem>
                    <SelectItem value={Visibility.PRIVATE}>Private - Only visible to participants</SelectItem>
                    <SelectItem value={Visibility.DRAFT}>Draft - Only visible to you</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Control who can see your jam
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Feature this jam</FormLabel>
                    <FormDescription>
                      Featured jams appear prominently on the homepage
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {isEditing && (
              <FormField
                control={form.control}
                name="isTrending"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as trending</FormLabel>
                      <FormDescription>
                        Trending jams appear in the trending section
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Jam" : "Create Jam"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 