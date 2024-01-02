const MongoClient = require('mongodb').MongoClient;
const mysql = require('mysql');

function init() {
  let db;
  let coll;

  // Create MySQL connection pool
  const mysqlPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023',
  });

  MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
      db = client.db('proj2023MongoDB');
      coll = db.collection('managers');
    })
    .catch((error) => {
      console.log(error.message);
    });

  return {
    getManagers: async () => {
      return coll.find().toArray();
    },

    getManagerById: async (id) => {
        return coll.findOne({ _id: id });
      },

    addManager: async (manager) => {
         return coll.insertOne(manager);
      },

    // Get a MySQL connection from the pool
    getConnection: () => {
      return new Promise((resolve, reject) => {
        mysqlPool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
    },
  };
}

module.exports = { init };