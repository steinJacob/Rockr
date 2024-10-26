const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

let userTokenMap = new Map(); // {username: [token, loginTime]}
const TIMEOUT = 15; // in minutes

frontendPort = 3000;

//SQL DATABASE CONNECTION
// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'rockrdatabase-do-user-18048731-0.g.db.ondigitalocean.com',
  user: 'doadmin',
  password: 'AVNS_Qd4pwVZ6xO7LWrZRrRp',
  database: 'defaultdb',
  port: 25060
});
// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
  connection.release();
});

//LISTENING FUNCTIONS
//Takes user's username and password input, finds user w/ the username and compares passwords. 
//If matching passwords, returns 'accepted' for user to be redirected to Home page
app.post('/login', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  try {
    //Find user by username
    const [ sqlPass ] = await pool.promise().query('SELECT password, Verified FROM User_information WHERE username=?', [username]);
    console.log("Login: Query completed.");
    //If user is found
    if(sqlPass.length = 1) {
      if(password != sqlPass[0].password || sqlPass[0].Verified == 0) {
        return res.send(JSON.stringify({response: "rejected"}));
      } else {
        console.log("Login: Handle token stuff.")
        let responseToken = '';
        let hasToken = userTokenMap.has(username);
        console.log("found out if it has.")
        if (hasToken && isAuthorized(userTokenMap.get(body.username)[0])) {
          console.log("hasToken and isAuthorized");
          responseToken = userTokenMap.get(body.username)[0];
        } else {
          console.log("NOT: hasToken and isAuthorized");
          responseToken = jwt.sign({username: username}, "3f9c8fdeb68c4c9188f1e4c8a7bdb59e");
          const time = new Date();
          userTokenMap.set(username, [responseToken, time]);
        }
        return res.send(JSON.stringify({response: "accepted", token: responseToken}));
      }
    } else {
      return res.send(JSON.stringify({response: "userNotFound"}));
    }
  } catch (error) {
    res.status(500).send("Error fetching login information.");
  }
});

//Takes user input and registers user by putting information in database, with inputs, Verified=0, and a hex string verification token. User then checks their email and verfiies their account
app.post('/Register', async (req, res) => {
  const { firstName, lastName, username, password, email, phoneNumber } = req.body;
  const vToken = crypto.randomBytes(20).toString('hex')
  try {
    //Insert user's information into User_information table
    await pool.promise().query('INSERT INTO User_information (FirstName, LastName, username, password, email, phone, vToken) VALUES (?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, username, password, email, phoneNumber, vToken]);
    //Establish email service & credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rockr.verify@gmail.com',
        pass: 'xkttfbrqlnkakntq'
      }
    });
    //Create email
    const mailOptions = {
      from: 'rockr.verify@gmail.com',
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking this link:
      http://localhost:${frontendPort}/verify?token=${vToken}`
    };
    await transporter.sendMail(mailOptions);
    res.status(200).send('Verification email sent!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro registering user.');
  }
});

//Takes token, finds the user with that token, and verifies that user so they can log in.
app.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    //Find user with the token
    const [rows] = await pool.promise().query('SELECT * FROM User_information WHERE vToken = ?', [token]);
    //If the user is not verified: true. If the user is verified / DNE, false.
    if(rows.length > 0){
      await pool.promise().query('UPDATE User_information SET Verified = 1, vToken = NULL WHERE vToken = ?', [token]);
      return res.send(JSON.stringify({response: 'Email verified successfully!'}));
    } else {
      return res.send(JSON.stringify({response: 'Invalid token.'}));
    }
  } catch (error) {
    res.status(500).send('Error verifying email.');
  }
});

//returns user_info table for the current user
app.post('/getUser', async (req, res) => {
  //grab user via token
  const userT = req.body.token;
  const user = isAuthorized(userT);
  if(user) {
    try {
      let userInfo = await pool.promise().query('SELECT * FROM User_information WHERE username = ?', [user]);
      return res.send(userInfo[0][0]);
    } catch (error) {
      res.status(500).send('Error retrieving your information.');
    }
  } else {
    return res.send(JSON.stringify({error: "Failed to find user."}));
  }
});

//pushes new user info to DB. Retrieves said info from DB and push to frontend
app.post('/newUserInfo', async (req, res) => {
  const body = req.body;
  const userT = body.token;
  const nFN = body.newfirstname, nLN = body.newlastname, nUN = body.newusername,
        nPass = body.newpassword, nE = body.newemail, nPh = body.newphonenum;
  
  //grab user via token
  const user = isAuthorized(userT);
  console.log(user);
  time = new Date();
  userTokenMap.set(nUN, [userT, time]);
  if(user) {
    //try-catches are separate to return relevant error messages for each problem
    try {
      await pool.promise().query('UPDATE User_information SET username=?, password=?, email=?, phone=?, FirstName=?, LastName=? WHERE username=?', [nUN, nPass, nE, nPh, nFN, nLN, user]);
    } catch (error) {
      res.status(500).send(JSON.stringify({error: 'Error changing your info.'}));
    }
    try {
      let userInfo = await pool.promise().query('SELECT * FROM User_information WHERE username = ?', [nUN]);
      return res.send(userInfo[0][0]);
    } catch (error) {
      res.status(500).send(JSON.stringify({error: 'Error retrieving your new info.'}));
    }
  }
  
})

// returns "response" and "user", "user" is false if not authorized
app.post('/isAuthorized', (req, res) => {
  const body = req.body;
  const currToken = body.token;
  let response = false;
  const user = isAuthorized(currToken);
  if (user) {
    response = true;
  }
  else
    console.log("Auth for token failed");
  return res.send(JSON.stringify({response: response, user: user}));
});

// returns username if authorized, returns false if not
function isAuthorized(currToken) {
  for (const user of userTokenMap.keys()) {
    if (userTokenMap.get(user)[0] == currToken) {
      const currTime = new Date();
      const elapsedMinutes = Math.floor((currTime - userTokenMap.get(user)[1]) / 60000);
      if (elapsedMinutes <= TIMEOUT)
        return user;
      else {
        console.log(user + " timed out");
        userTokenMap.delete(user);
        return false;
      }
    }
  }
  return false;
}

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
  });