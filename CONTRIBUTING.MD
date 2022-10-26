# Contributing to Invoys
Thank you for your interest in contributing! Here are some guide on how to contribute to this project.

## Setup
Fork and clone the project to your local repository.

```sh
pnpm install
```
Setup all the required environment variables on .env.examples.

For database, this project uses Prisma with MySQL connector hosted on PlanetScale.  

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
