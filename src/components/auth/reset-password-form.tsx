"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { ResetPasswordFormValues, resetPasswordSchema } from "@/lib/auth-schema";
import { useAuth } from "@/lib/providers/auth-provider";
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
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { resetPassword } = useAuth();

  // Redirect if no token is provided
  if (!token) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Invalid reset link</AlertTitle>
          <AlertDescription>
            The password reset link is invalid or expired. Please request a new one.
          </AlertDescription>
        </Alert>
        <Button 
          className="w-full" 
          onClick={() => router.push("/forgot-password")}
        >
          Request new link
        </Button>
      </div>
    );
  }

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(token as string, data.password);
      setIsSuccessful(true);
      toast.success("Password has been reset successfully");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "Failed to reset password. Please try again.");
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccessful) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Password reset successful</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been reset successfully.
          </p>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            You can now log in with your new password. Redirecting to login page...
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter a new password for your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters long
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> 
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 