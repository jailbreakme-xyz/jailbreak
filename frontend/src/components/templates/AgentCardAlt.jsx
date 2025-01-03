import React from "react";
import { Link } from "react-router-dom";
import { RiVerifiedBadgeFill } from "react-icons/ri";

const numbersWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const AgentCardAlt = ({
  agent,
  publicKey,
  connected,
  handleAdvancedModalOpen,
}) => {
  const getStatusClass = (status) => {
    return status === "active"
      ? "live"
      : status === "upcoming"
      ? "upcoming"
      : "inactive";
  };

  const getStatusText = (status) => {
    return status === "active" ? "LIVE" : status;
  };

  const getPrizeLevel = (prize) => {
    if (prize >= 10000) return "legendary";
    if (prize >= 5000) return "epic";
    if (prize >= 1000) return "rare";
    if (prize >= 500) return "uncommon";
    return "common";
  };

  return (
    <div className="agent-wrapper" style={{ height: "100%" }}>
      <Link
        to={`/break/${agent.name}`}
        className="agent-card-alt pointer"
        key={agent._id || agent.name}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="agent-image-container">
          <img
            src={agent.pfp}
            alt={agent.name}
            className="agent-image pointer"
          />
          <div className={`status-indicator ${getStatusClass(agent.status)}`}>
            {getStatusText(agent.status)}
          </div>
          <div
            className="prize-overlay"
            data-prize-tier={getPrizeLevel(agent.usd_prize)}
          >
            ${numbersWithCommas(agent.usd_prize.toFixed(2))}
          </div>
        </div>
        <div className="agent-content" style={{ flex: 1 }}>
          <div>
            <h3
              className="pointer"
              style={{
                color: "white",
                marginBottom: agent.verified_owner ? "4px" : "10px",
              }}
            >
              {agent.name.length > 16
                ? `${agent.name.slice(0, 16)}...`
                : agent.name}
            </h3>
            {agent.verified_owner && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.8em",
                  color: "#0BBF99",
                  marginBottom: "8px",
                }}
              >
                <RiVerifiedBadgeFill
                  style={{
                    marginRight: "4px",
                    verticalAlign: "middle",
                  }}
                />
                <span>{agent.verified_owner}</span>
              </div>
            )}
          </div>
          <div className="agent-stats">
            <div className="stat-item">
              <span className="stat-label">Entry Fee</span>
              <span className="stat-value" style={{ color: "white" }}>
                {agent.entryFee?.toFixed(3)} SOL
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Break Attempts</span>
              <span className="stat-value" style={{ color: "white" }}>
                {numbersWithCommas(agent.break_attempts)}{" "}
                {agent.break_attempts === 1 ? "Attempt" : "Attempts"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AgentCardAlt;
