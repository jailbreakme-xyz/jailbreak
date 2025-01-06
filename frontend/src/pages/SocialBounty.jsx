import React, { useState, useEffect } from "react";
import Header from "../components/templates/Header";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageLoader from "../components/templates/PageLoader";
import Footer from "../components/templates/Footer";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const SocialBounty = () => {
  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBounty();
  }, [id]);

  const fetchBounty = async () => {
    try {
      const response = await axios.get(`/api/data/social-bounties/${id}`);
      setBounty(response.data.bounty);
    } catch (error) {
      console.error("Error fetching bounty:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setSubmitting(true);
    try {
      await axios.post(`/api/data/social-bounties/${id}/submissions`, {
        url: url,
      });
      setUrl("");
      alert("URL submitted successfully!");
    } catch (error) {
      console.error("Error submitting URL:", error);
      alert("Failed to submit URL. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fullWidthPage wildWestTheme">
      <Header />
      <div style={styles.container}>
        <button onClick={() => navigate("/jailx")} style={styles.backButton}>
          ← Back to Bounties
        </button>
        {loading ? (
          <PageLoader />
        ) : bounty ? (
          <div
            style={{
              ...styles.wantedPoster,
              ...(bounty.jailbreak?.url && styles.jailbrokenPosterFilter),
            }}
            className={`wanted-poster singlePoster`}
            onClick={() => {
              if (bounty.jailbreak?.url) {
                window.open(bounty.jailbreak?.url, "_blank");
              }
            }}
          >
            <div style={styles.posterContent}>
              {bounty.jailbreak?.url && (
                <div style={styles.jailbrokenStamp} className="pointer">
                  <a
                    href={bounty.jailbreak?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.jailbreak?.url}
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
              <div style={styles.task}>{bounty.task}</div>
              <div style={styles.amount}>
                ${numberWithCommas(bounty.prize.toFixed(0))}
              </div>
              {!bounty.jailbreak?.url && (
                <form onSubmit={handleSubmit} style={styles.inPosterForm}>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter Jailbreak URL"
                    style={styles.inPosterInput}
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    style={styles.inPosterButton}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Jailbreak"}
                  </button>
                </form>
              )}
            </div>
            <div className="wrinkles" />
          </div>
        ) : (
          <div>Bounty not found</div>
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
    marginBottom: "10px",
    padding: "0 20px",
  },
  pageTitle: {
    fontFamily: "var(--font-western)",
    fontSize: "2.5rem",
    color: "#8b4513",
    margin: "10px 0px",
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
  loadingText: {
    textAlign: "center",
    fontSize: "1.5rem",
    color: "#8b4513",
    fontFamily: "var(--font-western)",
    margin: "40px 0",
  },
  wantedPoster: {
    width: "100%",
    textAlign: "center",
    maxWidth: "400px",
    margin: "-20px auto 0px",
    padding: "30px",
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
    transition: "all 0.3s ease",
  },
  posterContent: {
    padding: "15px",
    backgroundColor: "transparent",
    position: "relative",
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
    marginTop: "10px",
    marginBottom: "5px",
    color: "#2b1810",
    textTransform: "uppercase",
    letterSpacing: "0.6rem",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    fontFamily: "var(--font-western), serif",
  },
  name: {
    fontSize: "1.4rem",
    margin: "10px 0px",
    color: "#2b1810",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    fontFamily: "var(--font-western), serif",
    textDecoration: "underline",
  },
  deadOrAlive: {
    fontSize: "1.4rem",
    marginBottom: "10px",
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
    fontSize: "1.2rem",
    margin: "10px 0px",
    color: "#8b4513",
    fontFamily: "var(--font-western)",
  },
  amount: {
    fontSize: "3rem",
    fontWeight: "bold",
    margin: "10px 0px 20px",
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
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    minHeight: "100px",
    resize: "vertical",
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
    marginTop: "10px",
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
    gap: "20px",
    marginBottom: "20px",
    position: "relative",
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#8b4513",
    color: "#f4e4bc",
    border: "2px solid #704012",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    marginBottom: "0px",
    fontFamily: "var(--font-western)",
    transition: "all 0.3s",
    textShadow: "1px 1px 1px rgba(0,0,0,0.3)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    "&:hover": {
      backgroundColor: "#704012",
      transform: "translateY(1px)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    },
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
};
export default SocialBounty;
