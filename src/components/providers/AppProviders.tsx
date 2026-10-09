import React from "react";
import { ClerkProvider, useAuth } from "@clerk/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexProvider } from "convex/react";
import { convex } from "../../lib/convex";

const defaultClerkKey = "pk_test_aGVscGZ1bC1ndWxsLTkwMTQuY2xlcmsuYWNjb3VudHMuZGV2JA";
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || defaultClerkKey;

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (clerkPublishableKey) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
};
