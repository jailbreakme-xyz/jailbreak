use anchor_lang::prelude::*;

use crate::state::{ProgramAdmin};

#[derive(Accounts)]
pub struct InitializeAdmin<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32,
        seeds = [b"admin"],
        bump,
    )]
    pub program_admin: Account<'info, ProgramAdmin>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeAdmin>) -> Result<()> {
    let program_admin = &mut ctx.accounts.program_admin;
    program_admin.authority = ctx.accounts.authority.key();
    Ok(())
}