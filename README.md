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

## Avatar Upload Feature

The application includes a secure avatar upload feature with the following capabilities:

### Features

- **User-friendly interface**: Clean UI with preview and progress indicators
- **Image validation**: Ensures only valid file types (JPEG, PNG, GIF, WebP) are uploaded
- **Size limits**: Restricts uploads to 5MB maximum file size
- **Automatic cleanup**: Old avatars are automatically deleted when new ones are uploaded
- **Error handling**: Comprehensive error handling with user feedback
- **CDN integration**: Production environment uses AWS CloudFront for optimal delivery
- **Responsive design**: Works well on both mobile and desktop views

### Implementation Details

The avatar upload system is implemented as a modular component that:

1. Validates file types and sizes client-side before upload
2. Shows a preview of the image before confirming upload
3. Displays upload progress with a progress bar
4. Handles success and error states with appropriate feedback

The backend supports dual storage modes:
- Local storage for development environments
- S3 with CloudFront CDN for production environments

### Usage

In user profile pages, the avatar component appears as an avatar with an upload icon on hover:

```tsx
<AvatarUpload 
  user={user} 
  onAvatarUpdated={handleAvatarUpdated} 
/>
```

The component handles all upload logic and validation internally while providing callbacks for state updates.
