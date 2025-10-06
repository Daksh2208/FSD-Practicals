import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './SideBar';
import About from './About'; // make sure the path is correct
import Home from './Home';
import Contact from './Contact';
import Services from './Services';


function App() {
    return (
        <Router>
            <Sidebar />
            <div style={{ marginLeft: '220px', padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />
                    
                </Routes>
            </div>
        </Router>
    );
}

export default App;
