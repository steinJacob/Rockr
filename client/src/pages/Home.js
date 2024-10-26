import React, {useState, useEffect} from "react";
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import Listing from '../components/Listing';
import CustomNavLink from "../components/CustomNavLink";
import '../styles/Home.css';
import {Authorization} from '../components/Authorization';

export default function Home() {
    Authorization();

    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleMenu = () => {
        setIsMenuVisible(prev => !prev);
    }

    const menuNames = ["Profile", "Chat", "My Listings", "Settings"];
    const menuLinks = ["/Profile", "/Chat", "/Listings", "/Settings"];

    return (
        <>
            <Header isMenuVisible = {isMenuVisible} toggleMenu = {toggleMenu}/>
            <div className = 'main-container'>
                <SideMenu isMenuVisible = {isMenuVisible} menuNames = {menuNames} menuLinks = {menuLinks}/>
                <Listing/>
            </div>
        </>
    )
}