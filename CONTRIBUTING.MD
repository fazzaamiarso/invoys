# Contributing to Invoys
Thank you for your interest in contributing! Here are some guide on how to contribute to this project.

## Setup
Before contributing to Invoys, you will have to fork the Repo. If you want to spin up your own app, you can simply download the code and continue to the setup.

### System Requirements

- [Node.js](https://nodejs.org/) >= 16.0.0
- [git](https://git-scm.com/) >= 2.7.0
- [Docker](https://www.docker.com/) or MySQl/Postgres database.
- [pnpm](https://pnpm.io/) >= 7.0.0

### Steps
Fork and clone the repo, then do this:
```bash
cd invoys

# Copy to local .env, you will need to configure some on variables. 
cp .env.example .env

pnpm install

docker compose up -d

pnpm db:seed

pnpm test:unit && cy:test-run
```
If you have all the requirements, the steps should do, if not, please read more below. 

You also need to setup a [SMTP server](#Authentication) for auth.

Finally, to send Invoices setup [Courier API](#Courier).

To start dev server:
```bash
pnpm dev
```

### Database
For **local development**, you can use MySQL/Postgres database. If you want to use Postgres, you will need to modify some of the database setup in `Prisma` and `Docker`.
For **production**, the demo app uses Prisma with MySQL connector hosted on PlanetScale.

This project use docker for local development and testing, to run docker
```bash
docker compose up -d
```
You can also setup your own MySQL database.

Some common command for database when developing is:
```bash
# This will reset your database and re-seed it.
pnpm db:seed

# To push schema changes you made in prisma
pnpm db:push

# To open up database view with Prisma.
pnpm db:studio
```

### Running Automated Tests
Testing uses different environment variables, which is set in .env.test
```bash
# Run unit test with Vitest
pnpm test:unit

# Will start a server and run Cypress tests headless.
pnpm cy:test-run 
```

### Courier
For sending invoices, [Courier Send API](https://www.courier.com/docs/guides/getting-started/nodejs/) is used.  

### Authentication
Set up SMTP server to send [verification link with next-auth](https://next-auth.js.org/providers/email). This project use Gmail which is free. 
To setup your gmail account for SMTP refer to [this article](https://miracleio.me/snippets/use-gmail-with-nodemailer/)

You are good to go! Happy hacking!
