/**
 * Created by iamhosseindhv on 02/09/2017.
 */
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
});
connection.connect();


module.exports = connection;