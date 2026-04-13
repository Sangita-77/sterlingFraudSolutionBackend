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
export const getAddressTokenStatsService = async (address) => {
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid address provided");
    }

    const url = `${CRYSTAL_BLOCKCHAIN_BASE_URL}/address/${address}/token-stats`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `External API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch token stats: ${error.message}`);
  }
};
