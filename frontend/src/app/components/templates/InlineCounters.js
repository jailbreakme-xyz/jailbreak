"use client";
import React from "react";
import CountUp from "react-countup";
import {
  GiBreakingChain,
  GiOpenTreasureChest,
  GiPayMoney,
} from "react-icons/gi";

const InlineCounters = ({ data }) => {
  return (
    <div className="beta-counters inline-counters desktop">
      <div>
        <h4>🏆 TOTAL PAYOUT</h4>
        <CountUp
          start={1000}
          end={data?.total_payout + data?.treasury}
          duration={2.75}
          decimals={0}
          decimal="."
          prefix="$"
        />
      </div>
      <div>
        <h4>💰 NET PAYOUT</h4>
        <CountUp
          start={1000}
          end={data?.total_payout}
          duration={2.75}
          decimals={0}
          decimal="."
          prefix="$"
        />
      </div>
    </div>
  );
};

export default InlineCounters;
