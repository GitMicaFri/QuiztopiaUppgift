import jwt from 'jsonwebtoken'; // Importerar jsonwebtoken-biblioteket

// Skapar en JWT-token med ett specifikt användar-ID
export const createToken = (userId) => {
  // Kontrollera att JWT_SECRET är definierad
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined'); // Om hemligheten saknas, kasta ett fel
  }

  // Skapa och returnera en token, använd process.env.JWT_SECRET som hemlig nyckel
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token gäller i 1 timme
};
