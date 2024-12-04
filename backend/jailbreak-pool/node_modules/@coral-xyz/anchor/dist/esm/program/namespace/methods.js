import { AccountsResolver, } from "../accounts-resolver.js";
import { translateAddress } from "../common.js";
export class MethodsBuilderFactory {
    static build(provider, programId, idlIx, ixFn, txFn, rpcFn, simulateFn, viewFn, accountNamespace, idlTypes, customResolver) {
        return (...args) => new MethodsBuilder(args, ixFn, txFn, rpcFn, simulateFn, viewFn, provider, programId, idlIx, accountNamespace, idlTypes, customResolver);
    }
}
export function isPartialAccounts(partialAccount) {
    return (typeof partialAccount === "object" &&
        partialAccount !== null &&
        !("_bn" in partialAccount) // Ensures not a pubkey
    );
}
export function flattenPartialAccounts(partialAccounts, throwOnNull) {
    const toReturn = {};
    for (const accountName in partialAccounts) {
        const account = partialAccounts[accountName];
        if (account === null) {
            if (throwOnNull)
                throw new Error("Failed to resolve optionals due to IDL type mismatch with input accounts!");
            continue;
        }
        toReturn[accountName] = isPartialAccounts(account)
            ? flattenPartialAccounts(account, true)
            : translateAddress(account);
    }
    return toReturn;
}
export class MethodsBuilder {
    constructor(_args, _ixFn, _txFn, _rpcFn, _simulateFn, _viewFn, provider, programId, idlIx, accountNamespace, idlTypes, customResolver) {
        this._args = _args;
        this._ixFn = _ixFn;
        this._txFn = _txFn;
        this._rpcFn = _rpcFn;
        this._simulateFn = _simulateFn;
        this._viewFn = _viewFn;
        this._accounts = {};
        this._remainingAccounts = [];
        this._signers = [];
        this._preInstructions = [];
        this._postInstructions = [];
        this._resolveAccounts = true;
        this._accountsResolver = new AccountsResolver(_args, this._accounts, provider, programId, idlIx, accountNamespace, idlTypes, customResolver);
    }
    args(args) {
        this._args = args;
        this._accountsResolver.args(args);
    }
    /**
     * Set instruction accounts with account resolution.
     *
     * This method only accepts accounts that cannot be resolved.
     *
     * See {@link accountsPartial} for overriding the account resolution or
     * {@link accountsStrict} for strictly specifying all accounts.
     */
    accounts(accounts) {
        // @ts-ignore
        return this.accountsPartial(accounts);
    }
    /**
     * Set instruction accounts with account resolution.
     *
     * There is no functional difference between this method and {@link accounts}
     * method, the only difference is this method allows specifying all accounts
     * even if they can be resolved. On the other hand, {@link accounts} method
     * doesn't accept accounts that can be resolved.
     */
    accountsPartial(accounts) {
        this._resolveAccounts = true;
        this._accountsResolver.resolveOptionals(accounts);
        return this;
    }
    /**
     * Set instruction accounts without account resolution.
     *
     * All accounts strictly need to be specified when this method is used.
     *
     * See {@link accounts} and {@link accountsPartial} methods for automatically
     * resolving accounts.
     */
    accountsStrict(accounts) {
        this._resolveAccounts = false;
        this._accountsResolver.resolveOptionals(accounts);
        return this;
    }
    signers(signers) {
        this._signers = this._signers.concat(signers);
        return this;
    }
    remainingAccounts(accounts) {
        this._remainingAccounts = this._remainingAccounts.concat(accounts);
        return this;
    }
    preInstructions(ixs, prepend = false) {
        if (prepend) {
            this._preInstructions = ixs.concat(this._preInstructions);
        }
        else {
            this._preInstructions = this._preInstructions.concat(ixs);
        }
        return this;
    }
    postInstructions(ixs) {
        this._postInstructions = this._postInstructions.concat(ixs);
        return this;
    }
    /**
     * Get the public keys of the instruction accounts.
     *
     * The return type is an object with account names as keys and their public
     * keys as their values.
     *
     * Note that an account key is `undefined` if the account hasn't yet been
     * specified or resolved.
     */
    async pubkeys() {
        if (this._resolveAccounts) {
            await this._accountsResolver.resolve();
        }
        // @ts-ignore
        return this._accounts;
    }
    async rpc(options) {
        if (this._resolveAccounts) {
            await this._accountsResolver.resolve();
        }
        // @ts-ignore
        return this._rpcFn(...this._args, {
            accounts: this._accounts,
            signers: this._signers,
            remainingAccounts: this._remainingAccounts,
            preInstructions: this._preInstructions,
            postInstructions: this._postInstructions,
            options,
        });
    }
    async rpcAndKeys(options) {
        const pubkeys = await this.pubkeys();
        return {
            pubkeys: pubkeys,
            signature: await this.rpc(options),
        };
    }
    async view(options) {
        if (this._resolveAccounts) {
            await this._accountsResolver.resolve();
        }
        if (!this._viewFn) {
            throw new Error("Method does not support views");
        }
        // @ts-ignore
        return this._viewFn(...this._args, {
            accounts: this._accounts,
            signers: this._signers,
            remainingAccounts: this._remainingAccounts,
            preInstructions: this._preInstructions,
            postInstructions: this._postInstructions,
            options,
        });
    }
    async simulate(options) {
        if (this._resolveAccounts) {
            await this._accountsResolver.resolve();
        }
        // @ts-ignore
        return this._simulateFn(...this._args, {
            accounts: this._accounts,
            signers: this._signers,
            remainingAccounts: this._remainingAccounts,
            preInstructions: this._preInstructions,
            postInstructions: this._postInstructions,
            options,
        });
    }
    async instruction() {
        if (this._resolveAccounts) {
            await this._accountsResolver.resolve();
        }
        // @ts-ignore
        return this._ixFn(...this._args, {
            accounts: this._accounts,
            signers: this._signers,
            remainingAccounts: this._remainingAccounts,
            preInstructions: this._preInstructions,
            postInstructions: this._postInstructions,
        });
    }
    /**
     * Convenient shortcut to get instructions and pubkeys via:
     *
     * ```ts
     * const { pubkeys, instructions } = await method.prepare();
     * ```
     */
    async prepare() {
        return {
            instruction: await this.instruction(),
            pubkeys: await this.pubkeys(),
            signers: this._signers,
        };
    }
    async transaction() {
        if (this._resolveAccounts) {
            await this._accountsResolver.resolve();
        }
        // @ts-ignore
        return this._txFn(...this._args, {
            accounts: this._accounts,
            signers: this._signers,
            remainingAccounts: this._remainingAccounts,
            preInstructions: this._preInstructions,
            postInstructions: this._postInstructions,
        });
    }
}
//# sourceMappingURL=methods.js.map