import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import bs58 from "bs58";

export const useAuthenticatedRequest = (setErrorCallback) => {
  const { publicKey, wallet, connected } = useWallet();

  const getNewToken = async () => {
    if (!connected || !publicKey || !wallet) {
      throw new Error("Wallet not connected");
    }

    const timestamp = Date.now().toString();
    const message = `Authenticate with your wallet: ${timestamp}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signature = await wallet.adapter.signMessage(encodedMessage);

    const response = await axios.post("/api/auth/create-token", null, {
      headers: {
        signature: bs58.encode(signature),
        publickey: publicKey.toString(),
        message: message,
        timestamp: timestamp,
      },
    });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      return response.data.token;
    }
    throw new Error("Failed to get token");
  };

  const createAuthenticatedRequest = useCallback(
    async (endpoint, options = {}, formData) => {
      try {
        // First try using stored JWT
        let token = localStorage.getItem("token");

        // If no token exists, get a new one
        if (!token) {
          token = await getNewToken();
        }

        let config = {
          url: endpoint,
          method: options.method || "GET",
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        };

        // Add FormData configuration if provided
        if (formData instanceof FormData) {
          config = {
            ...config,
            data: formData,
            headers: {
              ...config.headers,
              "Content-Type": "multipart/form-data",
            },
          };
        } else if (options.method === "POST") {
          config.data = formData;
        }

        try {
          const response = await axios(config);
          return response.data;
        } catch (error) {
          if (error.response?.status === 401) {
            // Token might be invalid, try to get a new one
            localStorage.removeItem("token");
            token = await getNewToken();

            // Retry the request with new token
            config.headers.Authorization = `Bearer ${token}`;
            const retryResponse = await axios(config);
            return retryResponse.data;
          }
          throw error;
        }
      } catch (error) {
        if (setErrorCallback) {
          setErrorCallback(error.message);
        }
        throw error;
      }
    },
    [publicKey, wallet, connected]
  );

  return { createAuthenticatedRequest };
};
