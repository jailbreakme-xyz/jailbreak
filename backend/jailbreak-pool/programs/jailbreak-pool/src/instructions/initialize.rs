use anchor_lang::prelude::*;

use crate::state::{Tournament, TournamentState};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Tournament::MAX_SIZE,
        seeds = [b"tournament"],
        bump,
    )]
    pub tournament: Account<'info, Tournament>,
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let tournament = &mut ctx.accounts.tournament;
    require_keys_eq!(tournament.authority.key(), Pubkey::default());
    tournament.authority = ctx.accounts.authority.key();
    tournament.state = TournamentState::Concluded;

    Ok(())
}
