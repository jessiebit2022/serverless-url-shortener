#!/bin/bash

# Serverless URL Shortener Setup Script
# Author: Jessie Borras

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

print_header "🚀 Serverless URL Shortener Setup"
echo "Author: Jessie Borras"
echo "Website: https://jessiedev.xyz"
echo ""

# Get script directory and navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$SCRIPT_DIR/.."
cd "$PROJECT_DIR"

print_status "Project directory: $(pwd)"

# Check Node.js version
print_header "🔍 Checking Prerequisites"

if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed."
    print_error "Please install Node.js 18.x or later from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [[ $NODE_MAJOR -lt 18 ]]; then
    print_error "Node.js version $NODE_VERSION is not supported."
    print_error "Please install Node.js 18.x or later."
    exit 1
fi

print_success "Node.js version: $NODE_VERSION ✓"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
    print_error "npm is not installed."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm version: $NPM_VERSION ✓"

# Check AWS CLI
if ! command -v aws >/dev/null 2>&1; then
    print_warning "AWS CLI is not installed."
    print_warning "Please install AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    print_warning "You can still develop locally without AWS CLI, but you won't be able to deploy."
else
    AWS_VERSION=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
    print_success "AWS CLI version: $AWS_VERSION ✓"
    
    # Check AWS credentials
    if aws sts get-caller-identity >/dev/null 2>&1; then
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        print_success "AWS credentials configured ✓ (Account: $AWS_ACCOUNT)"
    else
        print_warning "AWS credentials not configured"
        print_warning "Run 'aws configure' to set up your credentials"
    fi
fi

# Install root dependencies
print_header "📦 Installing Dependencies"

print_status "Installing root dependencies..."
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies  
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

print_success "All dependencies installed ✓"

# Check for Serverless Framework
print_header "🔧 Checking Serverless Framework"

if ! command -v serverless >/dev/null 2>&1; then
    print_status "Installing Serverless Framework globally..."
    npm install -g serverless
    print_success "Serverless Framework installed ✓"
else
    SLS_VERSION=$(serverless --version | head -1)
    print_success "Serverless Framework: $SLS_VERSION ✓"
fi

# Setup environment files
print_header "⚙️  Setting Up Environment Configuration"

# Frontend environment
if [[ ! -f "frontend/.env.local" ]]; then
    print_status "Creating frontend environment file..."
    cp frontend/.env.example frontend/.env.local
    print_success "Created frontend/.env.local ✓"
    print_warning "Please update frontend/.env.local with your API Gateway URL after deployment"
else
    print_status "frontend/.env.local already exists ✓"
fi

# Create gitignore if not exists
if [[ ! -f ".gitignore" ]]; then
    print_status "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
frontend/.next/
frontend/out/
frontend/dist/
backend/.serverless/

# Environment files
.env
.env.local
.env.production.local
.env.development.local
frontend/.env.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.nyc_output/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Temporary files
.tmp/
.temp/

# AWS
.aws/
.api-url

# Serverless
.serverless_plugins/
EOF
    print_success "Created .gitignore ✓"
fi

# Create basic tests
print_header "🧪 Setting Up Basic Tests"

# Backend test
if [[ ! -f "backend/tests/handler.test.js" ]]; then
    mkdir -p backend/tests
    cat > backend/tests/handler.test.js << 'EOF'
const { generateShortCode, isValidUrl, normalizeUrl } = require('../src/utils/helpers');

describe('Helper Functions', () => {
  test('generateShortCode should return a 6-character string', () => {
    const code = generateShortCode();
    expect(code).toHaveLength(6);
    expect(typeof code).toBe('string');
  });

  test('isValidUrl should validate URLs correctly', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('example.com')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  test('normalizeUrl should add https if missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });
});
EOF
    print_success "Created basic backend tests ✓"
fi

# Frontend test
if [[ ! -f "frontend/__tests__/index.test.tsx" ]]; then
    mkdir -p frontend/__tests__
    cat > frontend/__tests__/index.test.tsx << 'EOF'
import { validateUrl, normalizeUrl, copyToClipboard } from '../lib/utils';

describe('Frontend Utils', () => {
  test('validateUrl should validate URLs correctly', () => {
    const validResult = validateUrl('https://example.com');
    expect(validResult.isValid).toBe(true);

    const invalidResult = validateUrl('not-a-url');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.message).toBeDefined();
  });

  test('normalizeUrl should add https if missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });
});
EOF

    # Jest config for frontend
    cat > frontend/jest.config.js << 'EOF'
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
EOF

    cat > frontend/jest.setup.js << 'EOF'
import '@testing-library/jest-dom';
EOF

    print_success "Created basic frontend tests ✓"
fi

# Create run scripts
print_header "🏃 Creating Development Scripts"

# Make deployment script executable
chmod +x scripts/deploy.sh
chmod +x scripts/setup.sh

print_success "Scripts are now executable ✓"

# Final setup verification
print_header "✅ Setup Verification"

print_status "Running quick verification..."

# Test backend utilities
cd backend
if npm test >/dev/null 2>&1; then
    print_success "Backend tests pass ✓"
else
    print_warning "Backend tests have issues (this is normal for initial setup)"
fi
cd ..

# Test frontend build
cd frontend
if timeout 30s npm run build >/dev/null 2>&1; then
    print_success "Frontend builds successfully ✓"
else
    print_warning "Frontend build has issues (check your configuration)"
fi
cd ..

print_header "🎉 Setup Complete!"

echo "Your Serverless URL Shortener is now set up and ready to use!"
echo ""
echo "Next Steps:"
echo ""
echo "1. 🔧 Configure AWS credentials (if not done yet):"
echo "   aws configure"
echo ""
echo "2. 🚀 Deploy the backend:"
echo "   ./scripts/deploy.sh --stage dev --backend"
echo ""
echo "3. 🎨 Update frontend configuration:"
echo "   Edit frontend/.env.local with your API Gateway URL"
echo ""
echo "4. 💻 Start local development:"
echo "   npm run dev"
echo ""
echo "5. 🌐 Deploy to production:"
echo "   ./scripts/deploy.sh --stage prod --all"
echo ""
echo "Useful commands:"
echo "  npm run dev              # Start frontend and backend locally"
echo "  npm run test             # Run all tests"
echo "  npm run build            # Build frontend"
echo "  npm run deploy           # Deploy backend"
echo "  ./scripts/deploy.sh -h   # Show deployment help"
echo ""
echo "For more information, check the README.md file."
echo ""
print_success "Happy coding! 🔗✨"
echo ""
echo "Built with ❤️  by Jessie Borras"
echo "Website: https://jessiedev.xyz"