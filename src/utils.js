const csvtojson = require('csvtojson');
const path = require('path');
const fs = require('fs');

const generateAccountNumber = () =>
  Math.random().toString(36).replace('0.', '').slice(0, 8);

const getTransactionFromFile = async (newFileName, previousFileName) => {
  if (previousFileName !== 'none') {
    const oldFilePath = path.join(__dirname, `../uploads/${previousFileName}`);
    fs.unlinkSync(oldFilePath);
  }
  const newFilePath = path.join(__dirname, `../uploads/${newFileName}`);
  const transactions = await csvtojson().fromFile(newFilePath);
  return transactions.map((t) => ({ ...t, Date: t.Date && new Date(t.Date) }));
};

const getBalanceForAMonth = (st, month) =>
  st
    .filter((s) => s.Date && s.Date.getMonth() === month)
    .reduce((acc, st) => {
      if (st.Deposit) {
        acc = acc + Number(st.Deposit);
      } else if (st.Withdraw) {
        acc = acc - Number(st.Withdraw);
      }

      return acc;
    }, 0);

const getCreditLimit = (st) =>
  ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].reduce(
    (acc, month) => acc + getBalanceForAMonth(st, month),
    0
  ) /
    12) *
  1.2;

const getClosingBalance = (transactions, type, amount) => {
  if (transactions.length > 0) {
    if (transactions[transactions.length - 1]['Closing Balance'] - amount) {
      return undefined;
    }
    return type === 'W'
      ? Number(transactions[transactions.length - 1]['Closing Balance']) -
          Number(amount)
      : Number(transactions[transactions.length - 1]['Closing Balance']) +
          Number(amount);
  }

  return amount;
};

const getDescription = (amount, usernameOne, usernameTwo) =>
  `${usernameOne} sent ${amount} to ${usernameTwo}`;

const createTransaction = (
  type,
  amount,
  transactions,
  usernameOne,
  usernameTwo
) => ({
  Date: new Date(),
  Withdraw: type === 'W' ? amount : '',
  Deposit: type === 'D' ? amount : '',
  'Closing Balance': getClosingBalance(transactions, type, amount),
  Description: getClosingBalance(transactions, type, amount)
    ? getDescription(amount, usernameOne, usernameTwo)
    : 'Transaction unsuccessful. Minimum balance needs to be maintained.',
});

module.exports = {
  generateAccountNumber,
  getTransactionFromFile,
  getCreditLimit,
  createTransaction,
};
