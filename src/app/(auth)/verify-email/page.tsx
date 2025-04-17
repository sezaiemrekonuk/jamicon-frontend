"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyEmail } = useAuth();
    const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const oobCode = searchParams.get("oobCode");
        
        if (oobCode) {
            setStatus("verifying");
            verifyEmail(oobCode)
                .then(() => {
                    setStatus("success");
                    setTimeout(() => {
                        router.push("/");
                    }, 3000);
                })
                .catch((err) => {
                    setStatus("error");
                    setError(err.message);
                });
        }
    }, [searchParams, verifyEmail, router]);

    if (!searchParams.get("oobCode")) {
        return (
            <div className="container min-h-screen min-w-screen py-8 flex justify-center items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Verify Your Email</CardTitle>
                        <CardDescription>
                            Please check your email for a verification link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/")} className="w-full">
                            Return to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-md py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                </CardHeader>
                <CardContent>
                    {status === "verifying" && (
                        <Alert>
                            <AlertTitle>Verifying your email...</AlertTitle>
                            <AlertDescription>
                                Please wait while we verify your email address.
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === "success" && (
                        <Alert className="bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertTitle>Email Verified!</AlertTitle>
                            <AlertDescription>
                                Your email has been successfully verified. Redirecting to home page...
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === "error" && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error || "Failed to verify email. Please try again."}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

