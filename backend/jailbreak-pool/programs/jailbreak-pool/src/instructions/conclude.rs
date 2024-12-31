use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

use crate::state::{Tournament, TournamentState, ProgramAdmin};
use crate::errors::JailbreakError;

#[derive(Accounts)]
pub struct ConcludeTournament<'info> {
    #[account(mut)]
    pub tournament: Account<'info, Tournament>,
    #[account(
        seeds = [b"admin"],
        bump,
        constraint = program_admin.authority == authority.key() @ JailbreakError::InvalidAuthority
    )]
    pub program_admin: Account<'info, ProgramAdmin>,
    /// CHECK: Safe because we're just sending SOL to this address
    #[account(
        mut,
        constraint = royalty_destination.key() == program_admin.authority
    )]
    pub royalty_destination: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub winner_account: SystemAccount<'info>,
    /// CHECK: Safe because we're just sending SOL to this address
    #[account(
        mut,
        constraint = tournament_authority.key() == tournament.authority @ JailbreakError::InvalidAuthority
    )]
    pub tournament_authority: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ConcludeTournament>) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;

    // rogram_admin.authority
    require!(tournament.state == TournamentState::Running, JailbreakError::TournamentNotRunning);
    tournament.state = TournamentState::Concluded;
    
    // Calculate the rent-exempt minimum
    let rent_exempt_minimum = Rent::get()?.minimum_balance(tournament.to_account_info().data_len());
    // Get the lamports held in the tournament account minus the rent-exempt minimum
    let lamports_held =  tournament.to_account_info().lamports() - rent_exempt_minimum;

    // Calculate the payout and ensure the account retains the rent-exempt minimum
    let payout = lamports_held * (tournament.winner_payout_pct as u64) / 100u64;
    let royalty_payout = lamports_held * (tournament.royalty_payout_pct as u64) / 100u64;
    let deployer_payout = lamports_held - payout - royalty_payout;

    // Manually transfer lamports by adjusting account balances
    **tournament.to_account_info().try_borrow_mut_lamports()? -= payout + deployer_payout + royalty_payout;
    **ctx.accounts.winner_account.try_borrow_mut_lamports()? += payout;
    **ctx.accounts.royalty_destination.try_borrow_mut_lamports()? += royalty_payout;
    // pay tournament authority
    **ctx.accounts.tournament_authority.try_borrow_mut_lamports()? += deployer_payout;

    Ok(())
}