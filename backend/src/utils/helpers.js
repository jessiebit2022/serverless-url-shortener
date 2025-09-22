const { nanoid, customAlphabet } = require('nanoid');
const validator = require('validator');

// Custom alphabet for short codes (no confusing characters)
const nanoidCustom = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz', 6);

/**
 * Generate a random short code
 */
function generateShortCode(length = 6) {
  if (length !== 6) {
    const customAlphabet = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz', length);
    return customAlphabet();
  }
  return nanoidCustom();
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Add protocol if missing
  let urlToValidate = url.trim();
  if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
    urlToValidate = 'https://' + urlToValidate;
  }

  return validator.isURL(urlToValidate, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: false,
    host_whitelist: false,
    host_blacklist: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false
  });
}

/**
 * Normalize URL by adding protocol if missing
 */
function normalizeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

/**
 * Validate custom short code
 */
function isValidCustomCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Check length (3-20 characters)
  if (code.length < 3 || code.length > 20) {
    return false;
  }

  // Check pattern (alphanumeric, hyphens, underscores only)
  const pattern = /^[a-zA-Z0-9\-_]+$/;
  return pattern.test(code);
}

/**
 * Create HTTP response object
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

/**
 * Create error response
 */
function createErrorResponse(statusCode, message, code = null) {
  return createResponse(statusCode, {
    error: true,
    message,
    ...(code && { code })
  });
}

/**
 * Create success response
 */
function createSuccessResponse(data, statusCode = 200) {
  return createResponse(statusCode, data);
}

/**
 * Parse request body
 */
function parseRequestBody(body) {
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Get base URL for short URLs
 */
function getBaseUrl(event) {
  // Check for custom domain in environment
  if (process.env.CUSTOM_DOMAIN) {
    return process.env.CUSTOM_DOMAIN;
  }

  // Use API Gateway URL
  const headers = event.headers || {};
  const host = headers.Host || headers.host;
  const stage = event.requestContext?.stage || 'prod';
  
  if (host) {
    const protocol = headers['X-Forwarded-Proto'] || 'https';
    return `${protocol}://${host}${stage !== 'prod' ? `/${stage}` : ''}`;
  }

  // Fallback
  return 'https://your-domain.com';
}

module.exports = {
  generateShortCode,
  isValidUrl,
  normalizeUrl,
  isValidCustomCode,
  createResponse,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
  getBaseUrl
};