import Head from 'next/head';
import UrlShortener from '@/components/UrlShortener';

export default function Home() {
  return (
    <>
      <Head>
        <title>Serverless URL Shortener | Jessie Borras</title>
        <meta name="description" content="A serverless URL shortener built with Next.js, AWS Lambda, and DynamoDB. Created by Jessie Borras." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Serverless URL Shortener" />
        <meta property="og:description" content="Transform your long URLs into short, shareable links with our serverless URL shortener." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Serverless URL Shortener" />
        <meta name="twitter:description" content="Transform your long URLs into short, shareable links." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  URL Shortener
                </h1>
              </div>
              <div className="text-sm text-gray-600">
                By{' '}
                <a 
                  href="https://jessiedev.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Jessie Borras
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <UrlShortener />
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Built with ❤️ using serverless technologies
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <span>Next.js</span>
                <span>•</span>
                <span>AWS Lambda</span>
                <span>•</span>
                <span>DynamoDB</span>
                <span>•</span>
                <span>Tailwind CSS</span>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                © 2024 Jessie Borras. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}