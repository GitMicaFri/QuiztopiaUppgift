import jwt from 'jsonwebtoken'; // Importerar jsonwebtoken-biblioteket

// Skapar en JWT-token med ett specifikt användar-ID
export const createToken = (userId) => {
  // Kontrollera att JWT_SECRET är definierad
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined'); // Felmeddelande om token saknas
  }

  // Skapa och returnera ett token, använd process.env.JWT_SECRET som key
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token gäller i 1 timme
};
