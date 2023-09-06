import { createAccount, createUser, findAccount } from "@/lib/crud";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import SpotifyProvider from "next-auth/providers/spotify";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env.mjs";
/**
 * Returns a NextAuthOptions object with extended functionality that requires a request and response object
 * In this specific case, the extended functionality allows for one user multiple accounts
 * @param req A NextRequest
 * @param res A NextResponse
 * @returns A NextAuthOptions object with extended functionality that requires a request and response object
 */
export const getNextAuthOptions = <Req extends Request, Res extends Response>(
  req: NextApiRequest | GetServerSidePropsContext["req"],
  res: NextApiResponse | GetServerSidePropsContext["res"],
) => {
  const extendedOptions: NextAuthOptions = {
    providers: [
      GithubProvider({
        clientId: env.GITHUB_CLIENT_ID!,
        clientSecret: env.GITHUB_CLIENT_SECRET!,
      }),
      SpotifyProvider({
        clientId: env.SPOTIFY_CLIENT_ID!,
        clientSecret: env.SPOTIFY_CLIENT_SECRET!,
      }),
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    pages: {
      signIn: "/",
      error: "/",
      signOut: "/",
    },
    callbacks: {
      async signIn(params) {
        const { account, user } = params;

        const currentSession = await getServerSession(
          req,
          res,
          extendedOptions,
        );

        const currentUserId = currentSession?.userId;

        // If there is a user logged in already that we recognize,
        // and we have an account that is being signed in with
        if (account && currentUserId) {
          // Do the account linking
          const existingAccount = await findAccount({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          if (existingAccount) {
            throw new Error("Account is already connected to another user!");
          }

          // Only link accounts that have not yet been linked
          // Link the new account
          await createAccount({
            providerAccountId: account.providerAccountId,
            provider: account.provider,
            userId: currentUserId,
            email: user.email!, // Email field not absolutely necessary, just for keeping record of user emails
          });

          // Redirect to the home page after linking is complete
          return "/";
        }

        // Your Other logic to block sign-in's

        return true;
      },

      async jwt(params) {
        const { token, account, user } = params;

        // If there is an account for which we are generating JWT for (e.g on sign in)
        // then attach our userId to the token
        if (account) {
          const existingAppAccount = await findAccount({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          // User account already exists so set user id on token to be added to session in the session callback
          if (existingAppAccount) {
            token.userId = existingAppAccount.userId;
          }

          // No account exists under this provider account id so probably new "user"
          if (!existingAppAccount) {
            const appUser = await createUser({
              provider: account.provider, // Provider field not absolutely necessary, just for keeping record of provider the account was created with
            });

            const newAppAccount = await createAccount({
              providerAccountId: account.providerAccountId,
              provider: account.provider,
              userId: appUser.id,
              email: user.email!, // Email field not absolutely necessary, just for keeping record of user emails
            });

            token.userId = newAppAccount.userId;
          }
        }

        return token;
      },

      async session(params) {
        const { session, token } = params;
        // Attach the user id from our table to session to be able to link accounts later on sign in
        // when we make the call to getServerSession
        session.userId = token.userId;
        return session;
      },
    },
  };

  return extendedOptions;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, getNextAuthOptions(req, res));
}
