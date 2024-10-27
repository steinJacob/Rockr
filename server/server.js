const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

const TIMEOUT = 15; // minutes
let userTokenMap = new Map(); // {username: [token, loginTime]}
const frontendPort = 3000; // used for verification

app.use(cors());
app.use(express.json());

// SQL DATABASE CONNECTION
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

// HELPER FUNCTIONS

// Returns username if authorized, returns false if not
function isAuthorized(currToken) {
  for (const user of userTokenMap.keys()) {
    if (userTokenMap.get(user)[0] == currToken) {
      const currTime = new Date();
      const elapsedMinutes = Math.floor((currTime - userTokenMap.get(user)[1]) / 60000);
      if (elapsedMinutes <= TIMEOUT) {
        return user;
      }
      else {
        userTokenMap.delete(user);
        return false;
      }
    }
  }
  return false;
}

//Sends promised SQL queries
async function sendQuery(query, list=[]) {
  try {
    const queryResponse = await pool.query(query, list);
    return queryResponse;
  }
  catch (error) {
    console.log(error);
    return false;
  }
}

//LISTENING FUNCTIONS

//Takes user's submitted login input, finds username (if exists), compares password
//Successful: Redirect to home page, user is assigned Authorization token
//Failure: Returns message of unsuccessful login
app.post('/login', async (req, res) => {
  let inUsername = req.body.username;
  let inPassword = req.body.password;
  let body = req.body;

  // send query to see if user/password combo exists
  let realPassword = "";
  try {
    let queryResponse = await sendQuery('SELECT password, Verified FROM User_information WHERE username=?', [inUsername]);
    realPassword = queryResponse[0][0].password;
    userVerified = queryResponse[0][0].Verified;
  }
  catch (error) {
    console.log(error);
  }

  if (realPassword == "" || inPassword != realPassword || userVerified == 0)
    return res.send(JSON.stringify({response: "rejected"}));
  else if(inPassword == realPassword && userVerified == 1){
    let responseToken = '';
    let hasToken = userTokenMap.has(body.username);

    if (hasToken && isAuthorized(userTokenMap.get(body.username)[0])) 
      responseToken = userTokenMap.get(body.username)[0];
    else {
      //assign user a token
      responseToken = jwt.sign({username: body.username}, "3f9c8fdeb68c4c9188f1e4c8a7bdb59e");
      const time = new Date();
      userTokenMap.set(body.username, [responseToken, time]);
    }

    return res.send(JSON.stringify({response: "accepted", token: responseToken}));
  }
});

//Takes user input and registers user by putting information in database, with inputs, Verified=0, and a hex string verification token. User then checks their email and verfiies their account
app.post('/Register', async (req, res) => {
  const { firstName, lastName, username, password, email, phoneNumber } = req.body;
  const vToken = crypto.randomBytes(20).toString('hex')
  try {
    //Insert user's information into User_information table
    await sendQuery('INSERT INTO User_information (FirstName, LastName, username, password, email, phone, vToken) VALUES (?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, username, password, email, phoneNumber, vToken]);
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
    res.status(500).send('Error registering user.');
  }
});

//Takes token, finds the user with that token, and verifies that user so they can log in.
app.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    //Find user with the token
    const [rows] = await sendQuery('SELECT * FROM User_information WHERE vToken = ?', [token]);
    //If the user is not verified: true. If the user is verified / DNE, false.
    if(rows.length > 0){
      await sendQuery('UPDATE User_information SET Verified = 1, vToken = NULL WHERE vToken = ?', [token]);
      return res.send(JSON.stringify({response: 'Email verified successfully!'}));
    } else {
      return res.send(JSON.stringify({response: 'Invalid token.'}));
    }
  } catch (error) {
    res.status(500).send('Error verifying email.');
  }
});

// Confirms Session Authorization
// True: Returns user and token
// False: User DNE
app.post('/isAuthorized', (req, res) => {
  console.log("Attempting to auth");
  const body = req.body;
  const currToken = body.token;
  let response = false;
  const user = isAuthorized(currToken);
  if (user) {
    response = true;
    console.log("Confirmed auth for: " + user);
  }
  else
    console.log("Auth for token failed");
  return res.send(JSON.stringify({response: response, user: user}));
});

// Returns user information from User_information DB table
app.post('/getUser', async (req, res) => {
  //grab user via token
  const userT = req.body.token;
  const user = isAuthorized(userT);
  if(user) {
    try {
      let userInfo = await sendQuery('SELECT * FROM User_information WHERE username = ?', [user]);
      return res.send(userInfo[0][0]);
    } catch (error) {
      res.status(500).send('Error retrieving your information.');
    }
  } else {
    return res.send(JSON.stringify({error: "Failed to find user."}));
  }
});

//Pushes new user info to DB. Retrieves said info from DB and pushes to frontend (ensures consistency of data)
app.post('/newUserInfo', async (req, res) => {
  const body = req.body;
  const userT = body.token;
  const nFN = body.newfirstname, nLN = body.newlastname, nUN = body.newusername,
        nPass = body.newpassword, nE = body.newemail, nPh = body.newphonenum;
  
  //grab user via token
  const user = isAuthorized(userT);
  time = new Date();
  userTokenMap.set(nUN, [userT, time]);
  if(user) {
    //try-catches are separate to return relevant error messages for each problem
    try {
      await sendQuery('UPDATE User_information SET username=?, password=?, email=?, phone=?, FirstName=?, LastName=? WHERE username=?', [nUN, nPass, nE, nPh, nFN, nLN, user]);
    } catch (error) {
      res.status(500).send(JSON.stringify({error: 'Error changing your info.'}));
    }
    try {
      let userInfo = await sendQuery('SELECT * FROM User_information WHERE username = ?', [nUN]);
      return res.send(userInfo[0][0]);
    } catch (error) {
      res.status(500).send(JSON.stringify({error: 'Error retrieving your new info.'}));
    }
  }
})

app.post('/getListing', async (req, res) => {
  console.log("user requesting listing");
  let body = req.body;
  const userToken = body.token;
  //const currListing = body.currListing;
  let username = isAuthorized(userToken);
  if (!username)
    return;

  // used to query database to get listing
  let query = "SELECT listingId, imagePath, creatorId FROM Listings WHERE listingId NOT IN ( SELECT S.listingId FROM User_information U, Seen_listings S WHERE U.username = '" + username + "' AND S.userId = U.id) LIMIT 1;";
  let listingId = ""
  let imagePath = ""
  let creatorId = ""
  let queryResponse = await sendQuery(query);
  if (!queryResponse) {
    return;
  }
  if (queryResponse[0].length == 0)
    return res.send(JSON.stringify({imagePath: "AllOut.jpeg", listingId: null}));
  listingId = queryResponse[0][0].listingId;
  imagePath = queryResponse[0][0].imagePath;
  creatorId = queryResponse[0][0].creatorId;
  
  query = "SELECT id FROM User_information WHERE username = '" + username + "';";
  let userId = "";
  queryResponse = await sendQuery(query);
  if (!queryResponse) {
    return;
  }
  userId = queryResponse[0][0].id;

  query = "SELECT username FROM User_information WHERE id = " + creatorId + ";";
  let creatorUsername = "";
  queryResponse = await sendQuery(query);
  if (!queryResponse) {
    return;
  }
  creatorUsername = queryResponse[0][0].username;

  query = "INSERT INTO Seen_listings (listingId, userId) VALUES (" + listingId + ", " + userId + ");";
  sendQuery(query);
  let responsePath = imagePath;
  console.log("Sending listing");
  console.log("--------------------------------------");
  return res.send(JSON.stringify({imagePath: responsePath, listingId: listingId, creatorUsername: creatorUsername}));
});

app.post('/matchedListing', async (req) => {
  console.log("Attempting to push match");
  let body = req.body;
  const userToken = body.token;
  const currListing = body.currListing;
  let username = isAuthorized(userToken);
  if (!username) {
    return;
  }

  let query = "SELECT id FROM User_information WHERE username = '" + username + "';"
  let userId = "";
  let queryResponse = await sendQuery(query);
  if (!queryResponse) {
    return;
  }
  userId = queryResponse[0][0].id;
  
  query = "INSERT INTO MatchedWith (userId, listingId) VALUES (" + userId + ", " + currListing + ");";
  sendQuery(query);
  console.log("match sent");
});

app.post("/getChatOverviews", async (req, res) => {
  console.log("getting chat overviews");
  let body = req.body
  const userToken = body.token
  let username = isAuthorized(userToken);
  if (!username) 
    return;

  let query = "SELECT L.listingId, L.listingName, U.username FROM Listings L, User_information U WHERE (L.listingId in (SELECT listingId FROM MatchedWith WHERE userId = (SELECT id FROM User_information WHERE username = '" + username + "'))) AND (U.id = L.creatorId);";
  let queryResponse = await sendQuery(query);
  if (!queryResponse) {
    return;
  }
  let outgoingChatListings = queryResponse[0];
  
  query = "SELECT L.listingId, L.listingName, U.username FROM Listings L, User_information U WHERE (L.creatorId = (SELECT id FROM User_information WHERE username = '" + username + "')) AND (U.id IN (SELECT userId FROM MatchedWith WHERE listingId = L.listingId));"
  queryResponse = await sendQuery(query);
  if (!queryResponse) {
    return;
  }
  let incomingChatListings = queryResponse[0];
  let allChats = [outgoingChatListings, incomingChatListings];
  
  console.log("Sending chat overviews");
  return res.send(JSON.stringify(allChats));
})

app.post("/getIndividualChat", async (req, res) => {
  console.log("Getting individual chat information");
  let body = req.body
  let userToken = body.token;
  let listingId = body.listingId;
  let otherUser = body.userId;
  let username = isAuthorized(userToken);
  if (!username)
    return;

  try {
    let query = "SELECT id FROM User_information WHERE '" + username + "' = username;";
    let queryResponse = await sendQuery(query);
    let myId = queryResponse[0][0].id;

    query = "SELECT id FROM User_information WHERE '" + otherUser + "' = username;";
    queryResponse = await sendQuery(query);
    let otherId = queryResponse[0][0].id;

    query = "SELECT listingName FROM Listings WHERE listingId = " + listingId + ";";
    queryResponse = await sendQuery(query);
    let listingName = queryResponse[0][0].listingName;

    query = "SELECT text, timestamp, userId FROM Messages WHERE " + myId + " = userId AND " + otherId + " = receiverId UNION SELECT text, timestamp, userId FROM Messages WHERE " + otherId + " = userId AND " + myId + " = receiverId ORDER BY timestamp;";
    queryResponse = await sendQuery(query);
    let messages = queryResponse[0];

    console.log("responding with individual chat");
    return res.send(JSON.stringify([myId, listingName, messages]));
  }
  catch (error) {
    console.log("Query error");
  }
})

app.post("/sendMessage", async (req, res) => {
  console.log('sending message');
  let body = req.body;
  let sendId = body.myId;
  let recvName = body.recvName;
  let listingId = body.listingId;
  let message = body.message;
  
  try {
    let query = "SELECT id FROM User_information WHERE username = '" + recvName + "';";
    queryResponse = await sendQuery(query);
    let recvId = queryResponse[0][0].id;

    query = "INSERT INTO Messages (`text`, userId, receiverId, listingId) VALUES ('" + message + "', " + sendId + ", " + recvId + ", " + listingId + ");";
    await sendQuery(query);
    console.log("sent message");
  }
  catch (error) {
    console.log("Query error");
  }
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
  });