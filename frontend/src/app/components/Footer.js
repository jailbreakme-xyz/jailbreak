import React from "react";
import { PiPaperPlaneRightFill } from "react-icons/pi";
export default function Footer(props) {
  // Inline styles
  const footerStyle = {
    // position: "fixed",
    left: 0,
    bottom: 0,
    // width: "100%",
    backgroundColor: "#181726",
    textAlign: "center",
    padding: "25px 0",
    borderTop: "1px solid #e7e7e7",
  };

  const inputStyle = {
    height: "40px",
    boxSizing: "border-box",
    fontSize: "16px",
    padding: "0px 10px",
    fontWeight: "bold",
    borderTop: "2px solid #ccc",
    borderRight: "0px solid #ccc",
    borderBottom: "2px solid #ccc",
    borderLeft: "2px solid #ccc",
    borderRadius: "50px 0px 0px 50px",
    width: "80%",
    maxWidth: "500px",
  };

  return (
    <div style={{ width: "100%" }}>
      <form
        onSubmit={props.submit}
        style={{
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          width: "90%",
        }}
      >
        <input
          minLength={1}
          maxLength={1000}
          value={props.value}
          onChange={props.onChange}
          type="text"
          placeholder={
            props.task ? `${props.task}...` : "Jailbreak this prompt..."
          }
        />
        {props.allowed ? (
          <button
            style={{ display: "flex" }}
            className="pointer"
            type="submit"
            // style={{
            //   height: "40px",
            //   boxSizing: "border-box",
            //   padding: "0px 25px",
            //   fontSize: "16px",
            //   borderTop: "2px solid #ccc",
            //   borderRight: "2px solid #ccc",
            //   borderBottom: "2px solid #ccc",
            //   borderLeft: "0px solid #ccc",
            //   borderRadius: "0px 50px 50px 0px",
            //   backgroundColor: "#1C1A39",
            //   color: "#FEC434",
            // }}
          >
            <PiPaperPlaneRightFill className="pointer" />
          </button>
        ) : (
          <button
            style={{ display: "flex", cursor: "not-allowed" }}
            className="disabled stoneBtn grayed"
            type="button"
            // style={{
            //   height: "40px",
            //   boxSizing: "border-box",
            //   padding: "0px 25px",
            //   fontSize: "16px",
            //   borderTop: "2px solid #ccc",
            //   borderRight: "2px solid #ccc",
            //   borderBottom: "2px solid #ccc",
            //   borderLeft: "0px solid #ccc",
            //   borderRadius: "0px 50px 50px 0px",
            //   backgroundColor: "#1C1A39",
            //   color: "#FEC434",
            // }}
          >
            Coming Soon
          </button>
        )}
      </form>
    </div>
  );
}
