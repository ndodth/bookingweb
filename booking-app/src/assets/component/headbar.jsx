import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import '../css/bootstrap.min.css';
import '../js/bootstrap.js';
import mut from '../pic/mut.png';
import question from '../../../public/img/info/question.png';
import home from '../../../public/img/info/home.png'
import home2 from '../../../public/img/info/home2.png'
import ReserveRoom from '../../../public/img/info/reserveroom.png'
import history from '../../../public/img/info/history.png'
import lock from '../../../public/img/info/lock.png'
import ManageRoom from '../../../public/img/info/manageroom.png'
import employee from '../../../public/img/info/employee.png'

import rank from '../../../public/img/info/rank.png'
import rank2 from '../../../public/img/info/rank2.png'


import department from '../../../public/img/info/department.png'

import profile from '../../../public/img/info/profile.png'

import request from '../../../public/img/info/request.png'

import chart from '../../../public/img/info/chart.png'



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

    if (location.pathname === '/login') {
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
          <p className="fs-5">หน้านี้เมื่อใส่เงื่อนไขต่างๆก็จะแสดงเฉพาะแค่ห้องที่ว่างอยู่ แต่ถ้าไม่มีห้องว่างตามเงื่อนไขที่ระบุจะแสดงเวลาที่ใกล้เคียงที่สุดที่ห้องจะว่าง</p>
          <img src={home2} alt="Home" style={imgStyle} />

        </div>
      );
    } else if (location.pathname === '/ReserveRoom') {
      return (
        <div>
          <h1>หน้า การจองห้อง</h1>
          <img src={ReserveRoom} alt="Home" style={imgStyle} />
          <p className="fs-5 mb-2">หน้านี้จะแสดงถึงห้องที่คุณได้จองไว้โดยตามเนื้อหาโจทย์คือเเมื่อถึงเวลาที่จองจะมีการเจน QR codeที่แสดงตรงห้องประชุมเพื่อให้userที่จองในเวลานี้สามารถแสกนเพืื่อเข้าใช้ได้ </p>
          <br />
          <p className='fs-5'>แต่เพราะห้องทั้งหมดไม่มีจริง จึงมีปุ่มเพื่อจำลองแสดง qr code ของแต่ละห้องไว้ </p>
          <p className='fs-5 text-info'>-Waiting   คือห้องที่รอเวลาเข้าใช้<br/></p>
          <p className='fs-5 text-warning'>   -Pending คือสถานะรอได้รับอนุญาติการใช้ห้อง VIP<br/> </p>

       
          <p className='fs-5 text-danger'>**ถ้า user ไม่มีการแสกนห้องภายใน 30 นาทีห้องจะถูกเปลี่ยนเป็นสถานะ Expired และจะถูกยกเลิกโดยอัตโนมัติ และ user จะได้รับแต้ม Lock 1 แต้ม เมื่อมีแต้มครบ3 จะทำให้ไม่สามารถจองห้องได้อีกต้องติดต่อ admin เพื่อปลดล้อค</p>

          <p className='fs-5 text-info'>**qrcode จะเจน ก่อนถึงเวลาเริ่มที่จองไว้5นาที </p>


        </div>
      );
    } else if (location.pathname === '/BookingHistory') {
      return (
        <div>
         <h1>หน้า ประวัติการจองห้อง</h1>

          <img src={history} alt="history" style={imgStyle} />
          <p>หน้านี้จะแสดงประวัติการจองห้องทั้งหมดของ User</p>
        </div>
      );
    } else if (location.pathname === '/ManageRoom') {
      return (
        <div>
         <h1>หน้าจัดการห้องประชุม</h1>

          <img src={ManageRoom} alt="ManageRoom" style={imgStyle} />
          <p className='fs-5'>หน้านี้จะต้องมีตำแหน่งที่เข้าถึงได้ User</p>
          <p className='fs-5'>User จะสามารถ เพิ่ม แก้ไข เปลี่ยนรูปภาพ และลบห้องได้</p>

        </div>
      );
    }else if (location.pathname === '/LockListManagement') {
      return (
        <div>
         <h1>หน้าจัดการล้อค</h1>

          <img src={lock} alt="lock" style={imgStyle} />
          <p className='fs-5'>หน้านี้จะแสดง Userที่เคยจองห้องแต่ไม่เข้าใช้ห้องในเวลาที่กำหนด (30 นาทีหลังเวลาเริ่ม)</p>
          <p className='fs-5'>User ที่มี3แต้มหรือมากกว่านั้น จะไม่สามารถใช้งานระบบจองห้องได้</p>

        </div>
      );
    }else if (location.pathname === '/ManageEmployee') {
      return (
        <div>
         <h1>หน้าจัดการพนักงาน</h1>

          <img src={employee} alt="employee" style={imgStyle} />
          <p className='fs-2'>หน้านี้ไว้จัดการพนักงาน</p>
          <p className='fs-5'>จะสามารถเพิ่ม แก้ไขข้อมูลพนักงานได้</p>

        </div>
      );
    }else if (location.pathname === '/PositionManagement') {
      return (
        <div>
         <h1>หน้าจัดการตำแหน่ง</h1>

          <img src={rank} alt="rank" style={imgStyle} />
          <p className='fs-2'>หน้านี้ไว้จัดการเข้าถึงของพนักงานแต่ละตำแหน่ง</p>
          <img src={rank2} alt="rank2" style={{width: '60%'}}  />
          <p className='fs-5 text-start'>-Lock Management เข้าถึงหน้าจัดการการล้อค</p>
          <p className='fs-5 text-start'>-Report Management เข้าถึงหน้าการรายงาน</p>
          <p className='fs-5 text-start'>-Room Management เข้าถึงหน้าจัดการห้องประชุม</p>
          <p className='fs-5 text-start'>-Role Management เข้าถึงหน้าจัดกาตำแหน่ง</p>
          <p className='fs-5 text-start'>-Department Management เข้าถึงหน้าจัดการแผนก</p>
          <p className='fs-5 text-start'>-Employee Management เข้าถึงหน้าจัดการพนักงาน</p>




        </div>
      );
    }else if (location.pathname === '/DepartmentManagement') {
      return (
        <div>
         <h1>หน้าจัดการแผนก</h1>

          <img src={department} alt="department" style={imgStyle} />
          <p className='fs-2'>หน้านี้ไว้จัดการแผนก สามารถเพิ่มและลบแผนกได้
          </p>

        </div>
      );
    }else if (location.pathname === '/profile') {
      return (
        <div>
         <h1>หน้าProfile</h1>

          <img src={profile} alt="profile" style={imgStyle} />
          <p className='fs-4 text-start'>หน้านี้ User จะสามารถเปลี่ยนชื่อ-นามสกุล เพศ และ รูปภาพได้
          </p>

        </div>
      );
    }else if (location.pathname === '/RoomRequestManagement') {
      return (
        <div>
         <h1>หน้าอนุมัติใช้ห้อง vip</h1>

          <img src={request} alt="request" style={imgStyle} />
          <p className='fs-4 text-start'>หน้านี้จะแสดงถึงคำร้องขอการใช้ห้อง Vip และเหตุผลสามารถอนุมัติหรือยกเลิกได้
          </p>

        </div>
      );
    }else if (location.pathname === '/ReportMenu') {
      return (
        <div>
         <h1>หน้าReport</h1>

          <img src={chart} alt="chart" style={imgStyle} />
          <p className='fs-4 text-start'>หน้านี้จะแสดงรายงานการใช้ห้องของแต่ละเดือน
          </p>

        </div>
      );
    }else {
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
