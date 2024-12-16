"use client";
import React, { useEffect, useState, use } from "react";
import Header from "../../components/templates/Header";
import Timer from "../../components/partials/Timer";
import Footer from "../../components/templates/Footer";
import PageLoader from "../../components/templates/PageLoader";
async function getAgentData(name) {
  const response = await fetch(`/api/challenges/get-challenge?name=${name}`);
  if (!response.ok) {
    throw new Error("Failed to fetch agent data");
  }
  return response.json();
}

const Agent = ({ params }) => {
  const name = use(params).name;
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);

  const fetchData = async () => {
    try {
      const data = await getAgentData(name);
      setAgentData(data);
    } catch (error) {
      console.error("Failed to fetch agent data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [name]);

  if (loading) {
    return <PageLoader />;
  }

  if (!agentData) {
    return (
      <div>
        <Header />
        <div style={styles.noDataContainer}>
          <p style={styles.error}>Failed to load agent data</p>
        </div>
      </div>
    );
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const {
    label,
    task,
    pfp,
    level,
    status,
    characterLimit,
    contextLimit,
    chatLimit,
    expiry,
    initial_pool_size,
    entryFee,
    model,
    tools,
    tools_description,
    custom_rules,
    tldr,
    fee_multiplier,
    developer_fee,
    start_date,
    charactersPerWord,
    disable,
    language,
  } = agentData?.challenge;

  return (
    <div className="beta-container">
      <Header activeChallenge={agentData?.challenge} />
      {loading ? (
        <PageLoader />
      ) : (
        <div style={styles.container} className="agent-page">
          {/* Profile Section */}
          <div style={styles.profileSection}>
            <img
              className="pointer"
              src={pfp}
              alt={`${name} Profile`}
              style={styles.profileImage}
              onClick={() => {
                window.open(`/break/${name}`, "_blank");
              }}
            />
            <div style={styles.infoSection}>
              <h2
                style={styles.name}
                className="pointer"
                onClick={() => {
                  window.open(`/break/${name}`, "_blank");
                }}
              >
                {name}
              </h2>
              <p style={styles[status]} className={status}>
                {status}
              </p>
              <p style={styles.level} className={`${level} level`}>
                {level}
              </p>
            </div>
          </div>
          {/* Description */}
          <p style={styles.description}>{label}</p>
          {status === "active" ? (
            <button
              className="pointer"
              onClick={() => window.open(`/break/${name}`, "_blank")}
              style={styles.breakButton}
            >
              JAILBREAK ME →
            </button>
          ) : (
            <div>
              <p>Tournament starts in</p>
              <Timer expiryDate={start_date} />
            </div>
          )}
          <hr />

          {/* Task */}
          <div style={styles.taskSection}>
            {/* <p style={styles.task}>🏁 {task}</p> */}
            {((tools && tools.length > 0) || tools_description) && (
              <div style={styles.toolsSection}>
                <h4 style={styles.toolsTitle}>🛠️ Available Tools:</h4>
                {tools_description ? (
                  <span style={styles.toolsDescription}>
                    {tools_description}
                  </span>
                ) : (
                  <ul style={styles.toolsList}>
                    {tools.map((tool, index) => (
                      <li key={index} style={styles.toolItem}>
                        <span style={styles.toolName}>{tool.name}</span>
                        <br />
                        <label style={styles.detailsLabel}>
                          {tool.description}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <hr />
          </div>
          {custom_rules && (
            <>
              <h4 style={styles.customRulesTitle}>📜 Settings & Rules</h4>
              <p style={styles.customRules}>{tldr ? tldr : custom_rules}</p>
              <hr />
            </>
          )}
          {/* Details Section */}
          <div style={styles.details}>
            <h4 style={styles.toolsTitle}>💬 Chat Details:</h4>
            <strong style={{ textTransform: "capitalize" }}>
              Language: {language}
            </strong>
            <p>
              <strong>Characters Per Message:</strong> ~
              {numberWithCommas(characterLimit)}
              <br />
              <label style={styles.detailsLabel}>
                The amount of characters you can send in a single message.
              </label>
            </p>
            {charactersPerWord && (
              <p>
                <strong>Characters Per Word:</strong> {charactersPerWord}
                <br />
                <label style={styles.detailsLabel}>
                  The amount of characters per word.
                </label>
              </p>
            )}
            <p>
              <strong>Context Window:</strong> ~{contextLimit}
              <br />
              <label style={styles.detailsLabel}>
                The amount of messages sent to the agent, including the agent
                responses (your messages only).
              </label>
            </p>
            <p>
              <strong>UI Chat Limit:</strong> ~{chatLimit || "Unlimited"}
              <br />
              <label style={styles.detailsLabel}>
                The amount of messages that the chat disaplays in the UI.
              </label>
            </p>
            <p>
              <strong>Special Characters:</strong>{" "}
              {disable.includes("special_characters") ? "Disabled" : "Allowed"}
            </p>
            <hr />
            <p>
              <strong>Expiry:</strong> {new Date(expiry).toDateString()}
            </p>
            <p>
              <strong>Initial Pool Size:</strong>{" "}
              {initial_pool_size
                ? `$${numberWithCommas(
                    (initial_pool_size * agentData.solPrice).toFixed(2)
                  )}`
                : "N/A"}
            </p>
            <p>
              <strong>Entry Fee:</strong>{" "}
              {entryFee
                ? `$${numberWithCommas(
                    (entryFee * agentData.solPrice).toFixed(2)
                  )}`
                : "Free"}
            </p>
            <p>
              <strong>Fee Multiplier:</strong> {fee_multiplier}
              <br />
              <label style={styles.detailsLabel}>
                The multiplier for the entry fee - e.g if the multiplier is 100,
                the pool prize is 100x the base entry fee. (e.g if the entry fee
                is $100, the pool prize is $10,000)
              </label>
            </p>
            <p>
              <strong>Developer Fee:</strong> {developer_fee}%
            </p>
            <p>
              <strong>Model:</strong> {model || "Unknown"}
            </p>
            <p>
              <strong>Tournament PDA:</strong>{" "}
              {agentData?.challenge?.idl?.address || "N/A"}
            </p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px 0px 100px 0px",
    backgroundColor: "#181726",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  noDataContainer: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#181726",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    width: "100%",
    height: "auto",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  profileImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    marginRight: "20px",
    border: "6px double #0bbf99",
  },
  breakButton: {
    backgroundColor: "#0bbf99",
    color: "black",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  infoSection: {
    flex: 1,
  },
  title: {
    fontSize: "24px",
    margin: "0",
  },
  name: {
    fontSize: "24px",
    color: "#0BBF99",
    margin: "0px",
    textTransform: "uppercase",
  },
  level: {
    fontSize: "14px",
    margin: "5px 0px",
    width: "fit-content",
    fontWeight: "bold",
  },
  active: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0",
    color: "green",
    textTransform: "capitalize",
  },
  concluded: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0",
    color: "blue",
    textTransform: "capitalize",
  },
  closed: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0",
    color: "red",
    textTransform: "capitalize",
  },
  upcoming: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0",
    color: "orange",
    textTransform: "capitalize",
  },
  description: {
    fontSize: "16px",
    margin: "10px 0px",
  },
  taskSection: {
    marginBottom: "20px",
  },
  taskTitle: {
    fontSize: "18px",
    margin: "0 0 10px",
  },
  task: {
    fontSize: "16px",
    margin: "0",
  },
  details: {
    fontSize: "16px",
    lineHeight: "1.5",
  },
  loading: {
    fontSize: "18px",
    textAlign: "center",
    color: "#ebebeb",
    padding: "20px",
  },
  error: {
    fontSize: "18px",
    textAlign: "center",
    color: "#ff0000",
    padding: "20px",
  },
  detailsLabel: {
    color: "#888",
    fontSize: "12px",
    margin: "0px",
  },
  toolsSection: {
    marginTop: "15px",
  },
  toolsTitle: {
    fontSize: "16px",
    margin: "10px 0",
    fontWeight: "bold",
  },
  toolsList: {
    margin: "0",
    listStyleType: "none",
    padding: "0",
  },
  toolItem: {
    margin: "5px 0",
  },
  toolName: {
    fontWeight: "bold",
    backgroundColor: "rgb(59 59 59 / 69%)",
    padding: "5px 15px",
    borderRadius: "50px",
    color: "#ccc",
    fontSize: "14px",
  },
  toolsDescription: {
    fontSize: "14px",
    margin: "10px 0",
  },
  customRulesTitle: {
    fontSize: "16px",
    margin: "10px 0",
    fontWeight: "bold",
  },
  customRules: {
    fontSize: "14px",
    margin: "10px 0",
  },
};

export default Agent;
