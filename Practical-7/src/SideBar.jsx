import React, { useState } from 'react';
import './Sidebar.css'; // Create this file for styling

import { Link } from 'react-router-dom';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const sidebarItems = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/About' }, // Use lowercase and match the route
        { name: 'Services', path: '/Services' },
        { name: 'Contact', path: '/Contact' },
    ];

    return (
        <>
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isOpen ? 'Close ☰' : 'Menu ☰'}
            </button>

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <ul>
                    {sidebarItems.map((item, index) => (
                        <li key={index}>
                            <Link to={item.path} >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export default Sidebar;
