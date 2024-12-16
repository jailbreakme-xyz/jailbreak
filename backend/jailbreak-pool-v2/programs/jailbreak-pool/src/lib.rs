pub mod errors;
pub mod instructions;
pub mod state;
pub mod consts;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("9LRtUrui3pfsMpBe7NGLdGsjNUPKRT5W6rwddTTuAxTE");

#[program]
pub mod tournament {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn start_tournament(ctx: Context<StartTournament>, system_prompt_hash: [u8; 32], initial_pool: u64, fee_mul_pct_x10: u8, winner_payout_pct: u8) -> Result<()> {
        instructions::start::handler(ctx, system_prompt_hash, initial_pool, fee_mul_pct_x10, winner_payout_pct)
    }

    pub fn conclude_tournament(ctx: Context<ConcludeTournament>) -> Result<()> {
        instructions::conclude::handler(ctx)
    }

    pub fn submit_solution(ctx: Context<SubmitSolution>, solution_hash: [u8; 32]) -> Result<()> {
        instructions::submit::handler(ctx, solution_hash)
    }
}

