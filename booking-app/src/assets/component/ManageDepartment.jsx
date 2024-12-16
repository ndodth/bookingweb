import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function DepartmentManagement() {
  const [loading, setLoading] = useState(false); // สถานะการโหลด

  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({ id: "", name: "" });
  const [editDepartment, setEditDepartment] = useState(null); // แผนกที่กำลังแก้ไข
  const [showModal, setShowModal] = useState(false); // แสดง/ซ่อน modal
  const [searchTerm, setSearchTerm] = useState(""); // เก็บคำค้นหา

  // ดึงข้อมูลจาก API เมื่อ component โหลด
  useEffect(() => {
    setLoading(true)
    const token = localStorage.getItem('token');

    axios
      .get("https://bookingweb-sxkw.onrender.com/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then((response) => {
        if (response.status === 200 && Array.isArray(response.data)) {
          setDepartments(response.data);
        } else {
          console.error("Unexpected response:", response);
        }
      })
      .catch((error) => console.error("Error fetching departments:", error))
      .finally(() => {
        setLoading(false); // หยุดโหลด
      });;
  }, []);

  // ฟังก์ชันเพิ่มแผนก
  const addNewDepartment = () => {
    if (!newDepartment.name || !newDepartment.id) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return
    }
    const token = localStorage.getItem('token');
    console.log(newDepartment)
    axios
      .post("https://bookingweb-sxkw.onrender.com/departments", newDepartment, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then((response) => {
        setDepartments([...departments, newDepartment]);
        setShowModal(false);
      })
      .catch((error) => console.error("Error adding department:", error));
  };

  // ฟังก์ชันลบแผนก
  const deleteDepartment = (id) => {
    const token = localStorage.getItem('token');

    const confirmDelete = window.confirm("คุณต้องการลบแผนกนี้ใช่หรือไม่?");
    if (confirmDelete) {
      axios
        .delete(`https://bookingweb-sxkw.onrender.com/departments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        .then((response) => {
          setDepartments(departments.filter((dept) => dept.id !== id));
        })
        .catch((error) => console.error("Error deleting department:", error));
    }
  };

  // ฟังก์ชันสำหรับแสดงฟอร์มแก้ไขแผนก
  const editDepartmentDetails = (dept) => {
    setEditDepartment(dept);
    setNewDepartment(dept);
    setShowModal(true);
  };

  const saveEditDepartment = () => {
    if (!newDepartment.name || !newDepartment.id) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");

      return; // ออกจากฟังก์ชัน
    }

    // ลบคลาส is-invalid ถ้าข้อมูลครบถ้วน

    const token = localStorage.getItem('token');

    const departmentToUpdate = {
      ...newDepartment,
      id: newDepartment.id, // แปลง id ให้เป็น string
    };
    console.log(departmentToUpdate)


    axios
      .put(`https://bookingweb-sxkw.onrender.com/departments/${editDepartment.id}`, departmentToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then((response) => {
        setDepartments(
          departments.map((dept) =>
            dept.id === editDepartment.id ? departmentToUpdate : dept
          )
        );
        setEditDepartment(null);
        setShowModal(false);
      })
      .catch((error) => console.error("Error updating department:", error));
  };




  // ฟังก์ชันสำหรับการค้นหาแผนก
  const filteredDepartments = departments.filter(
    (dept) =>
      (dept.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (String(dept.id) || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      {/* Top Section */}
      <div className="mb-4">
        <h1 className="mb-3">จัดการแผนก</h1>

        <div className="row">
          <div className="col-md-8 mb-3">
            {/* ฟิลด์ค้นหา */}
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="ค้นหาแผนกหรือรหัสแผนก"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-3 d-flex justify-content-end">
            <button
              className="btn btn-primary btn-lg"
              style={{ backgroundColor: "#49647C", width: "200px" }}
              onClick={() => {
                setNewDepartment({ id: "", name: "" });
                setShowModal(true);
              }}
            >
              เพิ่มแผนก
            </button>
          </div>
        </div>
      </div>

      {/* Department List */}
      <div className="row">
        <div className="col-12">
          {loading ? ( // แสดงข้อความ Loading
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                height: '50vh', // ใช้เพื่อให้ความสูงเต็มจอ
              }}
            >
              <div
                className="spinner-border text-primary"
                role="status"
                style={{
                  width: '5rem', // ปรับขนาดความกว้าง
                  height: '5rem', // ปรับขนาดความสูง
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <div key={dept.id} className="card mb-4 shadow-sm border-0">
                    <div className="row g-0">
                      <div className="col-md-8 d-flex align-items-center">
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title mb-2">ชื่อแผนก : {dept.name}</h5>
                          <p className="card-text mb-2">รหัสแผนก : {dept.id}</p>
                        </div>
                      </div>

                      <div className="col-md-4 d-flex flex-column justify-content-center align-items-end">
                        <button
                          className="btn btn-secondary mb-2 mt-3 btn-lg"
                          onClick={() => editDepartmentDetails(dept)}
                          style={{ width: "300px", backgroundColor: "#35374B" }}
                        >
                          แก้ไขแผนก
                        </button>
                        <div className='fs-5 mb-2'> ปิดปุ่มลบรายการไว้เนื่องจากเป็นไอดีที่ทุกคนเข้าดูได้</div>
                        {/* <button
                          className="btn btn-danger btn-lg mb-3"
                          onClick={() => deleteDepartment(dept.id)}
                          style={{ width: "300px", backgroundColor: "#AC5050" }}
                        >
                          ลบแผนก
                        </button> */}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>ไม่พบข้อมูลแผนกที่ค้นหา</p>
              )}
            </>)}
        </div>
      </div>

      {/* Modal สำหรับเพิ่ม/แก้ไขแผนก */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editDepartment ? "แก้ไขข้อมูลแผนก" : "เพิ่มแผนก"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {setEditDepartment(null)
                    setShowModal(false)}}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">ชื่อแผนก</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDepartment.name}
                    onChange={(e) =>
                      setNewDepartment({ ...newDepartment, name: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">รหัสแผนก</label>
                  {(editDepartment ?
                    <>
                      <div style={{
                        border: "1px solid black", borderRadius: "4%",
                        backgroundColor: "#f8f9fa"
                      }}
                        className='p-2'>
                        {newDepartment.id}
                      </div>
                    </> :
                    <input
                      type="number"
                      className="form-control"
                      value={newDepartment.id}
                      onChange={(e) =>
                        setNewDepartment({ ...newDepartment, id: e.target.value })
                      }
                    />)}
                </div>

              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {setEditDepartment(null)
                    setShowModal(false)}}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={editDepartment ? saveEditDepartment : addNewDepartment}
                >
                  {editDepartment ? "บันทึกการแก้ไข" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentManagement;