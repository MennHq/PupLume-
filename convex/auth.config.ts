export default {
  providers: [
    {
      // Clerk JWT template configured for Convex
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://helpful-gull-9014.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
