const { getUrlStats } = require('../utils/dynamodb');
const {
  createErrorResponse,
  createSuccessResponse
} = require('../utils/helpers');

/**
 * Lambda handler for getting URL statistics
 */
module.exports.handler = async (event) => {
  console.log('Stats request:', JSON.stringify(event, null, 2));

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createSuccessResponse({}, 204);
  }

  if (event.httpMethod !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  const shortCode = event.pathParameters?.shortCode;

  if (!shortCode) {
    return createErrorResponse(400, 'Short code is required');
  }

  try {
    const stats = await getUrlStats(shortCode);
    
    console.log('Stats retrieved successfully:', stats);
    return createSuccessResponse(stats);

  } catch (error) {
    console.error('Error retrieving stats:', error);

    if (error.message === 'URL not found') {
      return createErrorResponse(404, 'Short URL not found');
    }

    return createErrorResponse(500, 'Internal server error');
  }
};