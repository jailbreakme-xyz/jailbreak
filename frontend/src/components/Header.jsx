import stoneLogo from "../../assets/stone_logo.png";
import MobileMenu from "./MobileMenu";
import lightSlogen from "../../assets/lightSlogen.png";
import "../globals.css";
import "../../styles/MainMenu.css";
import "../../styles/Chat.css";

export default function Header(props) {
  return (
    <div id="header">
      <MobileMenu
        attempts={props.attempts}
        price={props.price}
        prize={props.prize}
        hiddenItems={props.hiddenItems}
        challenge={props.challenge}
        usdPrice={props.usdPrice}
        usdPrize={props.usdPrize}
        activeChallenge={props.activeChallenge}
      />
      <img
        onClick={() => {
          window.location.href = "/";
        }}
        alt="logo"
        src={stoneLogo}
        width="80"
        style={{
          borderRadius: "0px 0px 50px 50px",
          marginBottom: "10px",
        }}
        className="pointer mainLogo"
      />
      <img
        className="pointer"
        onClick={() => {
          window.location.href = "/";
        }}
        alt="logo"
        src={lightSlogen}
        width="120"
      />
    </div>
  );
}
