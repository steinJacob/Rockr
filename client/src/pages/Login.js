import React, {useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
export default function Login() {
    //Variables for user input
    const [uNameInput, setUName] = useState("");
    const [passInput, setPassword] = useState("");
    
    //Variable for value returned from the backend
    const [loginMessage, setLoginMessage] = useState("");

    //handle changes to username and password input
    const handleUsernameChange = (event) => {
        setUName(event.target.value);
    }
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    const navigate = useNavigate();
    //function to login. When 'Log In' button is pressed, the inputs are sent to the backend. 
    //If the login info matches a user in the database, the user will be sent to the home page.
    const submitLogin = (event) => {
        event.preventDefault();
        const loginQuery = {
            username: uNameInput,
            password: passInput
        };
        fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginQuery), //sent as a JSON string
            })
            .then(res => res.json())
            .then(data => {
                if (data.response == "accepted") {
                    setLoginMessage("login accepted. Going to home...");
                    localStorage.setItem('token', data.token);
                    navigate("/Home");
                }
                else {
                    setLoginMessage("Login rejected. Please enter valid credentials...");
                }
            })
            .catch(error => console.error(error));
    }

    return (
        <div>
            <h1 class="header">Welcome to the Login Page!</h1>
            <p class="spacer"> </p>
            <div class="main-container">
                <div class="user-info-box">
                    <div>
                        <label class="login-label">Username:</label>
                        <input type="text" class="input-text" id="userInputText" name="userInputText" placeholder="Username" onChange={handleUsernameChange} />
                    </div>
                    <div>
                    <label class="login-label">Password: </label>
                        <input type="text" class="input-text" id="passInputText" name="passInputText" placeholder="Password" onChange={handlePasswordChange} />
                    </div>
                    <p> </p>
                    <button onClick={submitLogin}>Log In</button>
                </div>
            </div>
            <div class="main-container">
                <div class="user-info-box">
                    <label class="profile-description">Need an account?</label>
                    <Link to="/CreateAccount">Create Account</Link>
                </div>
                <p>{loginMessage}</p>
            </div>
        </div>
    )
}