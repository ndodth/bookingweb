import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function EditRoom() {
  // กำหนด State สำหรับฟอร์ม
  const [roomData, setRoomData] = useState({
    name: "Melon Room",
    id: "001",
    wing: "D",
    floor: "5",
    status: "เปิดใช้งาน",
    type: "Normal",
    capacity: "15",
    details: `
    - ขนาด: ประมาณ 45-50 ตารางเมตร
    - จำนวนที่นั่ง: 25-45 ที่นั่ง
    - การเชื่อมต่อ: มีโปรเจคเตอร์และลำโพงภายในห้อง, หน้าจอ, กระดานไวท์บอร์ดสำหรับการประชุม, ให้บริการพร้อมด้วยอุปกรณ์สื่อสารและอุปกรณ์เชื่อมต่อ
    - เหมาะสำหรับประชุมกลุ่มใหญ่, กิจกรรมอบรม, การนำเสนอผลงาน
    `,
  });

  // ฟังก์ชันสำหรับอัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลงในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // ฟังก์ชันจัดการเมื่อกดปุ่มตกลง (เพื่อบันทึกข้อมูล)
  const handleSubmit = () => {
    // บันทึกข้อมูลหรือทำงานตามที่ต้องการเมื่อกดปุ่มตกลง
    console.log("บันทึกข้อมูล:", roomData);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg p-4">
            <h2 className="card-title text-center mb-4">แก้ไขข้อมูลห้อง</h2>
            <div className="d-flex flex-column align-items-center mb-4">
              <img
                src="https://via.placeholder.com/150"
                alt="Room"
                className="img-fluid rounded-circle border border-secondary mb-2"
                style={{ width: "150px", height: "150px" }}
              />
              <button className="btn btn-info">เปลี่ยนรูปภาพ</button>
            </div>
            <form>
              {/* ชื่อห้อง */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">ชื่อห้อง</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={roomData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* รหัสห้อง */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">รหัสห้อง</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    name="id"
                    value={roomData.id}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </div>

              {/* ตึก */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">ตึก</label>
                <div className="col-sm-9">
                  <select
                    className="form-select"
                    name="wing"
                    value={roomData.wing}
                    onChange={handleChange}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>

              {/* ชั้น */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">ชั้น</label>
                <div className="col-sm-9">
                  <select
                    className="form-select"
                    name="floor"
                    value={roomData.floor}
                    onChange={handleChange}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>

              {/* สถานะตั้งต้น */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">สถานะตั้งต้น</label>
                <div className="col-sm-9 d-flex align-items-center">
                  <div className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      value="เปิดใช้งาน"
                      checked={roomData.status === "เปิดใช้งาน"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">เปิดใช้งาน</label>
                  </div>
                  <div className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      value="กำลังใช้งาน"
                      checked={roomData.status === "กำลังใช้งาน"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">กำลังใช้งาน</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      value="ปิดปรับปรุง"
                      checked={roomData.status === "ปิดปรับปรุง"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">ปิดปรับปรุง</label>
                  </div>
                </div>
              </div>

              {/* ประเภทห้อง */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">ประเภทห้อง</label>
                <div className="col-sm-9 d-flex align-items-center">
                  <div className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      value="Normal"
                      checked={roomData.type === "Normal"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Normal</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      value="VIP"
                      checked={roomData.type === "VIP"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">VIP</label>
                  </div>
                </div>
              </div>

              {/* ความจุ */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">ความจุ</label>
                <div className="col-sm-9">
                  <select
                    className="form-select"
                    name="capacity"
                    value={roomData.capacity}
                    onChange={handleChange}
                  >
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                  </select>
                </div>
              </div>

              {/* รายละเอียด */}
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">รายละเอียด</label>
                <div className="col-sm-9">
                  <textarea
                    className="form-control"
                    name="details"
                    value={roomData.details}
                    onChange={handleChange}
                    rows="5"
                  ></textarea>
                </div>
              </div>

              {/* ปุ่มตกลง */}
              <div className="row justify-content-center">
                <button
                  type="button"
                  className="btn btn-success col-md-4"
                  onClick={handleSubmit}
                >
                  ตกลง
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditRoom;
