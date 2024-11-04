import {Authorization} from './Authorization';
import React, {useState, useEffect} from 'react';

function AllChats({ navigate }) {
    const host = process.env.REACT_APP_BACKEND_HOST;
    const [outgoingChats, setOutgoingChats] = useState([]);
    const [incomingChats, setIncomingChats] = useState([]);

    // need to query database to get chat information
    useEffect(() => {
        Authorization();

        const myToken = localStorage.getItem('token');
        let body = {
            token: myToken
        }
        fetch(host + '/getChatOverviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        })
        .then(res => res.json())
        .then(data => {
            console.log(data[0]);
            setOutgoingChats(data[0]);
            setIncomingChats(data[1]);
        });// set useState variables)
    }, []);

    const goToChat = (userId, listingId) => {
        navigate(`/IndividualChat/${userId}/${listingId}`);
    };


    return (
        <div className = 'all-chats'>
            <h1>Outgoing Chats</h1>
            <div className = 'outgoing-chats' style = {{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
            }}>
                {outgoingChats.map((item, index) => (
                    <div className = 'individual-chat' onClick={() => goToChat(item.username, item.listingId)}>
                        <img className = 'chat-image' src = {item.imagePath}></img>
                        <div className = 'chat-titles'>
                            <h2>{item.listingName}</h2>
                            <h3>{item.username}</h3>
                        </div>
                    </div>
                ))}
            </div>
            <h1>Incoming Chats</h1>
            <div className = 'incoming-chats' style = {{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
            }}>
                {incomingChats.map((item, index) => (
                    <div className = 'individual-chat' onClick={() => goToChat(item.username, item.listingId)}>
                        <img className = 'chat-image' src = {item.imagePath}></img>
                        <div className = 'chat-titles'>
                            <h2>{item.listingName}</h2>
                            <h3>{item.username}</h3>
                        </div>
                        <div className = 'last-message'>
                            <h4></h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AllChats;