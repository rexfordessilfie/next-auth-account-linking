import { getServerSession } from "next-auth";
import { HomePage } from "./home-page";
import { getNextAuthOptions } from "./api/auth/[...nextauth]/route";
import { findUserById, getUserAccounts } from "@/lib/crud";

export default async function Home() {
  const session = await getServerSession(getNextAuthOptions());

  if (session?.userId) {
    const user = await findUserById(session.userId);
    const accounts = await getUserAccounts(session.userId);

    return <HomePage accounts={accounts} user={user} />;
  }

  return <HomePage accounts={[]} user={null} />;
}
