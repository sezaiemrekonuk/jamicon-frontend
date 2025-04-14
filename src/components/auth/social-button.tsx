"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface SocialButtonProps {
  icon: ReactNode;
  text: string;
  provider: "github" | "google" | "twitter";
  onClick?: () => void;
  isLoading?: boolean;
}

export function SocialButton({ 
  icon, 
  text, 
  provider, 
  onClick,
  isLoading = false
}: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={isLoading}
    >
      {!isLoading && <span className="mr-2">{icon}</span>}
      {isLoading ? "Loading..." : text}
    </Button>
  );
} 