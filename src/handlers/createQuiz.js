const middy = require('@middy/core');
const { nanoid } = require('nanoid');
const validator = require('@middy/validator');
const { transpileSchema } = require('@middy/validator/transpile');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httpErrorHandler = require('@middy/http-error-handler');
const httpHeaderNormalizer = require('@middy/http-header-normalizer');

const { db } = require('../services/index');
const { validateToken } = require('../middleware/validateToken');
const { sendResponse, sendError } = require('../responses/index');
const schema = require('../schemas/postNewQuizSchema.json');

const handler = middy(async (event) => {
  try {
    const requestBody = event.body;
    const { quizName, description, questions } = requestBody;
    const userId = event.userId;
    const quizId = nanoid(2);

    const newQuiz = {
      quizId,
      quizName,
      description,
      creatorId: userId,
    };

    const params = {
      TableName: process.env.DYNAMODB_QUIZ_TABLE,
      Item: newQuiz,
    };

    await db.put(params).promise();

    // Spara frågorna
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
      message: 'Quiz successfully created.',
      quiz: newQuiz,
    });
  } catch (error) {
    return sendError(400, {
      success: false,
      error: error.message,
      message: 'Could not save your quiz.',
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
