"use client";

import RequireAuth from "@/components/auth/require-auth";

// verification-success page

export default function VerificationSuccess() {
  return (
    <RequireAuth allowVisitOnce={true} pageKey="verification_success">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Verification Success</h1>
        <p className="text-sm text-gray-500">You can now close this page</p>
      </div>
    </RequireAuth>
  );
}