import middy from '@middy/core';
import { GetCommand } from '@aws-sdk/lib-dynamodb'; // För att hämta alla quiz
import httpErrorHandler from '@middy/http-error-handler';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import { validateToken } from '../middleware/validateToken.js'; // Middleware för token-verifiering
import { sendResponse, sendError } from '../responses/index.js'; // Response-hantering
import { db } from '../services/index.js'; // DynamoDB-klient

export const handler = middy(async (event) => {
    const { quizId } = event.pathParameters; // Hämta quizId från URL:en

    if (!quizId) {
        return sendError(400, { message: 'Quiz ID is required' });
    }

    try {
        // Skicka en begäran för att hämta quiz från DynamoDB
        const dbResponse = await db.send(
            new GetCommand({
                TableName: process.env.DYNAMODB_QUIZZES_TABLE, // Din DynamoDB-tabell med quizzen
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
    .use(validateToken) // Verifierar att användaren är inloggad
    .use(httpHeaderNormalizer()) // Normaliserar HTTP-headrar
    .use(httpErrorHandler()); // Hanterar eventuella fel
