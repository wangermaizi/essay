const mysql = require('mysql');

const connectdb = ()=>{
    let connection = mysql.createConnection({
        host     : '192.168.1.2',
        port     : '3306',
        user     : 'root',
        password : '123',
        database : 'myfirst'
    });
    return connection;
};

module.exports=connectdb;