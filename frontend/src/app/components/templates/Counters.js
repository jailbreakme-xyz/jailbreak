"use client";
import React from "react";
import CountUp from "react-countup";
import {
  GiBreakingChain,
  GiOpenTreasureChest,
  GiPayMoney,
} from "react-icons/gi";

const Counters = ({ data }) => {
  return (
    <div
      className="beta-counters"
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div>
        <GiPayMoney size={44} />
        <h4>
          TOTAL
          <br />
          PAYOUT
        </h4>
        <hr />
        <CountUp
          start={1000}
          end={data?.total_payout}
          duration={2.75}
          decimals={0}
          decimal="."
          prefix="$"
        />
      </div>
      <div>
        <GiOpenTreasureChest size={44} />
        <h4>
          TOTAL
          <br />
          REVENUE
        </h4>
        <hr />
        <CountUp
          start={1000}
          end={data?.treasury}
          duration={2.75}
          decimals={0}
          decimal="."
          prefix="$"
        />
      </div>
      <div>
        <GiBreakingChain size={44} />
        <h4>
          BREAK
          <br />
          ATTEMPTS
        </h4>
        <hr />
        <CountUp
          start={100}
          end={data?.breakAttempts}
          duration={2.75}
          decimals={0}
          decimal="."
        />
      </div>
    </div>
  );
};

export default Counters;
