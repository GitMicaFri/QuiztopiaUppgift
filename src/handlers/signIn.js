import dotenv from 'dotenv';
dotenv.config(); // Ladda miljövariabler från .env-fil
import middy from '@middy/core';
import bcrypt from 'bcryptjs'; // För att jämföra lösenord
import httpJsonBodyParser from '@middy/http-json-body-parser'; // För att tolka JSON body
import { QueryCommand } from '@aws-sdk/lib-dynamodb'; // DynamoDB-query
import { sendResponse, sendError } from '../responses/index.js';
import { db } from '../services/index.js';
import { createToken } from '../utilities/signInToken.js'; // JWT token-generator
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const schema = require('../schemas/signInSchema.json');

// Huvudhandler för signIn-funktionen
const baseHandler = async (event) => {
    console.log('Full event:', JSON.stringify(event, null, 2)); // Logga hela eventet

    try {
        const requestBody =
            typeof event.body === 'string'
                ? JSON.parse(event.body)
                : event.body; // Tolkar JSON body från inkommande HTTP-anrop

        if (!requestBody.userName) {
            return sendError(400, { message: 'Username required' });
        }
        if (!requestBody.password) {
            return sendError(400, { message: 'Password required' });
        }

        // Kontrollera om användaren finns i databasen
        const userResult = await db.send(
            new QueryCommand({
                TableName: process.env.DYNAMODB_USERS_TABLE,
                IndexName: process.env.DYNAMODB_USER_INDEX,
                KeyConditionExpression: 'userName = :userName',
                ExpressionAttributeValues: {
                    ':userName': requestBody.userName,
                },
            })
        );

        const user = userResult.Items.find(
            (item) => item.userName === requestBody.userName
        );

        if (!user) {
            return sendError(401, {
                message: 'User doesn´t exist',
            });
        }

        // Kolla lösenordet
        const isPasswordValid = await bcrypt.compare(
            requestBody.password,
            user.password
        );
        if (!isPasswordValid) {
            return sendError(401, {
                message: 'Passwords don´t match',
            });
        }

        const token = createToken(user.userId); // Skapa JWT-token med createToken

        return sendResponse(200, {
            success: true,
            message: 'Login successful.',
            user: { userId: user.userId, userName: user.userName },
            token,
        });
    } catch (error) {
        console.log('Invalid JSON format:', event.body); // Loggar felaktig JSON
        return sendError(400, {
            success: false,
            message: 'Invalid JSON body format.',
        });
    }
};

// Wrappa baseHandler med Middy och middleware
export const handler = middy(baseHandler).use(httpJsonBodyParser()); // Tolka JSON body
