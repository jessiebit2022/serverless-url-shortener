import React, { useState } from 'react';
import { Link, Copy, ExternalLink, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { urlApi } from '@/lib/api';
import { validateUrl, normalizeUrl, copyToClipboard } from '@/lib/utils';
import { ShortenUrlResponse } from '@/types';

const UrlShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenUrlResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.isValid) {
      setError(validation.message || 'Invalid URL');
      return;
    }

    setLoading(true);

    try {
      const normalizedUrl = normalizeUrl(url);
      const requestData = {
        url: normalizedUrl,
        ...(customCode ? { customCode } : {}),
      };

      const response = await urlApi.shortenUrl(requestData);
      setResult(response);
      toast.success('URL shortened successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to shorten URL';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleReset = () => {
    setUrl('');
    setCustomCode('');
    setResult(null);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Link className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            URL Shortener
          </h1>
          <p className="text-gray-600">
            Transform your long URLs into short, shareable links
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-2">
              Custom short code (optional)
            </label>
            <input
              type="text"
              id="customCode"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="my-custom-code"
              className="input-field"
              pattern="[a-zA-Z0-9\-_]+"
              title="Only letters, numbers, hyphens, and underscores allowed"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !url}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Shortening...
                </div>
              ) : (
                'Shorten URL'
              )}
            </button>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary"
              >
                New URL
              </button>
            )}
          </div>
        </form>

        {result && (
          <div className="mt-8 space-y-4 animate-slide-up">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Your shortened URL is ready!
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short URL
                  </label>
                  <div className="flex gap-2">
                    <div className="url-result flex-1">
                      {result.shortUrl}
                    </div>
                    <button
                      onClick={() => handleCopy(result.shortUrl)}
                      className="btn-secondary px-3 py-2"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-3 py-2"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original URL
                  </label>
                  <div className="url-result text-gray-600">
                    {result.originalUrl}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                  <span>Short code: {result.shortCode}</span>
                  <span>Created: {new Date(result.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features section */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="text-center p-4">
          <div className="inline-flex p-2 bg-blue-100 rounded-lg mb-2">
            <Link className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Fast & Reliable</h3>
          <p className="text-sm text-gray-600">Lightning-fast URL shortening with 99.9% uptime</p>
        </div>
        
        <div className="text-center p-4">
          <div className="inline-flex p-2 bg-green-100 rounded-lg mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Analytics Ready</h3>
          <p className="text-sm text-gray-600">Track clicks and analyze your link performance</p>
        </div>
        
        <div className="text-center p-4">
          <div className="inline-flex p-2 bg-purple-100 rounded-lg mb-2">
            <ExternalLink className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Custom Codes</h3>
          <p className="text-sm text-gray-600">Create memorable short URLs with custom codes</p>
        </div>
      </div>
    </div>
  );
};

export default UrlShortener;