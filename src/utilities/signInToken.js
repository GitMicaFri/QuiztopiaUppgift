import jwt from 'jsonwebtoken'; // Importerar jsonwebtoken-biblioteket

// Skapar en JWT-token med ett specifikt användar-ID och användarnamn
export const createToken = (userId, userName) => {
    // Kontrollera att JWT_SECRET är definierad
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined'); // Felmeddelande om hemligheten saknas
    }

    // Skapa och returnera ett token som innehåller både userId och userName
    return jwt.sign(
        { userId, userName }, // Inkludera både userId och userName i tokenens payload
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token gäller i 1 timme
    );
};
