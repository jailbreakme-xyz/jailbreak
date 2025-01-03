import ChallengeList from "./ChallengeList";

export default function ChallengesSection({ latestChallenges, challenges }) {
  return (
    <div className="beta-challenges">
      <div className="challenges-lists">
        <ChallengeList
          title="New Born Agents 🍼"
          challenges={latestChallenges}
        />
        <ChallengeList title="Top Prize Pools 💰" challenges={challenges} />
      </div>
    </div>
  );
}
