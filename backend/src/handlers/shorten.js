const { 
  createUrl, 
  shortCodeExists 
} = require('../utils/dynamodb');

const {
  generateShortCode,
  isValidUrl,
  normalizeUrl,
  isValidCustomCode,
  createErrorResponse,
  createSuccessResponse,
  parseRequestBody,
  getBaseUrl
} = require('../utils/helpers');

/**
 * Lambda handler for creating short URLs
 */
module.exports.handler = async (event) => {
  console.log('Shorten URL request:', JSON.stringify(event, null, 2));

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createSuccessResponse({}, 204);
  }

  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    // Parse request body
    const body = parseRequestBody(event.body);
    const { url, customCode } = body;

    // Validate required fields
    if (!url) {
      return createErrorResponse(400, 'URL is required');
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return createErrorResponse(400, 'Invalid URL format');
    }

    // Normalize URL
    const normalizedUrl = normalizeUrl(url);

    let shortCode;

    // Handle custom short code
    if (customCode) {
      if (!isValidCustomCode(customCode)) {
        return createErrorResponse(400, 'Invalid custom code. Use 3-20 characters with letters, numbers, hyphens, or underscores only.');
      }

      // Check if custom code already exists
      const exists = await shortCodeExists(customCode);
      if (exists) {
        return createErrorResponse(409, 'Custom short code already exists');
      }

      shortCode = customCode;
    } else {
      // Generate random short code
      let attempts = 0;
      const maxAttempts = 5;

      do {
        shortCode = generateShortCode();
        attempts++;
        
        if (attempts >= maxAttempts) {
          return createErrorResponse(500, 'Unable to generate unique short code');
        }
      } while (await shortCodeExists(shortCode));
    }

    // Create URL in database
    const urlRecord = await createUrl(shortCode, normalizedUrl, !!customCode);

    // Build response
    const baseUrl = getBaseUrl(event);
    const shortUrl = `${baseUrl}/${shortCode}`;

    const response = {
      shortCode,
      shortUrl,
      originalUrl: normalizedUrl,
      createdAt: urlRecord.createdAt
    };

    console.log('URL shortened successfully:', response);
    return createSuccessResponse(response, 201);

  } catch (error) {
    console.error('Error shortening URL:', error);

    if (error.message === 'Short code already exists') {
      return createErrorResponse(409, 'Short code already exists');
    }

    if (error.message === 'Invalid JSON in request body') {
      return createErrorResponse(400, error.message);
    }

    return createErrorResponse(500, 'Internal server error');
  }
};