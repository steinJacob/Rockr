import { Link } from 'react-router-dom';
import '../styles/Home.css';

function SideMenu({ isMenuVisible, menuLinks, menuNames }) {

    return (
        <div className = {isMenuVisible ? 'sidebar' : 'sidebar hidden'}>
            {menuLinks.map((item, index) => (
                <div>
                    <Link to={item} className = 'sidebar-btn'>{menuNames[index]}</Link>
                </div>
            ))}
        </div>
    );
}

export default SideMenu;