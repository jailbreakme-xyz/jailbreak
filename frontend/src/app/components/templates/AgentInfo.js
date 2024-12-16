"use client";
import React from "react";
import { FaInfoCircle, FaCaretRight } from "react-icons/fa";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const styles = {
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
    lineHeight: "1rem",
    padding: "5px 0px",
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
    padding: "5px 0px",
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
  language: {
    fontSize: "14px",
    margin: "10px 0",
    textTransform: "capitalize",
  },
  tldr: {
    fontSize: "14px",
    margin: "10px 0",
    lineHeight: "1.5rem",
  },
};

export default function AgentInfo({ challenge }) {
  return (
    <div
      style={{ textAlign: "left", margin: "0px 0px 0px 0px" }}
      className="chatInfoSection"
    >
      {(challenge?.custom_rules || challenge?.tldr) && (
        <div className="statsWrapper" style={{ marginTop: "0px" }}>
          <h4 style={styles.customRulesTitle}>📜 Settings & Rules</h4>
          <hr />
          <p style={styles.tldr}>
            {challenge?.tldr ? challenge?.tldr : challenge?.custom_rules}
          </p>
          <p style={styles.language}>
            <FaCaretRight size={18} /> Language: {challenge?.language}
          </p>
          <p style={styles.customRules}>
            <FaCaretRight size={18} /> Message fees increase the prize pool.
          </p>
          <p style={styles.customRules}>
            <FaCaretRight size={18} /> Developer Fee: {challenge?.developer_fee}
            %
          </p>
        </div>
      )}
      <div className="statsWrapper" style={{ marginTop: "0px" }}>
        <h4 style={styles.toolsTitle}>💬 Chat Details</h4>
        <hr />
        <p style={styles.customRules}>
          <span>
            <FaCaretRight size={18} /> Characters Per Message:
          </span>{" "}
          ~{numberWithCommas(challenge?.characterLimit)}
        </p>
        {challenge?.charactersPerWord && (
          <p style={styles.customRules}>
            <span>
              <FaCaretRight size={18} /> Characters Per Word:
            </span>{" "}
            {challenge?.charactersPerWord}
          </p>
        )}
        <p style={styles.customRules}>
          <span>
            <FaCaretRight size={18} /> Context Window:
          </span>{" "}
          ~{challenge?.contextLimit}
        </p>
        {/* <p style={styles.customRules}>
          <span>
            <FaCaretRight size={18} />
            UI Chat Limit:
          </span>{" "}
          ~{challenge?.chatLimit || "Unlimited"}
        </p> */}
        <p style={styles.customRules}>
          <span>
            <FaCaretRight size={18} />
            Special Characters:
          </span>{" "}
          {challenge?.disable.includes("special_characters")
            ? "Disabled"
            : "Allowed"}
        </p>
      </div>
      {((challenge?.tools && challenge?.tools.length > 0) ||
        challenge?.tools_description) && (
        <div className="statsWrapper">
          <h4 style={styles.toolsTitle}>🛠️ Available Tools</h4>
          <hr />
          {challenge?.tools_description ? (
            <span style={styles.toolsDescription}>
              {challenge?.tools_description}
            </span>
          ) : (
            <ul style={styles.toolsList}>
              {challenge?.tools.map((tool, index) => (
                <li key={index} style={styles.toolItem}>
                  <span style={styles.toolName}>{tool.name}</span>
                  <br />
                  <label style={styles.detailsLabel}>{tool.description}</label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
