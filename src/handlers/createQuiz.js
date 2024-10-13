import middy from '@middy/core';
import { v4 as uuidv4 } from 'uuid';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpHeaderNormalizer from '@middy/http-header-normalizer';

import { validateToken } from '../middleware/validateToken.js';
import { sendResponse, sendError } from '../responses/index.js';

import { db } from '../services/index.js'; // DynamoDB-klient
import { PutCommand } from '@aws-sdk/lib-dynamodb'; // DynamoDB-query

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const schema = require('../schemas/postQuizSchema.json');

export const handler = middy(async (event) => {
  const requestBody = event.body;
  const { quizName, description, questions } = requestBody;
  const userId = event.userId;
  const quizId = uuidv4();

  const newQuiz = {
    quizId,
    quizName,
    description,
    creatorId: userId,
  };

  // En fråga innehåller: Frågan, svaret samt koordinater på kartan (longitud och latitud).

  try {
    const dbResponse = await db.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_QUIZZES_TABLE,
        Item: {
          quizId,
          quizName,
          description,
          questions,
        },
      })
    );

    // const putItemCommand = new PutItemCommand(putItemCommandInput);
    // const dbResponse = await dynamoDbClient.send(putItemCommand);

    return sendResponse(200, {
      message: 'Quiz successfully created.',
      quizId,
    });
  } catch (error) {
    console.error('Error creating quiz: ', error);

    return sendError(500, {
      message: 'Could not create quiz.',
      error: JSON.stringify(error),
    });
  }
})
  .use(validateToken)
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(
    validator({
      inputSchema: schema,
    })
  )
  .use(httpErrorHandler());
