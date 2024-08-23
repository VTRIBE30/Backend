const mongoose = require('mongoose');

const dbURI = process.env.dbURI;

const dbConnection = () => {
  mongoose
    .connect(dbURI)
    .then(() => {
        console.log('Mongodb database connected');
    })
    .catch((err) => {
      console.error(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
