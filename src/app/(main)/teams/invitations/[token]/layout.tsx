import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Invitation | Jamicon',
  description: 'Accept or decline a team invitation',
};

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-4xl py-6 lg:py-10 mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Invitation</h1>
          <p className="text-muted-foreground mt-2">
            Review and respond to your team invitation
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 