'use client';

import CreateTeamForm from '@/components/teams/create-team-form';

export default function CreateTeamPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Create a New Team</h1>
      <CreateTeamForm />
    </div>
  );
} 