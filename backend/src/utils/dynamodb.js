const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const URLS_TABLE = process.env.URLS_TABLE;

/**
 * Create a new URL mapping in DynamoDB
 */
async function createUrl(shortCode, originalUrl, customCode = false) {
  const timestamp = new Date().toISOString();
  
  const item = {
    shortCode,
    originalUrl,
    clicks: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    isCustom: customCode,
    ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
  };

  const params = {
    TableName: URLS_TABLE,
    Item: item,
    ConditionExpression: 'attribute_not_exists(shortCode)'
  };

  try {
    await dynamodb.put(params).promise();
    return item;
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      throw new Error('Short code already exists');
    }
    throw error;
  }
}

/**
 * Get URL by short code
 */
async function getUrl(shortCode) {
  const params = {
    TableName: URLS_TABLE,
    Key: { shortCode }
  };

  const result = await dynamodb.get(params).promise();
  return result.Item;
}

/**
 * Increment click count for a URL
 */
async function incrementClicks(shortCode) {
  const timestamp = new Date().toISOString();
  
  const params = {
    TableName: URLS_TABLE,
    Key: { shortCode },
    UpdateExpression: 'ADD clicks :inc SET updatedAt = :timestamp, lastClicked = :timestamp',
    ExpressionAttributeValues: {
      ':inc': 1,
      ':timestamp': timestamp
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamodb.update(params).promise();
  return result.Attributes;
}

/**
 * Check if a short code exists
 */
async function shortCodeExists(shortCode) {
  const params = {
    TableName: URLS_TABLE,
    Key: { shortCode },
    ProjectionExpression: 'shortCode'
  };

  const result = await dynamodb.get(params).promise();
  return !!result.Item;
}

/**
 * Get URL statistics
 */
async function getUrlStats(shortCode) {
  const url = await getUrl(shortCode);
  
  if (!url) {
    throw new Error('URL not found');
  }

  return {
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    clicks: url.clicks || 0,
    createdAt: url.createdAt,
    lastClicked: url.lastClicked,
    isCustom: url.isCustom || false
  };
}

module.exports = {
  createUrl,
  getUrl,
  incrementClicks,
  shortCodeExists,
  getUrlStats
};