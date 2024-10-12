/*const { sendResponse, sendError } = require('../responses/index');
const { db } = require('../services/index');

const checkIfQuizExists = async (quizId) => {
  try {
    const quizParams = {
      TableName: process.env.DYNAMODB_QUIZ_TABLE,
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
    };

    const quizResult = await db.query(quizParams).promise();

    if (quizResult.Count === 0) {
      return false;
    }

    return quizResult.Items[0];
  } catch (error) {
    return sendError(500, {
      success: false,
      error: error.message,
      message: 'Could not retrieve quiz.',
    });
  }
};

module.exports = {
  checkIfQuizExists: checkIfQuizExists,
};
*/
