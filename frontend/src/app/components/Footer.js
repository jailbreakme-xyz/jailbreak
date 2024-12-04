import React from "react";

export default function Footer(props) {
  return (
    <div style={{ width: "100%" }}>
      {props.status !== "concluded" ? (
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
            maxLength={4000}
            value={props.value}
            onChange={props.onChange}
            type="text"
            placeholder={
              props.task ? `${props.task}...` : "Jailbreak this prompt..."
            }
          />
          {props.button}
        </form>
      ) : (
        <div style={{ width: "100%" }}>
          <p style={{ color: "black" }}>
            🥳 This tournament has concluded. See you next time!
          </p>
        </div>
      )}
    </div>
  );
}
