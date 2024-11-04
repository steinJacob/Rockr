import React from 'react';
import '../styles/Home.css';

function Header({ isMenuVisible, toggleMenu } ) {
    const host = process.env.REACT_APP_BACKEND_HOST;
    return (
        <div className = 'header' style = {{
            backgroundImage: 'url("' + host + '/banner.png")',
            backgroundSize: "cover",
            backgroundPosition: "right",
            backgroundRepeat: "no-repeat",
        }}>
            <h2 className = "menu-btn" onClick = {toggleMenu} style = {{
                backgroundImage: isMenuVisible == true ? 'url("' + host + '/openmenu.png")' : 'url("' + host + '/closedmenu.png")',
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}></h2>
            <h1> Rockr </h1>
            <h2 className = "right-btn"></h2>
        </div>
    );
}

export default Header;