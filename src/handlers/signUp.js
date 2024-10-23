import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import middy from '@middy/core'; // Middy för att använda middleware i Lambda-funktioner
import bcrypt from 'bcryptjs'; // Bcryptjs för att hasha lösenord
import validator from '@middy/validator'; // Validator för att validera inkommande förfrågningar
import httpJsonBodyParser from '@middy/http-json-body-parser'; // Middleware för att tolka JSON i HTTP body
import httpErrorHandler from '@middy/http-error-handler'; // Middleware för att hantera fel och skicka meningsfulla HTTP-svar
import httpHeaderNormalizer from '@middy/http-header-normalizer'; // Normaliserar HTTP-headrar (t.ex. versaler/små bokstäver)
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'; // DynamoDB-kommandon för Query och Put

// Importerar anpassade moduler för att hantera svar och databasoperationer
import { sendResponse, sendError } from '../responses/index.js';
import { db } from '../services/index.js'; // DynamoDB-klient
//import { createToken } from '../utilities/signInToken.js'; // Skapar en JWT token
import { createRequire } from 'module';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

// JSON-schema för att validera inkommande data
const require = createRequire(import.meta.url);
const schema = require('../schemas/signUpSchema.json');

// Huvudhandler för sign-up funktionen, middleware-kedjan börjar här
export const handler = middy(async (event) => {
    try {
        const requestBody = event.body; // Tolkar JSON body från inkommande HTTP-anrop

        // Kontrollera att lösenord och bekräftelselösenord matchar
        if (requestBody.password !== requestBody.passwordConfirm) {
            return sendError(400, {
                success: false,
                message: 'Passwords do not match.', // Skickar ett felmeddelande om de inte matchar
            });
        }

        // Genererar ett unikt ID för användaren med uuid
        const userId = uuidv4();

        // Skapar ett nytt användarobjekt med data från requesten
        const newUser = {
            userId, // Nytt användar-ID
            userName: requestBody.userName, // Användarnamn från request
            password: requestBody.password, // Lösenord (kommer att hashas senare)
            createdAt: new Date().toISOString(), // Tidsstämpel för när kontot skapades
            updatedAt: new Date().toISOString(), // Tidsstämpel för senaste uppdatering
        };

        // Kontrollera om användarnamnet redan finns i DynamoDB
        const isUserExists = await db.send(
            new QueryCommand({
                TableName: process.env.DYNAMODB_USERS_TABLE, // DynamoDB-tabellen för användare
                IndexName: process.env.DYNAMODB_USER_INDEX, // Sekundärt index för att söka på användarnamn
                KeyConditionExpression: 'userName = :userName', // Sök villkor
                ExpressionAttributeValues: {
                    ':userName': newUser.userName, // Användarnamnet att söka efter
                },
            })
        );

        // Om användarnamnet redan finns, returnera ett felmeddelande
        if (isUserExists.Items.length > 0) {
            return sendError(400, {
                success: false,
                message: 'Username already exists.', // Felmeddelande om användarnamnet är upptaget
            });
        }

        // Hashar användarens lösenord för att inte lagra det i klartext
        newUser.password = await bcrypt.hash(newUser.password, 12);

        // Förbereder parametern för att lägga till den nya användaren i DynamoDB
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE, // DynamoDB-tabellen där användaren ska sparas
            Item: newUser, // Ny användardata som ska sparas
        };

        // Spara ny användare i DynamoDB med PutCommand
        await db.send(new PutCommand(params));

        // Tar bort känsliga fält från svaret (lösenord och lösenordsbekräftelse)
        newUser.passwordConfirm = undefined;
        newUser.password = undefined;

        // Returnerar ett lyckat svar med användaruppgifter och token
        return sendResponse(200);
    } catch (error) {
        // Om indexet backfylls, returnera ett 503-felmeddelande (Service Unavailable)
        if (
            error.message.includes(
                'Cannot read from backfilling global secondary index'
            )
        ) {
            return sendError(503, {
                success: false,
                message:
                    'The system is currently updating. Please try again later.',
            });
        }

        // Felhantering: Om något går fel, returnera ett felmeddelande
        return sendError(500, {
            success: false,
            errorMessage: error.message, // Specifikt felmeddelande för felsökning
            error: 'User registration failed.', // Allmänt felmeddelande
        });
    }
})
    // Middleware för att normalisera HTTP-headrar (exempelvis göra dem skiftlägesokänsliga)
    .use(httpHeaderNormalizer())
    // Middleware för att tolka JSON i inkommande HTTP-body
    .use(httpJsonBodyParser())
    // Middleware för att validera inkommande förfrågningar mot ett JSON-schema
    .use(
        validator({
            inputSchema: schema, // Validera mot JSON-schemat
        })
    )
    // Middleware för att hantera eventuella fel som uppstår under hanteringen av förfrågningar
    .use(httpErrorHandler());
