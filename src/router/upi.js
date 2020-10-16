const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Account = require('../model/account');
const {
  generateAccountNumber,
  getTransactionFromFile,
  getCreditLimit,
  createTransaction,
} = require('../utils');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const account = new Account({
      ...req.body,
      accountNumber: generateAccountNumber(),
      fileName: 'none',
    });

    const token = await account.generateAuthToken();

    res.status(201).send({ account, token });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/login', async (req, res) => {
  try {
    const account = await Account.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await account.generateAuthToken();

    if (account.transactions.length === 0) {
      res.send({
        message: 'NO Account details. Please upload you statement file.',
        token,
      });
    } else {
      res.send({
        account,
        token,
      });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/upload', [auth, upload.single('statement')], async (req, res) => {
  try {
    const account = req.account;
    const transactions = await getTransactionFromFile(
      req.file.filename,
      account.fileName
    );

    account.transactions = account.transactions.concat(transactions);
    account.fileName = req.file.filename;
    await account.save();

    res.send({
      rateOfInterest: '20%',
      creditLimit: getCreditLimit(transactions),
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/transfer', auth, async (req, res) => {
  try {
    const currentUser = req.account;
    if (currentUser.transactions.length === 0) {
      throw new Error('NO Account details. Please upload you statement file.');
    }

    const accountToTransferUser = await Account.findOne({
      username: req.body.username,
    });

    currentUser.transactions = currentUser.transactions.concat(
      createTransaction(
        'W',
        req.body.amount,
        currentUser.transactions,
        currentUser.username,
        accountToTransferUser.username
      )
    );

    accountToTransferUser.transactions = accountToTransferUser.transactions.concat(
      createTransaction(
        'D',
        req.body.amount,
        accountToTransferUser.transactions,
        currentUser.username,
        accountToTransferUser.username
      )
    );

    await currentUser.save();
    await accountToTransferUser.save();
    res.send({ currentUser, accountToTransferUser });
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
