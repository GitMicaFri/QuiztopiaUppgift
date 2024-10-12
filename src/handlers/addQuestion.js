/*const middy = require('@middy/core');
const { nanoid } = require('nanoid');
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const httpHeaderNormalizer = require('@middy/http-header-normalizer');

const { db } = require('../services/index');
const { validateToken } = require('../middleware/validateToken');
const { sendResponse, sendError } = require('../responses/index');
const schema = require('../schemas/postAdditionalQuestionsScema.json');
const { checkIfQuizExists } = require('../utilities/quizUtils');

const handler = middy(async (event) => {
  try {
    const requestBody = event.body;
    const { questions } = requestBody;

    const userId = event.userId;
    const quizId = event.pathParameters.quizId;

    const quiz = await checkIfQuizExists(quizId);

    if (!quiz) {
      return sendError(404, {
        success: false,
        message: 'Quiz not found.',
      });
    }

    if (quiz.creatorId !== userId) {
      return sendError(403, {
        success: false,
        message: 'Access denied. You do not have permission to edit this quiz.',
      });
    }

    const questionParams = {
      RequestItems: {
        [process.env.DYNAMODB_QUESTION_TABLE]: questions.map((question) => ({
          PutRequest: {
            Item: {
              questionId: nanoid(3),
              quizId: quizId,
              questionText: question.questionText,
              answer: question.answer,
              latitude: question.latitude,
              longitude: question.longitude,
            },
          },
        })),
      },
    };

    const questionsResult = await db.batchWrite(questionParams).promise();

    if (questionsResult.UnprocessedItems.roomDb) {
      return sendError(500, {
        success: false,
        message: 'All questions could not be saved.',
      });
    }

    return sendResponse(200, {
      success: true,
      message: `Questions successfully added to quiz ${quiz.quizName}.`,
    });
  } catch (error) {
    return sendError(400, {
      success: false,
      error: error.message,
      message: 'Could not add your questions.',
    });
  }
})
  .use(validateToken)
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema(schema),
    })
  )
  .use(httpErrorHandler());

module.exports = { handler };
*/
