import middy from '@middy/core';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'; // För att hämta alla quiz
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
        // Skicka en begäran för att ta bort quiz från DynamoDB
        await db.send(
            new DeleteCommand({
                TableName: process.env.DYNAMODB_QUIZZES_TABLE, // DynamoDB-tabell med quizzen
                Key: { quizId },
            })
        );

        // Returnera bekräftelse på att quizet är borttaget
        return sendResponse(200, {
            message: 'Quiz successfully deleted.',
            quizId, // Specifikt quizId
        });
    } catch (error) {
        console.error('Error deleting quiz: ', error);

        return sendError(500, {
            message: 'Could not delete quiz.',
            error: JSON.stringify(error),
        });
    }
})
    .use(validateToken) // Verifierar att användaren är inloggad
    .use(httpHeaderNormalizer()) // Normaliserar HTTP-headrar
    .use(httpErrorHandler()); // Hanterar eventuella fel
