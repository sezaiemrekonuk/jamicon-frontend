import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTeam } from '@/lib/services/team-service';
import { CreateTeamRequest } from '@/types/team';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { slugify } from '@/lib/utils';

// Define the form schema with zod for validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }).max(50, {
    message: "Team name must not exceed 50 characters."
  }),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    })
    .min(1, {
      message: "Slug is required."
    })
    .or(z.string().length(0)),
});

export default function CreateTeamForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  // Generate slug preview as user types the team name
  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');
  const slugPreview = nameValue ? slugify(nameValue) : 'my-team';

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    // Prepare request data
    const requestData: CreateTeamRequest = {
      name: values.name,
      slug: values.slug || slugify(values.name)
    };

    // Ensure slug is valid
    if (!requestData.slug.match(/^[a-z0-9-]+$/)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createTeam(requestData);
      toast({
        title: "Team created!",
        description: `${result.name} has been successfully created.`,
      });
      router.push(`/teams/${result.slug}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create New Team</CardTitle>
        <CardDescription>
          Create a team to collaborate with others on projects
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Awesome Team" 
                      {...field} 
                      className="bg-background"
                    />
                  </FormControl>
                  <FormDescription>
                    This will be the display name of your team.
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
                  <FormLabel>Team URL Slug (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={slugPreview}
                      {...field} 
                      className="bg-background"
                      onChange={(e) => {
                        // Convert to lowercase and remove invalid characters
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="flex flex-col space-y-1">
                    <span>Will be used in your team URL: <span className="font-medium text-foreground/80">/teams/{field.value || slugPreview}</span></span>
                    <span className="text-xs text-muted-foreground">Slug can only contain lowercase letters, numbers, and hyphens.</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter>
            <Button
              type="submit"
              className="w-full group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Team...
                </>
              ) : (
                <>
                  Create Team
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 