import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Skapa en instans av DynamoDBClient
const client = new DynamoDBClient();

// Skapa DynamoDBDocumentClient från DynamoDBClient-instansen
const db = DynamoDBDocumentClient.from(client);

// Exportera db så att det kan användas i andra filer
export { db };
