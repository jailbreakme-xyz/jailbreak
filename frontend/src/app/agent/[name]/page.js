"use client";
import React, { useEffect, useState, use } from "react";
import Header from "../../components/Header";
import MainMenu from "../../components/MainMenu";

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
    return (
      <div>
        <Header />
        <div style={styles.noDataContainer}>
          <p style={styles.loading}>Loading {name}...</p>
        </div>
      </div>
    );
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
    developer_fee,
  } = agentData?.challenge;

  return (
    <div>
      <Header />
      <div style={styles.container}>
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
        <button
          className="pointer"
          onClick={() => window.open(`/break/${name}`, "_blank")}
          style={styles.breakButton}
        >
          Break {name} →
        </button>
        <hr />

        {/* Task */}
        <div style={styles.taskSection}>
          <p style={styles.task}>🏁 {task}</p>
          {tools && tools.length > 0 && (
            <div style={styles.toolsSection}>
              <h4 style={styles.toolsTitle}>🛠️ Available Tools:</h4>
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
            </div>
          )}
        </div>
        <hr />
        {/* Details Section */}
        <div style={styles.details}>
          <h4 style={styles.toolsTitle}>💬 Chat Details:</h4>
          <p>
            <strong>Characters Per Message:</strong> ~
            {numberWithCommas(characterLimit)}
            <br />
            <label style={styles.detailsLabel}>
              The amount of characters you can send in a single message.
            </label>
          </p>

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
          <hr />
          <p>
            <strong>Expiry:</strong> {new Date(expiry).toDateString()}
          </p>
          <p>
            <strong>Initial Pool Size:</strong>{" "}
            {initial_pool_size ? `${initial_pool_size} SOL` : "N/A"}
          </p>
          <p>
            <strong>Entry Fee:</strong>{" "}
            {entryFee ? `$${entryFee.toFixed(4)}` : "Free"}
          </p>
          <p>
            <strong>Developer Fee:</strong> {developer_fee}%
          </p>
          <p>
            <strong>Model:</strong> {model || "Unknown"}
          </p>
          <p>
            <strong>Contract Address:</strong>{" "}
            {agentData?.challenge?.idl?.address || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  noDataContainer: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
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
    border: "3px solid #555",
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
    color: "#555",
    margin: "0px",
    textTransform: "uppercase",
  },
  level: {
    fontSize: "14px",
    margin: "5px 0px",
    width: "fit-content",
  },
  active: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0",
    color: "green",
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
    color: "#666",
    padding: "20px",
  },
  error: {
    fontSize: "18px",
    textAlign: "center",
    color: "#ff0000",
    padding: "20px",
  },
  detailsLabel: {
    color: "#666",
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
};

export default Agent;
