# Invoys
Open source and self-hostable invoice management app built with Next.js. 
Made to be free of cost.

## Features
- Freely customize and use the code.
- Create invoice and manage clients.
- Send Invoice link to email.
- Download invoice to PDF.
- Invite team members.
- Download datas to CSV. (WIP)

|||
|:----------------------------------------:|:-----------------------------------------:|
| ![Imgur](https://i.imgur.com/ujWxXj5.png) | ![Imgur](https://i.imgur.com/fVusKr7.png) |
| ![Imgur](https://i.imgur.com/KehNO4f.png) | ![Imgur](https://i.imgur.com/x4Xxw5w.png) |
| ![Imgur](https://i.imgur.com/1CZnXF3.png) | ![Imgur](https://i.imgur.com/x1TjQOP.png) |
| ![Imgur](https://i.imgur.com/rpDor0M.gif) | 

## Tech Stack
- Next.js + Typescript
- TRPC
- Next-auth (Email Magic Link)
- Prisma
- Planetscale (MySQL)
- Tailwind CSS
- Courier
- Docker
- Cypress + Vitest

## Overview
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
- [X] Setup CI workflow for testing.
- [ ] Table virtualization with @tanstack-virtual.
- [ ] UI/UX.
- [X] E2E testing with Cypress.
- [X] Setup Docker for development database and test?