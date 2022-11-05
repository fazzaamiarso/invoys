 <p align="center"><img src="https://i.imgur.com/S2cqkro.png" align="center" alt="invoys logo" /></p>

# Invoys

I am Happy you're here!

Invoys is an Open source and self-hostable invoice management app built with Next.js. Made to be free of cost.

Want to know more about the motivation of building Invoys? Read [my blog post on Invoys](https://fazzaamiarso.me/projects/invoys).

## Table of Contents
- [Features](#features)
- [Try it out](#try-the-demo-app)
- [Project Gallery](#project-gallery)
- [Overview](#overview)
  - [Tech Stack](#tech-stack)
  - [Folder Structure](#folder-structure)
- [Host your own app](#spin-up-your-own-app)
- [Contributing](#contributing)
- [Improvements](#improvements)

## Features

- Freely customize and use the code.
- Create invoice and manage clients.
- Send Invoice link to email.
- Download invoice to PDF.
- Invite team members.
- Download datas to CSV.

## Try the Demo App

> For demo app, as it's a public dashboard, the Database will be resetted once in a while.

1. Go to [https://invoys.fzworld.xyz](https://invoys.fzworld.xyz)
2. Use any email to login, but must be able to receive verification email (recommended to use [temp mail](https://temp-mail.org/en/))
3. You are logged-in

## Project Gallery

|                                           |                                           |
| :---------------------------------------: | :---------------------------------------: |
| ![Imgur](https://i.imgur.com/rpDor0M.gif) |  ![Imgur](https://i.imgur.com/ujWxXj5.png)|
| ![Imgur](https://i.imgur.com/KehNO4f.png) | ![Imgur](https://i.imgur.com/x4Xxw5w.png) |
| ![Imgur](https://i.imgur.com/1CZnXF3.png) | ![Imgur](https://i.imgur.com/x1TjQOP.png) |
| ![Imgur](https://i.imgur.com/fVusKr7.png) |

## Overview

### Tech Stack

- Next.js + Typescript
- TRPC
- Next-auth (Email Magic Link) with Nodemailer
- Prisma
- Planetscale (MySQL)
- Tailwind CSS
- Courier
- Docker
- Cypress + Vitest

### Folder Structure

- `/cypress` E2E + Integration testing files in Cypress.
- `/scripts` SQL files that used in docker.
- `/prisma` All files related to schema, seed script included.
- `/src`
  - `/assets` Files such as images and icons.
  - `/components` React components files.
  - `/hooks` React hooks files.
  - `/lib` Contains files with 3rd party library specific code.
  - `/pages` Next.js pages. (still use `/pages` for now, rather than `/app`)
  - `/data` Constants and mock datas.
  - `/styles` CSS files.
  - `/utils` Utility files such as helpers, display, formatting.

## Spin-up your own app

Checkout the [contributing guide](CONTRIBUTING.MD) for setup guide. After setup, you can host it wherever you want.

## Contributing

Any contributions is welcomed and encouraged. If you are interested, see the [contributing guide](CONTRIBUTING.MD).

## Improvements

- [ ] Dashboard analytics.
- [ ] Recurring and scheduled invoice sending.
- [ ] Invoice due date reminder.
- [ ] UI/UX.
- [x] Setup CI workflow for testing.
- [x] Table virtualization with @tanstack-virtual.
- [x] E2E testing with Cypress.
- [x] Setup Docker for development database and test?
