import React from "react";
import { FaCaretRight } from "react-icons/fa";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => (
                  <span
                    className="info-text"
                    style={{
                      whiteSpace: "pre-line",
                      display: "block",
                      fontSize: "14px",
                    }}
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    target="_blank"
                    className="info-link pointer"
                    style={{ color: "#007bff", textDecoration: "underline" }}
                    {...props}
                  />
                ),
                // Maintain consistent heading sizes
                h1: ({ node, ...props }) => (
                  <h1
                    style={{
                      fontSize: "1.2em",
                      fontWeight: "bold",
                      textAlign: "left",
                      margin: "2px 0px",
                    }}
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    style={{
                      fontSize: "1.1em",
                      fontWeight: "bold",
                      textAlign: "left",
                      margin: "2px 0px",
                    }}
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    style={{
                      fontSize: "1em",
                      fontWeight: "bold",
                      textAlign: "left",
                      margin: "2px 0px",
                    }}
                    {...props}
                  />
                ),
              }}
            >
              {challenge?.tldr ? challenge?.tldr : challenge?.custom_rules}
            </Markdown>
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
        (challenge?.tools_description &&
          challenge?.tools_description.length > 0)) && (
        <div className="glass-card">
          <div className="section-header">
            {challenge?.type === "phrases" ? (
              <h3>🔒 Secret Phrases</h3>
            ) : (
              <h3>🛠️ Available Tools</h3>
            )}
          </div>
          <div className="divider" />

          {challenge?.tools_description ? (
            <p className="info-text" style={{ margin: "0px" }}>
              {challenge?.tools_description}
            </p>
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
