import { IUser } from "./crud";

type JwtPayload = {
  userId?: IUser["id"];
};

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    userId?: IUser["id"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends IUser {
    [k in IUser]: IUser[k];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends JwtPayload {
    [k in JwtPayload]: JwtPayload[k];
  }
}
