/*
const { sendResponse, sendError } = require('../responses/index');
const { checkIfQuizExists } = require('../utilities/quizUtils');
const { db } = require('../services/index');

exports.handler = async (event, context) => {
  try {
    const quizId = event.pathParameters.quizId;

    const quiz = await checkIfQuizExists(quizId);

    if (!quiz) {
      return sendError(404, {
        success: false,
        message: 'Quiz not found.',
      });
    }

    const questionParams = {
      TableName: process.env.DYNAMODB_QUESTION_TABLE,
      IndexName: process.env.DYNAMODB_QUESTION_INDEX,
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
    };

    const questionResult = await db.query(questionParams).promise();

    if (questionResult.Count === 0) {
      return sendError(404, {
        success: false,
        message: 'Questions not found.',
      });
    }

    const questions = questionResult.Items;

    return sendResponse(200, {
      success: true,
      results: questions.length,
      quiz,
      questions,
    });
  } catch (error) {
    return sendError(500, {
      success: false,
      error: error.message,
      message: 'Could not retrieve quiz and questions.',
    });
  }
};
*/
