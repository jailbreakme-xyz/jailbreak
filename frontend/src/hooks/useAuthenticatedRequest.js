import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import bs58 from "bs58";

export const useAuthenticatedRequest = (setErrorCallback) => {
  const { publicKey, wallet, connected } = useWallet();

  const createAuthenticatedRequest = useCallback(
    async (endpoint, options = {}, formData) => {
      // First try using stored JWT
      const storedToken = localStorage.getItem("token");

      let config = {
        url: endpoint,
        method: options.method || "GET",
        headers: {
          ...options.headers,
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
        // If it's a POST request but not FormData, add the data to config
        config.data = formData;
      }

      if (storedToken) {
        try {
          const verifyResponse = await axios.get("/api/auth/verify-token", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              address: publicKey?.toString(),
            },
          });

          if (verifyResponse.status === 200) {
            config.headers.Authorization = `Bearer ${storedToken}`;
            const response = await axios(config);
            return response.data;
          }
        } catch (error) {
          localStorage.removeItem("token");
        }
      }

      if (!connected || !publicKey || !wallet) {
        throw new Error("Wallet not connected");
      }

      try {
        const message = `Authenticate with your wallet: ${Date.now()}`;
        const encodedMessage = new TextEncoder().encode(message);
        const signature = await wallet.adapter.signMessage(encodedMessage);

        config.headers = {
          ...config.headers,
          signature: bs58.encode(signature),
          publickey: publicKey.toString(),
          message: message,
          timestamp: Date.now().toString(),
        };

        const response = await axios(config);

        // Store the new token if it's in the response
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        return response.data;
      } catch (error) {
        console.error("Authentication error:", error);
        if (setErrorCallback) {
          setErrorCallback(error.response?.data?.error || error.message);
        }
        throw error;
      }
    },
    [publicKey, wallet, connected, setErrorCallback]
  );

  return { createAuthenticatedRequest };
};
