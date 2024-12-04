use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::{invoke, invoke_signed};

use crate::state::{Tournament, TournamentState, TOURNAMENT_PAYOUT_PCT};
use crate::errors::JailbreakError;

#[derive(Accounts)]
pub struct ConcludeTournament<'info> {
    #[account(mut)]
    pub tournament: Account<'info, Tournament>,
    pub payer: Signer<'info>,
    #[account(mut)]
    pub winner_account: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ConcludeTournament>) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;

    // check that payer is the tournament authority
    require_keys_eq!(tournament.authority.key(), ctx.accounts.payer.key());

    // update state
    require!(tournament.state == TournamentState::Running, JailbreakError::TournamentNotRunning);
    tournament.state = TournamentState::Concluded;

    
    // Calculate the rent-exempt minimum
    let rent_exempt_minimum = Rent::get()?.minimum_balance(tournament.to_account_info().data_len());
    // Get the lamports held in the tournament account minus the rent-exempt minimum
    let lamports_held =  tournament.to_account_info().lamports() - rent_exempt_minimum;

    // Calculate the payout and ensure the account retains the rent-exempt minimum
    let payout = lamports_held * (TOURNAMENT_PAYOUT_PCT as u64) / 100u64;
    let deployer_payout = lamports_held - payout;

    // Manually transfer lamports by adjusting account balances
    **tournament.to_account_info().try_borrow_mut_lamports()? -= payout + deployer_payout;
    **ctx.accounts.winner_account.try_borrow_mut_lamports()? += payout;
    **ctx.accounts.payer.try_borrow_mut_lamports()? += deployer_payout;

    Ok(())
}