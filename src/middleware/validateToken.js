import jwt from 'jsonwebtoken'; // JSON Web Token-bibliotek för att hantera JWT-verifiering
import { promisify } from 'util'; // promisify konverterar callback-baserade funktioner till promises
import { sendError } from '../responses/index.js'; // Funktioner för att hantera API-svar

const validateToken = {
  // Middleware som körs innan huvudlogiken
  before: async (request) => {
    try {
      // Hämta token från request-headers och ta bort "Bearer "-prefixet
      const authHeader = request.event.headers.authorization;

      // Kontrollera att headern finns och innehåller "Bearer "
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(401, {
          success: false,
          message: 'No or invalid token provided.', // Felmeddelande om token saknas eller är felaktig
        });
      }

      // Extrahera och verifiera JWT-token
      const token = authHeader.replace('Bearer ', ''); // Ta bort "Bearer "-delen
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      ); // Verifiera token med hemligheten

      // Lagra användarens ID (från den dekodade token) i request-objektet
      request.event.userId = decoded.userId;

      // Fortsätt om allt är okej
      return request.response;
    } catch (error) {
      // Hantera olika typer av JWT-relaterade fel
      if (error.name === 'TypeError') {
        return sendError(401, {
          success: false,
          message: 'No token provided.', // Om ingen token skickades
        });
      } else if (error.name === 'JsonWebTokenError') {
        return sendError(401, { success: false, message: 'Invalid token.' }); // Om token är ogiltig
      } else if (error.name === 'TokenExpiredError') {
        return sendError(401, {
          success: false,
          message: 'Token has expired.', // Om token har gått ut
        });
      } else {
        // För alla andra fel, logga dem och skicka ett allmänt serverfel
        console.error('Token validation error:', error);
        return sendError(500, {
          success: false,
          message: 'Server error during token validation.', // Serverfel vid token-verifiering
        });
      }
    }
  },

  // Middleware för att hantera fel som uppstår under körning
  onError: async (request) => {
    request.event.error = '401'; // Sätt ett 401-fel i event-objektet
    return sendError(401, {
      success: false,
      message: 'An error occurred during token validation.', // Standardfelmeddelande
    });
  },
};

module.exports = { validateToken }; // Exportera validateToken-modulen
