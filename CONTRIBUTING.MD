# Contributing to Invoys
Thank you for your interest in contributing! Here are some guide on how to contribute to this project.

## Setup
Fork and clone the project to your local repository.

### Install
```sh
pnpm install
```
Setup all the required environment variables on .env.examples.

For database, this project uses Prisma with MySQL connector hosted on PlanetScale in **Production**.
You can use any database you want for development/production.

This project use docker for local database, to run docker
```sh
docker compose -f docker-compose.yml up -d
```
If you want to use other database for testing, just change the `DATABASE_URL` in .env

### Test
Make sure all tests passes before you start to code.
```sh
pnpm test:unit
pnpm cy:test-run 
```

### Other Setup
For sending invoices, [Courier API](https://www.courier.com/docs/guides/getting-started/nodejs/) is used.  

Set up SMTP server to send [verification link with next-auth](https://next-auth.js.org/providers/email). This project use Gmail which is free. 
To setup your gmail account for SMTP refer to [this article](https://miracleio.me/snippets/use-gmail-with-nodemailer/)

Seed the database for development.
```sh
pnpm db:seed
```

Start dev server
```sh
pnpm dev
```

 You are good to go! Happy hacking!
