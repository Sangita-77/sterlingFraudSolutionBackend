import axios from "axios";

const CRYSTAL_BLOCKCHAIN_BASE_URL = "https://apiexplorer.crystalblockchain.com";

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



export const getAddressAllTxsService = async (address, payload) => {
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid address provided");
    }

    const url = `${CRYSTAL_BLOCKCHAIN_BASE_URL}/address/${address}/all-txs`;

    const response = await axios.post(url, payload, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.log("API Error:", error.response?.data);

    throw new Error(
      `Failed to fetch all txs: ${
        error.response?.status || ""
      } ${error.response?.data?.message || error.message}`
    );
  }
};

export const getAddressAllTxBoundsService = async (address, payload) => {
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid address provided");
    }

    const url = `${CRYSTAL_BLOCKCHAIN_BASE_URL}/address/${address}/all-tx-bounds`;

    const response = await axios.get(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch all tx bounds: ${
        error.response?.status || ""
      } ${error.response?.statusText || error.message}`
    );
  }
};

export const getAddressTxService = async (address, payload) => {
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid address provided");
    }

    const url = `${CRYSTAL_BLOCKCHAIN_BASE_URL}/tx/${address}?prev_next=0`;

    const response = await axios.get(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch all tx bounds: ${
        error.response?.status || ""
      } ${error.response?.statusText || error.message}`
    );
  }
};

export const getBitAddressOwnerDetailsService = async ({
  address,
  email,
  password,
}) => {
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid address provided");
    }

    if (!email || !password) {
      throw new Error("Crystal Blockchain email and password are required");
    }

    const loginResponse = await axios.post(
      `${CRYSTAL_BLOCKCHAIN_BASE_URL}/auth/login`,
      { email, password },
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/json",
        },
      }
    );

    const accessToken =
      loginResponse.data?.data?.token?.access_token?.token;

    if (!accessToken) {
      throw new Error("Access token not found in Crystal Blockchain login response");
    }

    const ownerUrl = `${CRYSTAL_BLOCKCHAIN_BASE_URL}/address/${address}/owner`;

    const ownerResponse = await axios.get(ownerUrl, {
      params: {
        access_token: accessToken,
      },
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    return ownerResponse.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch bit address owner details: ${
        error.response?.status || ""
      } ${error.response?.data?.meta?.error_message || error.response?.data?.message || error.response?.statusText || error.message}`
    );
  }
};
