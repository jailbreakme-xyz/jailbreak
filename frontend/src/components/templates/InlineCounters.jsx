import React from "react";
import CountUp from "react-countup";

const InlineCounters = ({ data }) => {
  return (
    <div className="beta-counters inline-counters">
      <div>
        <h4>🏆 TOTAL PAYOUT</h4>
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
        <h4>💰 NET PAYOUT</h4>
        <CountUp
          start={1000}
          end={data?.totalNetPrize}
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
