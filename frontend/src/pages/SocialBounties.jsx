import React, { useState } from "react";
import Header from "../components/templates/Header";

const SocialBounties = () => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("URL submitted:", url);
  };

  return (
    <div className="fullWidthPage">
      <Header />
      <div style={styles.container}>
        <div style={styles.wantedPoster}>
          <div style={styles.posterContent}>
            <div className="wanted-poster">
              <img
                src="https://storage.googleapis.com/jailbreakme-images/1735908733800-devtest.png"
                alt="Wanted Target"
                className="wanted-image"
                style={{
                  filter: "grayscale(100%)",
                  width: "100px",
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                  border: "2px solid #8b4513",
                }}
              />
            </div>
            <h1 style={styles.wanted}>WANTED</h1>
            <h2 style={styles.deadOrAlive}>DEAD OR ALIVE</h2>
            <div style={styles.reward}>REWARD</div>
            <div style={styles.amount}>$5,000</div>

            <form onSubmit={handleSubmit} style={styles.inPosterForm}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter target URL"
                style={styles.inPosterInput}
              />
              <button type="submit" style={styles.inPosterButton}>
                Submit Target
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    height: "calc(100vh - 150px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  wantedPoster: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
    padding: "30px",
    backgroundColor: "#f4e4bc",
    border: "none",
    boxShadow: `
      0 0 20px rgba(0,0,0,0.3),
      inset 0 0 80px rgba(139, 69, 19, 0.1)
    `,
    textAlign: "center",
    fontFamily: '"Playfair Display", serif',
    position: "relative",
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
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        linear-gradient(
          to right,
          transparent 0%,
          rgba(185, 146, 112, 0.1) 48%,
          transparent 52%,
          rgba(185, 146, 112, 0.15) 98%
        ),
        linear-gradient(
          to bottom,
          transparent 20%,
          rgba(185, 146, 112, 0.1) 45%,
          rgba(185, 146, 112, 0.15) 75%,
          transparent 100%
        )
      `,
      pointerEvents: "none",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 2px,
          rgba(139, 69, 19, 0.03) 3px,
          transparent 4px
        )
      `,
      opacity: 0.4,
      pointerEvents: "none",
    },
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
    fontSize: "3rem",
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "5px",
    color: "#8b4513",
    letterSpacing: "8px",
    textShadow: "2px 2px 4px rgba(139, 69, 19, 0.3)",
  },
  deadOrAlive: {
    fontSize: "1.5rem",
    marginBottom: "10px",
    color: "#8b4513",
    textShadow: "1px 1px 2px rgba(139, 69, 19, 0.3)",
  },
  reward: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#8b4513",
  },
  amount: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#8b4513",
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
};

export default SocialBounties;
