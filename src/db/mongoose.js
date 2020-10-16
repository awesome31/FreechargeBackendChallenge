const mongoose = require('mongoose');

const connectionUri = '';
mongoose
  .connect(connectionUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to the database.');
  })
  .catch((e) => {
    console.log('Error connecting to the database.');
    console.log(e);
  });
