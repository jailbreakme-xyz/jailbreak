use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::state::{Tournament, TournamentState};
use crate::errors::JailbreakError;

#[derive(Accounts)]
pub struct SubmitSolution<'info> {
    #[account(mut)]
    pub tournament: Account<'info, Tournament>,
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[event]
pub struct SolutionSubmitted {
    pub submitter: Pubkey,
    pub solution_hash: [u8; 32],
    pub amount_paid: u64,
}

pub fn handler(ctx: Context<SubmitSolution>, solution_hash: [u8; 32]) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;

    // Check that the tournament is accepting submissions
    if tournament.state != TournamentState::Running {
        return Err(JailbreakError::TournamentNotRunning.into());
    }
    
    // Transfer tokens from submitter to tournament account
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.payer.to_account_info(),
            to: tournament.to_account_info(),
        },
    );
    transfer(cpi_context, tournament.entry_fee)?;

    tournament.entry_fee += tournament.entry_fee * (tournament.fee_mul_pct as u64) / 1000u64;

    emit!(SolutionSubmitted {
        // address of submitter
        submitter: ctx.accounts.payer.key(),
        // sha256 hash of solution
        solution_hash,
        // amount paid
        amount_paid: tournament.entry_fee,
    });
    Ok(())
}

