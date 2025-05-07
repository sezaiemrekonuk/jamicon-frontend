"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { setCookie } from "cookies-next";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyEmail, resendVerificationEmail, user } = useAuth();
    const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [countdown, setCountdown] = useState(0);
    const [autoLoginMessage, setAutoLoginMessage] = useState<string | null>(null);

    // Handle automatic verification and login from URL params
    useEffect(() => {
        const oobCode = searchParams.get("oobCode");
        const statusParam = searchParams.get("status");
        const message = searchParams.get("message");
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        
        if (user?.emailVerified) {
            router.push("/");
            return;
        }

        if (oobCode) {
            // If both status and tokens are provided by the backend, perform auto login
            if (statusParam === "success" && accessToken && refreshToken) {
                setStatus("success");
                setAutoLoginMessage("Your email has been verified! Logging you in automatically...");
                
                // Store tokens in cookies
                setCookie("accessToken", accessToken);
                setCookie("refreshToken", refreshToken);
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    router.push("/");
                    window.location.reload(); // Force reload to update authentication state
                }, 2000);
                return;
            }
            
            // If just status is provided by the backend
            if (statusParam === "success") {
                setStatus("success");
                setTimeout(() => {
                    router.push("/");
                }, 5000);
                return;
            } else if (statusParam === "error" && message) {
                setStatus("error");
                setError(message);
                return;
            }
            
            // Otherwise, perform client-side verification
            setStatus("verifying");
            verifyEmail(oobCode)
                .then(() => {
                    setStatus("success");
                    setTimeout(() => {
                        router.push("/");
                    }, 5000);
                })
                .catch((err) => {
                    setStatus("error");
                    setError(err.message || "Failed to verify your email");
                });
        }
    }, [searchParams, verifyEmail, router, user]);
    
    // Handle resend countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendVerification = async () => {
        if (resendStatus === "sending" || countdown > 0) return;
        
        setResendStatus("sending");
        try {
            await resendVerificationEmail();
            setResendStatus("sent");
            setCountdown(60); // 60 second countdown before next resend
        } catch (err: any) {
            setResendStatus("error");
            setError(err.message || "Failed to resend verification email");
        }
    };

    if (!searchParams.get("oobCode")) {
        return (
            <div className="container flex justify-center items-center min-h-[80vh] mx-auto">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-blue-50">
                                <MailCheck className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                        <CardTitle className="text-xl">Verify Your Email</CardTitle>
                        <CardDescription>
                            We've sent a verification link to your email.
                            Please check your inbox and spam folder.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user && !user.emailVerified && (
                            <Alert className="bg-amber-50 border-amber-200">
                                <AlertTitle className="text-amber-700">Email not verified yet</AlertTitle>
                                <AlertDescription className="text-amber-600">
                                    You need to verify your email to access all features.
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {resendStatus === "sent" && (
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <AlertTitle className="text-green-700">Verification email sent!</AlertTitle>
                                <AlertDescription className="text-green-600">
                                    We've sent a new verification link to your email.
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {resendStatus === "error" && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {error || "Failed to resend verification email."}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                        <Button 
                            onClick={handleResendVerification} 
                            className="w-full"
                            disabled={resendStatus === "sending" || countdown > 0}
                            variant="outline"
                        >
                            {resendStatus === "sending" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : countdown > 0 ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend in {countdown}s
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend verification email
                                </>
                            )}
                        </Button>
                        <Button onClick={() => router.push("/")} variant="secondary" className="w-full">
                            Return to Home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container flex justify-center items-center min-h-[80vh] mx-auto">
            <Card className="w-full max-w-md shadow-lg overflow-hidden">
                {status === "verifying" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Verifying your email...</p>
                        </div>
                    </div>
                )}
                
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {status === "success" ? (
                            <div className="p-3 rounded-full bg-green-50">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                        ) : status === "error" ? (
                            <div className="p-3 rounded-full bg-red-50">
                                <XCircle className="h-10 w-10 text-red-500" />
                            </div>
                        ) : (
                            <div className="p-3 rounded-full bg-blue-50">
                                <MailCheck className="h-10 w-10 text-blue-500" />
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-center text-xl">
                        {status === "success" ? "Email Verified!" : 
                         status === "error" ? "Verification Failed" : 
                         "Email Verification"}
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {status === "success" && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertTitle className="text-green-700">Success!</AlertTitle>
                            <AlertDescription className="text-green-600">
                                {autoLoginMessage || 
                                 "Your email has been successfully verified. You will be redirected to the home page in a few seconds."}
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === "error" && (
                        <>
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Verification Failed</AlertTitle>
                                <AlertDescription>
                                    {error || "There was a problem verifying your email. The link may be invalid or expired."}
                                </AlertDescription>
                            </Alert>
                            
                            {user && !user.emailVerified && (
                                <div className="mt-4 flex justify-center">
                                    <Button 
                                        onClick={handleResendVerification} 
                                        disabled={resendStatus === "sending" || countdown > 0}
                                        variant="outline"
                                    >
                                        {resendStatus === "sending" ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : countdown > 0 ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Resend in {countdown}s
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Resend verification email
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
                
                <CardFooter className="pt-0">
                    {status === "error" && (
                        <Button onClick={() => router.push("/")} className="w-full">
                            Return to Home
                        </Button>
                    )}
                    
                    {status === "success" && (
                        <div className="w-full flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Redirecting to home page...</span>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

