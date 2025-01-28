import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronCircleRight } from "react-icons/fa";
import Jdenticon from "react-jdenticon";
import CountUp from "react-countup";
import InlineCounters from "./InlineCounters";
import QuickCreation from "./QuickCreation";
import AdvancedModal from "./AdvancedModal";
import { useWallet } from "@solana/wallet-adapter-react";
import AgentCardAlt from "./AgentCardAlt";
import QuickPromptCreation from "./QuickPromptCreation";
import "../../styles/components/Hero.css";

const Hero = ({
  data,
  handleQuickCreationOpen,
  handleQuickCreationClose,
  quickCreationOpen,
  isUploading,
}) => {
  const { publicKey, connected } = useWallet();
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1); // Start with middle card

  useEffect(() => {
    if (data?.heroChallenges?.length === 3) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [data?.heroChallenges]);

  const getPositionClass = (index) => {
    const positions = ["left", "center", "right"];
    const offset = (index - currentIndex + 3) % 3;
    return positions[offset];
  };

  const handleAdvancedModalOpen = () => {
    setAdvancedModalOpen(true);
  };

  const handleAdvancedModalClose = () => {
    setAdvancedModalOpen(false);
    isUploading.current = false;
  };

  return (
    <div className="beta-content">
      <div className="beta-content-left">
        <h1>JailbreakMe</h1>
        <hr style={{ width: "100%", margin: "0px 0px 15px 0px" }} />
        <p>
          The first open-source AI security platform where users earn bounties
          for breaking AI agents.
        </p>
        <InlineCounters data={data} />
        {/* <Counters data={data} /> */}

        {/* <p style={{ fontWeight: "bold", fontStyle: "italic" }}>
          TOP WINNERS 🔥
        </p> */}
        {/* <div
          id="heroTopWinners"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            alignItems: "center",
            columnGap: "25px",
            padding: "0px 0px 0px",
            margin: "0px 0px",
          }}
        >
          {data?.topChatters &&
            data?.topChatters?.slice(0, 5)?.map((breaker, index) => (
              <div
                key={index}
                className="pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/breaker/${breaker?.address}`;
                }}
                style={{
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Jdenticon value={breaker?.address} size={"50"} />
                <p
                  className="beta-breaker-address pointer"
                  style={{
                    backgroundColor: "#000",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {index === 0 && "👑 "}
                  {breaker?.address?.slice(0, 3)}...
                  {breaker?.address?.slice(-3)}
                </p>
                <CountUp
                  end={breaker?.totalUsdPrize?.toFixed(0)}
                  prefix="$"
                  start={0}
                  duration={2.75}
                  decimals={0}
                  decimal="."
                />
              </div>
            ))}
        </div> */}
        {/* <div className="hero-buttons">
          <button
            className="styledBtn pointer launch-agent-btn"
            onClick={handleQuickCreationOpen}
            style={{
              backgroundColor: "#0BBF99",
              color: "#000",
              border: "2px solid #0BBF99",
            }}
          >
            LAUNCH AGENT 🚀
          </button>
          <Link
            to={`/break/${data?.activeChallenge?.name}`}
            target="_blank"
            className="pointer"
            style={{
              zIndex: "99",
              position: "relative",
              textDecoration: "none",
            }}
          >
            <button className="styledBtn pointer">
              START BREAKING <FaChevronCircleRight className="pointer" />
            </button>
          </Link>
        </div> */}

        <QuickPromptCreation isUploading={isUploading} />

        <QuickCreation
          isUploading={isUploading}
          open={quickCreationOpen}
          onClose={handleQuickCreationClose}
          sample={data?.challenges?.find((agent) => agent.sample === "quick")}
          setAdvancedModalOpen={setAdvancedModalOpen}
          connected={connected}
          publicKey={publicKey}
        />
        <AdvancedModal
          isUploading={isUploading}
          formOpen={advancedModalOpen}
          setFormOpen={setAdvancedModalOpen}
          connected={connected}
          publicKey={publicKey}
          handleAdvancedModalClose={handleAdvancedModalClose}
          handleAdvancedModalOpen={handleAdvancedModalOpen}
        />
      </div>
      <div
        className="beta-content-right"
        style={{ width: data?.heroChallenges?.length === 3 ? "40%" : "330px" }}
      >
        {data?.heroChallenges?.length === 3 ? (
          <div className="cards-stack-container">
            {data.heroChallenges.map((challenge, index) => (
              <div
                key={challenge?._id || index}
                className={`stack-card stack-card-${getPositionClass(index)}`}
              >
                <AgentCardAlt agent={challenge || {}} />
              </div>
            ))}
          </div>
        ) : (
          data?.activeChallenge && (
            <AgentCardAlt agent={data?.activeChallenge} />
          )
        )}
      </div>
    </div>
  );
};

export default Hero;
