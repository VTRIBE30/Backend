const Transaction = require("../../models/transaction");
const Admin = require("../../models/admin");

exports.getAllTransactions = async (req, res, next) => {
  try {
    // Check if the requester is an admin or sub-admin with permission to view transactions
    const requesterAdmin = await Admin.findById(req.admin.adminId);
    if (
      !requesterAdmin ||
      !requesterAdmin.permissions.includes("SEE_TRANSACTIONS")
    ) {
      return res.status(403).json({
        status: false,
        error:
          "Access denied. You do not have permission to view transactions.",
      });
    }

    const { page = 1, limit = 10, transactionStatus, sender, recipient } = req.query;

    const query = {};
    if (transactionStatus) query.transactionStatus = transactionStatus;
    if (sender) query.sender = sender;
    if (recipient) query.recipient = recipient;

    const transactions = await Transaction.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 }); // Sort by creation date

    return res.status(200).json({
      status: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTotalSalesBalance = async (req, res, next) => {
  try {
    // Sum all successful 'Wallet Payment' transactions
    const totalSales = await Transaction.aggregate([
      {
        $match: {
          transactionType: "Wallet Funding",
          transactionStatus: "Successful",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Check if there were any matching transactions
    const salesBalance = totalSales.length > 0 ? totalSales[0].totalAmount : 0;

    return res.status(200).json({
      status: true,
      message: "Total sales balance fetched successfully",
      data: {
        totalSalesBalance: salesBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTotalSalesPayOut = async (req, res, next) => {
  try {
    // Sum all successful 'Wallet Payment' transactions
    const totalSales = await Transaction.aggregate([
      {
        $match: {
          transactionType: "Wallet Withdrawal",
          transactionStatus: "Successful",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Check if there were any matching transactions
    const salesBalance = totalSales.length > 0 ? totalSales[0].totalAmount : 0;

    return res.status(200).json({
      status: true,
      message: "Total payouts fetched successfully",
      data: {
        totalSalesBalance: salesBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};
