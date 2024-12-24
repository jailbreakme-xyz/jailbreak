use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::state::{Tournament, TournamentState, TournamentFeeType};
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
    pub fee_mul_pct_x10: u8,
    pub winner_payout_pct: u8,
    pub fee_type: TournamentFeeType,
}

pub fn handler(ctx: Context<StartTournament>, system_prompt_hash: [u8; 32], initial_pool: u64, fee_mul_pct_x10: u8, winner_payout_pct: u8, tournament_fee_type: u8) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;
    let payer = &mut ctx.accounts.payer;

    require_keys_eq!(tournament.authority.key(), payer.key());
    require!(tournament.state == TournamentState::Concluded, JailbreakError::TournamentNotConcluded);
    tournament.state = TournamentState::Running;

    // convert tournament_fee_type to TournamentFeeType
    tournament.fee_type = match tournament_fee_type {
        0 => TournamentFeeType::Exp,
        1 => TournamentFeeType::Const,
        _ => return Err(JailbreakError::InvalidTournamentFeeType.into()),
    };

    // transfer initial pool tokens to the tournament
    let cpi_context = CpiContext::new(ctx.accounts.system_program.to_account_info(), Transfer {
        from: payer.to_account_info(),
        to: tournament.to_account_info(),
    });
    transfer(cpi_context, initial_pool)?;

    tournament.fee_mul_pct_x10 = fee_mul_pct_x10;
    tournament.winner_payout_pct = winner_payout_pct;
    tournament.entry_fee = initial_pool * (fee_mul_pct_x10 as u64) / 1000u64;
    emit!(TournamentStarted {
        system_prompt_hash: system_prompt_hash,
        initial_pool: initial_pool,
        fee_mul_pct_x10: fee_mul_pct_x10,
        winner_payout_pct: winner_payout_pct,
        fee_type: tournament.fee_type,
    });
    Ok(())
}