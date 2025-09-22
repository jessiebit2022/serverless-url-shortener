const { 
  getUrl, 
  incrementClicks 
} = require('../utils/dynamodb');

const {
  createErrorResponse,
  createResponse
} = require('../utils/helpers');

/**
 * Lambda handler for redirecting short URLs to original URLs
 */
module.exports.handler = async (event) => {
  console.log('Redirect request:', JSON.stringify(event, null, 2));

  const shortCode = event.pathParameters?.shortCode;

  if (!shortCode) {
    return createErrorResponse(400, 'Short code is required');
  }

  try {
    // Get URL from database
    const urlRecord = await getUrl(shortCode);

    if (!urlRecord) {
      return createErrorResponse(404, 'Short URL not found');
    }

    // Increment click count (fire and forget)
    incrementClicks(shortCode).catch(error => {
      console.error('Error incrementing clicks:', error);
    });

    // Log the redirect
    console.log(`Redirecting ${shortCode} to ${urlRecord.originalUrl}`);

    // Return redirect response
    return createResponse(302, '', {
      'Location': urlRecord.originalUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

  } catch (error) {
    console.error('Error during redirect:', error);
    return createErrorResponse(500, 'Internal server error');
  }
};