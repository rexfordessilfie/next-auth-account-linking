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

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
    >
      <h2 className={`mb-8 text-2xl font-semibold`}>Sign In</h2>

      {isAuthenticating && <p>Authenticating with {provider}...</p>}

      <button
        className="dark:bg-white dark:text-black px-4 py-2 rounded-md shadow-md font-medium bg-black text-white"
        onClick={() => handleSignIn("github")}
      >
        GitHub
      </button>

      {isAuthenticated && (
        <div>
          <p className="mt-3 mb-3">Signed in as {userEmail}</p>
          <button
            className="dark:bg-white dark:text-black px-4 py-2 rounded-md shadow-md font-medium bg-black text-white"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </div>
      )}
    </main>
  );
}
