import React from "react";
import Link from "next/link";
import Button from "@mui/material/Button";

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
    <div className="agent-wrapper">
      <Link
        href={`/break/${agent.name}`}
        className="agent-card-alt pointer"
        key={agent._id || agent.name}
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
        <div className="agent-content">
          <h3 className="pointer" style={{ color: "white" }}>
            {agent.name.length > 16
              ? `${agent.name.slice(0, 16)}...`
              : agent.name}{" "}
            {/* {publicKey &&
              connected &&
              publicKey?.toString() === agent.owner?.toString() && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdvancedModalOpen(agent);
                  }}
                  variant="contained"
                  disabled={agent.status === "active"}
                  sx={{
                    float: "right",
                    backgroundColor: "#0BBF99",
                    color: "#000",
                    "&.Mui-disabled": {
                      backgroundColor: "#0BBF99",
                      opacity: 0.5,
                      color: "#000",
                    },
                  }}
                >
                  Edit
                </Button>
              )} */}
          </h3>
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
