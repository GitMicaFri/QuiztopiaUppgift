import jwt from 'jsonwebtoken'; // Importerar jsonwebtoken-biblioteket

// Skapar JWT-token med ett specifikt id
export const createToken = (userId, userName) => {
    // Kontrollera att JWT_SECRET är definierad
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined'); // Felmeddelande om token saknas
    }

    // Skapa och returnera ett token som innehåller både userId och userName
    return jwt.sign(
        { userId, userName }, // Inkludera både userId och userName i tokens payload
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token gäller i 1 timme
    );
};
