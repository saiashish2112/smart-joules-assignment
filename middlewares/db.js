const dbName = "smart-joules";
const colName = "real-time-monitoring";
const uri = `mongodb://localhost:27017/?directConnection=true&serverSelectionTimeoutMS=2000`;
const mongodb = require("mongodb");
let MongoClient = mongodb.MongoClient;

function writetoDB(query) {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect((err) => {
    if (err) {
      return err;
    }
    const col = client.db(dbName).collection(colName);
    col.insertMany(query, (err, result) => {
      if (err) {
        return err;
      }
      client.close();
    });
  });
}

module.exports.writetoDB = writetoDB;
