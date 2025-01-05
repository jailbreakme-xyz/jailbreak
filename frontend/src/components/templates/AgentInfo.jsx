import React from "react";
import { FaCaretRight } from "react-icons/fa";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function AgentInfo({ challenge }) {
  return (
    <div className="agentInfo desktopOnly">
      <div className="glass-card">
        <div className="section-header">
          <h3>📜 Settings & Rules</h3>
        </div>
        <div className="divider" />

        {(challenge?.custom_rules || challenge?.tldr) && (
          <div className="info-block">
            <p className="info-text">
              {challenge?.tldr ? challenge?.tldr : challenge?.custom_rules}
            </p>
          </div>
        )}

        <div className="info-grid">
          <div className="info-item">
            <FaCaretRight className="item-icon" />
            <span className="label">Language:</span>
            <span className="value" style={{ textTransform: "capitalize" }}>
              {challenge?.language}
            </span>
          </div>
          <div className="info-item">
            <FaCaretRight className="item-icon" />
            <span className="label">Developer Fee:</span>
            <span className="value">{challenge?.developer_fee}%</span>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="section-header">
          <h3>💬 Chat Details</h3>
        </div>
        <div className="divider" />

        <div className="info-grid">
          <div className="info-item">
            <FaCaretRight className="item-icon" />
            <span className="label">Characters Per Message:</span>
            <span className="value">
              ~{numberWithCommas(challenge?.characterLimit)}
            </span>
          </div>
          <div className="info-item">
            <FaCaretRight className="item-icon" />
            <span className="label">Characters Per Word:</span>
            <span className="value">
              {challenge?.charactersPerWord || "Unlimited"}
            </span>
          </div>
          <div className="info-item">
            <FaCaretRight className="item-icon" />
            <span className="label">Context Window:</span>
            <span className="value">~{challenge?.contextLimit}</span>
          </div>
          <div className="info-item">
            <FaCaretRight className="item-icon" />
            <span className="label">Dangerous Characters:</span>
            <span className="value">
              {challenge?.disable?.includes("special_characters")
                ? "Disabled"
                : "Allowed"}
            </span>
          </div>
        </div>
      </div>

      {((challenge?.tools && challenge?.tools.length > 0) ||
        challenge?.tools_description) && (
        <div className="glass-card">
          <div className="section-header">
            {challenge?.phrases?.length > 0 ? (
              <h3>🔒 Secret Phrases</h3>
            ) : (
              <h3>🛠️ Available Tools</h3>
            )}
          </div>
          <div className="divider" />

          {challenge?.tools_description ? (
            <p className="info-text">{challenge?.tools_description}</p>
          ) : (
            <div className="tools-grid">
              {challenge?.tools.map((tool, index) => (
                <div key={index} className="tool-item">
                  <span className="tool-name">{tool.name}</span>
                  <span className="tool-description">{tool.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
