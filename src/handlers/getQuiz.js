import middy from '@middy/core';
import { GetCommand } from '@aws-sdk/lib-dynamodb'; // För att hämta alla quiz
import httpErrorHandler from '@middy/http-error-handler';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import { sendResponse, sendError } from '../responses/index.js';
import { db } from '../services/index.js';

export const handler = middy(async (event) => {
    const { quizId } = event.pathParameters; // Hämta quizId från URL:en

    if (!quizId) {
        return sendError(400, { message: 'Quiz ID is required' });
    }

    try {
        // Skicka en begäran för att hämta quiz med specifikt id från DynamoDB
        const dbResponse = await db.send(
            new GetCommand({
                TableName: process.env.DYNAMODB_QUIZZES_TABLE,
                Key: { quizId },
            })
        );

        const quiz = dbResponse.Item; // Det quiz som hämtades

        if (!quiz) {
            return sendError(404, { message: 'Quiz not found' });
        }

        // Returnera specifikt quiz i svaret
        return sendResponse(200, {
            message: 'Quiz successfully retrieved.',
            quiz, // Specifikt quiz
        });
    } catch (error) {
        console.error('Error retrieving quiz: ', error);

        return sendError(500, {
            message: 'Could not retrieve quiz.',
            error: JSON.stringify(error),
        });
    }
})
    .use(httpHeaderNormalizer())
    .use(httpErrorHandler());
