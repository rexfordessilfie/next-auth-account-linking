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
* NextAuth was likely not designed with this use case as first class. There is a big assumption here that a sign-in attempt with a currently signed in user is an attempt to link accounts. This may not always be the case for certain applications. 
  * For example, this could be the case if your sign in page/endpoints accessible when a user is already signed in, allowing for the possibility of a second user signing in on the same device (e.g. a shared computer). See the discussion linked below for ideas/solutions for this!
* I have not thought too much about what the migration strategy would look like for already existing applications that seek to add this account linking functionality and this should be approached carefully! For now, some thoughts I have are as follows:
  *  First, add the logic to start including an application-level unique `userId` property in the JWT object, by invalidating/revoking existing sessions to force users to sign in again and get a new JWT with  `userId` property.
  *  After this, roll in the logic to start linking accounts on sign-in's.
* One may also want to distinguish between "primary" and "secondary" accounts. For example there can be use-cases where sign-in's are only allowed through a single provider, but other accounts from other providers may be linked to the primary account for verification purposes.
* This demo has also not been tested beyond the providers used in this demo, but the solution looks to be provider agnostic and relies heavily on the `account.providerAccountId` + `account.provider` properties in identifying existing accounts on sign-in's. It works to the degree that providers/or next-auth supplies a uniquely identifiable id (`account.providerAccountId`) for each user on the provider's platform. The logic for determining existing accounts may be modified to rely on other properties if necessary.
* The demo is very minimal, but supports features such as ensuring an account (as identified by `account.provider` + `account.providerAccountId`) can only be linked to one user. It does not support features such as unlinking or removing connected accounts.

See this [discussion](https://github.com/nextauthjs/next-auth/discussions/1702#discussioncomment-5112080) for more context and ideas for how this can be improved!

# Contributing
All contributions to this demo are welcome! Issues are especially welcome to bring light to bugs or improvements that can be made to the approach adopted by this demo!
