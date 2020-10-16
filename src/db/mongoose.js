const mongoose = require('mongoose');

const connectionUri =
  'mongodb+srv://rohit:rohit1997@cluster0.xhjq8.gcp.mongodb.net/upidb?retryWrites=true&w=majority';

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
