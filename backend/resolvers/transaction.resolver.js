import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_parent, _input, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }
        const userId = await context.getUser()._id;
        const transactions = await Transaction.find({ userId });
        return transactions;
      } catch (error) {
        console.log(`Error getting transactions: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },

    transaction: async (_parent, { transactionId }, _context) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (error) {
        console.log(`Error getting transaction: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },

    categoryStatistics: async (_, __, context) => {
      if (!context.getUser()) throw new Error("Unauthorized");
      const userId = context.getUser()._id;
      const transactions = await Transaction.find({ userId });
      const categoryMap = {};

      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        categoryMap[transaction.category] += transaction.amount;
      });

      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
  },
  Mutation: {
    createTransaction: async (_parent, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: await context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.log(`Error creating transactions: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },

    updateTransaction: async (_parent, { input }, _context) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.log(`Error updating transactions: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },

    deleteTransaction: async (_parent, { transactionId }, _context) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (error) {
        console.log(`Error updating transactions: ${error}`);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
};

export default transactionResolver;
