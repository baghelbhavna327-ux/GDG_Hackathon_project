/**
 * HealthChain AI - Node.js to FastAPI AI Microservice Client
 * 
 * Cleanly forwards prediction and emergency simulation requests to the Python FastAPI
 * AI Prediction Microservice running at http://localhost:8000 without duplicating ML code.
 */

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.FASTAPI_AI_URL || 'http://localhost:8000';

/**
 * Predicts medicine demand & stockout risk via FastAPI
 */
const predictDemand = async (payload) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`FastAPI Prediction error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AI Service Error]', error.message);
    throw error;
  }
};

/**
 * Simulates emergency footfall & consumption surge via FastAPI
 */
const simulateEmergency = async (payload) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/predict/emergency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`FastAPI Emergency Simulation error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[AI Service Emergency Error]', error.message);
    throw error;
  }
};

/**
 * Checks operational health of FastAPI AI Prediction Service
 */
const checkAIHealth = async () => {
  try {
    const response = await fetch(`${FASTAPI_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
};

module.exports = {
  predictDemand,
  simulateEmergency,
  checkAIHealth
};
