use anchor_lang::prelude::*;

// TODO: configure this
pub const TOURNAMENT_COIN: Pubkey = pubkey!("So11111111111111111111111111111111111111112");

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, PartialEq)]
pub enum TournamentFeeType {
    #[default]
    Exp,
    Const,
}

// these pcts are multiples of 10000 (0.01 -> 1% -> 100)
#[account]
#[derive(Default)]
pub struct Tournament {
    pub authority: Pubkey,
    pub state: TournamentState,
    pub fee_type: TournamentFeeType,
    pub entry_fee: u64,
    pub fee_mul_pct_x10: u8,
    pub winner_payout_pct: u8,
}
impl Tournament {
    // TODO: calculate this automatically in the future
    // 32 = pubkey, 2 = 2xenum(u8), 8 = u64, 1 = u8, 1 = u8
    pub const MAX_SIZE: usize = 32 + 2 + 8 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, PartialEq)]
pub enum TournamentState {
    #[default]
    Concluded,
    Running,
}