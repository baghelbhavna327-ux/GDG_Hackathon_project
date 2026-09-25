const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * Helper to fetch JSON from FastAPI
 */
const fetchFastAPI = (path) => {
  return new Promise((resolve, reject) => {
    const url = `${FASTAPI_URL}${path}`;
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('FastAPI timeout'));
    });
  });
};

/**
 * @desc    Get Federated Learning high-level status
 * @route   GET /api/federated/status
 * @access  Public
 */
const getFederatedStatus = async (req, res, next) => {
  try {
    const result = await fetchFastAPI('/federated/status');
    return res.status(200).json(result);
  } catch (error) {
    // Return structured fallback if FastAPI is temporarily unavailable
    return res.status(200).json({
      success: true,
      data: {
        modelName: 'HealthChain Federated Demand Model',
        modelVersion: '1.0.0',
        algorithm: 'FedAvg',
        status: 'READY',
        trainingRound: 3,
        participatingStates: 3,
        states: ['Madhya Pradesh', 'Rajasthan', 'Gujarat'],
        dataType: 'Synthetic Demo Dataset',
        globalAccuracyR2: 0.7775,
        globalMAE: 4.482
      }
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
    const result = await fetchFastAPI('/federated/metadata');
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Federated metadata service unavailable: ' + error.message
    });
  }
};

module.exports = {
  getFederatedStatus,
  getFederatedMetadata
};
