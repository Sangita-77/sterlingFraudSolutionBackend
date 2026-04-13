/**
 * Blockchain Service
 * Handles external API calls to Crystal Blockchain API
 */

const CRYSTAL_BLOCKCHAIN_BASE_URL = "https://apiexplorer.crystalblockchain.com";

/**
 * Fetch token stats for a given Bitcoin address
 * @param {string} address - Bitcoin address
 * @returns {Promise<Object>} Token stats data
 */
import axios from "axios";

export const getAddressTokenStatsService = async (address) => {
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid address provided");
    }

    const url = `${CRYSTAL_BLOCKCHAIN_BASE_URL}/address/${address}/token-stats`;

    const response = await axios.get(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch token stats: ${
        error.response?.status || ""
      } ${error.response?.statusText || error.message}`
    );
  }
};