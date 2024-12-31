use anchor_lang::prelude::*;

use crate::state::{Tournament, TournamentState, ProgramAdmin};

#[derive(Accounts)]
#[instruction(tournament_id: u64)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Tournament::MAX_SIZE,
        seeds = [
            b"tournament",
            authority.key().as_ref(),
            tournament_id.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub tournament: Account<'info, Tournament>,
    #[account(
        seeds = [b"admin"],
        bump,
    )]
    pub program_admin: Account<'info, ProgramAdmin>,
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, tournament_id: u64) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;
    tournament.authority = ctx.accounts.authority.key();
    tournament.state = TournamentState::Concluded;
    tournament.tournament_id = tournament_id;
    Ok(())
}

