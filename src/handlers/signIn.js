import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import middy from '@middy/core';
import bcrypt from 'bcryptjs'; // För att jämföra lösenord
import validator from '@middy/validator'; // Validering
import httpJsonBodyParser from '@middy/http-json-body-parser'; // För att tolka JSON body
import httpErrorHandler from '@middy/http-error-handler'; // Hantera fel i HTTP-anrop
import httpHeaderNormalizer from '@middy/http-header-normalizer'; // Normaliserar HTTP-header
import { QueryCommand } from '@aws-sdk/lib-dynamodb'; // DynamoDB-query

import { sendResponse, sendError } from '../responses/index.js';
import { db } from '../services/index.js'; // DynamoDB-klient
import { createToken } from '../utilities/signInToken.js'; // JWT token-generator

import { createRequire } from 'module';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const require = createRequire(import.meta.url);
const schema = require('../schemas/signInSchema.json');

// Huvudhandler för signIn-funktionen
export const handler = middy(async (event) => {
  try {
    const requestBody = event.body; // Tolkar JSON body från inkommande HTTP-anrop

    if (!requestBody.userName) {
      return sendError(400, { message: 'Username required' });
    }
    if (!requestBody.password) {
      return sendError(400, { message: 'Password required' });
    }

    // Kontrollera om användaren finns i databasen
    const userResult = await db.send(
      new QueryCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE, // DynamoDB-tabellen för användare
        IndexName: process.env.DYNAMODB_USER_INDEX, // Sekundärt index för att söka på användarnamn
        KeyConditionExpression: 'userName = :userName', // Sökvillkor
        ExpressionAttributeValues: {
          ':userName': requestBody.userName, // Användarnamnet att söka efter
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

    // Kolla lösenord
    const isPasswordValid = await bcrypt.compare(
      requestBody.password,
      user.password
    );
    if (!isPasswordValid) {
      return sendError(401, {
        message: 'Passwords don´t match',
      });
    }

    const token = jwt.sign({ userId: user.userId }, jwtSecret, {
      expiresIn: '12h',
    });

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
})
  .use(httpHeaderNormalizer()) // Normalisera HTTP-header
  .use(httpJsonBodyParser()) // Tolka JSON body
  .use(validator({ inputSchema: schema })) // Validera mot JSON-schema
  .use(httpErrorHandler()); // Hantera eventuella fel
