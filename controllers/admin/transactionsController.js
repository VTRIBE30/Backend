const Transaction = require("../../models/transaction");
const Admin = require("../../models/admin");
const moment = require("moment"); // for date manipulation
const { validateTrnsactionChartDetails } = require("../../utils/validation");

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

exports.getRoi = async (req, res, next) => {
  try {
    // Helper function to get the start and end dates for daily, weekly, yearly periods
    const getPeriods = () => {
      const today = moment().startOf('day');
      const weekStart = moment().startOf('week');
      const yearStart = moment().startOf('year');
      return {
        day: { start: today.toDate(), end: moment().endOf('day').toDate() },
        week: { start: weekStart.toDate(), end: moment().endOf('week').toDate() },
        year: { start: yearStart.toDate(), end: moment().endOf('year').toDate() },
      };
    };

    const periods = getPeriods();

    // Helper function to calculate pay-ins and payouts for a given time period
    const calculateForPeriod = async (start, end) => {
      const payins = await Transaction.aggregate([
        { $match: { transactionType: 'Wallet Funding', transactionStatus: 'Successful', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      
      const payouts = await Transaction.aggregate([
        { $match: { transactionType: 'Wallet Withdrawal', transactionStatus: 'Successful', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      
      const totalPayins = payins.length > 0 ? payins[0].total : 0;
      const totalPayouts = payouts.length > 0 ? payouts[0].total : 0;

      // Calculate ROI if there were pay-ins
      const roi = totalPayins > 0
        ? ((totalPayins - totalPayouts) / totalPayins) * 100
        : 0;

      return {
        payins: totalPayins,
        payouts: totalPayouts,
        roi: roi.toFixed(2), // ROI rounded to 2 decimal places
      };
    };

    // Fetch data for daily, weekly, and yearly periods
    const dailyStats = await calculateForPeriod(periods.day.start, periods.day.end);
    const weeklyStats = await calculateForPeriod(periods.week.start, periods.week.end);
    const yearlyStats = await calculateForPeriod(periods.year.start, periods.year.end);

    // Return the calculated data
    return res.status(200).json({
      status: true,
      message: "ROI fetched successfully",
      data: {
        daily: dailyStats,
        weekly: weeklyStats,
        yearly: yearlyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalesComparison = async (req, res, next) => {
  try {
    // Helper function to get the start and end dates for daily, weekly, yearly periods
    const getPeriods = () => {
      const today = moment().startOf('day');
      const yesterday = moment().subtract(1, 'days').startOf('day');
      const weekStart = moment().startOf('week');
      const lastWeekStart = moment().subtract(1, 'weeks').startOf('week');
      const yearStart = moment().startOf('year');
      const lastYearStart = moment().subtract(1, 'years').startOf('year');
      return {
        current: {
          day: { start: today.toDate(), end: moment().endOf('day').toDate() },
          week: { start: weekStart.toDate(), end: moment().endOf('week').toDate() },
          year: { start: yearStart.toDate(), end: moment().endOf('year').toDate() },
        },
        previous: {
          day: { start: yesterday.toDate(), end: yesterday.endOf('day').toDate() },
          week: { start: lastWeekStart.toDate(), end: moment(lastWeekStart).endOf('week').toDate() },
          year: { start: lastYearStart.toDate(), end: moment(lastYearStart).endOf('year').toDate() },
        },
      };
    };

    const periods = getPeriods();

    // Helper function to calculate total pay-ins for a given time period
    const calculatePayinsForPeriod = async (start, end) => {
      const payins = await Transaction.aggregate([
        { $match: { transactionType: 'Wallet Funding', transactionStatus: 'Successful', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      return payins.length > 0 ? payins[0].total : 0;
    };

    // Fetch current and previous period data for daily, weekly, yearly pay-ins
    const currentDayPayins = await calculatePayinsForPeriod(periods.current.day.start, periods.current.day.end);
    const previousDayPayins = await calculatePayinsForPeriod(periods.previous.day.start, periods.previous.day.end);

    const currentWeekPayins = await calculatePayinsForPeriod(periods.current.week.start, periods.current.week.end);
    const previousWeekPayins = await calculatePayinsForPeriod(periods.previous.week.start, periods.previous.week.end);

    const currentYearPayins = await calculatePayinsForPeriod(periods.current.year.start, periods.current.year.end);
    const previousYearPayins = await calculatePayinsForPeriod(periods.previous.year.start, periods.previous.year.end);

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0; // 100% increase if previous period had 0 sales
      }
      return ((current - previous) / previous) * 100;
    };

    const dayChange = calculatePercentageChange(currentDayPayins, previousDayPayins);
    const weekChange = calculatePercentageChange(currentWeekPayins, previousWeekPayins);
    const yearChange = calculatePercentageChange(currentYearPayins, previousYearPayins);

    // Return the calculated data with percentage changes
    return res.status(200).json({
      status: true,
      message: "Sales comparison fetched successfully",
      data: {
        daily: {
          current: currentDayPayins,
          previous: previousDayPayins,
          percentageChange: dayChange.toFixed(2),
        },
        weekly: {
          current: currentWeekPayins,
          previous: previousWeekPayins,
          percentageChange: weekChange.toFixed(2),
        },
        yearly: {
          current: currentYearPayins,
          previous: previousYearPayins,
          percentageChange: yearChange.toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPendingTransactionsCount = async (req, res, next) => {
  try {
    // Query the database to count transactions with status 'Processing'
    const pendingTransactionsCount = await Transaction.countDocuments({
      transactionStatus: 'Processing',
    });

    // Respond with the number of pending transactions
    return res.status(200).json({
      status: true,
      message: 'Pending transactions count fetched successfully',
      data: {
        pendingTransactionsCount,
      },
    });
  } catch (err) {
    next(err); // Pass any errors to the error handler middleware
  }
};

// Controller to fetch transaction data for charts
exports.getTransactionChartData = async (req, res, next) => {
  try {
    const { error } = validateTrnsactionChartDetails(req.query);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { period } = req.query; // e.g., 'daily', 'weekly', 'monthly', 'yearly'

    let groupBy;
    let dateFormat;
    let xLabels = [];
    
    switch (period) {
      case 'daily':
        groupBy = { $dayOfWeek: '$createdAt' }; // Group by day of the week
        dateFormat = '%A'; // Format as day name (Sunday, Monday...)
        xLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        break;
      case 'weekly':
        groupBy = { $week: '$createdAt' }; // Group by week
        dateFormat = 'Week %U'; // Week number
        break;
      case 'monthly':
        groupBy = { $month: '$createdAt' }; // Group by month
        dateFormat = '%B'; // Format as month name (January, February...)
        xLabels = moment.months(); // ['January', 'February', 'March', ...]
        break;
      case 'yearly':
        groupBy = { $year: '$createdAt' }; // Group by year
        dateFormat = '%Y'; // Format as year (e.g., 2023)
        break;
      default:
        return res.status(400).json({ status: false, message: 'Invalid period parameter' });
    }

    // Aggregate transactions
    const transactionsData = await Transaction.aggregate([
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: '$amount' }, // Sum the amounts
          count: { $sum: 1 } // Count the number of transactions
        }
      },
      {
        $sort: { _id: 1 } // Sort by the period (ascending)
      }
    ]);

    // Map the results to the appropriate labels
    let chartData = transactionsData.map(data => ({
      x: xLabels[data._id - 1], // For daily (1 -> Sunday, 2 -> Monday, etc.)
      y: data.totalAmount
    }));

    return res.status(200).json({
      status: true,
      message: 'Transaction chart data fetched successfully',
      data: chartData
    });
  } catch (err) {
    next(err);
  }
};

