import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="container grid h-screen w-screen lg:max-w-none lg:grid-cols-2 lg:px-0 mx-auto">
      <div className="hidden h-full bg-muted lg:block">
        <div className="flex h-full items-end justify-start bg-primary p-8">
          <blockquote className="space-y-2">
            <p className="text-lg text-white">
              "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before."
            </p>
            <footer className="text-sm text-white">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
} 