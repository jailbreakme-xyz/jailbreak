"use client";
import Image from "next/image";
import { FaClock, FaChartLine, FaCaretRight } from "react-icons/fa";
import CountUp from "react-countup";
import Timer from "../partials/Timer";
import { RiVerifiedBadgeFill } from "react-icons/ri";
export default function ChatMenu({ challenge, attempts, price, usdPrice }) {
  return (
    <div className="chatMenu desktopChatMenu desktop">
      {challenge?.title && (
        <div className="challengeTitle glass-card">
          <div className="challenge-header">
            <div className="challenge-info">
              <span className="level-badge">{challenge?.name}</span>
              <h4 style={{ margin: "8px 0px 4px", fontSize: "14px" }}>
                {challenge?.title.length > 20 && challenge?.verified_owner
                  ? challenge?.title.substring(0, 20) + "..."
                  : challenge?.title}
              </h4>
              {challenge?.verified_owner && (
                <div className="verified-badge">
                  <RiVerifiedBadgeFill />
                  <span>{challenge?.verified_owner}</span>
                </div>
              )}
            </div>
            <div className="challenge-avatar">
              <img
                onClick={() => {
                  window.open(`/agent/${challenge?.name}`, "_blank");
                }}
                alt="logo"
                src={challenge?.pfp}
                width="60"
                height="60"
                className="pfp pointer hover-effect"
              />
            </div>
          </div>
          <div className="divider" />
          <span className="challenge-label">{challenge?.label}</span>
        </div>
      )}

      <div className="stats-section glass-card">
        <div className="section-header">
          <h3>
            <FaChartLine className="header-icon" /> STATS
          </h3>
        </div>
        <div className="divider" />

        <div className="stats-grid">
          <div className="stat-item">
            <h4>Break Attempts</h4>
            <CountUp
              start={0}
              end={attempts}
              duration={2.75}
              decimals={0}
              decimal="."
              className="stat-value"
            />
          </div>
          <div className="stat-item">
            <h4>Message Price</h4>
            <div className="price-display">
              <CountUp
                start={0}
                end={price}
                duration={2.75}
                decimals={3}
                decimal="."
                suffix=" SOL"
                className="stat-value"
              />
              <span className="usd-price">(${usdPrice?.toFixed(2)})</span>
            </div>
          </div>
        </div>
        <div className="divider" />
        <div className="expiry-section">
          <div
            className="section-header"
            style={{ alignItems: "center", marginBottom: "10px" }}
          >
            <h3>
              <FaClock className="header-icon" /> EXPIRY
            </h3>
            <div className="timer-display">
              {challenge?.expiry ? (
                <Timer expiryDate={challenge?.expiry} />
              ) : (
                <div className="tba-badge">TBA</div>
              )}
            </div>
          </div>
          {challenge?.airdrop_split && (
            <div className="compact-info">
              <span className="split-info">
                Split: {challenge?.airdrop_split.winner}% winner •{" "}
                {challenge?.airdrop_split.creator}% creator •{" "}
                {100 -
                  challenge?.airdrop_split.winner -
                  challenge?.airdrop_split.creator}
                % participants
              </span>
              <span className="timer-info">
                Timer extends 1h per message if &lt;1h remains
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
