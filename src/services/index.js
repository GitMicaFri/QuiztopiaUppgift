import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();

const db = DynamoDBDocumentClient.from(client);

// Exportera db så att detta kan användas i andra filer
export { db };
