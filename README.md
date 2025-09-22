# Serverless URL Shortener

**Author:** Jessie Borras  
**Website:** [jessiedev.xyz](https://jessiedev.xyz)

## Description

A project that uses serverless functions to create and manage short URLs. It's a great way to showcase your understanding of cloud computing, cost optimization, and distributed systems. This URL shortener provides a clean web interface for creating short links and automatically redirects users to the original URLs.

## Tech Stack

- **Frontend:** React/Next.js
- **Backend:** AWS Lambda Functions
- **Database:** DynamoDB (key-value store)
- **Infrastructure:** AWS CloudFormation
- **Deployment:** Serverless Framework

## Features

- ✨ Clean, responsive web interface
- 🔗 Generate short URLs from long URLs
- 📊 Click tracking and analytics
- ⚡ Fast redirects with serverless functions
- 💰 Cost-effective serverless architecture
- 🔄 Automatic scaling
- 🛡️ URL validation and security

## Project Structure

```
Serverless URL Shortener/
├── frontend/          # Next.js React application
├── backend/           # AWS Lambda functions
├── infrastructure/    # AWS CloudFormation templates
├── package.json      # Root package.json for project scripts
└── README.md         # This file
```

## Prerequisites

- Node.js 18.x or later
- AWS CLI configured with appropriate permissions
- Serverless Framework CLI
- AWS account with Lambda and DynamoDB access

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure AWS

```bash
# Configure AWS credentials
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Deploy Backend

```bash
# Deploy serverless functions and infrastructure
cd backend
npm run deploy
cd ..
```

### 4. Configure Frontend

```bash
# Copy environment template and configure API endpoints
cd frontend
cp .env.example .env.local
# Edit .env.local with your API Gateway URLs
cd ..
```

### 5. Run Frontend Locally

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to use the URL shortener!

## API Endpoints

### POST /api/shorten
Create a short URL from a long URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "shortUrl": "https://your-domain.com/abc123",
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url"
}
```

### GET /{shortCode}
Redirect to the original URL.

**Response:** HTTP 302 redirect to original URL

### GET /api/stats/{shortCode}
Get click statistics for a short URL.

**Response:**
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 42,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Development

### Local Development

```bash
# Run backend locally
cd backend
npm run dev

# Run frontend locally (in another terminal)
cd frontend
npm run dev
```

### Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

### Deployment

```bash
# Deploy backend
cd backend
npm run deploy

# Build and deploy frontend
cd frontend
npm run build
npm run export
# Deploy static files to S3 or your hosting service
```

## Cost Optimization

This serverless architecture is designed for cost efficiency:

- **Lambda:** Pay per request (generous free tier)
- **DynamoDB:** Pay per read/write (generous free tier)
- **API Gateway:** Pay per API call
- **No server maintenance costs**

Estimated cost for 100,000 URLs/month: < $5

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ by [Jessie Borras](https://jessiedev.xyz)
- Inspired by the need for simple, scalable URL shortening
- Thanks to the serverless community for amazing tools and resources# serverless-url-shortener
