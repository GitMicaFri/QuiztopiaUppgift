import middy from '@middy/core';
import { ScanCommand } from '@aws-sdk/lib-dynamodb'; // För att hämta alla quiz
import httpErrorHandler from '@middy/http-error-handler';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import { sendResponse, sendError } from '../responses/index.js';
import { db } from '../services/index.js';

export const handler = middy(async (event) => {
    try {
        // Skicka en begäran för att hämta alla quiz från DynamoDB
        const dbResponse = await db.send(
            new ScanCommand({
                TableName: process.env.DYNAMODB_QUIZZES_TABLE,
            })
        );

        const quizzes = dbResponse.Items; // Alla quiz som hämtades

        // Returnera alla quiz i svaret
        return sendResponse(200, {
            message: 'Quizzes successfully retrieved.',
            quizzes, // Lista med quiz
        });
    } catch (error) {
        console.error('Error retrieving quizzes: ', error);

        return sendError(500, {
            message: 'Could not retrieve quizzes.',
            error: JSON.stringify(error),
        });
    }
})
    .use(httpHeaderNormalizer())
    .use(httpErrorHandler());
