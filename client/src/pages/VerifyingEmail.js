import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';

export default function VerifyingEmail() {
    const [message, setMessage] = useState('Verifying...');
    const [navMessage, setNavMessage] = useState('');
    const location = useLocation();

    const VerifyEmail = () => {
        const parameters = new URLSearchParams(location.search);
        const token = parameters.get('token');
        if(token) {
            fetch(`http://localhost:8000/verify?token=${token}`)
                .then(res => res.json())
                .then(data => {
                    setMessage(data.response);
                    setNavMessage('You can now close this page.');
                })
                .catch(error => {setMessage(error.response)});
        }
    }
   
    return (
        <div>
            <h1>Click here to verify your account:</h1>
            <button id='submitVerify' onClick={VerifyEmail}>Verify</button>
            <p>{message}</p>
            <p>{navMessage}</p>

        </div>
    )
}