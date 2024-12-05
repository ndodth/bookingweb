import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const AddRoom = () => {
  const [image, setImage] = useState(null);

  // ฟังก์ชันสำหรับการเลือกไฟล์รูปภาพ
  const handleImageChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} className="border rounded p-4 bg-light">
          <h3 className="text-center mb-4">เพิ่มห้อง</h3>
          <Form>
            <Row className="mb-3">
              <Col md={4} className="text-center">
                {/* แสดงรูปภาพที่เลือก */}
                <img
                  src={image || "https://via.placeholder.com/100"}
                  alt="Room"
                  className="rounded-circle"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <div className="mt-3">
                  <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                </div>
              </Col>
              <Col md={8}>
                <Form.Group controlId="building" className="mb-3">
                  <Form.Label>ตึก</Form.Label>
                  <Form.Select>
                    <option>กรุณาเลือก</option>
                    <option>ตึก A</option>
                    <option>ตึก B</option>
                    <option>ตึก C</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="floor" className="mb-3">
                  <Form.Label>ชั้น</Form.Label>
                  <Form.Select>
                    <option>กรุณาเลือก</option>
                    <option>ชั้น 1</option>
                    <option>ชั้น 2</option>
                    <option>ชั้น 3</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="roomName" className="mb-3">
                  <Form.Label>ชื่อห้อง</Form.Label>
                  <Form.Control type="text" placeholder="กรุณาใส่ชื่อห้อง" />
                </Form.Group>
                <Form.Group controlId="roomCode" className="mb-3">
                  <Form.Label>รหัสห้อง</Form.Label>
                  <Form.Control type="text" placeholder="กรุณาใส่รหัสห้อง" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="status" className="mb-3">
              <Form.Label>สถานะตั้งต้น</Form.Label>
              <div>
                <Form.Check inline label="เปิดใช้งาน" type="radio" name="status" />
                <Form.Check inline label="ปิดปรับปรุง" type="radio" name="status" />
              </div>
            </Form.Group>
            <Form.Group controlId="roomType" className="mb-3">
              <Form.Label>ประเภทห้อง</Form.Label>
              <div>
                <Form.Check inline label="Normal" type="radio" name="roomType" />
                <Form.Check inline label="VIP" type="radio" name="roomType" />
              </div>
            </Form.Group>
            <Form.Group controlId="capacity" className="mb-3">
              <Form.Label>ความจุ</Form.Label>
              <Form.Control type="text" placeholder="กรุณาใส่จำนวนความจุ" />
            </Form.Group>
            <Form.Group controlId="details" className="mb-3">
              <Form.Label>รายละเอียด</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
            <div className="text-center">
              <Button variant="primary" type="submit">
                ตกลง
              </Button>
            </div>
            <Link to="/ManageRoom"> {/* ใส่เส้นทางไปยังหน้าที่ต้องการ */}
              <button
                className="btn btn-primary btn-lg me-3"
                style={{ backgroundColor: "#49647C", width: "200px" }}
              >
                กลับ
              </button>
            </Link>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddRoom;
