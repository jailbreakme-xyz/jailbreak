import React, { useState } from "react";
import Link from "next/link";
import {
  FaHome,
  FaUserSecret,
  FaCode,
  FaQuestionCircle,
  FaUsers,
  FaBars,
  FaTimes,
  FaFlagCheckered,
  FaShieldVirus,
} from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";
import { SiGitbook, SiGithub } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { GiPodium } from "react-icons/gi";
import { TiThMenu } from "react-icons/ti";
import CountUp from "react-countup";

const MobileMenu = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={props.absolute ? "absolute mobileMenu" : "mobileMenu"}>
      {/* Hamburger Icon */}
      <div className="hamburgerIcon" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={20} /> : <TiThMenu size={20} />}
      </div>

      {/* Menu Items */}
      <div className={`mainMenu ${menuOpen ? "open" : ""}`}>
        <Link
          href="/"
          className="chatMainMenuItem pointer"
          onClick={() => setMenuOpen(false)}
        >
          <FaHome size={25} /> HOME
        </Link>
        {/* <Link
          href="/beta"
          className="chatMainMenuItem pointer"
          onClick={() => setMenuOpen(false)}
        >
          <FaUserSecret size={25} /> CHALLENGES
        </Link> */}
        <Link
          href="/docs"
          className="chatMainMenuItem pointer"
          onClick={() => setMenuOpen(false)}
        >
          <FaCode size={25} /> API
        </Link>
        <Link
          href="/faq"
          className="chatMainMenuItem pointer"
          onClick={() => setMenuOpen(false)}
        >
          <FaQuestionCircle size={25} /> FAQ
        </Link>
        <div className="chatMainMenuItem chatPageSocialMenu">
          <span className="">
            <FaUsers size={25} /> LINKS
          </span>
          <hr />
          <div className="chatPageSocialIcons">
            <a
              href="https://twitter.com/jailbreakme_xyz"
              target="_blank"
              className="pointer"
            >
              <FaXTwitter size={30} className="pointer" />
            </a>
            <a
              href="https://t.me/+-MZ4uveXh2swZmFk"
              target="_blank"
              className="pointer"
            >
              <FaTelegramPlane size={30} className="pointer" />
            </a>
            <a
              href="https://jailbreak.gitbook.io/jailbreakme.xyz"
              target="_blank"
              className="pointer"
            >
              <SiGitbook size={30} className="pointer" />
            </a>
            <a
              href="https://github.com/probonodev/jailbreak"
              target="_blank"
              className="pointer"
            >
              <SiGithub size={30} className="pointer" />
            </a>
          </div>
        </div>
        {props.prize && (
          <div className="chatMenu">
            <div style={{ textAlign: "left" }} className="statsWrapper">
              <h3 style={{ color: "#ccc" }}>Stats</h3>
              <hr />
              <div className="stats">
                <div className="chatComingSoonMenuItem">
                  <h4>PRIZE</h4>
                  <CountUp
                    start={0}
                    end={props.prize}
                    duration={2.75}
                    decimals={0}
                    decimal="."
                  />
                </div>
                <div className="chatComingSoonMenuItem">
                  <h4>Break Attempts</h4>
                  <CountUp
                    start={0}
                    end={props.attempts}
                    duration={2.75}
                    decimals={0}
                    decimal="."
                  />
                </div>
                <div className="chatComingSoonMenuItem">
                  <h4>Message Price</h4>
                  <CountUp
                    start={0}
                    end={props.price}
                    duration={2.75}
                    decimals={2}
                    decimal="."
                    prefix="$"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {/* <div className="chatMenu">
          <div>
            <h3>Coming Soon...</h3>
            <hr />
            <div className="chatMainMenuItem chatComingSoonMenuItem disabled">
              <FaFlagCheckered size={25} /> TOURNAMENTS
            </div>
            <div className="chatMainMenuItem chatComingSoonMenuItem disabled">
              <GiPodium size={25} /> LEADERBOARD
            </div>
            <div className="chatMainMenuItem chatComingSoonMenuItem disabled">
              <FaShieldVirus size={25} /> SECURE AI AGENTS
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MobileMenu;
