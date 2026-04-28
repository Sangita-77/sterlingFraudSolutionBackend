import {
  getAddressTokenStatsService,
  getAddressAllTxsService,
  getAddressAllTxBoundsService,
  getAddressTxService,
  getBitAddressOwnerDetailsService,
} from "../services/blockchain.service.js";

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

export const getAddressTx = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Bitcoin address is required in request body",
      });
    }

    const tokenStats = await getAddressTxService(address);

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

export const getBitAddressOwnerDetails = async (req, res) => {
  try {
    const { address } = req.body;
    const email = process.env.BLOCKCHAIN_USERNAME || "";
    const password = process.env.BLOCKCHAIN_PASSWORD || "";

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Bitcoin address is required in request body",
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required in request body",
      });
    }

    const ownerDetails = await getBitAddressOwnerDetailsService({
      address,
      email,
      password,
    });

    res.status(200).json({
      success: true,
      data: ownerDetails,
      address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
