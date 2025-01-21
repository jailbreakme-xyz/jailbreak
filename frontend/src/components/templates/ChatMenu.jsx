import { FaClock, FaChartLine } from "react-icons/fa";
import CountUp from "react-countup";
import Timer from "../partials/Timer";
import { RiVerifiedBadgeFill } from "react-icons/ri";
export default function ChatMenu({ challenge, attempts, price, usdPrice }) {
  return (
    <div className="chatMenu desktopChatMenu desktop">
      {challenge?.title && (
        <div className="challengeTitle glass-card">
          <div className="challenge-header">
            <div
              className="challenge-avatar"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <img
                onClick={() => {
                  window.open(`/agent/${challenge?.name}`, "_blank");
                }}
                alt="logo"
                src={challenge?.pfp}
                width={"70"}
                height={"70"}
                className="pfp pointer hover-effect"
              />
            </div>
            <div className="challenge-info">
              <h4
                style={{
                  color: "#0BBF99",
                  fontWeight: "bold",
                  margin: "0px",
                }}
              >
                {challenge?.name}
              </h4>
              {challenge?.verified_owner?.name && (
                <div className="verified-badge" style={{ gap: "2px" }}>
                  <RiVerifiedBadgeFill />
                  {challenge?.verified_owner?.link ? (
                    <a
                      className="pointer"
                      href={challenge?.verified_owner?.link}
                      target="_blank"
                      style={{ color: "#0BBF99", textDecoration: "none" }}
                    >
                      {challenge?.verified_owner?.name}
                    </a>
                  ) : (
                    <span>
                      {challenge?.verified_owner?.name
                        ? challenge?.verified_owner?.name
                        : challenge?.verified_owner}
                    </span>
                  )}
                </div>
              )}
              <div
                style={{
                  marginTop: "5px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <a
                  className="pointer"
                  href={`/breaker/${challenge?.owner}`}
                  target="_blank"
                  style={{
                    textDecoration: "none",
                    color: "#0BBF99",
                    fontSize: "12px",
                    backgroundColor: "rgba(11, 191, 153, 0.1)",
                    padding: "5px 10px",
                    borderRadius: "12px",
                    width: "80px",
                  }}
                >
                  Creator {challenge?.owner?.slice(0, 3)}...
                  {challenge?.owner?.slice(-3)}
                </a>
                <a
                  className="pointer"
                  href={`https://solscan.io/account/${challenge?.tournamentPDA}`}
                  target="_blank"
                  style={{
                    textDecoration: "none",
                    color: "#0BBF99",
                    fontSize: "12px",
                    backgroundColor: "rgba(11, 191, 153, 0.1)",
                    padding: "5px 10px",
                    borderRadius: "12px",
                    width: "80px",
                  }}
                >
                  {challenge.type === "transfer"
                    ? "Agent Wallet "
                    : "Agent Pool "}
                  {challenge?.tournamentPDA?.slice(0, 3)}...
                  {challenge?.tournamentPDA?.slice(-3)}
                </a>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: "8px 0px" }} />
          <h4 style={{ margin: "8px 0px 4px", fontSize: "14px" }}>
            {challenge?.title}
          </h4>
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
            <h4 style={{ margin: "0px" }}>Break Attempts</h4>
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
            <h4 style={{ margin: "0px" }}>Message Price</h4>
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
            style={{ alignItems: "center", marginBottom: "20px" }}
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
