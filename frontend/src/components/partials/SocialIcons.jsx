import React from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiGitbook, SiGithub } from "react-icons/si";
import Jdenticon from "react-jdenticon";

export default function SocialIcons(props) {
  return (
    <div className="socialIcons">
      <a
        href="https://twitter.com/jailbreakme_xyz"
        target="_blank"
        className="pointer"
      >
        <FaXTwitter size={20} className="pointer" />
      </a>
      <a
        href="https://t.me/jailbreakme_xyz"
        target="_blank"
        className="pointer"
      >
        <FaTelegramPlane size={20} className="pointer" />
      </a>
      <a
        href="https://solscan.io/account/43m2CSa83AVK6yT7SpZ1KFcScWfxyfid7nQx2KUMWJko"
        target="_blank"
        className="pointer imgIcon"
      >
        <img
          src="/images/solIcon.png"
          alt="Solana"
          width={20}
          height={20}
          className="pointer"
        />
      </a>
      <a
        href="https://jailbreak.gitbook.io/jailbreakme.xyz"
        target="_blank"
        className="pointer"
      >
        <SiGitbook size={20} className="pointer" />
      </a>
      <a
        href="https://github.com/jailbreakme-xyz"
        target="_blank"
        className="pointer"
      >
        <SiGithub size={20} className="pointer" />
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
