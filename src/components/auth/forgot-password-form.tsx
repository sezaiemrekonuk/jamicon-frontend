"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ForgotPasswordFormValues, forgotPasswordSchema } from "@/lib/auth-schema";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [email, setEmail] = useState("");
  const { forgotPassword } = useAuth();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    
    try {
      await forgotPassword(data.email);
      setEmail(data.email);
      setIsSuccessful(true);
      toast.success("Password reset email sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccessful) {
    return (
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <span className="font-medium">{email}</span>
          </p>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Email sent</AlertTitle>
          <AlertDescription>
            Please check your inbox and follow the link to reset your password.
            The link will expire in 24 hours.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or{" "}
            <button 
              className="underline underline-offset-4 hover:text-primary"
              onClick={() => {
                setIsSuccessful(false);
                form.reset();
              }}
            >
              try again
            </button>
          </p>
          <p className="text-sm">
            <Link 
              href="/login" 
              className="underline underline-offset-4 hover:text-primary"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    autoComplete="email"
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
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </Form>
      
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