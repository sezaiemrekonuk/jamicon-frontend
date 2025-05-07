"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { LoginFormValues, loginSchema } from "@/lib/auth-schema";
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
import { SocialButton } from "@/components/auth/social-button";
import { GitHubLogoIcon, Icons } from "@/components/icons";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectTarget, setRedirectTarget] = useState<string>(searchParams.get("redirectTo") || "/");
  const { signIn } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState<string>("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Check for stored redirect from invitation flow
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRedirect = localStorage.getItem('redirectAfterLogin');
      if (storedRedirect) {
        setRedirectTarget(storedRedirect);
      }
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setShowResendVerification(false);

    try {
      await signIn(data);
      toast.success("Successfully logged in");
      
      // Clear stored redirect if we're using it
      if (typeof window !== 'undefined' && localStorage.getItem('redirectAfterLogin')) {
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath || redirectTarget);
      } else {
        router.push(redirectTarget);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Authentication failed. Please check your credentials.";
      setError(errorMessage);
      
      if (errorMessage.includes("Please verify your email")) {
        setError(
          "Your email address has not been verified. Please check your inbox for the verification link or click resend below."
        );
        setShowResendVerification(true);
        setEmailForVerification(data.email);
        toast.error(
          <div className="flex flex-col gap-1">
            <span>Email verification required</span>
            <span className="text-xs">Check your inbox for the verification link</span>
          </div>
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [signIn, router, redirectTarget]);

  const handleResendVerification = async () => {
    if (!emailForVerification) return;

    setIsResendingVerification(true);
    try {
      // You'll need to implement this API endpoint
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForVerification }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }
      
      toast.success('Verification email sent successfully. Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleSocialLogin = useCallback(async (provider: "github" | "google") => {
    const setLoading = provider === "github" ? setIsGitHubLoading : setIsGoogleLoading;
    setLoading(true);
    setError(null);
    
    try {
      // Social login implementation would go here
      const errorMessage = `${provider === "github" ? "GitHub" : "Google"} login is not implemented yet`;
      setError(errorMessage);
      toast.error(errorMessage);
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      setError(error.message || `Failed to login with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGitHubLogin = useCallback(() => handleSocialLogin("github"), [handleSocialLogin]);
  const handleGoogleLogin = useCallback(() => handleSocialLogin("google"), [handleSocialLogin]);

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in to your account
        </p>
        {redirectTarget !== "/" && (
          <Badge variant="outline" className="mx-auto mt-2">
            You'll be redirected after login
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex flex-col">
              <span>{error}</span>
              {showResendVerification && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="self-start mt-2 pl-0"
                >
                  {isResendingVerification ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend verification email"
                  )}
                </Button>
              )}
            </div>
          )}
          
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
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SocialButton
          icon={<Icons.google className="h-4 w-4" />}
          text="Google"
          provider="google"
          onClick={handleGoogleLogin}
          isLoading={isGoogleLoading}
        />
        <SocialButton
          icon={<GitHubLogoIcon className="h-4 w-4" />}
          text="GitHub"
          provider="github"
          onClick={handleGitHubLogin}
          isLoading={isGitHubLoading}
        />
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
} 