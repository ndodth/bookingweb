import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import home from '../pic/home.png';
import reserve from '../pic/จอง.png';
import profile from '../pic/profile.png';
import history from '../pic/README.png';
import cancelIcon from '../pic/cancel.png';
import exit from '../pic/ออก.png';
import manage_room from '../pic/ห้อง.png'
import lock_user from '../pic/admin.png'
import emp from '../pic/พนักงาน.png'
import report from '../pic/report.png'
import info from '../pic/info.png'


function Sidebar({ isLoggedIn ,isAdmin }) {
    const [Permission, setPermission] = useState([]);

    useEffect(() => {
        setTimeout(() => {
            
      
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
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
      
        fetchData();
    }, 500);
      }, [isLoggedIn]);

      console.log("Permission",Permission)
  return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-white" style={{ width: '250px', height: '100vh', overflowY: 'auto' }}>
            <ul className="nav nav-pills flex-column pb-3 w-100">
                <li className="nav-item ">
                    <Link 
                        to="/home"
                        className="nav-link btn text-start d-flex align-items-center p-2 mb-3 fs-5 w-100"
                        style={{
                            backgroundColor: '#A4C6CC', 
                            borderRadius: '10px',
                            color: 'black',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                        }}
                    >
                        <img className="me-3" width="30" height="30" src={home} alt="home icon" />
                        หน้าหลัก
                    </Link>
                </li>
                {!isLoggedIn  && (
                    <>
                <li className="nav-item ">
                    <Link 
                        to="/login"
                        className="nav-link btn text-start d-flex align-items-center p-2 mb-3 fs-5 w-100"
                        style={{
                            backgroundColor: '#A4C6CC', 
                            borderRadius: '10px',
                            color: 'black',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                        }}
                    >
                        <img className="me-3" width="30" height="30" src={home} alt="home icon" />
                        Login
                    </Link>
                </li>
                </>
                )}
               
               {isLoggedIn  && (
<>
                     <li className="nav-item mb-3">
                            <Link 
                                to="/ReserveRoom"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={reserve} alt="reserve icon" />
                                ห้องที่จอง
                            </Link>
                        </li>
                     
                        <li className="nav-item mb-3">
                            <Link 
                                to="/BookingHistory"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={history} alt="history icon" />
                                ประวัติการจองห้อง
                            </Link>
                        </li>
                       </>)}
                       {isLoggedIn &&Permission.some(permission => permission.menu_id === 3) && (
                            <>
                       <li className="nav-item mb-3">
                            <Link 
                                to="/ManageRoom"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={manage_room} alt="reserve icon" />
                                จัดการห้องประชุม
                            </Link>
                        </li>
                        </>)}
                        {isLoggedIn &&Permission.some(permission => permission.menu_id === 1) && (
                                    <>
                        <li className="nav-item mb-3">
                            <Link 
                                to="/LockListManagement"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={lock_user} alt="reserve icon" />
                                จัดการล้อคพนักงาน
                            </Link>
                        </li>
                        </>
                        )}
                        {isLoggedIn &&Permission.some(permission => permission.menu_id === 6) && (
                            <>
                        <li className="nav-item mb-3">
                            <Link 
                                to="/ManageEmployee"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={emp} alt="reserve icon" />
                                จัดการพนักงาน
                            </Link>
                        </li>
                        </>)}
                        {isLoggedIn &&Permission.some(permission => permission.menu_id === 5) && (
                            <>
                        <li className="nav-item mb-3">
                            <Link 
                                to="/DepartmentManagement"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={emp} alt="reserve icon" />
                                จัดการแผนก
                            </Link>
                        </li>
                        </>)}
                        {isLoggedIn &&Permission.some(permission => permission.menu_id === 6) && (
                            <>
                        <li className="nav-item mb-3">
                            <Link 
                                to="/PositionManagement"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={emp} alt="reserve icon" />
                                จัดการตำแหน่ง
                            </Link>
                        </li>
                        </>)}
                        {isLoggedIn && (
                            <>
                        <li className="nav-item mb-3">
                            <Link 
                                to="/profile"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={profile} alt="profile icon" />
                                โปรไฟล์
                            </Link>
                        </li>
                        </>)}
                        {isLoggedIn &&Permission.some(permission => permission.menu_id === 2) && (
                            <>
                        <li className="nav-item mb-3">
                            <Link 
                                to="/ReportMenu"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={report} alt="profile icon" />
                                รายงาน
                            </Link>
                        </li>
                        </>)}
                        {isLoggedIn &&Permission.some(permission => permission.menu_id === 3) && (
<>
                        <li className="nav-item mb-3">
                            <Link 
                                to="/RoomRequestManagement"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                <img className="me-3" width="30" height="30" src={info} alt="profile icon" />
                                คำขอการใช้งาน
                            </Link>
                        </li>  
                        </>)}

                        {isLoggedIn && (
                            <>
                        <li className="nav-item mb-2">
                            <Link 
                                to="/logout"
                                className="nav-link btn text-start d-flex align-items-center p-2 fs-5 w-100"
                                style={{
                                    backgroundColor: '#A4C6CC', 
                                    borderRadius: '10px',
                                    color: 'black',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // เพิ่มเงา
                                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                            >
                                
                                <img className="me-3" width="30" height="30" src={exit} alt="logout icon" />
                                ออกจากระบบ
                            </Link>
                        </li>
                        </>)}

                    
                   
            </ul>
        </div>
    );
}

export default Sidebar;