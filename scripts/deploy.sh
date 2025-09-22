#!/bin/bash

# Serverless URL Shortener Deployment Script
# Author: Jessie Borras

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
STAGE="dev"
REGION="us-east-1"
PROFILE=""
CUSTOM_DOMAIN=""
DEPLOY_FRONTEND=false
DEPLOY_BACKEND=true
DEPLOY_INFRA=false

# Function to print colored output
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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --stage STAGE          Deployment stage (dev, staging, prod) [default: dev]"
    echo "  -r, --region REGION        AWS region [default: us-east-1]"
    echo "  -p, --profile PROFILE      AWS profile to use"
    echo "  -d, --domain DOMAIN        Custom domain for short URLs"
    echo "  -f, --frontend             Deploy frontend only"
    echo "  -b, --backend              Deploy backend only [default]"
    echo "  -i, --infrastructure       Deploy infrastructure only"
    echo "  -a, --all                  Deploy everything (backend + frontend + infrastructure)"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --stage prod --region us-west-2 --all"
    echo "  $0 --stage dev --backend"
    echo "  $0 --stage prod --frontend --domain https://short.example.com"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stage)
            STAGE="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -p|--profile)
            PROFILE="$2"
            shift 2
            ;;
        -d|--domain)
            CUSTOM_DOMAIN="$2"
            shift 2
            ;;
        -f|--frontend)
            DEPLOY_FRONTEND=true
            DEPLOY_BACKEND=false
            shift
            ;;
        -b|--backend)
            DEPLOY_BACKEND=true
            DEPLOY_FRONTEND=false
            shift
            ;;
        -i|--infrastructure)
            DEPLOY_INFRA=true
            DEPLOY_BACKEND=false
            DEPLOY_FRONTEND=false
            shift
            ;;
        -a|--all)
            DEPLOY_BACKEND=true
            DEPLOY_FRONTEND=true
            DEPLOY_INFRA=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate stage
if [[ ! "$STAGE" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid stage: $STAGE. Must be dev, staging, or prod."
    exit 1
fi

# Set AWS profile if provided
if [[ -n "$PROFILE" ]]; then
    export AWS_PROFILE="$PROFILE"
    print_status "Using AWS profile: $PROFILE"
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    print_error "AWS CLI is not configured or credentials are invalid."
    print_error "Please run 'aws configure' or set AWS environment variables."
    exit 1
fi

# Get AWS account info
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
print_status "Deploying to AWS Account: $AWS_ACCOUNT_ID"
print_status "Region: $REGION"
print_status "Stage: $STAGE"

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js 18.x or later."
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
if [[ $(echo "$NODE_VERSION" | cut -d. -f1) -lt 18 ]]; then
    print_error "Node.js version $NODE_VERSION is not supported. Please install Node.js 18.x or later."
    exit 1
fi

print_success "Node.js version: $NODE_VERSION"

# Check Serverless Framework
if ! command -v serverless >/dev/null 2>&1; then
    print_warning "Serverless Framework is not installed globally. Installing..."
    npm install -g serverless
fi

print_success "Prerequisites check passed"

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$SCRIPT_DIR/.."
cd "$PROJECT_DIR"

print_status "Project directory: $(pwd)"

# Deploy infrastructure if requested
if [[ "$DEPLOY_INFRA" == true ]]; then
    print_status "Deploying infrastructure..."
    
    STACK_NAME="url-shortener-infrastructure-$STAGE"
    TEMPLATE_FILE="infrastructure/cloudformation.yml"
    
    if [[ ! -f "$TEMPLATE_FILE" ]]; then
        print_error "Infrastructure template not found: $TEMPLATE_FILE"
        exit 1
    fi
    
    PARAMS="Stage=$STAGE ServiceName=url-shortener"
    if [[ -n "$CUSTOM_DOMAIN" ]]; then
        PARAMS="$PARAMS CustomDomain=$CUSTOM_DOMAIN"
    fi
    
    aws cloudformation deploy \
        --template-file "$TEMPLATE_FILE" \
        --stack-name "$STACK_NAME" \
        --parameter-overrides $PARAMS \
        --capabilities CAPABILITY_IAM \
        --region "$REGION" \
        --tags Author="Jessie Borras" Project="Serverless URL Shortener" Stage="$STAGE"
    
    if [[ $? -eq 0 ]]; then
        print_success "Infrastructure deployed successfully"
    else
        print_error "Infrastructure deployment failed"
        exit 1
    fi
fi

# Deploy backend if requested
if [[ "$DEPLOY_BACKEND" == true ]]; then
    print_status "Deploying backend..."
    
    cd backend
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Deploy with Serverless Framework
    DEPLOY_CMD="serverless deploy --stage $STAGE --region $REGION"
    
    if [[ -n "$CUSTOM_DOMAIN" ]]; then
        DEPLOY_CMD="$DEPLOY_CMD --param=\"domain=$CUSTOM_DOMAIN\""
    fi
    
    print_status "Running: $DEPLOY_CMD"
    eval $DEPLOY_CMD
    
    if [[ $? -eq 0 ]]; then
        print_success "Backend deployed successfully"
        
        # Get API Gateway URL
        API_URL=$(serverless info --stage $STAGE --region $REGION | grep -o 'https://[^/]*\.execute-api\.[^/]*\.amazonaws\.com/[^/]*' | head -1)
        if [[ -n "$API_URL" ]]; then
            print_success "API Gateway URL: $API_URL"
            echo "$API_URL" > "../.api-url"
        fi
    else
        print_error "Backend deployment failed"
        exit 1
    fi
    
    cd ..
fi

# Deploy frontend if requested
if [[ "$DEPLOY_FRONTEND" == true ]]; then
    print_status "Deploying frontend..."
    
    cd frontend
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Set environment variables
    if [[ -f "../.api-url" ]]; then
        API_URL=$(cat "../.api-url")
        echo "NEXT_PUBLIC_API_BASE_URL=$API_URL" > .env.local
        print_status "Configured API URL: $API_URL"
    fi
    
    if [[ -n "$CUSTOM_DOMAIN" ]]; then
        echo "NEXT_PUBLIC_SHORT_DOMAIN=$CUSTOM_DOMAIN" >> .env.local
        print_status "Configured custom domain: $CUSTOM_DOMAIN"
    fi
    
    # Build and export
    print_status "Building frontend..."
    npm run build
    
    if [[ $? -eq 0 ]]; then
        npm run export
        print_success "Frontend built successfully"
        print_status "Static files are in: frontend/dist"
        print_warning "Please upload the contents of frontend/dist to your hosting service"
        print_warning "Popular options: AWS S3 + CloudFront, Vercel, Netlify"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
fi

# Final status
print_success "Deployment completed successfully!"

if [[ "$DEPLOY_BACKEND" == true ]]; then
    print_status "Backend deployed to stage: $STAGE"
fi

if [[ "$DEPLOY_FRONTEND" == true ]]; then
    print_status "Frontend built and ready for deployment"
fi

if [[ "$DEPLOY_INFRA" == true ]]; then
    print_status "Infrastructure deployed"
fi

print_status "Next steps:"
if [[ "$DEPLOY_FRONTEND" == true ]]; then
    echo "  1. Upload frontend/dist/* to your hosting service"
fi
if [[ "$DEPLOY_BACKEND" == true ]]; then
    echo "  2. Test your API endpoints"
    echo "  3. Update your frontend configuration with the API URL"
fi
echo "  4. Visit your URL shortener and test the functionality"

print_success "Happy shortening! 🔗"