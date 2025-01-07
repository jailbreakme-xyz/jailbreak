pub mod errors;
pub mod instructions;
pub mod state;
pub mod consts;
pub mod fees;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("43m2CSa83AVK6yT7SpZ1KFcScWfxyfid7nQx2KUMWJko");

#[program]
pub mod tournament {
    use super::*;

    pub fn initialize_admin(ctx: Context<InitializeAdmin>) -> Result<()> {
        instructions::initialize_admin::handler(ctx)
    }

    pub fn initialize(ctx: Context<Initialize>, tournament_id: u64) -> Result<()> {
        instructions::initialize::handler(ctx, tournament_id)
    }

    pub fn start_tournament(
        ctx: Context<StartTournament>,
        system_prompt_hash: [u8; 32], 
        initial_pool: u64,
        fee_mul_pct_x10: u8,
        winner_payout_pct: u8,
        royalty_payout_pct: u8,
        tournament_fee_type: u8
    ) -> Result<()> {
        instructions::start::handler(ctx, system_prompt_hash, initial_pool, fee_mul_pct_x10, winner_payout_pct, royalty_payout_pct, tournament_fee_type)
    }

    pub fn conclude_tournament(ctx: Context<ConcludeTournament>) -> Result<()> {
        instructions::conclude::handler(ctx)
    }

    pub fn submit_solution(ctx: Context<SubmitSolution>, solution_hash: [u8; 32]) -> Result<()> {
        instructions::submit::handler(ctx, solution_hash)
    }
}

