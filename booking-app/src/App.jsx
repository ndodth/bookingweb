import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Header from '../../go/headbar';
import Sidebar from './assets/component/sidebar';
import LoginForm from './assets/component/login';
import RegisterForm from './assets/component/Registerform';
import Home from './assets/component/home';
import ReserveRoom from './assets/component/ReserveRoom';
import ยืนยัน from './assets/component/ยืนยัน';
import BookingHistory from './assets/component/bookingHistory';
import Detail from './assets/component/melonroom';
import Profile from './assets/component/profile';
import RoomManagement from './assets/component/ManageRoom';
import LockListManagement from './assets/component/LockEmp';
import DepartmentManagement from './assets/component/ManageDepartment';
import ManageEmployee from './assets/component/ManageEmployee';
import PositionManagement from './assets/component/ManageRank';
import RoomRequestManagement from './assets/component/RequestMenu';
import QRCodeScanner from './assets/component/QRcodeScanner';
import UnlockRoom from './assets/component/UnlockRoom';
import ReportMenu from './assets/component/ReportMenu';
import './App.css';

const Logout = ({ onLogout }) => {
  useEffect(() => {
    localStorage.removeItem('token');
    onLogout();
  }, [onLogout]);

  return <Navigate to="/login" />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [Permission, setPermission] = useState([]);

  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [data, setData] = useState(null); // เก็บข้อมูลจาก API

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
  };

  useEffect(() => {

    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const response = await fetch("https://bookingweb-sxkw.onrender.com/userPermissions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });


        const data = await response.json();
        setPermission(data);
        console.log(data)
        // Here you might want to update state with fetched data, e.g., setRooms(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Router>
      <div className="container-fluid">
        {/* <Header /> */}
        <div className="row">

          <div className="col-md-2 col-sm-1 col-lg-2">
            <Sidebar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          </div>
          <div className="col-md-2 col-sm-1 col-lg-1"></div>
          <div className="col-md-8 col-sm-10 col-lg-9">
            <Routes>
              <Route
                path="/login"
                element={
                  isLoggedIn ? (
                    <Navigate to="/home" />
                  ) : (
                    <LoginForm onLogin={handleLogin} onAdmin={handleAdmin} />
                  )
                }
              />

              <Route path="/Register" element={<RegisterForm />} />
              <Route path="/home" element={<Home isLoggedIn={isLoggedIn} />} />
              <Route path="/Detail" element={<Detail />} />
              <Route path="/ยืนยัน" element={<ยืนยัน />} />


              {isLoggedIn && (
                <>
                  <Route path="/BookingHistory" element={<BookingHistory />} />
                  <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ReserveRoom" element={<ReserveRoom />} />
                  <Route path="/unlockRoom/:id" element={<UnlockRoom />} />
                  <Route path="/QRCodeScanner" element={<QRCodeScanner />} />
                </>
              )}
              {isLoggedIn && Permission.some(permission => permission.menu_id === 1) && (
                <>
                  <Route path="/LockListManagement" element={<LockListManagement />} />
                </>)}
              {isLoggedIn && Permission.some(permission => permission.menu_id === 2) && (
                <>
                  <Route path="/ReportMenu" element={<ReportMenu />} />
                </>)}

              {isLoggedIn && Permission.some(permission => permission.menu_id === 3) && (
                <>
                  <Route path="/ManageRoom" element={<RoomManagement />} />
                  <Route path="/RoomRequestManagement" element={<RoomRequestManagement />} />

                </>)}
              {isLoggedIn && Permission.some(permission => permission.menu_id === 4) && (
                <>
                  <Route path="/PositionManagement" element={<PositionManagement />} />
                </>)}
              {isLoggedIn && Permission.some(permission => permission.menu_id === 5) && (
                <>
                  <Route path="/DepartmentManagement" element={<DepartmentManagement />} />
                </>)}
              {isLoggedIn && Permission.some(permission => permission.menu_id === 6) && (
                <>
                  <Route path="/ManageEmployee" element={<ManageEmployee />} />
                  <Route path="/PositionManagement" element={<PositionManagement />} />

                </>)}




              <Route path="/QRCodeScanner" element={<QRCodeScanner />} />

            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
