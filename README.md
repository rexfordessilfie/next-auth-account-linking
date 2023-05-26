# next-auth-account-linking demo
This project demonstrates an approach for supporting ["one user, multiple account providers"](https://github.com/nextauthjs/next-auth/discussions/1702#discussioncomment-5995307) with [NextAuth.js](https://next-auth.js.org/).

![Screenshot](/public/screenshot.png)

# How It Works
The primary logic for how this is achieved is inside of the [src/pages/api/auth/[...nextauth].ts](src/pages/api/auth/[...nextauth].ts) file. 

> The logic in this file should be adaptable to different application needs without requiring having the exact same database schema, ORM, authentication providers, or UI as used in this demo! 

1. First, extend the types of the `Session` and `JWT` objects from NextAuth to include a `userId` property which will be used to link accounts together.
2. Wrap the `NextAuth` handler one level deep in a custom handler to get direct access to `req` and `res` objects on the request.
3. In the `signIn` callback of `NextAuth` auth options, check if a user is already signed in by making a call to `getServerSession` from NextAuth.
   * If they are signed in, **treat the new sign in as an attempt to link an account** and perform the linking using the `userId` property from the session object.
   * If they are not signed in, let the sign in continue as normal.
4. Next, in the `jwt` callback, and for sign-in's fetch an existing account from the database for the provider and provider's account identifier. 
   * If there is one, add the `userId` property to the JWT object.
   * If there is no existing account, create a new user account first, and then add the `userId` property of the newly created user to the JWT object.
5. Lastly, in the `session` callback, ensure that the `token.userId` that was previously set is also set on the `session.userId` property. This will ensure that it is available in the `signIn` callback (Step 3) for linking!


# Tech Stack
This project specifically uses the following tools and technologies:
* Framework: [Next.js](https://nextjs.org/)
* Authentication: [NextAuth.js](https://next-auth.js.org/)
* Database: [Postgres](https://www.postgresql.org/)
* ORM: [Drizzle](https://orm.drizzle.team)
* Environment Variables: [T3-Env](https://env.t3.gg/)
* Styling: [Tailwind CSS](https://tailwindcss.com/)
* Deployment: [Vercel](https://vercel.com/)


# Setup

### Environment Variables
To use the application as is, you will need to setup environment variables as described in `.env.example`. Also see NextAuth documentation on providers for setup information for each provider's secrets (e.g [GitHub](https://next-auth.js.org/providers/github#documentation))


### Database
This project uses [Postgres](https://www.postgresql.org/) as its database. You will need to create a database to run the application as is!

I have found [Neon](https://neon.tech) to be quick and easy to setup. Alternatively, you can setup [postgres through Docker](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/).

For postgres database clients, I recommend [Postico](https://eggerapps.at/postico/) or [pgAdmin](https://www.pgadmin.org/).


### Migrations
Once your database is setup and you have added it's URL to `.env.local`, you can generate and run migrations as follows:

```bash 

# Generate migrations
npm run migrations:generate

# Run migrations
npm run migrations:run
```

> NB: There is a bug here where the migration run script looks like it is taking long to complete, but the migrations are actually successful. Verify that they completed from your database.

# Getting Started

First, ensure that you have the necessary environment variables in a `.env.local` file corresponding with those described in `.env.example`.

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Once the application is started, you may go to the demo and attempt the one-user multiple functionality! 🎉



# Discussion ✋
* ⚠️ **Potential security risks** ahead! See: https://github.com/nextauthjs/next-auth/pull/1002#issuecomment-754071687
  * This is an external work-around/approach to the problem of account linking. NextAuth itself does support internal (and MORE secure though limited) approach to [account linking](https://authjs.dev/reference/core/adapters#linkaccount) which should be considered strongly to this approach! The conditions for linking are controlled by next-auth, vs. externally in this approach and should be more secure/locked down compared to this approach. 
  * Such conditions include checks for same email accross providers, and [`allowDangerousEmailLinking`](https://next-auth.js.org/configuration/providers/oauth#allowdangerousemailaccountlinking-option) flag to only link accounts from providers that are trusted to verify email addresses (to prevent hijacking accounts with less secure oauth providers) and naturally more/better conditions as the library evolves!
* You may also want to distinguish between "primary" and "secondary" accounts. For example there can be use-cases where sign-in's are only allowed through a single provider, but other accounts from other providers may be linked to the primary account for verification purposes. You may keep track of the primary provider (provider at first sign in/up) and block the `signIn` if it is not through that provider!
* There is a big assumption here that a sign-in attempt with a currently signed in user is an attempt to link accounts. This may not always be the case for certain applications. This is not an assumption that always makes sense, and care should be taken to mitigate this for different applications. 
  * For example, this could be the case if your sign in page/endpoints accessible when a user is already signed in, allowing for the possibility of a second user signing in on the same device (e.g. a shared computer). See the discussion linked below for ideas/solutions for this!
  * The adapter approach mentioned above introduces extra conditions on top of this assumption.
* I have not thought too much about what the migration strategy would look like for already existing applications that seek to add this account linking functionality and this should be approached carefully! For now, some thoughts I have are as follows:
  *  First, add the logic to start including an application-level unique `userId` property in the JWT object, by invalidating/revoking existing sessions to force users to sign in again and get a new JWT with  `userId` property.
  *  After this, roll in the logic to start linking accounts on sign-in's.
  *  Again, here the adapter approach by NextAuth should help with automatically making sure that sessions are in the right state to support account linking by attaching the `userId` on creation! A migration strategy might still be necessary especially for already existing applications that seek to use existing adapaters.
* This demo has also not been tested beyond the providers used in this demo, but the solution looks to be provider agnostic and relies heavily on the `account.providerAccountId` + `account.provider` properties in identifying existing accounts on sign-in's. It works to the degree that providers/or next-auth supplies a uniquely identifiable id (`account.providerAccountId`) for each user on the provider's platform. The logic for determining existing accounts may be modified to rely on other properties if necessary. Coincidentally, a similar approach is used by NextAuth to identify existing accounts in their codebase. See [here](https://github.com/nextauthjs/next-auth/blob/461b52ea4f55d740b3b94de800d105a9bfc854ef/packages/next-auth/src/core/lib/callback-handler.ts#L124) for more.
* The demo is very minimal, but supports features such as ensuring an account (as identified by `account.provider` + `account.providerAccountId`) can only be linked to one user. It does not support features such as unlinking or removing connected accounts.
* In conclusion, browse through this [callback handler logic](https://github.com/nextauthjs/next-auth/blob/461b52ea4f55d740b3b94de800d105a9bfc854ef/packages/next-auth/src/core/lib/callback-handler.ts#L23) from `nextauth` code-base to know what offerings there are following the adapter-based approach.

See this [discussion](https://github.com/nextauthjs/next-auth/discussions/1702) for more context and ideas on this!

# Contributing
All contributions to this demo are welcome! Issues are especially welcome to bring light to bugs or improvements that can be made to the approach adopted by this demo!
