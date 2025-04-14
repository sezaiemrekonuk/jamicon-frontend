import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
};

export default function DashboardPage() {
  return (
    <div className="container flex flex-col items-center py-10">
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground max-w-md">
          You have successfully logged in. This is a placeholder dashboard page.
        </p>
      </div>

      <div className="grid gap-6 mt-10 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View and update your account details, profile and more.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Manage Account</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage app preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Configure your application settings and preferences.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Open Settings</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logout</CardTitle>
            <CardDescription>Sign out of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Sign out of your account when you're done.</p>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="destructive" className="w-full">Log Out</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 