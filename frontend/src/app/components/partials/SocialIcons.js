import React from "react";
import { FaTelegramPlane, FaUserSecret } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiGitbook, SiGithub } from "react-icons/si";
import Image from "next/image";
import SolIcon from "../../../assets/solIcon.png";
import Jdenticon from "react-jdenticon";

export default function SocialIcons(props) {
  return (
    <div className="socialIcons">
      <a
        href="https://twitter.com/jailbreakme_xyz"
        target="_blank"
        className="pointer"
      >
        <FaXTwitter size={25} className="pointer" />
      </a>
      <a
        href="https://t.me/jailbreakme_xyz"
        target="_blank"
        className="pointer"
      >
        <FaTelegramPlane size={25} className="pointer" />
      </a>
      <a
        href="https://solscan.io/account/B1XbZeQYZxv5ezBpBgomEUqDvTbM8HwSYfktcpBGkgjg"
        target="_blank"
        className="pointer imgIcon"
      >
        <Image
          src={SolIcon}
          alt="Solana"
          width={25}
          height={25}
          className="pointer"
        />
      </a>
      <a
        href="https://jailbreak.gitbook.io/jailbreakme.xyz"
        target="_blank"
        className="pointer"
      >
        <SiGitbook size={25} className="pointer" />
      </a>
      <a
        href="https://github.com/probonodev/jailbreak"
        target="_blank"
        className="pointer"
      >
        <SiGithub size={25} className="pointer" />
      </a>
      {props.address && <div className="separator"></div>}
      {props.address && (
        <a
          href={`/breaker/${props.address}`}
          target="_blank"
          className="pointer userIcon"
        >
          <Jdenticon
            value={props.address}
            className="pointer"
            size={"30"}
            style={{ border: "3px double #0BBF99" }}
          />
        </a>
      )}
    </div>
  );
}
