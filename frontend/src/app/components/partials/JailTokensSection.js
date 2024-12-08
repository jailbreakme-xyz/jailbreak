import React from "react";
import BarLoader from "react-spinners/BarLoader";

const override = {
  display: "block",
  margin: "0 auto",
  width: "200px",
};

const JailTokensSection = ({ data, loading }) => {
  return (
    <div style={styles.container} className="jail-token-page">
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "80vh",
          }}
        >
          <div style={{ display: "block" }}>
            <div className="page-loader" style={{ textAlign: "center" }}>
              <BarLoader color="black" size={150} cssOverride={override} />
              <br />
              <span style={{ color: "black" }}>Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1 style={styles.title}>
            $JAIL Tokens: The Future of the JailbreakMe Ecosystem
          </h1>
          <span style={styles.address}>Token Address: {data?.address}</span>
          <hr />
          {/* Overview Section */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>🔍 Overview</h2>
            <p>
              $JAIL tokens are designed to be the{" "}
              <strong>native currency of the JailbreakMe dApp</strong>, serving
              as the backbone of the platform&apos;s economy. While the full
              utility of $JAIL tokens will roll out in future updates, the
              groundwork is being laid to ensure their value and relevance
              within the ecosystem.
            </p>
          </section>

          {/* Current Use Case */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>
              💡 Current Use Case: Buyback Program
            </h2>
            <ul style={styles.list}>
              <li>
                <strong>Prize Pool Allocation:</strong> A portion of every prize
                pool is allocated to
                <strong> buy back $JAIL tokens</strong> from the market. This
                creates consistent demand for the token.
              </li>
              <li>
                <strong>Market Impact:</strong>
                <ul style={styles.sublist}>
                  <li>
                    The buybacks help support the token&apos;s value by reducing
                    the circulating supply.
                  </li>
                  <li>
                    This strategy establishes a strong foundation for the $JAIL
                    token economy as the platform scales.
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Future Plans */}
          <section style={styles.section}>
            <h2 style={styles.subtitle}>🚀 Future Plans for $JAIL Tokens</h2>
            <p>
              As the JailbreakMe platform evolves, $JAIL tokens will become
              integral to the dApp&apos;s functionality and user interactions.
              Planned use cases include:
            </p>
            <ul style={styles.list}>
              <li>
                <strong>Challenge Participation:</strong> Users will need $JAIL
                tokens to enter certain tournaments or challenges.
              </li>
              <li>
                <strong>Rewards System:</strong> Successful participants will
                earn $JAIL tokens as rewards for solving challenges, creating a
                circular token economy.
              </li>
              <li>
                <strong>Custom Tournaments:</strong> Organizations creating
                custom challenges will use $JAIL tokens for:
                <ul style={styles.sublist}>
                  <li>Funding prize pools.</li>
                  <li>Paying platform fees.</li>
                </ul>
              </li>
              <li>
                <strong>AI Agent Security Tournament Marketplace:</strong>{" "}
                projects will be able to burn and lock $JAIL tokens to fund
                tournaments to test own AI Agents against attacks.
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    lineHeight: "1.6",
    color: "#333",
    width: "70%",
    margin: "0",
    padding: "0px 20px 20px 20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "left",
    marginBottom: "0px",
  },
  subtitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#444",
    marginBottom: "10px",
  },
  section: {
    marginBottom: "20px",
  },
  list: {
    listStyleType: "none",
    padding: "0",
  },
  sublist: {
    listStyleType: "circle",
    marginLeft: "20px",
  },
  address: {
    fontSize: "16px",
    color: "#666",
  },
};

export default JailTokensSection;
