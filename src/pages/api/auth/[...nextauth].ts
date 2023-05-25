import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const nextAuthHandler = NextAuth({
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!
      })
    ],
    callbacks: {
      async signIn() {
        // TODO: Intercept the sign in request if a user is already signed in and
        // treat the rest of the flow as an attempt to link a new account.
        return true;
      },

      jwt({ token }) {
        // TODO: Ensure that the token contains a unique identifier for the user (e.g id or email)
        // which will be used to link accounts together in the system if they are already signed in with
        // a different provider.
        return token;
      },

      async session({ session }) {
        // TODO: optionally attach some extra information from the token/db to make available to the client side via useSession, etc.
        return session;
      }
    }
  });

  return nextAuthHandler(req, res);
}
