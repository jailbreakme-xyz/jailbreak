import React from "react";
import { PiPaperPlaneRightFill } from "react-icons/pi";

export default function Footer(props) {
  return (
    <div style={{ width: "100%" }}>
      <form
        onSubmit={props.submit}
        style={{
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <input
          style={{ fontSize: "16px" }}
          minLength={1}
          maxLength={1000}
          value={props.value}
          onChange={props.onChange}
          type="text"
          placeholder={
            props.task ? `${props.task}...` : "Jailbreak this prompt..."
          }
        />
        {props.button}
      </form>
    </div>
  );
}
