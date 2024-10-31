const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'rockrdatabase-do-user-18048731-0.g.db.ondigitalocean.com',
    user: 'doadmin',
    password: 'AVNS_Qd4pwVZ6xO7LWrZRrRp',
    database: 'defaultdb',
    port: 25060
  });

async function revisePasswordInDB(user, password, hashedPass, salt) {
    await pool.promise().query('UPDATE User_information SET password=?, salt=? WHERE username=?', [hashedPass, salt, user]);
}

async function hashpassword(password) {
    for(var i = 1; i < 11; i++){
        let currPass = password + String(i);
        let currUser = "user" + String(i);
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPass = await bcrypt.hash(currPass, salt);
        console.log(currUser, currPass, hashedPass, salt);
        revisePasswordInDB(currUser, currPass, hashedPass, salt);
        console.log("Pushed to DB!");
    }
}

hashpassword("password");