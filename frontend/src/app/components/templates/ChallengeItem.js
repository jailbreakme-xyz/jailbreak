import Link from "next/link";

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
    <Link href={`/break/${challenge.name}`} className="challenge-item pointer">
      <div className="challenge-info pointer">
        <img
          src={challenge.pfp}
          alt={challenge.name}
          className="challenge-pfp pointer"
        />
        <div className="challenge-details pointer">
          <h3 className="pointer" style={{ color: "white", fontSize: "16px" }}>
            {challenge.name.length > 12
              ? `${challenge.name.slice(0, 12)}...`
              : challenge.name}
          </h3>
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
