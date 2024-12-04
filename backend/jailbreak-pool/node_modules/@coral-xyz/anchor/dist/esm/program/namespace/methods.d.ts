import { AccountMeta, ConfirmOptions, PublicKey, Signer, Transaction, TransactionInstruction, TransactionSignature } from "@solana/web3.js";
import { Idl, IdlInstructionAccount, IdlInstructionAccountItem, IdlInstructionAccounts, IdlTypeDef } from "../../idl.js";
import Provider from "../../provider.js";
import { AccountsGeneric, CustomAccountResolver } from "../accounts-resolver.js";
import { Address } from "../common.js";
import { Accounts } from "../context.js";
import { AccountNamespace } from "./account.js";
import { InstructionFn } from "./instruction.js";
import { RpcFn } from "./rpc.js";
import { SimulateFn, SimulateResponse } from "./simulate.js";
import { TransactionFn } from "./transaction.js";
import { AllInstructions, InstructionAccountAddresses, MakeMethodsNamespace, MethodsFn } from "./types.js";
import { ViewFn } from "./views.js";
export type MethodsNamespace<IDL extends Idl = Idl, I extends AllInstructions<IDL> = AllInstructions<IDL>> = MakeMethodsNamespace<IDL, I>;
export declare class MethodsBuilderFactory {
    static build<IDL extends Idl, I extends AllInstructions<IDL>>(provider: Provider, programId: PublicKey, idlIx: AllInstructions<IDL>, ixFn: InstructionFn<IDL>, txFn: TransactionFn<IDL>, rpcFn: RpcFn<IDL>, simulateFn: SimulateFn<IDL>, viewFn: ViewFn<IDL> | undefined, accountNamespace: AccountNamespace<IDL>, idlTypes: IdlTypeDef[], customResolver?: CustomAccountResolver<IDL>): MethodsFn<IDL, I, MethodsBuilder<IDL, I>>;
}
type ResolvedAccounts<A extends IdlInstructionAccountItem = IdlInstructionAccountItem> = PartialUndefined<ResolvedAccountsRecursive<A>>;
type ResolvedAccountsRecursive<A extends IdlInstructionAccountItem = IdlInstructionAccountItem> = OmitNever<{
    [N in A["name"]]: ResolvedAccount<A & {
        name: N;
    }>;
}>;
type ResolvedAccount<A extends IdlInstructionAccountItem = IdlInstructionAccountItem> = A extends IdlInstructionAccounts ? ResolvedAccountsRecursive<A["accounts"][number]> : A extends NonNullable<Pick<IdlInstructionAccount, "address">> ? never : A extends NonNullable<Pick<IdlInstructionAccount, "pda">> ? never : A extends NonNullable<Pick<IdlInstructionAccount, "relations">> ? never : A extends {
    signer: true;
} ? Address | undefined : PartialAccount<A>;
type PartialUndefined<T, P extends keyof T = {
    [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T]> = Partial<Pick<T, P>> & Pick<T, Exclude<keyof T, P>>;
type OmitNever<T extends Record<string, any>> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K];
};
export type PartialAccounts<A extends IdlInstructionAccountItem = IdlInstructionAccountItem> = Partial<{
    [N in A["name"]]: PartialAccount<A & {
        name: N;
    }>;
}>;
type PartialAccount<A extends IdlInstructionAccountItem = IdlInstructionAccountItem> = A extends IdlInstructionAccounts ? PartialAccounts<A["accounts"][number]> : A extends {
    optional: true;
} ? Address | null : Address;
export declare function isPartialAccounts(partialAccount: any): partialAccount is PartialAccounts;
export declare function flattenPartialAccounts<A extends IdlInstructionAccountItem>(partialAccounts: PartialAccounts<A>, throwOnNull: boolean): AccountsGeneric;
export declare class MethodsBuilder<IDL extends Idl, I extends AllInstructions<IDL>, A extends I["accounts"][number] = I["accounts"][number]> {
    private _args;
    private _ixFn;
    private _txFn;
    private _rpcFn;
    private _simulateFn;
    private _viewFn;
    private _accounts;
    private _remainingAccounts;
    private _signers;
    private _preInstructions;
    private _postInstructions;
    private _accountsResolver;
    private _resolveAccounts;
    constructor(_args: Array<any>, _ixFn: InstructionFn<IDL>, _txFn: TransactionFn<IDL>, _rpcFn: RpcFn<IDL>, _simulateFn: SimulateFn<IDL>, _viewFn: ViewFn<IDL> | undefined, provider: Provider, programId: PublicKey, idlIx: AllInstructions<IDL>, accountNamespace: AccountNamespace<IDL>, idlTypes: IdlTypeDef[], customResolver?: CustomAccountResolver<IDL>);
    args(args: Array<any>): void;
    /**
     * Set instruction accounts with account resolution.
     *
     * This method only accepts accounts that cannot be resolved.
     *
     * See {@link accountsPartial} for overriding the account resolution or
     * {@link accountsStrict} for strictly specifying all accounts.
     */
    accounts(accounts: ResolvedAccounts<A>): this;
    /**
     * Set instruction accounts with account resolution.
     *
     * There is no functional difference between this method and {@link accounts}
     * method, the only difference is this method allows specifying all accounts
     * even if they can be resolved. On the other hand, {@link accounts} method
     * doesn't accept accounts that can be resolved.
     */
    accountsPartial(accounts: PartialAccounts<A>): this;
    /**
     * Set instruction accounts without account resolution.
     *
     * All accounts strictly need to be specified when this method is used.
     *
     * See {@link accounts} and {@link accountsPartial} methods for automatically
     * resolving accounts.
     */
    accountsStrict(accounts: Accounts<A>): this;
    signers(signers: Array<Signer>): this;
    remainingAccounts(accounts: Array<AccountMeta>): this;
    preInstructions(ixs: Array<TransactionInstruction>, prepend?: boolean): this;
    postInstructions(ixs: Array<TransactionInstruction>): this;
    /**
     * Get the public keys of the instruction accounts.
     *
     * The return type is an object with account names as keys and their public
     * keys as their values.
     *
     * Note that an account key is `undefined` if the account hasn't yet been
     * specified or resolved.
     */
    pubkeys(): Promise<Partial<InstructionAccountAddresses<IDL, I>>>;
    rpc(options?: ConfirmOptions): Promise<TransactionSignature>;
    rpcAndKeys(options?: ConfirmOptions): Promise<{
        pubkeys: InstructionAccountAddresses<IDL, I>;
        signature: TransactionSignature;
    }>;
    view(options?: ConfirmOptions): Promise<any>;
    simulate(options?: ConfirmOptions): Promise<SimulateResponse<any, any>>;
    instruction(): Promise<TransactionInstruction>;
    /**
     * Convenient shortcut to get instructions and pubkeys via:
     *
     * ```ts
     * const { pubkeys, instructions } = await method.prepare();
     * ```
     */
    prepare(): Promise<{
        pubkeys: Partial<InstructionAccountAddresses<IDL, I>>;
        instruction: TransactionInstruction;
        signers: Signer[];
    }>;
    transaction(): Promise<Transaction>;
}
export {};
//# sourceMappingURL=methods.d.ts.map