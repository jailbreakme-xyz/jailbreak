import { useState, useEffect } from "react";
import Header from "../components/templates/Header";
import axios from "axios";
import PageLoader from "../components/templates/PageLoader";
import "../styles/WildWest.css";
import Footer from "../components/templates/Footer";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { Modal, Box } from "@mui/material";
import ProfilePictureUploader from "../components/templates/ProfilePictureUploader";
import { Transaction, Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuthenticatedRequest } from "../hooks/useAuthenticatedRequest";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
const SOLANA_RPC =
  process.env.NODE_ENV === "development"
    ? "https://brande-ffqoic-fast-devnet.helius-rpc.com"
    : "https://rosette-xbrug1-fast-mainnet.helius-rpc.com";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const SocialBounties = () => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrize, setTotalPrize] = useState(0);
  const [sort, setSort] = useState("date_desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBounty, setNewBounty] = useState({
    name: "",
    image: "",
    targetUrl: "",
    prize: 2,
    task: "",
  });
  const { publicKey, sendTransaction, connected, wallet } = useWallet();
  const { setVisible, visible } = useWalletModal();

  const [launchLoading, setLaunchLoading] = useState(null);
  const [errorModalOpen, setErrorModalOpen] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [ownerFee, setOwnerFee] = useState(0);

  const { createAuthenticatedRequest } =
    useAuthenticatedRequest(setErrorModalOpen);

  useEffect(() => {
    fetchBounties();
  }, [sort]);

  const fetchBounties = async () => {
    try {
      const response = await axios.get(
        `/api/data/social-bounties?sort=${sort}`
      );
      setBounties(response.data.bounties);
      setTotalPrize(response.data.totalPrize);
      setOwnerFee(response.data.ownerFee);
    } catch (error) {
      console.error("Error fetching bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBounty = async (e) => {
    e.preventDefault();
    if (!connected) {
      setVisible(true);
      return;
    }

    setLaunchLoading("Creating Transaction...");
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");

      // Use authenticated request to get transaction
      const response = await createAuthenticatedRequest(
        "/api/transactions/get-bounty-transaction",
        { method: "POST" },
        {
          prize: newBounty.prize,
          targetUrl: newBounty.targetUrl,
          task: newBounty.task,
        }
      );

      const { serializedTransaction } = response;

      // Deserialize and send the transaction
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );
      const formData = new FormData();

      if (newBounty.image) {
        formData.append("image", newBounty.image);
      } else {
        setErrorModalOpen("Please upload an image");
        setLaunchLoading(null);
        return;
      }

      setLaunchLoading("Waiting for confirmation...");
      const signature = await sendTransaction(transaction, connection);
      const bountyData = {
        targetUrl: newBounty.targetUrl,
        prize: newBounty.prize,
        task: newBounty.task,
        txn: signature,
      };

      formData.append("data", JSON.stringify(bountyData));

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        commitment: "confirmed",
      });

      if (confirmation.value.err) {
        setErrorModalOpen("Transaction failed");
        setLaunchLoading(null);
        return;
      }

      // Create FormData and append all bounty data
      setLaunchLoading("Creating bounty...");

      // Create bounty using authenticated request with FormData
      await createAuthenticatedRequest(
        "/api/data/create-bounty",
        {
          method: "POST",
        },
        formData
      );

      setSuccessModalOpen(true);
      // Reset form and close modal
      setNewBounty({
        image: "",
        targetUrl: "",
        prize: 1,
        task: "",
      });
      setIsModalOpen(false);
      setLaunchLoading(null);
      fetchBounties();
    } catch (error) {
      console.error("Error creating bounty:", error);
      setErrorModalOpen(error.response?.data?.error || error.message);
      setLaunchLoading(null);
    }
  };

  return (
    <div className="fullWidthPage wildWestTheme">
      <Header />
      <div style={styles.container}>
        <div style={styles.headerSection} className="headerSection">
          <div style={styles.headerLeft} className="headerLeft">
            <div style={styles.titleGroup}>
              <div style={styles.titleRow}>
                <img
                  src="https://storage.googleapis.com/jailbreakme-images/jailxLogo.png"
                  alt="logo"
                  width="50"
                  style={{
                    marginRight: "10px",
                    borderRadius: "100px",
                    border: "5px double white",
                  }}
                />
                <h1 style={styles.pageTitle} className="pageTitle">
                  JailX - Social Bounties
                </h1>
              </div>
              <div style={styles.sortControls}>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={styles.sortSelect}
                >
                  <option value="date_desc">⏰ Latest First</option>
                  <option value="date_asc">⌛️ Oldest First</option>
                  <option value="prize_desc">💰 Highest Prize</option>
                  <option value="prize_asc">🪙 Lowest Prize</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.headerRight} className="headerRight">
            <div style={styles.totalPrize} className="totalPrize">
              Total Payout:{" "}
              <CountUp end={totalPrize} start={0} duration={2} prefix="$" />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={styles.listBountyButton}
              className="pointer"
            >
              List Bounty
            </button>
          </div>
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <div style={styles.grid} className="grid">
            {bounties.map((bounty) => (
              <div
                key={bounty._id}
                style={{
                  ...styles.wantedPoster,
                  ...(bounty.jailbreak?.url && styles.jailbrokenPosterFilter),
                }}
                className="wanted-poster"
              >
                <div style={styles.posterContent}>
                  {bounty.jailbreak?.url && (
                    <div style={styles.jailbrokenStamp}>
                      <a
                        href={bounty.jailbreak?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.jailbreakLink}
                        className="pointer"
                      >
                        JAILBROKEN
                      </a>
                    </div>
                  )}
                  <div style={styles.wantedHeader}>
                    <div className="sheriff-star left" />
                    <h1 style={styles.wanted}>WANTED</h1>
                    <div className="sheriff-star right" />
                  </div>
                  <h2 style={styles.deadOrAlive}>DEAD OR ALIVE</h2>
                  <h4 style={styles.name}>
                    <a
                      className="wanted-link pointer"
                      href={bounty.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{bounty.name}
                    </a>
                  </h4>
                  <div>
                    <img
                      src={
                        bounty.image ||
                        "https://storage.googleapis.com/jailbreakme-images/1735908733800-devtest.png"
                      }
                      alt="Wanted Target"
                      className="wanted-image"
                      style={{
                        filter: "grayscale(100%)",
                        width: "160px",
                        height: "auto",
                        display: "block",
                        margin: "0 auto",
                        border: "2px solid #8b4513",
                        backgroundColor: "#f4e4bc",
                      }}
                    />
                  </div>
                  <div style={styles.amount}>
                    ${numberWithCommas(bounty.prize.toFixed(0))}
                  </div>
                  <div style={styles.task}>{bounty.task}</div>

                  {!bounty.jailbreak?.url && (
                    <Link
                      to={`/jailx/${bounty._id}`}
                      style={styles.inPosterButton}
                      className="pointer"
                    >
                      VIEW TARGET
                    </Link>
                  )}
                </div>
                <div className="wrinkles" />
              </div>
            ))}
          </div>
        )}

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="bounty-form-modal"
          style={{ zIndex: 999999999 }}
        >
          <Box sx={styles.modalBox} className="listBountyModalBox">
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>List New Bounty</h2>
              <button
                style={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                X
              </button>
            </div>
            <form onSubmit={handleSubmitBounty} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <ProfilePictureUploader
                  sample="https://storage.googleapis.com/jailbreakme-images/20916012.jpg"
                  customFilter="grayscale(100%)"
                  customColor="#2b1810"
                  onFileChange={(file) =>
                    setNewBounty({ ...newBounty, image: file })
                  }
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target URL (X Profile):</label>
                <input
                  type="url"
                  value={newBounty.targetUrl}
                  onChange={(e) =>
                    setNewBounty({ ...newBounty, targetUrl: e.target.value })
                  }
                  style={styles.input}
                  required
                  placeholder="https://x.com/someagent"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Prize (SOL):</label>
                <input
                  type="number"
                  value={newBounty.prize}
                  onChange={(e) =>
                    setNewBounty({ ...newBounty, prize: e.target.value })
                  }
                  style={styles.input}
                  required
                  min="2"
                  step="0.5"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Jailbreak Task:</label>
                <textarea
                  placeholder="For making it post a meme..."
                  value={newBounty.task}
                  onChange={(e) =>
                    setNewBounty({ ...newBounty, task: e.target.value })
                  }
                  style={styles.textarea}
                  required
                />
              </div>

              <button type="submit" style={styles.submitButton}>
                {launchLoading
                  ? launchLoading
                  : connected
                  ? "Create Bounty"
                  : "Connect Wallet"}
              </button>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#8b4513",
                  textAlign: "center",
                  margin: "0px",
                }}
              >
                {ownerFee}% of the bounty prize will be sent to the platform.
              </p>
            </form>
          </Box>
        </Modal>
        {errorModalOpen && (
          <div style={styles.errorModal}>
            <h1>Error</h1>
            <button
              style={styles.closeButton}
              onClick={() => setErrorModalOpen(null)}
            >
              X
            </button>
            <p>{errorModalOpen}</p>
          </div>
        )}
        {successModalOpen && (
          <div style={styles.successModal}>
            <span style={styles.successIcon}>🤠</span>
            <p>Bounty created successfully</p>
            <button
              style={styles.closeButton}
              onClick={() => setSuccessModalOpen(false)}
            >
              X
            </button>
          </div>
        )}
      </div>
      <Footer />
      <svg style={{ display: "none" }}>
        <filter id="paper-wrinkle">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="3"
          />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
      </svg>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "var(--font-western)",
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "20px 0px 30px",
    padding: "0 20px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  titleRow: {
    display: "flex",
    alignItems: "flex-end",
  },
  pageTitle: {
    fontFamily: "var(--font-western)",
    fontSize: "2.5rem",
    color: "#8b4513",
    margin: "0px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
  },
  sortControls: {
    display: "flex",
    alignItems: "center",
  },
  sortSelect: {
    padding: "8px 12px",
    border: "2px solid #8b4513",
    borderRadius: "4px",
    backgroundColor: "#f4e4bc",
    color: "#8b4513",
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "var(--font-western)",
    minWidth: "150px",
    boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
  },
  totalPrize: {
    fontSize: "1.5rem",
    color: "#8b4513",
    fontFamily: "var(--font-western)",
    margin: "0px",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    textTransform: "uppercase",
  },
  loadingText: {
    textAlign: "center",
    fontSize: "1.5rem",
    color: "#8b4513",
    fontFamily: "var(--font-western)",
    margin: "40px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "10px",
    padding: "0px 20px",
  },
  wantedPoster: {
    width: "100%",
    textAlign: "center",
    maxWidth: "300px",
    margin: "0 auto",

    padding: "30px 30px",
    backgroundColor: "#f4e4bc",
    backgroundImage:
      "linear-gradient(to right, rgba(255,210,0,0.5), rgba(200, 160, 0, 0.2) 11%, rgba(0,0,0,0) 35%, rgba(200, 160, 0, 0.2) 65%)",
    boxShadow:
      "inset 0 0 75px rgba(255,210,0,0.4), inset 0 0 20px rgba(255,210,0,0.5), inset 0 0 30px rgba(220,120,0,0.9)",
    color: "rgba(0,0,0,0.5)",
    letterSpacing: "0.05em",
    overflow: "hidden",
    clipPath: `polygon(
      0% 5%,
      4% 0%,
      12% 3%,
      22% 1%,
      30% 4%,
      40% 2%,
      48% 4%,
      58% 1%,
      70% 3%,
      80% 1%,
      90% 4%,
      100% 2%,
      98% 15%,
      100% 25%,
      99% 40%,
      100% 54%,
      98% 65%,
      100% 75%,
      99% 88%,
      100% 100%,
      90% 98%,
      80% 100%,
      70% 97%,
      60% 100%,
      50% 98%,
      42% 100%,
      30% 98%,
      20% 100%,
      10% 98%,
      0% 100%,
      1% 85%,
      0% 70%,
      2% 60%,
      0% 44%,
      2% 30%,
      0% 15%
    )`,
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(
          circle at 0% 0%,
          rgba(139, 69, 19, 0.1) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 100% 100%,
          rgba(139, 69, 19, 0.15) 0%,
          transparent 50%
        )
      `,
      pointerEvents: "none",
    },
  },
  posterContent: {
    padding: "15px",
    backgroundColor: "transparent",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "500px",
    justifyContent: "space-between",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(
          circle at 30% 20%,
          rgba(139, 69, 19, 0.05) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 70% 80%,
          rgba(139, 69, 19, 0.08) 0%,
          transparent 40%
        )
      `,
      pointerEvents: "none",
    },
  },
  wanted: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "10px 0px 0px 0px",
    color: "#2b1810",
    textTransform: "uppercase",
    letterSpacing: "0.6rem",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    fontFamily: "var(--font-western), serif",
  },
  name: {
    fontSize: "1.4rem",
    margin: "0px",
    color: "#2b1810",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    fontFamily: "var(--font-western), serif",
    textDecoration: "underline",
  },
  deadOrAlive: {
    fontSize: "1.4rem",
    margin: "0px",
    color: "#2b1810",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    fontFamily: "var(--font-western), serif",
  },
  reward: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#8b4513",
    fontFamily: "var(--font-western)",
    marginTop: "10px",
  },
  task: {
    fontSize: "0.8rem",
    margin: "0px",
    color: "#8b4513",
    fontFamily: "var(--font-western)",
  },
  amount: {
    fontSize: "3rem",
    fontWeight: "bold",
    margin: "0px 0px",
    color: "#8b4513",
    fontFamily: "var(--font-western)",
  },
  description: {
    fontSize: "1rem",
    marginBottom: "10px",
    color: "#8b4513",
    lineHeight: "1.3",
  },
  date: {
    fontSize: "1rem",
    color: "#8b4513",
  },
  formContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  formTitle: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#8b4513",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  textarea: {
    fontFamily: "var(--font-western)",
    padding: "8px 12px",
    border: "2px solid #2b1810",
    borderRadius: "4px",
    fontSize: "1rem",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "70%",
    height: "70px",
    resize: "none",
  },
  submitButton: {
    padding: "12px 24px",
    backgroundColor: "#8b4513",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
    ":hover": {
      backgroundColor: "#704012",
    },
  },
  inPosterForm: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: "10px 0",
  },
  inPosterInput: {
    padding: "10px",
    border: "2px solid #8b4513",
    borderRadius: "4px",
    fontSize: "1rem",
    backgroundColor: "rgba(244, 228, 188, 0.8)",
    color: "#8b4513",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
  },
  inPosterButton: {
    textDecoration: "none",
    padding: "12px 24px",
    backgroundColor: "#8b4513",
    color: "#f4e4bc",
    border: "2px solid #704012",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s",
    textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    "&:hover": {
      backgroundColor: "#704012",
      transform: "translateY(1px)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    },
  },
  targetUrl: {
    fontSize: "0.9rem",
    color: "#8b4513",
    marginTop: "10px",
    wordBreak: "break-all",
    padding: "0 10px",
  },
  wantedHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    gap: "10px",
  },
  jailbrokenStamp: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-25deg)",
    border: "0.5rem double #8b0000",
    padding: "10px 20px",
    color: "#8b0000",
    fontSize: "2.5rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    opacity: "0.8",
    pointerEvents: "none",
    zIndex: 2,
  },
  jailbreakLink: {
    color: "#8b0000",
    textDecoration: "none",
    fontFamily: "var(--font-western)",
    pointerEvents: "all",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  jailbrokenPosterFilter: {
    filter: "grayscale(40%) brightness(0.9)",
    backgroundColor: "#e6d5b0",
    backgroundImage:
      "linear-gradient(to right, rgba(220,180,0,0.3), rgba(170, 140, 0, 0.1) 11%, rgba(0,0,0,0) 35%, rgba(170, 140, 0, 0.1) 65%)",
    boxShadow:
      "inset 0 0 75px rgba(220,180,0,0.2), inset 0 0 20px rgba(220,180,0,0.3), inset 0 0 30px rgba(190,100,0,0.7)",
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "15px",
  },
  listBountyButton: {
    padding: "10px 20px",
    backgroundColor: "#8b4513",
    color: "#f4e4bc",
    border: "2px solid #704012",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "var(--font-western)",
    transition: "all 0.3s",
    textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    alignSelf: "flex-end",
  },
  modalBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "400px",
    backgroundColor: "#f4e4bc",
    backgroundImage:
      "linear-gradient(to right, rgba(255,210,0,0.5), rgba(200, 160, 0, 0.2) 11%, rgba(0,0,0,0) 35%, rgba(200, 160, 0, 0.2) 65%)",
    boxShadow:
      "inset 0 0 75px rgba(255,210,0,0.4), inset 0 0 20px rgba(255,210,0,0.5), inset 0 0 30px rgba(220,120,0,0.9)",
    padding: "40px 60px",
    maxHeight: "100vh",
    overflowY: "auto",
    clipPath: `polygon(
        0% 5%,
        4% 0%,
        12% 3%,
        22% 1%,
        30% 4%,
        40% 2%,
        48% 4%,
        58% 1%,
        70% 3%,
        80% 1%,
        90% 4%,
        100% 2%,
        98% 15%,
        100% 25%,
        99% 40%,
        100% 54%,
        98% 65%,
        100% 75%,
        99% 88%,
        100% 100%,
        90% 98%,
        80% 100%,
        70% 97%,
        60% 100%,
        50% 98%,
        42% 100%,
        30% 98%,
        20% 100%,
        10% 98%,
        0% 100%,
        1% 85%,
        0% 70%,
        2% 60%,
        0% 44%,
        2% 30%,
        0% 15%
      )`,
  },
  modalTitle: {
    color: "#2b1810",
    fontFamily: "var(--font-western)",
    textAlign: "center",
    marginBottom: "20px",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "center",
    width: "100%",
  },
  label: {
    fontFamily: "var(--font-western)",
    color: "#2b1810",
  },
  input: {
    fontFamily: "var(--font-western)",
    padding: "8px 12px",
    border: "2px solid #2b1810",
    borderRadius: "4px",
    fontSize: "1rem",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "70%",
  },
  submitButton: {
    padding: "12px 24px",
    backgroundColor: "#8b4513",
    color: "#f4e4bc",
    border: "2px solid #704012",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "var(--font-western)",
    transition: "all 0.3s",
    alignSelf: "center",
    marginTop: "10px",
  },
  closeButton: {
    position: "absolute",
    top: "40px",
    right: "30px",
    cursor: "pointer",
    fontSize: "2rem",
    color: "#2b1810",
    fontFamily: "var(--font-western)",
    backgroundColor: "transparent",
    border: "none",
  },
  errorModal: {
    position: "absolute",
    bottom: "10%",
    right: "1%",
    backgroundColor: "#f4e4bc",
    padding: "20px",
    borderRadius: "8px",
    zIndex: 99999999999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
  },
  successModal: {
    color: "#2b1810",
    fontFamily: "var(--font-western)",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 99999999999,
    backgroundColor: "#f4e4bc",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    border: "2px solid #8b4513",
    padding: "20px",
    borderRadius: "8px",
    width: "30%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
  },
  successIcon: {
    fontSize: "4rem",
  },
};

export default SocialBounties;
