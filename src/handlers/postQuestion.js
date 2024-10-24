import middy from '@middy/core';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'; // Uppdaterar quizet
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import validator from '@middy/validator';
import { db } from '../services/index.js';
import { sendResponse, sendError } from '../responses/index.js';
import postQuestionSchema from '../schemas/postQuestionSchema.json' assert { type: 'json' };

export const handler = middy(async (event) => {
    const { quizId } = event.pathParameters; // Hämta quizId från url:en
    const { questionText, answer, longitude, latitude } = event.body; // Hämta frågedata från bodyn

    if (!quizId) {
        return sendError(400, { message: 'Quiz Id is required' });
    }

    try {
        // Förbered ny fråga
        const newQuestion = {
            questionText,
            answer,
            longitude,
            latitude,
        };

        // Uppdatera quizet i DynamoDB genom att lägga till en fråga
        await db.send(
            new UpdateCommand({
                TableName: process.env.DYNAMODB_QUIZZES_TABLE,
                Key: { quizId },
                UpdateExpression:
                    'SET questions = list_append(questions, :newQuestion)',
                ExpressionAttributeValues: {
                    ':newQuestion': [newQuestion], // lägg till nya frågan som ett objekt
                },
                ReturnValues: 'UPDATED_NEW', // returnera uppdaterade värden
            })
        );

        return sendResponse(200, {
            message: 'Question successfully added to the quiz.',
            quizId,
        });
    } catch (error) {
        console.error('Error adding question:', error);
        return sendError(500, {
            message: 'Could not add question to quiz.',
            error: JSON.stringify(error),
        });
    }
})
    .use(httpJsonBodyParser())
    .use(validator({ inputSchema: postQuestionSchema }))
    .use(httpHeaderNormalizer())
    .use(httpErrorHandler());
