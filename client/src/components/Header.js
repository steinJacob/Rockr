import React from 'react';
import '../styles/Home.css';

function Header({ isMenuVisible, toggleMenu } ) {
    return (
        <div className = 'header' style = {{
            backgroundImage: 'url("banner.png")',
            backgroundSize: "cover",
            backgroundPosition: "right",
            backgroundRepeat: "no-repeat",
        }}>
            <h2 className = "menu-btn" onClick = {toggleMenu} style = {{
                backgroundImage: isMenuVisible == true ? 'url("openmenu.png")' : 'url("closedmenu.png")',
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
            }}></h2>
            <h1> Rockr </h1>
            <h2 className = "right-btn"></h2>
        </div>
    );
}

export default Header;