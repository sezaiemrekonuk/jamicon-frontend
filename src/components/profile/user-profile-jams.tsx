"use client";

import { UserJams } from "@/components/jams/user-jams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfileJamsProps {
  userId: string;
}

export function UserProfileJams({ userId }: UserProfileJamsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Game Jams</CardTitle>
      </CardHeader>
      <CardContent>
        <UserJams userId={userId} />
      </CardContent>
    </Card>
  );
} 