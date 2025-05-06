# AutoRFP

AutoRFP is a tool for processing and responding to Request for Proposal (RFP) documents. It allows uploading documents, extracting structured questions, and managing responses.

## Features

- Document upload and parsing
- Automatic extraction of RFP questions and sections
- Structured organization of questions for easy response
- Answer management

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

## Usage

1. Upload an RFP document via the upload page
2. Click "Get Questions" to extract structured questions
3. View and answer questions in the organized interface
4. Export your answers when complete

## Technologies

- Next.js
- React
- OpenAI GPT-4
- shadcn/ui components

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
