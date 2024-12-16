use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::state::{Tournament, TournamentState};
use crate::errors::JailbreakError;

#[derive(Accounts)]
pub struct StartTournament<'info> {
    #[account(mut)]
    pub tournament: Account<'info, Tournament>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// TournamentStarted event
#[event]
pub struct TournamentStarted {
    pub system_prompt_hash: [u8; 32],
    pub initial_pool: u64,
}

pub fn handler(ctx: Context<StartTournament>, system_prompt_hash: [u8; 32], initial_pool: u64, fee_mul_pct: u8, winner_payout_pct: u8) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;
    let payer = &mut ctx.accounts.payer;

    require_keys_eq!(tournament.authority.key(), payer.key());
    require!(tournament.state == TournamentState::Concluded, JailbreakError::TournamentNotConcluded);
    tournament.state = TournamentState::Running;

    // transfer initial pool tokens to the tournament
    let cpi_context = CpiContext::new(ctx.accounts.system_program.to_account_info(), Transfer {
        from: payer.to_account_info(),
        to: tournament.to_account_info(),
    });
    transfer(cpi_context, initial_pool)?;

    tournament.fee_mul_pct = fee_mul_pct;
    tournament.winner_payout_pct = winner_payout_pct;
    tournament.entry_fee = initial_pool * (fee_mul_pct as u64) / 1000u64;
    emit!(TournamentStarted {
        system_prompt_hash: system_prompt_hash,
        initial_pool: initial_pool,
    });
    Ok(())
}
