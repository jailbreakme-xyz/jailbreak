import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const AgentCardSkeleton = (index) => (
  <div className="agent-card-alt" key={index}>
    <Skeleton height={200} className="agent-image" style={{ top: "-10px" }} />
    <div className="agent-content">
      <Skeleton height={24} width="80%" className="mb-2" />
      <Skeleton height={16} count={2} className="mb-1" />
      <Skeleton height={16} width="60%" />
    </div>
  </div>
);

export const ChallengeItemSkeleton = (index) => (
  <div className="challenge-item" key={index}>
    <div className="challenge-info">
      <Skeleton circle width={48} height={48} className="challenge-pfp" />
      <div className="challenge-details">
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={16} className="mobile-break-attempts" />
      </div>
    </div>
    <div className="challenge-stats">
      <Skeleton width={80} height={20} className="challenge-prize" />
      <div className="attempts-status-container">
        <Skeleton width={100} height={16} className="desktop-break-attempts" />
        <Skeleton width={60} height={16} />
      </div>
    </div>
  </div>
);
