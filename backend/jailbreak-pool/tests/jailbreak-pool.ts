import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
const assert = require("assert");
import { Tournament, TournamentState } from "../target/types/tournament";

describe("tournament", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Tournament as Program<Tournament>;
  const init_seed = anchor.utils.bytes.utf8.encode("tournament");
  const entry_sum = 100000000000;
  let init_balance = 0;
  
  let tournamentPubKey;

  beforeEach(async () => {
    [tournamentPubKey] = await anchor.web3.PublicKey.findProgramAddressSync(
      [init_seed],
      program.programId
    );
  });

  it("runs the constructor", async () => {
    await program.methods.initialize().accounts({
      tournament: tournamentPubKey,
      authority: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
    const tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    assert.equal(tournamentAccount.authority, provider.wallet.publicKey.toString());
    init_balance = await provider.connection.getBalance(tournamentPubKey);
  });

  it("Starts a tournament", async () => {
    const expected_entry_fee = entry_sum / 100;
    const system_prompt_hash = Array.from(new Uint8Array(32).fill(0));
    await program.methods.startTournament(system_prompt_hash, new anchor.BN(entry_sum)).accounts({
      tournament: tournamentPubKey,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    const tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    assert.equal(tournamentAccount.entryFee, expected_entry_fee);
    const balance = await provider.connection.getBalance(tournamentPubKey);
    assert.equal(balance - init_balance, entry_sum);
    // TODO: Fix this
    // assert.equal(tournamentAccount.state, TournamentState.Running);
  });

  it("Submits some solutions", async () => {
    let tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    const entry_fee = tournamentAccount.entryFee / 1;
    const solution_hash = Array.from(new Uint8Array(32).fill(1));
    await program.methods.submitSolution(solution_hash).accounts({
      tournament: tournamentPubKey,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    assert.equal(tournamentAccount.entryFee, entry_fee*1.01);
    const balance = await provider.connection.getBalance(tournamentPubKey);
    assert.equal(balance - init_balance, entry_sum + entry_fee);
  });

  it("Concludes a tournament", async () => {
    await program.methods.concludeTournament().accounts({
      tournament: tournamentPubKey,
      payer: provider.wallet.publicKey,
      winnerAccount: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    // assert that the contract doesnt hold any SOL
    let balance = await provider.connection.getBalance(tournamentPubKey);
    assert.equal(balance, init_balance);
    // TODO: Fix this
    // assert.equal(tournamentAccount.state, TournamentState.Concluded);
  });

  it("Starts a second tournament", async () => {
    let system_prompt_hash = Array.from(new Uint8Array(32).fill(2));
    await program.methods.startTournament(system_prompt_hash, new anchor.BN(entry_sum)).accounts({
      tournament: tournamentPubKey,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    const tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    assert.equal(tournamentAccount.entryFee, entry_sum*0.01);
    const balance = await provider.connection.getBalance(tournamentPubKey);
    assert.equal(balance - init_balance, entry_sum);
  });

  it("Submits to the second tournament", async () => {
    let tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    let entry_fee = tournamentAccount.entryFee / 1;
    let solution_hash = Array.from(new Uint8Array(32).fill(3));
    await program.methods.submitSolution(solution_hash).accounts({
      tournament: tournamentPubKey,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    assert.equal(tournamentAccount.entryFee, entry_fee*1.01);
    let balance = await provider.connection.getBalance(tournamentPubKey);
    assert.equal(balance - init_balance, entry_sum + entry_fee);

    tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    let entry_fee2 = tournamentAccount.entryFee / 1;
    solution_hash = Array.from(new Uint8Array(32).fill(4));
    await program.methods.submitSolution(solution_hash).accounts({
      tournament: tournamentPubKey,
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    tournamentAccount = await program.account.tournament.fetch(tournamentPubKey);
    assert.equal(tournamentAccount.entryFee, entry_fee2*1.01);
    balance = await provider.connection.getBalance(tournamentPubKey);
    assert.equal(balance - init_balance, entry_sum + entry_fee2 + entry_fee);
  });
  
  it("Concludes a second tournament", async () => {
    await program.methods.concludeTournament().accounts({
      tournament: tournamentPubKey,
      payer: provider.wallet.publicKey, 
      winnerAccount: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();
    let balance = await provider.connection.getBalance(tournamentPubKey);
    assert.equal(balance, init_balance);
  });
});
