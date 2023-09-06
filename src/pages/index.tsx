import { useSession, signIn, signOut } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { getNextAuthOptions } from "./api/auth/[...nextauth]";
import { findUserById, getUserAccounts } from "@/lib/crud";
import Link from "next/link";
import { FaGithub, FaGoogle, FaSpotify } from "react-icons/fa";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/components/Toast";

export default function Home({
  accounts,
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { showToast, hideToast } = useToast();

  const router = useRouter();

  useEffect(() => {
    if (router.query?.error) {
      showToast({
        message: router.query.error as string,
        type: "error",
      });
    }

    setTimeout(() => {
      hideToast();
      router.replace("/", undefined, { shallow: true });
    }, 5000);
  }, [hideToast, router, router.query, showToast]);

  const handleSignIn = (provider: string) => {
    signIn(provider);
  };

  const providersConfig = [
    {
      id: "github",
      name: "GitHub",
      Component: <FaGithub size={24} />,
    },
    {
      id: "spotify",
      name: "Spotify",
      Component: <FaSpotify className="text-green-500" size={24} />,
    },
    {
      id: "google",
      name: "Google",
      Component: <FaGoogle className="text-red-500" size={24} />,
    },
  ];

  const userDetails = [
    // {
    //   key: "Sign-in Email",
    //   value: session?.user?.email
    // },
    {
      key: "User ID",
      value: user?.id,
    },
    {
      key: "Primary Provider",
      value: user?.provider,
    },
    {
      key: "Linked Providers",
      value: accounts.map((account) => account.provider).join(", "),
    },
  ];

  const linkedProviders = accounts.map((account) => account.provider);

  return (
    <main
      className={`flex max-w-4xl min-h-screen flex-col items-center p-24 self-center`}
    >
      <h2 className={`mb-8 text-5xl font-semibold`}>
        Next Auth Account Linking
      </h2>

      <div className="flex gap-8 flex-col mb-4">
        <p>
          This is a demo of how to link multiple accounts to a single user using{" "}
          <Link
            href="https://next-auth.js.org/"
            className="underline text-blue-500"
            passHref
          >
            NextAuth
          </Link>{" "}
          . Sign in with one of the buttons below, and then click other
          providers to sign in with them as well. You can then sign out and sign
          back in with any of the providers you linked.
        </p>

        <div className="flex flex-1 gap-4 flex-col items-center w-full">
          {providersConfig.map((provider) => {
            const isLinked = linkedProviders.includes(provider.id);
            return (
              <div
                key={provider.id}
                className="w-full flex flex-row gap-2 items-baseline"
              >
                {isLinked && (
                  <span className="text-xs h-fit flex justify-center items-center px-2 py-2 bg-green-500 rounded-full"></span>
                )}
                <button
                  disabled={isLinked}
                  className={`flex items-center gap-2 flex-1 text-xl dark:bg-white dark:text-black px-4 py-2 rounded-md shadow-md font-medium bg-black text-white ${
                    isLinked ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleSignIn(provider.id)}
                >
                  {provider.Component && provider.Component}

                  <span>{provider.name}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="w-full">
          <h3 className="mb-4 text-2xl font-semibold">
            {isAuthenticated ? "You are signed in!" : "You are not signed in."}
          </h3>

          {isAuthenticated && (
            <>
              <div className="flex flex-col gap-2 mb-4">
                {userDetails.map((detail) => (
                  <div key={detail.key} className="grid grid-cols-2">
                    <span className="font-semibold">{detail.key}</span>
                    <span>{detail.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  className="dark:bg-white dark:text-black px-4 py-2 rounded-md shadow-md font-medium bg-black text-white"
                  onClick={() => signOut()}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(
    context.req,
    context.res,
    getNextAuthOptions(context.req, context.res),
  );

  console.log(session);

  if (session?.userId) {
    return {
      props: {
        user: await findUserById(session.userId),
        accounts: await getUserAccounts(session.userId),
      },
    };
  }

  return {
    props: {
      accounts: [],
    },
  };
}
