import React, {useState, useEffect} from "react";
import CustomNavLink from "../components/CustomNavLink";
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import {Authorization} from '../components/Authorization';
import Geolocation from "../components/Geolocation";
import Popup from 'reactjs-popup';
import "../styles/Profile.css";


export default function Profile() {
    Authorization();

    //variables for current user info (from DB)
    const [firstName, setFName] = useState("");
    const [lastName, setLName] = useState("");
    const [username, setUName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordText, setPassText] = useState("••••••••••");
    const [email, setEmail] = useState("");
    const [phoneNum, setPhoneNum] = useState("");
    const [location, setLocation] = useState([]);

    //variables to hold new profile info inputted by user
    const [newFirstName, setNewFName] = useState("");
    const [newLastName, setNewLName] = useState("");
    const [newUsername, setNewUName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhoneNum, setNewPhoneNum] = useState("");

    //sidebar variables
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const menuNames = ["Home", "Chat", "My Listings", "Settings"];
    const menuLinks = ["/Home",  "/Chat", "/Listings", "/Settings"];

    //by using the user's token, retrieve the user and their profile info
    const grabUserInfo = () => {
        let mytoken = localStorage.getItem('token');
        fetch('http://localhost:8000/getUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token: mytoken})
        })
        .then(res => res.json())
        .then(data => {
            setFName(data.FirstName);
            setLName(data.LastName);
            setUName(data.username);
            setPassword(data.password);
            setEmail(data.email);
            setPhoneNum(data.phone);
            setLocation([data.latitude, data.longitude]);
        })
        .catch(error => console.error(error));
    }

    //compile current and changed info and push it to the server. Server retrieves the information from the DB and returns it here
    const changeUserInfo = () => {
        //compile info to push to server
        let qFN = newFirstName;
        let qLN = newLastName;
        let qUN = newUsername;
        let qPa = newPassword;
        let qEm = newEmail;
        let qPh = newPhoneNum;

        if(newFirstName.length === 0) {
            qFN = firstName;
        }
        if(newLastName.length === 0) {
            qLN = lastName;
        }
        if(newUsername.length === 0) {
            qUN = username;
        }
        if(newPassword.length === 0) {
            qPa = password;
        }
        if(newEmail.length === 0) {
            qEm = email;
        }
        if(newPhoneNum.length === 0) {
            qPh = phoneNum;
        }

        let mytoken = localStorage.getItem('token');
        let userObj = {
            token: mytoken,
            newfirstname: qFN,
            newlastname: qLN,
            newusername: qUN,
            newpassword: qPa,
            newemail: qEm,
            newphone: qPh
        };
        console.log(JSON.stringify(userObj));
        fetch("http://localhost:8000/newUserInfo", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userObj)
        })
        .then(res => res.json())
        .then(data => {
            setFName(data.FirstName);
            setLName(data.LastName);
            setUName(data.username);
            setPassword(data.password);
            setEmail(data.email);
            setPhoneNum(data.phone);
        })
        .catch(error => console.error(error));
    }

    const toggleMenu = () => {
        setIsMenuVisible(prev => !prev);
    }

    const showPassword = (event) => {
        if(passwordText == password) {
            setPassText("••••••••••");
        } else {
            setPassText(password);
        }
    }

    useEffect(() => {
        grabUserInfo();
    }, []);

    return (
        <div>
            <Header class="header" isMenuVisible = {isMenuVisible} toggleMenu = {toggleMenu}/>
            <SideMenu isMenuVisible = {isMenuVisible} menuNames = {menuNames} menuLinks = {menuLinks}/>
            <div className="main-container">
                <div class="user-info-box">
                    <div>
                        <h2>User Information</h2>
                    </div>
                    <p class="profile-description">First Name: {firstName}</p>
                    <p></p>
                    <p class="profile-description">Last Name: {lastName}</p>
                    <p></p>
                    <p class="profile-description">Username: {username}</p>
                    <p></p>

                    <Popup trigger={<button class="button">Change Profile Info</button>} position="right">
                        <div class="change-info-box">
                            <label>Input New First Name: </label>
                            <div>
                            <input type="text" class="input-text" value={newFirstName} placeholder={firstName} onChange={(e) => setNewFName(e.target.value)} />
                            </div>
                            <label>Input New Last Name: </label>
                            <div>
                            <input type="text" class="input-text" value={newLastName} placeholder={lastName} onChange={(e) => setNewLName(e.target.value)} />
                            </div>
                            <label>Input New Username: </label>
                            <div>
                            <input type="text" class="input-text" value={newUsername} placeholder={username} onChange={(e) => setNewUName(e.target.value)} />
                            </div>
                            <button class="button" onClick={changeUserInfo}>Submit New Profile Info</button>
                        </div>
                    </Popup>
                </div>
            </div>
            <div class="main-container">
                <div class="user-info-box">
                        <h2>  Communication  </h2>
                        <p class="profile-description">Email: {email}</p>
                        <p></p>
                        <p class="profile-description">Phone Number: {phoneNum}</p>
                        <p></p>
                        <Popup trigger={<button class="button">Change Profile Info</button>} position="right">
                            <div class="change-info-box">
                                <label>Input New Email: </label>
                                <div>
                                <input type="text" class="input-text" value={newEmail} placeholder={email} onChange={(e) => setNewEmail(e.target.value)} />
                                </div>
                                <label>Input New Phone #: </label>
                                <div>
                                <input type="text" class="input-text" value={newPhoneNum} placeholder={phoneNum} onChange={(e) => setNewPhoneNum(e.target.value)} />
                                </div>
                                <button class="button" onClick={changeUserInfo}>Submit New Contact Info</button>
                            </div>
                        </Popup>
                </div>
            </div>
            <div class="main-container">
                <div class="user-info-box">
                    <h2>  Password  </h2>
                    <div>
                        <p id="passwordText"> {passwordText} </p>
                        <button class="button" id="toggleButton" onClick={showPassword}>Show</button>
                        <Popup trigger={<button class="button">Change Password</button>} position="right">
                            <div class="change-info-box">
                                <label>Input New Email: </label>
                                <div>
                                <input type="text" class="input-text" value={newPassword} placeholder={passwordText} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                                <button class="button" onClick={changeUserInfo}>Submit New Password</button>
                            </div>
                        </Popup>
                    </div>
                </div>
            </div>
            <div class="main-container">
                <div class="user-info-box">
                    <h2>  Location  </h2>
                    <Geolocation />
                </div>
            </div>
        </div>
    )
}