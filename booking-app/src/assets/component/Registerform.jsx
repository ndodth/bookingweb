import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false); // state สำหรับแสดงข้อความยืนยันอีเมล
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [gender, setGender] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    // Regex สำหรับตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !department || !gender) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage('กรุณากรอกอีเมลให้ถูกต้อง เช่น yourname@gmail.com');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัว');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleOpenModal = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowModal(true);
    }
  };

  const handleRegister = async () => {
    const user = {
      name: firstName,
      lname: lastName,
      email: email,
      password: password,
      dept_id: parseInt(department, 10),
      sex: gender,
    };

    try {
      setLoading(true)
      console.log("loading",loading)
      const response = await fetch('https://bookingweb-sxkw.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      console.log(response)
      if (response.ok) {
        const data = await response.json();
        approve();
        setShowConfirmationMessage(true); // แสดงข้อความยืนยันการสมัครเมื่อการลงทะเบียนสำเร็จ
      } else {
        const text = await response.text();
        if (text === 'Conflict') {
          setErrorMessage('Email นี้มีการลงทะเบียนแล้ว');
        } else {
          setErrorMessage('Failed to register');
        }
        console.log('Error response from Back-end:', text);
      }
    } catch (error) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      console.error(error);
    } finally {
      setLoading(false)
    }
  };

  const approve = () => {
    alert('กรุณายืนยันอีเมลของคุณเพื่อทำการเข้าสู่ระบบ');

    navigate('/login', {
      state: {
        email: email,
        password: password,
      },
    });
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(to right, #d9f1ff, #ffffff)' }}>
      <div className="card shadow-lg border-0 rounded-5 p-5"
        style={{ maxWidth: '400px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '40px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <h1 className="text-center fw-bold mb-4" style={{ fontSize: '2rem' }}>Register</h1>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        {showConfirmationMessage && (
          <div className="alert alert-info">
            กรุณายืนยันอีเมลของคุณเพื่อทำการเข้าสู่ระบบ
          </div>
        )}

        <form>
          <div className="row mb-3">
            <div className="col">
              <input type="text"
                className="form-control border-0 shadow-sm rounded-3"
                placeholder="ชื่อ"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#d0e7f9' }} />
            </div>
            <div className="col">
              <input type="text"
                className="form-control border-0 shadow-sm rounded-3"
                placeholder="นามสกุล"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#d0e7f9' }} />
            </div>
          </div>

          <div className="mb-3">
            <input type="email"
              className="form-control border-0 shadow-sm rounded-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#d0e7f9' }} />
          </div>

          <div className="mb-3">
            <input type={showPassword ? 'text' : 'password'}
              className="form-control border-0 shadow-sm rounded-3"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#d0e7f9' }} />
          </div>

          <div className="mb-3">
            <input type={showPassword ? 'text' : 'password'}
              className="form-control border-0 shadow-sm rounded-3"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#d0e7f9' }} />
          </div>

          <div className="form-check form-switch mb-3">
            <input className="form-check-input"
              type="checkbox"
              id="showPasswordSwitch"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)} />
            <label className="form-check-label" htmlFor="showPasswordSwitch">
              แสดงรหัสผ่าน
            </label>
          </div>

          <div className="mb-4">
            <select className="form-select border-0 shadow-sm rounded-3"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#d0e7f9' }}>
              <option value="">แผนก</option>
              <option value="1">IT</option>
              <option value="2">HR</option>
              <option value="3">Finance</option>
            </select>
          </div>

          <div className="mb-4">
            <select className="form-select border-0 shadow-sm rounded-3"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#d0e7f9' }}>
              <option value="">เพศ</option>
              <option value="Male">ชาย</option>
              <option value="Female">หญิง</option>
              <option value="Other">อื่นๆ</option>
            </select>
          </div>

          <div className="d-grid">
            <button type="submit"
              className="btn btn-primary rounded-pill shadow-sm"
              onClick={handleOpenModal}
              style={{ height: '45px', fontSize: '1.1rem', backgroundColor: '#4A76A8' }}>
              Confirm
            </button>
          </div>
        </form>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <div style={{ backgroundColor: '#49647C', color: 'white', borderRadius: '10px' }}>
          <Modal.Header closeButton>
            <Modal.Title className="w-100 text-center">ยืนยันการยอมรับคำร้อง</Modal.Title>
          </Modal.Header>
          <Modal.Body className="container d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
          {loading ? (
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <>

                <div className="d-flex justify-content-center">
                  <Button variant="primary" className="bg-success mx-5 p-2 fs-2" onClick={handleRegister}>
                    ยืนยัน
                  </Button>
                  <Button variant="secondary" className="bg-danger mx-5 p-2 fs-2" onClick={() => setShowModal(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </>
            )}
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterForm;
