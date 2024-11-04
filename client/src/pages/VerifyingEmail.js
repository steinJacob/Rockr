import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';

export default function VerifyingEmail() {
    const host = process.env.REACT_APP_BACKEND_HOST;
    const [message, setMessage] = useState('Ready to verify...');
    const [navMessage, setNavMessage] = useState('');
    const location = useLocation();

    const VerifyEmail = () => {
        const parameters = new URLSearchParams(location.search);
        const token = parameters.get('token');
        console.log(token);
        console.log('verifying in the backend...');
        if(token) {
            fetch(host + `/verify?token=${token}`)
                .then(res => res.json())
                .then(data => {
                    setMessage(data.response);
                    setNavMessage('You can now close this page.');
                })
                .catch(error => {setMessage(error.response)});
        }
        console.log("Completed fetch");
        if(message == 'Email verified successfully!') {
            window.location.pathname = '/Home';
        }
    }
   
    return (
        <div>
            <h1>Click here to verify your account:</h1>
            <button id='sumbitVerify' onClick={VerifyEmail}>Verify</button>
            <p>{message}</p>
            <p>{navMessage}</p>
        </div>
    )
}