import React, {useState, useEffect} from "react";
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AllChats from '../components/AllChats.js';
import CustomNavLink from "../components/CustomNavLink";
import {Authorization} from '../components/Authorization';
import "../styles/Chat.css";

export default function Chat() {
    Authorization();

    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleMenu = () => {
        setIsMenuVisible(prev => !prev);
    }

    const menuNames = ['Profile', 'Chat', 'My Listings', 'Settings'];
    const menuLinks = ['/Profile', '/Chat', '/MyListings', '/Settings'];

    return (
        <>
            <Header isMenuVisible = {isMenuVisible} toggleMenu = {toggleMenu}/>
            <div className="main-container">
                <SideMenu isMenuVisible = {isMenuVisible} menuNames = {menuNames} menuLinks = {menuLinks}/>
                <div className = 'main-area'>
                    <h2>Chat Page</h2>
                    <div className = 'all-chat-area'>
                        <AllChats/>
                    </div>
                </div>
            </div>
        </>
    )
}