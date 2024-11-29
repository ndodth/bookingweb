import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";

function RoomRequestManagement() {
  const [roomRequests, setRoomRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");

  const fetchRoomRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5020/request',{
      headers: {
        Authorization: `Bearer ${token}`, 
      }
      
    });
    console.log(response.data)

      setRoomRequests(response.data);
    } catch (error) {
      console.error("Error fetching room requests:", error);
    }
  };
  useEffect(() => {

    fetchRoomRequests();
  }, []);

  

  // เปิด Modal เพื่อยืนยันคำร้อง
  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    console.log(request)
    setShowModal(true);
  };

  // เปิด Modal เพื่อยกเลิกคำร้อง
  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };


  const aproveroom = async () => {

    try {
      const token = localStorage.getItem('token');
      c = await axios.put(
        `http://localhost:5020/request/${selectedRequest.id}`,
        {}, // ค่าที่จะส่งในคำขอ PUT เช่น ข้อมูล body ถ้าไม่มีก็ใส่เป็น {} ว่าง
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
    } catch (error) {
      console.error("Error fetching room requests:", error);
    }
    setShowModal(false)
    fetchRoomRequests()

  };
    


  return (
    <div className="container mt-5">
      {/* Top Section */}
      <div className="mb-4">
        <h1 className="mb-3">คำขอการใช้งานห้อง</h1>
        <div className="col-12 input-group mb-3">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="ค้นหาชื่อห้องหรือรหัสห้อง"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Request List */}
      {(roomRequests === null) ? (
  <div className="text-center mt-5">
    <h3>ไม่มีคำขอใช้งานห้อง</h3>
  </div>
      ) : (
        <div className="row">
          <div className="col-12">
            {roomRequests.map((request) => {
              const bookingDate = new Date(request.booking_date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const startTime = new Date(request.start_time).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const endTime = new Date(request.end_time).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={request.id} className="card mb-4 shadow-sm border-0">
                  <div className="row g-0">
                    <div className="col-md-10 d-flex align-items-center">
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title mb-2">ชื่อห้อง : {request.room_name || "N/A"}</h5>
                        <p className="card-text mb-2">รหัสห้อง : {request.room_id || "N/A"}</p>
                        <p className="card-text mb-2">
                          วันที่จอง : {bookingDate} เวลา : {startTime} - {endTime}
                        </p>
                        <p className="card-text mb-2">คำขอการใช้งาน : {request.request_message || "N/A"}</p>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex flex-column justify-content-center align-items-end">
                      <button
                        className="btn btn-success btn-lg mb-2 mt-2"
                        onClick={() => handleApproveClick(request)}
                        style={{ width: "150px" }}
                      >
                        ยืนยัน
                      </button>
                      <button
                        className="btn btn-danger btn-lg mb-2"
                        onClick={() => handleRejectClick(request)}
                        style={{ width: "150px" }}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
            )}

      {/* Modal ยืนยันการยอมรับคำร้อง */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <div style={{ backgroundColor: '#49647C', color: 'white', borderRadius: '10px' }}>
          <Modal.Header closeButton className="d-flex justify-content-center w-100 ">
            <Modal.Title className="w-100 text-center ">ยืนยันการยอมรับคำร้อง</Modal.Title>
          </Modal.Header>
          <Modal.Body className="container">
            <div className="d-flex justify-content-center">
              <Button variant="primary" onClick={aproveroom} className="bg-success mx-5 p-2 fs-2">
                ยืนยัน
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)} className="bg-danger mx-5 p-2 fs-2">
                ยกเลิก
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </div>
      </Modal>

      {/* Modal ยืนยันการยกเลิกคำร้อง */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <div style={{ backgroundColor: '#49647C', color: 'white', borderRadius: '10px' }}>
          <Modal.Header closeButton className="d-flex justify-content-center w-100 ">
            <Modal.Title className="w-100 text-center ">ยืนยันการยกเลิกคำร้อง</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            คุณต้องการยกเลิกคำร้องสำหรับห้อง {selectedRequest?.room_name} ใช่หรือไม่?
            <Form.Group className="mt-3 ">
              <Form.Label>เหตุผลที่ไม่อนุมัติ:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="กรุณากรอกเหตุผล"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              ยกเลิก 
            </Button>
            <Button variant="danger" onClick={() => {
              setShowRejectModal(false); // ปิด Modal ยกเลิกคำร้อง
              setReason(""); // รีเซ็ตเหตุผล
            }}>
              ยกเลิกคำร้อง
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
}

export default RoomRequestManagement;
