const jwt = require('jsonwebtoken');
const Account = require('../model/account');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const accountObject = jwt.verify(token, 'thisisachallenge');
    const account = await Account.findOne({ _id: accountObject._id, token });
    req.account = account;
    next();
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = authMiddleware;
