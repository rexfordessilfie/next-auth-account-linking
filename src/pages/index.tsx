import { Inter } from "next/font/google";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  const [provider, setProvider] = useState("");

  const isAuthenticated = status === "authenticated";
  const isAuthenticating = status === "loading";

  const handleSignIn = (provider: string) => {
    setProvider(provider);
    signIn(provider);
  };

  const providersConfig = [
    {
      id: "github",
      name: "GitHub"
    },
    {
      id: "spotify",
      name: "Spotify"
    },
    {
      id: "google",
      name: "Google"
    }
  ];

  return (
    <main
      className={`flex min-h-screen flex-col items-center ${inter.className}`}
    >
      <div
        className={`flex max-w-4xl min-h-screen flex-col items-center p-24 self-center ${inter.className}`}
      >
        <h2 className={`mb-8 text-3xl font-semibold`}>
          Next Auth Account Linking
        </h2>

        <div className="flex gap-4 flex-col mb-4">
          <p>
            This is a demo of how to link multiple accounts to a single user in.
            Click one of the buttons below to sign in with any of these
            providers:
          </p>
        </div>

        <div className="flex flex-1 gap-4 flex-col items-center w-full self-center">
          {providersConfig.map((provider) => (
            <button
              key={provider.id}
              className="w-full dark:bg-white dark:text-black px-4 py-2 rounded-md shadow-md font-medium bg-black text-white"
              onClick={() => handleSignIn(provider.id)}
            >
              {provider.name}
            </button>
          ))}
        </div>

        {isAuthenticated && (
          <div>
            <h3 className="mt-8 mb-4 text-2xl font-semibold">
              You are signed in!
            </h3>

            <p className="mt-3 mb-3">Email: {session?.user?.email}</p>
            <p className="mt-3 mb-3">ID: {session?.userId}</p>

            <button
              className="dark:bg-white dark:text-black px-4 py-2 rounded-md shadow-md font-medium bg-black text-white"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
