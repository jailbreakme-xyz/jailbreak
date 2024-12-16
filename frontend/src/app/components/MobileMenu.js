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

function numberWithCommas(x) {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
        {props.activeChallenge && (
          <Link
            href={`/agent/${props.activeChallenge?.name}`}
            className="chatMainMenuItem pointer"
            style={{ textTransform: "uppercase" }}
          >
            <Image
              src={props.activeChallenge?.pfp}
              alt="logo"
              width="25"
              height="25"
              style={{ borderRadius: "50px" }}
            />{" "}
            {props.activeChallenge?.name}
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
        {!props.hiddenItems?.includes("SOCIAL") && (
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
        )}

        {props.component === "break" && (
          <div className="chatMenu">
            {console.log(props)}
            <div
              style={{ textAlign: "left", color: "#ccc" }}
              className="statsWrapper"
            >
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
              {props.challenge && (
                <div className="stats">
                  <div className="chatComingSoonMenuItem">
                    <h4>PRIZE</h4>
                    <CountUp
                      start={0}
                      end={
                        props.usdPrize
                          ? props.usdPrize
                          : numberWithCommas(
                              (props.prize * props.solPrice).toFixed(2)
                            )
                      }
                      duration={2.75}
                      decimals={2}
                      decimal="."
                      prefix="$"
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
                      end={props.usdPrice}
                      duration={2.75}
                      decimals={2}
                      decimal="."
                      prefix="$"
                    />
                  </div>
                  <hr />
                  <br />
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "normal",
                      margin: "8px 0px",
                    }}
                  >
                    <strong>Characters Per Message:</strong> ~
                    {numberWithCommas(props.challenge.characterLimit)}
                  </p>
                  {props.challenge.charactersPerWord && (
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "normal",
                        margin: "8px 0px",
                      }}
                    >
                      <strong>Characters Per Word:</strong>{" "}
                      {props.challenge.charactersPerWord}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "normal",
                      margin: "8px 0px",
                    }}
                  >
                    <strong>Context Window:</strong> ~
                    {props.challenge.contextLimit}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "normal",
                      margin: "8px 0px",
                    }}
                  >
                    <strong>UI Chat Limit:</strong> ~
                    {props.challenge.chatLimit || "Unlimited"}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "normal",
                      margin: "8px 0px",
                    }}
                  >
                    <strong>Developer Fee: </strong>
                    {props.challenge.developer_fee}%
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "normal",
                      margin: "8px 0px",
                    }}
                  >
                    Message fees increase the prize pool.
                  </p>
                  {props.challenge?.custom_rules && (
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "normal",
                        margin: "8px 0px",
                      }}
                    >
                      {props.challenge?.custom_rules}
                    </p>
                  )}
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
