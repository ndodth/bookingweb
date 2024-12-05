import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // นำเข้า Link จาก react-router-dom
import '../css/bootstrap.min.css';
import '../js/bootstrap.js';
import mut_bg from '../pic/background.png';
import userIcon from '../pic/user.png'; // นำเข้ารูปไอคอน
import passwordIcon from '../pic/padlock.png';
import '../css/login.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


function LoginForm({ onLogin, onAdmin }) {
  const location = useLocation();
  const { Email, password: passwordFromState } = location.state || {}; // รับค่า Email และ password จาก state (หากมี)
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ดึงค่าจาก localStorage
  const storedEmail = localStorage.getItem('email');
  const storedPassword = localStorage.getItem('password');

  // ใช้ค่าใน state หรือ localStorage ถ้าไม่มี
  const emailToCheck = Email || storedEmail;
  const passwordToCheck = passwordFromState || storedPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(user)
    console.log(pass)

    axios.post('http://localhost:5020/login', {
      email: user,
      password: pass
    })
      .then(response => {
        const token = response.data.token;

        localStorage.setItem('token', token);
        console.log('Login successful:', response.data);
        onLogin();
      })
      .catch(error => {
        console.error('Login failed:', error);
        alert('Login failed')
      });
  };

  const handleAdmin = () => {
    axios.post('http://localhost:5020/login', {
      email: "admin@admin",
      password: "1234"
    })
      .then(response => {
        const token = response.data.token;

        localStorage.setItem('token', token);
        console.log('Login successful:', response.data);
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
    onLogin();
    onAdmin();
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '50vh',
        backgroundImage: `url(${mut_bg})`,
        backgroundSize: '150%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '10px'
      }}
    >
      <div className="text-center m-5" style={{ width: '50vw', padding: '10vh 10vw', backgroundColor: 'white', borderRadius: '10px' }}>
        <h1 className='display-4 fw-bold mb-5'>Login</h1>
        <div>user:ww@gmail.com pass:123</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group fw-bold text-start mb-5">
            <label htmlFor="username" style={{ textShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)' }}>Username</label>
            <input
              type="email"
              className="form-control shadow"
              style={{
                backgroundColor: '#A4C6CC',
                width: '100%',
                backgroundImage: `url(${userIcon})`, // ตั้งค่าภาพพื้นหลัง
                backgroundPosition: '10px center', // ตำแหน่งของภาพ
                backgroundSize: '20px', // ขนาดของภาพ
                backgroundRepeat: 'no-repeat',
                paddingLeft: '40px' // เพิ่มพื้นที่ให้กับข้อความ
              }}
              id="username"
              placeholder="Type your username"
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div className="form-group fw-bold text-start mb-5">
            <label htmlFor="password" style={{ textShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)' }}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control mb-5 shadow"
              style={{
                backgroundColor: '#A4C6CC',
                backgroundImage: `url(${passwordIcon})`, // ตั้งค่าภาพพื้นหลัง
                backgroundPosition: '10px center', // ตำแหน่งของภาพ
                backgroundSize: '20px', // ขนาดของภาพ
                backgroundRepeat: 'no-repeat',
                paddingLeft: '40px' // เพิ่มพื้นที่ให้กับข้อความ
              }}
              id="password"
              placeholder="Type your password"
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <div className="d-flex justify-content-between align-items-center">
              <label className="switch me-3">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                />
                <span className="slider">
                  <div className='ms-5' style={{ color: '#666666' }}>Show&nbsp;password</div>
                </span>
              </label>
              <Link to="/Register" className='text-decoration-none btn' style={{ color: '#666666' }}>
                Register
              </Link>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary px-4" style={{ backgroundColor: "#49647C" }}>Confirm</button>
          </div>
        </form>
      </div>
      <div className='align-self-end'>
        <Link to="/home" className="btn btn-primary px-4 text-end" style={{ backgroundColor: "#49647C" }} onClick={handleAdmin}> ตำแหน่งAdmin Test
        </Link>
      </div>

    </div>

  );
}

export default LoginForm;
