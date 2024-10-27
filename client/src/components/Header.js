import React from 'react';
import '../styles/Home.css';

function Header({ isMenuVisible, toggleMenu } ) {
    return (
        <div className = 'header'>
            <h2 onClick = {toggleMenu}> {isMenuVisible ? 'Hide Menu' : 'Show Menu'} </h2>
            <h1> Rockr </h1>
        </div>
    );
}

export default Header;