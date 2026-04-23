import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      checks: ["pkce", "state"],
    }),
  ],
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async redirect(params: any) {
      console.log('NextAuth redirect', params);
      return params.baseUrl;
    },
    async signIn(params: any) {
      console.log('NextAuth signIn callback', params);
      return true;
    },
  },
  events: {
    async signIn(message: any) {
      console.log('NextAuth event signIn', message);
    },
    async error(message: any) {
      console.error('NextAuth event error', message);
    },
  },
};

export default authOptions;
