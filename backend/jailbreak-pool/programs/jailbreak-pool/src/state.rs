use anchor_lang::prelude::*;

// TODO: configure this
pub const TOURNAMENT_COIN: Pubkey = pubkey!("So11111111111111111111111111111111111111112");
pub const TOURNAMENT_FEE_MULTIPLIER_PCT: u8 = 1;
pub const TOURNAMENT_PAYOUT_PCT: u8 = 70;

#[account]
#[derive(Default)]
pub struct Tournament {
    pub authority: Pubkey,
    pub state: TournamentState,
    pub entry_fee: u64,
}
impl Tournament {
    // TODO: calculate this automatically in the future
    // 32 = pubkey, 1 = enum(u8), 8 = u64
    pub const MAX_SIZE: usize = 32 + 1 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, PartialEq)]
pub enum TournamentState {
    #[default]
    Concluded,
    Running,
}
