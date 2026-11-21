import { Transaction } from '../models/index.js';

export const transactionService = {
  async createTransaction({
    category,
    description,
    amount,
    type = 'income',
    method = 'UPI',
    status = 'paid',
    referenceId = null,
    memberName = null,
    memberId = null
  }) {
    const txn = await Transaction.create({
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      category,
      referenceId,
      description,
      amount: Number(amount),
      method,
      status,
      memberName,
      memberId
    });
    return txn;
  }
};

export default transactionService;
