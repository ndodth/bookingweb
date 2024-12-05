import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import room1 from '../pic/room1.jpg';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingCard = ({ booking, handleShowModal }) => {
  return (
    <div
      className="card mb-3 p-3 shadow-sm"
      style={{
        backgroundColor: '#f0f8ff',
        borderRadius: '15px',
        border: '1px solid #d0e0ff',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
    >
      <div className="row no-gutters align-items-center">
        <div className="col-md-2 text-center">
          <img
            src={booking.roomDetails.roompic}
            className="rounded-circle img-fluid mb-2"
            alt="Room"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "35px",
              marginRight: "20px",
              border: "solid 1px black",
            }}
          />
          <span
            className="badge badge-light"
            style={{
              display: 'block',
              margin: '0 auto',
              backgroundColor: 'transparent',
              color: '#333',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {booking.type}
          </span>
        </div>

        <div className="col-md-9">
          <div
            className="card-body"
            style={{
              backgroundColor: '#f0f8ff',
              borderRadius: '15px',
              padding: '10px',
              border: 'none',
              paddingRight: '120px',
            }}
          >
            <h5 className="card-title">ชื่อ: {booking.roomDetails.name}</h5>
            <p className="card-text mb-1">รหัส: {booking.room_id}</p>
            <p className="card-text mb-1">จองเมื่อ: {booking.booking_date.split("+")[0].replace("T"," ")}</p>
            <p className="card-text mb-1">เวลา: {booking.start_time.split("+")[0].replace("T", " ")} -  {booking.end_time.split("+")[0].replace("T", " ")} </p>
          </div>
        </div>

        {/* ปุ่มจองอีกครั้ง - ขยับไปด้านบนสุดขอบขวาของการ์ด */}
        <button
          className="btn"
          style={{
            backgroundColor: '#38384F',
            color: 'white',
            borderRadius: '15px',
            padding: '10px 10px',
            width: '200px',
            position: 'absolute', // ทำให้ปุ่มอยู่ด้านบนขวา
            top: '25px',           // ปรับให้เกือบติดขอบด้านบน
            right: '25px',         // ปรับให้เกือบติดขอบด้านขวา
          }}
          onClick={handleShowModal}
        >
          จองอีกครั้ง
        </button>
      </div>
    </div>
  );
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found in localStorage");
        }

        const [bookingsResponse, roomsResponse] = await Promise.all([
          axios.get('https://bookingweb-sxkw.onrender.com/historyBooking', {
            headers: { "Authorization": `Bearer ${token}` },
          }),
          axios.get('https://bookingweb-sxkw.onrender.com/rooms', {
            headers: { "Authorization": `Bearer ${token}` },
          }),
        ]);

        const roomsData = roomsResponse.data;
      

        setRooms(roomsData);
        
        if(bookingsResponse.data != null){
        // สร้างการจองที่มีข้อมูลห้อง
        const enrichedBookings = bookingsResponse.data.map((booking) => {
          const roomDetails = roomsData.find(room => room.id === booking.room_id);
          return { ...booking, roomDetails };
        });
      
        // แทนที่ข้อมูลการจองในสถานะ

        setBookings(enrichedBookings);
      }
      else{
        setBookings(bookingsResponse.data)
      }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const navigate = useNavigate();
  const handleConfirm = () => {
    setShowModal(false);
    navigate('/home');
  };

  return (
    <div
      className="card shadow-lg p-4"
      style={{
        borderRadius: '15px',
        // border: '2px solid #1e90ff',
        maxWidth: '900px',
        margin: '0 auto 0 0',  // ชิดซ้ายโดยตั้งค่า margin left เป็น 0
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(230, 240, 255, 0.6))',
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <h2
        className="text-left mb-4"
        style={{
          padding: '10px 20px',
          color: '#000000',
          fontWeight: 'normal',
          borderRadius: '20px',
          backgroundColor: '#ffffff',
          width: 'fit-content',
          border: 'none',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          marginLeft: '0',  // จัดตำแหน่งหัวข้อให้อยู่ทางซ้าย
        }}
      >
        ประวัติการจอง
      </h2>
      {(bookings === null) ? (
  <div className="text-center mt-5">
    <h3>ไม่มีคำประวัติการจองห้อง</h3>
  </div>
      ) : (
        <>
      {bookings.map((booking, index) => (
        <BookingCard key={index} booking={booking} handleShowModal={handleShowModal} />
      ))}
</>)}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการจอง</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ยืนยันการจองอีกครั้งหรือไม่?
        </Modal.Body>
        <Modal.Footer>
        
          <Button variant="danger" onClick={handleCloseModal}>
            ยกเลิก
          </Button>
          <Button variant="success" onClick={handleConfirm}>
            ยืนยัน
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingHistory;