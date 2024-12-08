import React, { useState } from "react";
import Link from "next/link";
import {
  FaHome,
  FaCode,
  FaQuestionCircle,
  FaUsers,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";
import { SiGitbook, SiGithub } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { TiThMenu } from "react-icons/ti";
import CountUp from "react-countup";
import {
  GiBreakingChain,
  GiTwoCoins,
  GiArtificialIntelligence,
} from "react-icons/gi";
import Image from "next/image";
import SolIcon from "../../assets/solIcon.png";
import darkSlogen from "../../assets/darkSlogen.png";
const MobileMenu = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={props.absolute ? "absolute mobileMenu" : "mobileMenu"}>
      <div className="hamburgerIcon" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={20} /> : <TiThMenu size={20} />}
      </div>

      <div className={`mainMenu ${menuOpen ? "open" : ""}`}>
        <Image
          src={darkSlogen}
          alt="logo"
          width="200"
          style={{ marginBottom: "15px" }}
        />
        <Link
          href="/"
          className="chatMainMenuItem pointer"
          onClick={() => setMenuOpen(false)}
        >
          <FaHome size={25} /> HOME
        </Link>
        {!props.hiddenItems?.includes("BREAK") && (
          <Link href="/break/Lumiere" className="chatMainMenuItem pointer">
            <GiBreakingChain size={25} /> BREAK
          </Link>
        )}
        {!props.hiddenItems?.includes("ZYNX") && (
          <Link href="/agent/Lumiere" className="chatMainMenuItem pointer">
            <GiArtificialIntelligence size={25} /> LUMIERE
          </Link>
        )}
        {!props.hiddenItems?.includes("API") && (
          <Link
            href="/docs"
            className="chatMainMenuItem pointer"
            onClick={() => setMenuOpen(false)}
          >
            <FaCode size={25} /> API
          </Link>
        )}
        <Link
          href="/faq"
          className="chatMainMenuItem pointer"
          onClick={() => setMenuOpen(false)}
        >
          <FaQuestionCircle size={25} /> FAQ
        </Link>
        <Link
          href="/jail-token"
          className="chatMainMenuItem pointer"
          onClick={() => setMenuOpen(false)}
        >
          <GiTwoCoins size={25} /> $JAIL TOKENS
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
              href="https://t.me/jailbreakme_xyz"
              target="_blank"
              className="pointer"
            >
              <FaTelegramPlane size={30} className="pointer" />
            </a>
            <a
              href="https://solscan.io/account/B1XbZeQYZxv5ezBpBgomEUqDvTbM8HwSYfktcpBGkgjg"
              target="_blank"
              className="pointer imgIcon"
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Image
                src={SolIcon}
                alt="Solana"
                width={30}
                height={30}
                className="pointer"
              />
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
              <h3 style={{ color: "#ccc" }}>
                <FaChartLine
                  style={{
                    position: "relative",
                    top: "4px",
                  }}
                />{" "}
                STATS
              </h3>
              <hr />
              <div className="stats">
                <div className="chatComingSoonMenuItem">
                  <h4>PRIZE</h4>
                  <CountUp
                    start={0}
                    end={props.prize}
                    duration={2.75}
                    decimals={2}
                    decimal="."
                    suffix=" SOL"
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
                    decimals={3}
                    decimal="."
                    suffix=" SOL"
                  />
                </div>
                <a
                  href={`/agent/${props.challenge?.name}`}
                  target="_blank"
                  className="pointer"
                  style={{
                    color: "#09bf99",
                    fontSize: "16px",
                    fontWeight: "normal",
                  }}
                >
                  Read More →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
