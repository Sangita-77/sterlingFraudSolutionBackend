import { getAddressTokenStatsService } from "../services/blockchain.service.js";

/**
 * Get token statistics for a Bitcoin address
 * @route POST /blockchain/address/token-stats
 * @param {Object} req - Express request object with address in body
 * @param {Object} res - Express response object
 */
export const getAddressTokenStats = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Bitcoin address is required in request body",
      });
    }

    const tokenStats = await getAddressTokenStatsService(address);

    res.status(200).json({
      success: true,
      data: tokenStats,
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
