// src/responses/index.js

// Funktion för att skicka ett lyckat svar
export const sendResponse = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

// Funktion för att skicka ett felmeddelande
export const sendError = (statusCode, error) => {
  return {
    statusCode,
    body: JSON.stringify(error),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
