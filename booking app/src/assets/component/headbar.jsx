import React from 'react';
import { Link } from 'react-router-dom';

import '../css/bootstrap.min.css';
import '../js/bootstrap.js';
import mut from '../pic/mut.png';

function Header() {
    return (
        <div className="container-fluid "style={{backgroundColor: '#49647C'}}>
            <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-1 border-bottom">
                <div className="col-md-2 mb-2 mb-md-0">
                    <a >
                    <Link className="d-inline-flex link-body-emphasis text-decoration-none"  to="/home">
                    
                        <img src={mut} className="navbar-brand"style={{width:'50%',height:'50%'}} alt="Logo" /></Link>
                        </a>
                </div>
            </header>
        </div>
    );
}

export default Header;
