const express = require('express');
require('./db/mongoose');
const upiRouter = require('./router/upi');

const app = express();
app.use(express.json());
app.use(upiRouter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
