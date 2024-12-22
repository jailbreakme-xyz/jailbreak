import * as React from "react";
import { Box, styled } from "@mui/system";
import {
  Unstable_NumberInput as BaseNumberInput,
  numberInputClasses,
} from "@mui/base/Unstable_NumberInput";

const NumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
  return (
    <BaseNumberInput
      slots={{
        root: InputRoot,
        input: InputElement,
        incrementButton: Button,
        decrementButton: Button,
      }}
      slotProps={{
        incrementButton: {
          children: !props.disabled ? (
            <span className="arrow pointer">▴</span>
          ) : (
            <></>
          ),
        },
        decrementButton: {
          children: !props.disabled ? (
            <span className="arrow pointer">▾</span>
          ) : (
            <></>
          ),
        },
      }}
      {...props}
      ref={ref}
    />
  );
});

export default function NumberInputAdornments(props) {
  return (
    <NumberInput
      name={props.name}
      value={Number(props.value?.toFixed(4))}
      onChange={(event, val) => {
        event.preventDefault();
        props.onChange(val);
      }}
      endAdornment={
        props.noAdornment ? (
          <></>
        ) : (
          <InputAdornment>{props.suffix ? props.suffix : "SOL"}</InputAdornment>
        )
      }
      min={props.min}
      max={props.max}
      step={props.step}
      disabled={props.disabled}
      className={props.className}
      noAdornment={props.noAdornment}
    />
  );
}

const InputAdornment = styled("div")(
  ({ theme }) => `
  margin: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  grid-row: 1/3;
  color: ${theme.palette.mode === "dark" ? grey[500] : grey[700]};
`
);

const blue = {
  100: "#DAECFF",
  200: "#B6DAFF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  700: "#0059B2",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const InputRoot = styled("div")(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: #0BBF99;
  background: #000;
  border: 1px solid #0BBF99;
  box-shadow: 0 2px 4px rgba(0,0,0, 0.5);
  display: grid;
  grid-template-columns: auto 1fr auto 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  padding: 4px;

  &.${numberInputClasses.focused} {
    border-color: #0BBF99;
    box-shadow: 0 0 0 3px #0BBF99;
  }

  &:hover {
    border-color: #0BBF99;
  }

  /* firefox */
  &:focus-visible {
    outline: 0;
  }
`
);

const InputElement = styled("input")(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-row: 1/3;
  color: #0BBF99;
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`
);

const Button = styled("button")(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 20px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: #0BBF99;
  border: 0;
  color: #000;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === "dark" ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 4/5;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    border-color: #0BBF99;
    background: #0BBF99;
    color: #000;

    &:hover {
      cursor: pointer;
      color: #FFF;
      background: #0BBF99;
      border-color: #0BBF99;
    }
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 4/5;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    border-color: #0BBF99;
    background: #0BBF99;
    color: #000;

    &:hover {
      cursor: pointer;
      color: #FFF;
      background: #0BBF99;
      border-color: #0BBF99;
    }
  }

  & .arrow {
    transform: translateY(-1px);
  }
`
);
