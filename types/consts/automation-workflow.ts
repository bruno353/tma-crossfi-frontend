'use client'

// type for action nodes inputs

export interface CallCanisterType {
  canisterId?: string
  icpWalletId?: string
  methodName?: string
  callArguments?: string
}

class CallCanisterClass implements CallCanisterType {
  canisterId?: string
  icpWalletId?: string
  methodName?: string
  callArguments?: string

  constructor({
    canisterId,
    icpWalletId,
    methodName,
    callArguments,
  }: CallCanisterType = {}) {
    this.canisterId = canisterId
    this.icpWalletId = icpWalletId
    this.methodName = methodName
    this.callArguments = callArguments
  }
}

export const actionTypeToClass = {
  CALL_CANISTER: CallCanisterClass,
}
