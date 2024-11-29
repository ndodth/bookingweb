import React, { useState } from "react";
import '../css/bootstrap.min.css';
import '../js/bootstrap.js';
import qr from '../pic/qr-code.png';
import axios from 'axios';


import { useLocation } from 'react-router-dom';
import { Modal, Button, Form } from "react-bootstrap";

const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11, ต้องบวก 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function ยืนยันห้อง() {
    const location = useLocation();
    const { roomData, selectedTime, selectedTime2, selectedDate, roompic } = location.state || {};
    const [showModal1, setShowModal1] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [vipshowModal, setvipshowModals] = useState(false);
    const [reason, setReason] = useState('');

    

    const handleApproveClick = () => {
        if(roomData.room_type_id == 2){
            setvipshowModals(true)
        }
        else{
            setReason("")

            setShowModal1(true)
        }
    };
    const findstatus = () => {
        if (roomData.room_type_id == 2) { return 1 }

        return 5;
    };
    const success = async () => {
        const token = localStorage.getItem('token');
        const now = new Date();
        const timenow = formatDateTime(now);


        const [hour, minute] = selectedTime.split(".");
        const [hour2, minute2] = selectedTime2.split(".");


        const starttime = `${hour.padStart(2, '0')}.${minute}`;
        const endtime = `${hour2.padStart(2, '0')}.${minute2}`;

        const start = `${selectedDate} ${starttime}`;
        const end = `${selectedDate} ${endtime}`;
        const typeroom = findstatus()
        console.log(start);
        console.log(roomData)
        const sender = {

            "booking_date": timenow,
            "start_time": start,
            "end_time": end,
            "room_id": roomData.id,
            "request_message": reason,
            "status_id": typeroom,


        }

        try {
            await axios.post(`http://localhost:5020/bookRoom`, sender, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            setIsConfirmed(true);
        } catch (error) {
            console.error("Error confirming booking:", error);
            alert("เกิดข้อผิดพลาดในการยืนยันห้อง");
        }
    };

    const formatSelectedDate = (date) => {
        if (!date) return '';
        const selected = new Date(date);
        const day = String(selected.getDate()).padStart(2, '0');
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const year = selected.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const day = formatSelectedDate(selectedDate);

    return (
        <div
            className="container d-flex flex-column align-items-center"
            style={{
                minHeight: '50vh',
                backgroundSize: '150%',
                backgroundColor: '#A4C6CC',
                borderRadius: '4%',
                height: '80vh',
                borderColor: 'black',
                border: '2px solid black'
            }}
        >
            {/* รูปภาพ */}
            <div className="row justify-content-center mt-5">
                <div className="col-sm-10 text-center position-relative">
                    <img
                        style={{
                            width: '50vw',
                            height: '30vh',
                            borderRadius: '4%'
                        }}
                        src={roompic}
                        alt="room1"
                        className="img-fluid border border-black border-3"
                    />

                    {/* ข้อความด้านบนขวาของรูปภาพ */}
                    <div
                        className="position-absolute p-2  px-4  fs-2"
                        style={{
                            top: '10px',
                            right: '30px',
                            backgroundColor: '#EED1A2',
                            fontWeight: 'bold',
                            borderRadius: '4%'
                        }}
                    >
                        {roomData.people}
                    </div>

                    {/* ข้อความด้านล่างซ้ายของรูปภาพ */}
                    <div
                        className="position-absolute  px-4 text-dark bg-success fs-2"
                        style={{
                            bottom: '10px',
                            left: '30px',
                            fontWeight: 'bold',
                            borderRadius: '4%'
                        }}
                    >
                        {roomData.type}
                    </div>
                </div>
            </div>

            {/* ข้อความด้านล่าง */}
            <div className='container p-5 ' style={{ width: '40vw', height: '30vh' }}>
                <div className="row mb-3 mt-2">
                    <div className="col-sm-12 text-start display-4">
                        {roomData.name}
                    </div>
                </div>

                {/* ข้อความเพิ่มเติม */}
                <div className="row mb-4">
                    <div className="col-sm-7 text-center fs-4 bg-white p-2" style={{ borderRadius: '4%', minWidth: '120px' }}>
                        วันที่ {day}
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-7 text-center fs-4 bg-white p-2" style={{ borderRadius: '4%', minWidth: '120px' }}>
                        เวลา {selectedTime} - {selectedTime2}น.
                    </div>
                </div>

            </div>
            <div className="align-self-end me-5">
                <button className='btn btn-danger p-2 px-3 fs-3' style={{ borderRadius: '8%', minWidth: '120px', backgroundColor: '#4C6275' }} onClick={handleApproveClick}>
                    ยืนยันการจอง
                </button>
            </div>


            {/* Modal ยืนยันการยอมรับคำร้อง */}
            <Modal show={showModal1} onHide={() => setShowModal1(false)} centered>
                <div style={{ backgroundColor: '#49647C', color: 'white', borderRadius: '10px' }}>
                    <Modal.Header closeButton className="d-flex justify-content-center w-100">
                        <Modal.Title className="w-100 text-center">
                            {isConfirmed ? '' : 'ยืนยันการยอมรับคำร้อง'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="container">
                        {isConfirmed ? (<>
                            <div className="row justify-content-center">
                                <div className="text-center col-sm-8 p-2 text-white fs-3 mb-2" style={{
                                    backgroundColor: '#72B676', borderRadius: '4%'
                                }}>Succesful!!!</div>
                            </div>
                            <div className="row justify-content-center">
                                <button className="btn col-sm-8 p-2 text-center  fs-4 "
                                    style={{
                                        backgroundColor: '#A4C6CC',
                                        backgroundImage: `url(${qr})`,
                                        backgroundSize: '45px',
                                        backgroundRepeat: 'no-repeat',
                                        paddingLeft: '40px',
                                        borderRadius: '4%'

                                    }


                                    }


                                >QRCode</button>
                            </div>
                        </>
                        ) : (
                            <div className="d-flex justify-content-center">
                                <Button variant="primary" onClick={success} className="bg-success mx-5 p-2 fs-2">
                                    ยืนยัน
                                </Button>
                                <Button variant="secondary" onClick={() => setShowModal1(false)} className="bg-danger mx-5 p-2 fs-2">
                                    ยกเลิก
                                </Button>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer></Modal.Footer>
                </div>
            </Modal>

            <Modal show={vipshowModal} onHide={() => setvipshowModals(false)} centered>
    <div style={{ backgroundColor: '#49647C', color: 'white', borderRadius: '10px' }}>
        <Modal.Header closeButton className="d-flex justify-content-center w-100">
            <Modal.Title className="w-100 text-center">ยืนยันการจองห้องVIP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {isConfirmed ? (
                <>
                    <div className="row justify-content-center">
                        <div className="text-center col-sm-8 p-2 text-white fs-3 mb-2" style={{
                            backgroundColor: '#72B676', borderRadius: '4%'
                        }}>โปรดรออนุมัติการใช้ห้องVIP</div>
                    </div>
                   
                </>
            ) : (
                <>
                    <div>คุณต้องการจองห้องVIPใช่หรือไม่?</div>
                    <Form.Group className="mt-3">
                        <Form.Label>กรุณาเขียนเหตุผล:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="กรุณากรอกเหตุผล"
                        />
                    </Form.Group>
                </>
            )}
        </Modal.Body>
        {!isConfirmed && (
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setvipshowModals(false)}>
                    ยกเลิก
                </Button>
                <Button variant="success" onClick={success}>
                    ยืนยัน
                </Button>
            </Modal.Footer>
        )}
    </div>
</Modal>


        </div>
    );
}

export default ยืนยันห้อง;
