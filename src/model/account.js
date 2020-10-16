const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  transactions: [
    {
      Date: {
        type: Date,
      },
      Withdraw: {
        type: String,
      },
      Deposit: {
        type: String,
      },
      'Closing Balance': {
        type: String,
      },
      Description: {
        type: String,
      },
    },
  ],
  token: {
    type: String,
  },
});

AccountSchema.methods.toJSON = function () {
  const account = this;
  const accountObject = account.toObject();
  delete accountObject.token;
  delete accountObject.password;
  if (accountObject.fileName) {
    delete accountObject.fileName;
  }

  return accountObject;
};

AccountSchema.pre('save', async function (next) {
  const account = this;
  if (account.isModified('password')) {
    account.password = await bcrypt.hash(account.password, 8);
  }

  next();
});

AccountSchema.statics.findByCredentials = async (username, password) => {
  const account = await Account.findOne({ username });
  if (!account) {
    throw new Error('Unable to Login');
  }

  const isMatch = await bcrypt.compare(password, account.password);
  if (!isMatch) {
    throw new Error('Unable to Login');
  }

  return account;
};

AccountSchema.methods.generateAuthToken = async function () {
  const account = this;
  const token = jwt.sign({ _id: account._id.toString() }, 'thisisachallenge');
  account.token = token;
  await account.save();

  return token;
};

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
