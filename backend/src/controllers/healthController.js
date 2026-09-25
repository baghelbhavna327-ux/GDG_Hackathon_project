/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    status: 'success',
    message: 'HealthChain AI API is running',
    data: {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
};

module.exports = {
  getHealthStatus
};
