use crate::state::TournamentFeeType;

pub fn update_fee(fee: u64, fee_mul_pct_x10: u8, fee_type: TournamentFeeType) -> u64 {
    let mut new_fee = fee;
    if fee_type == TournamentFeeType::Exp {
        new_fee += fee * (fee_mul_pct_x10 as u64) / 1000u64;
    }
    new_fee
}