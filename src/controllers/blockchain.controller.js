import { getAddressTokenStatsService , getAddressAllTxsService , getAddressAllTxBoundsService } from "../services/blockchain.service.js";

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

export const getAddressTokenAllTxs = async (req, res) => {
  try {
    const { address, payload } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Bitcoin address is required",
      });
    }

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({
        success: false,
        message: "Payload is required and must be an object",
      });
    }

    const data = await getAddressAllTxsService(address, payload);

    res.status(200).json({
      success: true,
      data,
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAddressAllTxBounds = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Bitcoin address is required in request body",
      });
    }

    const tokenStats = await getAddressAllTxBoundsService(address);

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