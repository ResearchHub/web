import React from 'react';
import Head from 'next/head';
import CommentTest from '@/components/Comment/CommentTest';
import { SessionProvider } from 'next-auth/react';
import '@/app/globals.css'; // Import global styles

export default function CommentTestPage() {
  return (
    <>
      <Head>
        <title>Comment Test - ResearchHub</title>
        <meta name="description" content="Test page for comment functionality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SessionProvider>
        <div className="min-h-screen bg-gray-50 font-sans">
          <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Comment Test Page</h1>
            <p className="mb-4">
              This page is for testing the comment functionality, especially the "load more replies"
              feature.
            </p>

            <div className="bg-white rounded-lg shadow-md p-6">
              <CommentTest />
            </div>
          </div>
        </div>
      </SessionProvider>

      <style jsx global>{`
        /* Force font styles to ensure they're applied */
        body {
          font-family: var(
            --font-geist-sans,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            'Helvetica Neue',
            Arial,
            sans-serif
          );
          background-color: #f9fafb;
          color: #111827;
        }

        /* Ensure Tailwind styles are applied */
        .bg-white {
          background-color: white;
        }

        .rounded-lg {
          border-radius: 0.5rem;
        }

        .shadow-md {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Button styles */
        button {
          transition: all 0.2s;
        }

        /* Debug box styles */
        .bg-blue-50 {
          background-color: #eff6ff;
        }

        .border-blue-100 {
          border-color: #dbeafe;
        }

        /* Input styles */
        input {
          border: 1px solid #d1d5db;
        }
      `}</style>
    </>
  );
}
