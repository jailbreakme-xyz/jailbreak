import { Link } from "react-router-dom";
import { RiVerifiedBadgeFill } from "react-icons/ri";

const numbersWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function ChallengeItem({ challenge }) {
  const statusClass =
    challenge?.status === "active"
      ? "live"
      : challenge?.status === "upcoming"
      ? "upcoming"
      : "inactive";

  const statusText =
    challenge?.status === "active" ? "LIVE" : challenge?.status;

  return (
    <Link to={`/break/${challenge.name}`} className="challenge-item pointer">
      <div className="challenge-info pointer">
        <div
          className="challenge-pfp-container"
          style={{ position: "relative" }}
        >
          <img
            src={challenge.pfp}
            alt={challenge.name}
            className="challenge-pfp pointer"
          />
          {challenge.verified_owner?.name && (
            <RiVerifiedBadgeFill
              style={{
                position: "absolute",
                bottom: "-5px",
                right: "-5px",
                color: "#0BBF99",
                fontSize: "16px",
                backgroundColor: "black",
                borderRadius: "50%",
              }}
            />
          )}
        </div>
        <div className="challenge-details pointer">
          <h3
            className="pointer"
            style={{
              color: "white",
              fontSize: "14px",
              margin: "0px",
            }}
          >
            {challenge.name}
          </h3>
          <span
            className="pointer desktop"
            style={{ fontSize: "12px", color: "#9e9e9e", margin: "0px" }}
          >
            {challenge.break_attempts} Attempts
          </span>
          <span
            className="mobile-break-attempts pointer"
            style={{ color: "white" }}
          >
            {challenge.entryFee?.toFixed(3)} SOL
          </span>
        </div>
      </div>
      <div className="challenge-stats">
        <div className="prize-info">
          <span className="challenge-prize pointer" style={{ color: "white" }}>
            ${numbersWithCommas(challenge.usd_prize.toFixed(2))}
          </span>
        </div>
        <div className="attempts-status-container">
          <span
            className="desktop-break-attempts pointer"
            style={{ color: "white" }}
          >
            {challenge.entryFee?.toFixed(3)} SOL
          </span>
          <div className="status-container">
            <div className={`status-bulb ${statusClass}`}></div>
            <span className="status-text" style={{ color: "white" }}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
