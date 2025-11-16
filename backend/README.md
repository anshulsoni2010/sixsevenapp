# Six Seven Backend API

This is the backend API for Six Seven - a mobile app that transforms messages into Gen Alpha slang.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the API landing page.

## API Documentation

The complete API documentation is available via Swagger UI:

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **API README**: See [API_README.md](./API_README.md) for detailed documentation

### Generate Documentation

To regenerate the swagger specification after making changes:

```bash
npm run generate-swagger
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Google OAuth
- **Payments**: Stripe
- **Documentation**: Swagger/OpenAPI 3.0

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
