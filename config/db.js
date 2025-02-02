const mysql = require("mysql2");
require("dotenv").config();
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "movie_db",
});

const poolPromise = pool.promise();
module.exports = poolPromise;
