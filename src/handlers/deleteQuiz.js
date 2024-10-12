/*
const middy = require('@middy/core');

const { validateToken } = require('../middleware/validateToken');
const { sendResponse, sendError } = require('../responses/index');
const { checkIfQuizExists } = require('../utilities/quizUtils');
const { db } = require('../services/index');

const handler = middy(async (event, context) => {
  try {
    const quizId = event.pathParameters.quizId;
    const userId = event.userId;

    const quizExists = await checkIfQuizExists(quizId);

    if (!quizExists) {
      return sendError(404, {
        success: false,
        message: 'Quiz not found.',
      });
    }

    if (quizExists.creatorId !== userId) {
      return sendError(403, {
        success: false,
        message:
          'Access denied. You do not have permission to delete this quiz.',
      });
    }

    const deleteQuiz = {
      TableName: process.env.DYNAMODB_QUIZ_TABLE,
      Key: {
        quizId: quizId,
      },
    };

    await db.delete(deleteQuiz).promise();

    const questionParams = {
      TableName: process.env.DYNAMODB_QUESTION_TABLE,
      IndexName: process.env.DYNAMODB_QUESTION_INDEX,
      KeyConditionExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId,
      },
    };

    const allQuestionResult = await db.query(questionParams).promise();

    if (allQuestionResult.Count === 0) {
      return sendError(404, {
        success: false,
        message: 'Questions not found.',
      });
    }

    const questions = allQuestionResult.Items;

    const deletePromises = questions.map(async (question) => {
      const deleteParams = {
        TableName: process.env.DYNAMODB_QUESTION_TABLE,
        Key: {
          questionId: question.questionId,
        },
      };

      try {
        await db.delete(deleteParams).promise();
      } catch (error) {
        return sendError(500, {
          success: false,
          error: error.message,
          message: 'Could not delete questions.',
        });
      }
    });

    await Promise.all(deletePromises);

    return sendResponse(200, {
      success: true,
      message: `The quiz '${quizExists.quizName}' (ID: ${quizExists.quizId}) has been deleted.`,
    });
  } catch (error) {
    return sendError(500, {
      success: false,
      error: error.message,
      message: 'Could not delete quiz and questions.',
    });
  }
}).use(validateToken);

module.exports = { handler };
*/
