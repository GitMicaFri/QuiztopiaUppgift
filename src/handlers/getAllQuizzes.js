/*
const { sendResponse, sendError } = require('../responses/index');
const { db } = require('../services/index');

exports.handler = async (event, context) => {
  try {
    const params = {
      TableName: process.env.DYNAMODB_QUIZ_TABLE,
    };

    const result = await db.scan(params).promise();

    return sendResponse(200, {
      success: true,
      results: result.Items.length,
      quizzes: result.Items,
    });
  } catch (error) {
    return sendError(500, {
      success: false,
      error: error.message,
      message: 'Could not retrieve quizes.',
    });
  }
};
*/
