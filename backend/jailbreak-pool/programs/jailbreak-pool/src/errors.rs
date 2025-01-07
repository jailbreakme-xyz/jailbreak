use anchor_lang::prelude::*;


#[error_code]
pub enum JailbreakError {
    #[msg("Tournament is not running")]
    TournamentNotRunning,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Tournament is not concluded")]
    TournamentNotConcluded,
    #[msg("Invalid tournament fee type")]
    InvalidTournamentFeeType,
}