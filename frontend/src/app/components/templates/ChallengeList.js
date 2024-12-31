import ChallengeItem from "./ChallengeItem";

export default function ChallengeList({ title, challenges }) {
  return (
    <div className="challenges-list">
      <h2>{title}</h2>
      <div className="challenges-header">
        <span>Agent</span>
        <div>
          <span>Prize Pool</span>
          <span>Entry Fee</span>
          <span>Status</span>
        </div>
      </div>
      <hr style={{ border: "1px solid rgba(255, 255, 255, 0.6)" }} />
      <div className="challenges-items">
        {challenges?.map((challenge, index) => (
          <ChallengeItem key={index} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
