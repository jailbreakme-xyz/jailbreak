import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaKey, FaCopy, FaCheckCircle } from "react-icons/fa";
import { useAuthenticatedRequest } from "../../../hooks/useAuthenticatedRequest";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const styles = {
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#0BBF99",
    color: "black",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  buttonHover: {
    backgroundColor: "#0aa588",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    position: "fixed",
    inset: 0,
    overflow: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  modalContent: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "#1F1F2E",
    padding: "24px",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
  },
  title: {
    fontSize: "18px",
    fontWeight: 500,
    color: "white",
    marginBottom: "16px",
  },
  error: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    color: "#f87171",
  },
  text: {
    color: "#d1d5db",
    marginBottom: "16px",
  },
  smallText: {
    fontSize: "14px",
    color: "#9ca3af",
  },
  generateButton: {
    width: "100%",
    padding: "8px 16px",
    backgroundColor: "#0BBF99",
    color: "black",
    border: "none",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
  },
  keyContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#262636",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  keyText: {
    flex: 1,
    wordBreak: "break-all",
    fontFamily: "monospace",
    fontSize: "14px",
    color: "#d1d5db",
  },
  copyButton: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  copyButtonHover: {
    backgroundColor: "#1F1F2E",
  },
  successText: {
    color: "#34d399",
    marginBottom: "8px",
  },
};

export default function ApiKeyModal({ isOpen, setIsOpen }) {
  const { publicKey, connected } = useWallet();
  const { setVisible, visible } = useWalletModal();

  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { createAuthenticatedRequest } = useAuthenticatedRequest(setError);

  const requestApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await createAuthenticatedRequest(
        "/api/submissions/request-api-key",
        { method: "POST" }
      );
      if (response.success) {
        setApiKey(response.apiKey);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setApiKey(null);
    setError(null);
  };

  return (
    <>
      {publicKey ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            ...styles.button,
            ...(isHovered && styles.buttonHover),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="pointer"
        >
          <FaKey />
          <span>Get API Key</span>
        </button>
      ) : (
        <button
          style={styles.button}
          onClick={() => setVisible(true)}
          className="pointer"
        >
          <FaKey />
          <span>Connect Wallet to Get API Key</span>
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          style={{ position: "relative", zIndex: 50 }}
          onClose={handleClose}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div style={styles.modalOverlay} />
          </Transition.Child>

          <div style={styles.modalContainer}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel style={styles.modalContent}>
                <Dialog.Title style={styles.title}>
                  API Key Management
                </Dialog.Title>

                {error && <div style={styles.error}>{error}</div>}

                {!apiKey ? (
                  <div>
                    <p style={styles.text}>
                      Generate an API key to access the JailbreakAPI endpoints.
                    </p>
                    <p style={styles.smallText}>
                      Rate limit: 5,000 requests per hour
                    </p>
                    <button
                      onClick={requestApiKey}
                      disabled={loading}
                      style={{
                        ...styles.generateButton,
                        opacity: loading ? 0.5 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                      className={loading ? "disabled" : "pointer"}
                    >
                      {loading ? (
                        <span style={{ animation: "spin 1s linear infinite" }}>
                          ⚡
                        </span>
                      ) : (
                        <>
                          <FaKey />
                          <span>Generate API Key</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={styles.successText}>
                      Your API key has been generated!
                    </p>
                    <div style={styles.keyContainer}>
                      <code style={styles.keyText}>{apiKey}</code>
                      <button
                        onClick={copyApiKey}
                        style={styles.copyButton}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="pointer"
                      >
                        {copied ? (
                          <FaCheckCircle
                            className="pointer"
                            style={{ color: "#0BBF99" }}
                          />
                        ) : (
                          <FaCopy
                            className="pointer"
                            style={{ color: "#9ca3af" }}
                          />
                        )}
                      </button>
                    </div>
                    <p style={styles.smallText}>
                      Keep this key secure. You won't be able to see it again.
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
