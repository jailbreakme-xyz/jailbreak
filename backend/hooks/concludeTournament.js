import getSolPriceInUSDT from "./solPrice.js";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function concludeTournament(
  isValidTransaction,
  challenge,
  assistantMessage,
  blockchainService,
  DatabaseService,
  tournamentPDA,
  walletAddress,
  entryFee,
  fee_multiplier,
  signature
) {
  if (isValidTransaction) {
    const concluded = await blockchainService.concludeTournament(
      tournamentPDA,
      walletAddress
    );
    const solPrice = await getSolPriceInUSDT();

    const winningPrize = entryFee * fee_multiplier;
    const usdPrize = winningPrize * solPrice;

    const successMessage = `🏆 ${challenge.winning_message}\n\n${
      assistantMessage.content
    }\n\n👑 Winner: ${walletAddress}\n\n💰 Amount: $${numberWithCommas(
      usdPrize.toFixed(2)
    )}\n\n🧾 Transaction: ${concluded}`;
    assistantMessage.content = successMessage;
    assistantMessage.win = true;
    await DatabaseService.createChat(assistantMessage);
    await DatabaseService.updateChat(
      {
        txn: signature,
      },
      {
        win: true,
      }
    );
    await DatabaseService.updateChallenge(challenge._id, {
      status: "concluded",
      expiry: new Date(),
      winning_prize: winningPrize,
      usd_prize: usdPrize,
      winner: walletAddress,
    });

    return successMessage;
  } else {
    const failedMessage = `🚨 Transaction verification failed, but this prompt won the tournament, we will manualy verify the transaction and reward you once we confirm the transaction`;
    assistantMessage.content = failedMessage;

    await DatabaseService.createChat(assistantMessage);
    await DatabaseService.updateChallenge(challenge._id, {
      status: "concluded",
      expiry: new Date(),
    });
    return failedMessage;
  }
}

export default concludeTournament;
