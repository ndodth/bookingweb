import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import '../css/bootstrap.min.css';
import '../js/bootstrap.js';
import mut from '../pic/mut.png';
import question from '../../../public/img/info/question.png';
import home from '../../../public/img/info/home.png'
// import questionIcon from '../pic/question.png'; // ไอคอนสำหรับปุ่ม

function Header() {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  // ฟังก์ชันเปิด/ปิด Modal
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // กำหนดข้อความใน Modal ตาม URL ปัจจุบัน
  const renderModalMessage = () => {
    const imgStyle = {
      maxWidth: '100%', // จำกัดความกว้างไม่ให้เกินขอบเขต Modal
      maxHeight: '70vh', // จำกัดความสูงไม่ให้เกิน 70% ของความสูงหน้าจอ
      height: 'auto', // รักษาสัดส่วนของภาพ
      marginBottom: '10px',
    };

    if (location.pathname === '/profile') {
      return (
        <div>
          <img src={home} alt="Profile" style={imgStyle} />
          <p>คุณกำลังอยู่ในหน้าโปรไฟล์</p>
        </div>
      );
    } else if (location.pathname === '/login') {
      return (
        <div>
          <p className="fs-2  text-decoration-underline">ยินดีต้อนรับ นี่คือ miniprojectของมหาลัยที่ผมอยากจะลองทำต่อเพื่อนำมาใส่ในresume</p>
          <p className="fs-4 ">หัวข้อ projectคือเว็บการจองห้องประชุมสำหรับพนักงาน</p>

          <p className="fs-5">คุณสามารถลองใช้ Id admin โดยกดปุ่มขวาล่างหรือ ลองสมัครสมาชิกได้</p>
        </div>
      );
    } else if (location.pathname === '/home') {
      return (
        <div>
          <h1>หน้า Home</h1>
          <img src={home} alt="Home" style={imgStyle} />
          <p className="fs-5">โดยจ</p>
        </div>
      );
    } else if (location.pathname === '/ReserveRoom') {
      return 'คุณกำลังอยู่ในหน้าจองห้อง';
    } else if (location.pathname === '/BookingHistory') {
      return (
        <div>
         <h1>หน้า ประวัติการจองห้อง</h1>

          <img src={home} alt="Profile" style={imgStyle} />
          <p>หน้านี้จะแสดงประวัติการจองห้องทั้งหมดของ User</p>
        </div>
      );
    } else if (location.pathname === '/LockListManagement') {
      return 'คุณกำลังอยู่ในหน้าการจัดการล็อกรายการ';
    } else {
      return 'Error';
    }
  };


  return (
    <div className="container-fluid" style={{ backgroundColor: '#49647C' }}>
      <header className="d-flex flex-wrap align-items-center justify-content-between py-3 mb-1 border-bottom">
        <div className="col-md-2 mb-2 mb-md-0">
          <Link className="d-inline-flex link-body-emphasis text-decoration-none" to="/home">
            <img src={mut} className="navbar-brand" style={{ width: '50%' }} alt="Logo" />
          </Link>
        </div>
        <div className="col-md-auto">
          <Button
            className="btn btn-outline-light"
            style={{ borderRadius: '50%', padding: '10px',backgroundColor:'#49647C' }}
            onClick={handleShowModal}
          >
            <img src={question} alt="Help" style={{ width: '30px' }} />
          </Button>
        </div>
      </header>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <div style={{ backgroundColor: '#49647C', color: 'white', borderRadius: '10px', width: "550px" }}>
          <Modal.Header closeButton className="d-flex justify-content-center w-100">
            <Modal.Title className="w-100 text-center">ข้อมูล</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">{renderModalMessage()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              ปิด
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
}

export default Header;
