pub mod errors;
pub mod instructions;
pub mod state;
pub mod consts;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("B1XbZeQYZxv5ezBpBgomEUqDvTbM8HwSYfktcpBGkgjg");

#[program]
pub mod tournament {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn start_tournament(ctx: Context<StartTournament>, system_prompt_hash: [u8; 32], initial_pool: u64) -> Result<()> {
        instructions::start::handler(ctx, system_prompt_hash, initial_pool)
    }

    pub fn conclude_tournament(ctx: Context<ConcludeTournament>) -> Result<()> {
        instructions::conclude::handler(ctx)
    }

    pub fn submit_solution(ctx: Context<SubmitSolution>, solution_hash: [u8; 32]) -> Result<()> {
        instructions::submit::handler(ctx, solution_hash)
    }
}

