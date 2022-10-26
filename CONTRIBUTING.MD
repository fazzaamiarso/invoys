# Contributing to Invoys
Thank you for your interest in contributing! Here are some guide on how to contribute to this project.

## Setup
Fork and clone the project to your local repository.

```sh
pnpm install
```
Setup all the required environment variables on .env.examples

Set up an SMTP server to send verification link. This project use GMAIL which is free. 
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