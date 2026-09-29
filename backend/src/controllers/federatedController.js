const dotenv = require('dotenv');
dotenv.config();

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.FASTAPI_AI_URL || 'http://localhost:8000';

/**
 * Diagnostic logger for Node -> FastAPI communication
 */
const logRequest = (method, path, status, extra = '') => {
  console.log(`[Node -> FastAPI] ${method} ${FASTAPI_URL}${path} | Status: ${status} ${extra}`);
};

/**
 * Helper to make HTTP requests to FastAPI with structured error handling & timeouts
 */
const callFastAPI = async (path, options = {}) => {
  const url = `${FASTAPI_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeoutId);
    logRequest(options.method || 'GET', path, response.status);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => response.statusText);
      const err = new Error(`FastAPI responded with HTTP ${response.status}: ${errorBody}`);
      err.status = response.status;
      err.responseBody = errorBody;
      throw err;
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    const isConnRefused = err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED';
    const isTimeout = err.name === 'AbortError';
    logRequest(options.method || 'GET', path, err.status || 'FAILED', `[${isConnRefused ? 'ECONNREFUSED' : isTimeout ? 'TIMEOUT' : err.message}]`);
    
    if (isConnRefused) {
      err.status = 503;
      err.userMessage = 'Federated AI service is unavailable. Python FastAPI is not reachable on port 8000.';
    } else if (err.status === 404) {
      err.userMessage = 'Federated AI endpoint was not found on FastAPI server.';
    } else if (err.status === 422) {
      err.userMessage = 'Invalid federated training or inference request (Validation Error).';
    } else if (!err.status || err.status >= 500) {
      err.userMessage = 'Federated training service encountered an internal error.';
    }
    throw err;
  }
};

/**
 * @desc    Get Federated Learning high-level status
 * @route   GET /api/federated/status
 * @access  Public
 */
const getFederatedStatus = async (req, res, next) => {
  try {
    const result = await callFastAPI('/federated/status', { method: 'GET' });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.userMessage || error.message,
      errorType: error.code || 'FASTAPI_ERROR'
    });
  }
};

/**
 * @desc    Get full Federated Learning metadata and state metrics
 * @route   GET /api/federated/metadata
 * @access  Public
 */
const getFederatedMetadata = async (req, res, next) => {
  try {
    const result = await callFastAPI('/federated/metadata', { method: 'GET' });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.userMessage || error.message,
      errorType: error.code || 'FASTAPI_ERROR'
    });
  }
};

/**
 * @desc    Run Federated Global Model inference
 * @route   POST /api/federated/predict
 * @access  Public
 */
const predictFederated = async (req, res, next) => {
  try {
    const result = await callFastAPI('/federated/predict', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.userMessage || error.message,
      errorType: error.code || 'FASTAPI_ERROR'
    });
  }
};

module.exports = {
  getFederatedStatus,
  getFederatedMetadata,
  predictFederated
};
