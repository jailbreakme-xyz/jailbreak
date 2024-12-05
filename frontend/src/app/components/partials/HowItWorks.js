import React from "react";
import "../../../styles/HowItWorks.css";
import { TbTargetArrow } from "react-icons/tb";
import { GiBreakingChain } from "react-icons/gi";
import { FaRobot } from "react-icons/fa";
import { FaTrophy } from "react-icons/fa";

const steps = [
  {
    title: "Choose a Tournament",
    description:
      "Pick a challenge or get one assigned. Each is crafted to test your creativity.",
    icon: <TbTargetArrow color="#ff004b" />,
    // icon: "I",
    // icon: "🎯",
  },
  {
    title: "Break the LLM Restrictions",
    description:
      "Use your ingenuity to bypass the AI's restrictions. We save conversations linked to your wallet to determine success.",
    icon: <GiBreakingChain color="#09bf99" />,
    // icon: "II",
    // icon: "⛓️‍💥",
  },
  {
    title: "Win the Prize Pool",
    description: "If you succeed, claim your reward and climb the leaderboard.",
    icon: <FaTrophy color="#ff9e01" />,
    // icon: "III",
    // icon: "🏆",
  },
];

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const HowItWorks = (props) => {
  return (
    <div className="how-it-works-container">
      {/* <h2 className="how-it-works-title">How It Works</h2> */}
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step">
            <div className="step-icon">{step.icon}</div>
            <hr />
            <h3 className="step-title">{step.title}</h3>
            {/* <p className="step-description">{step.description}</p> */}
          </div>
        ))}
      </div>
      {/* {props.threshold && (
        <p className="note">
          <strong>Note:</strong> To participate, you must hold at least{" "}
          {numberWithCommas(props.threshold)} <a>$JAIL coins →</a>
        </p>
      )} */}
    </div>
  );
};

export default HowItWorks;
