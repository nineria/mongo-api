const { MongoClient } = require('mongodb');

let dbConnection;
const URI = process.env.MONGO_URI;

module.exports = {
  connectToDb: (callback) => {
    MongoClient.connect(URI)
      .then((client) => {
        dbConnection = client.db();
        return callback();
      })
      .catch((error) => {
        console.log(error);
        return callback(error);
      });
  },
  getDb: () => dbConnection,
};
