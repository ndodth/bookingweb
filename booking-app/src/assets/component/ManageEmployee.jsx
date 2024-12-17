import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function EmployeeManagement() {
  const [loading, setLoading] = useState(false); 

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    id: "",
    name: "",
    lname: "",
    nlock: "0", // ตั้งค่าเริ่มต้นเป็น 0
    sex: "Male",
    email: "",
    password: "",
    dept_id: "",
    role_id: "",
    img: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [editEmployee, setEditEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(null); // State for showing employee details
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // For error message

  useEffect(() => {

    fetchEmployees();
    fetchRolesAndDepartments();
  }, []);
  const token = localStorage.getItem('token');

  const fetchEmployees = async () => {
    const response = await axios.get("https://bookingweb-sxkw.onrender.com/employees", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });;
    console.log("response", response.data)
    setEmployees(response.data);
  };

  const fetchRolesAndDepartments = async () => {
    try {
      setLoading(true)
      const rolesResponse = await axios.get("https://bookingweb-sxkw.onrender.com/Roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });;
      console.log(rolesResponse.data)
      const departmentsResponse = await axios.get("https://bookingweb-sxkw.onrender.com/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });;
      setRoles(rolesResponse.data);
      setDepartments(departmentsResponse.data);
    } catch (error) {
      console.error("Error fetching roles or departments:", error);
    }finally{
      setLoading(false)
    }
  };
  const handleImageUpload = async (e, employeeId) => {

    if (!newEmployee.img) {
      setErrorMessage("ไม่มีไฟล์รูปภาพให้ส่ง");

      return;
    }

    // ตรวจสอบขนาดไฟล์
    if (newEmployee.img.size > 200 * 1024) { // 200 KB
      setErrorMessage("ไฟล์ต้องมีขนาดไม่เกิน 200 KB");
      return;
    }
    const token = localStorage.getItem('token');



    const formData = new FormData();
    formData.append("image", newEmployee.img);

    try {
      const response = await axios.put(`https://bookingweb-sxkw.onrender.com/employees/${editEmployee.id}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });


      if (response.ok) {
        const updatedEmployee = await response.json();
        setFilteredEmployees((prev) =>
          prev.map((emp) => (emp.id === employeeId ? updatedEmployee : emp))
        );
        setShowEditImageModal(false);
      } else {
        console.error("การอัปโหลดล้มเหลว");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
    }
    setShowEditImageModal(false)
    fetchEmployees();
  };

  const addNewEmployee = async () => {
    const sameemail = employees.find(emp => emp.email === newEmployee.email)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!newEmployee.name || !newEmployee.lname || !newEmployee.email || !newEmployee.password || !newEmployee.dept_id || !newEmployee.role_id) {
      setErrorMessage("กรุณากรอกข้อมูลในทุกช่องให้ครบถ้วน");
      return;
    }
    if (!emailRegex.test(newEmployee.email)) {
      setErrorMessage('กรุณากรอกอีเมลให้ถูกต้อง เช่น yourname@gmail.com');
      return;
    }
    if (sameemail) {
      setErrorMessage("มีการใช้ Email  " + sameemail.email + "แล้ว");
      return;
    }

    if (newEmployee.password.length < 6) {
      setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัว");
      return;
    }


    const token = localStorage.getItem('token');


    const formData = new FormData();
    formData.append("id", parseInt(newEmployee.id, 10));
    formData.append("name", newEmployee.name);
    formData.append("lname", newEmployee.lname);
    formData.append("nlock", parseInt(newEmployee.nlock, 10));
    formData.append("sex", newEmployee.sex);
    formData.append("email", newEmployee.email);
    formData.append("password", newEmployee.password);
    formData.append("dept_id", parseInt(newEmployee.dept_id, 10));
    formData.append("role_id", parseInt(newEmployee.role_id, 10));
    // เพิ่มไฟล์รูปภาพ
    if (newEmployee.img) {
      formData.append("img", newEmployee.img); // ตรวจสอบว่าค่า newEmployee.img เป็นไฟล์
    }

    try {
      console.log("Sending data to API (Add):", formData);
      const response = await axios.post("https://bookingweb-sxkw.onrender.com/employees", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });;

      setErrorMessage("");
      setShowModal(false)
      setConfirmPassword('')
      fetchEmployees();

    } catch (error) {
      console.error("Error adding employee:", error);
      setErrorMessage("ไม่สามารถเพิ่มพนักงานได้ กรุณาลองอีกครั้ง");
    }
  };

  const updateEmployee = async () => {
    console.log("employees", employees)
    const sameemail = employees.find(emp => emp.email === newEmployee.email)

    if (!newEmployee.id || !newEmployee.name || !newEmployee.lname || !newEmployee.email || !newEmployee.password || !newEmployee.dept_id || !newEmployee.role_id) {
      setErrorMessage("กรุณากรอกข้อมูลในทุกช่องzให้ครบถ้วน");
      return;
    }
    if (sameemail) {
      console.log("sameemail", sameemail)

      if (sameemail.id != newEmployee.id) {
        console.log("in")

        setErrorMessage("มีการใช้ Email  " + sameemail.email + "แล้ว");
        return;
      }
    }
    const token = localStorage.getItem('token');

    const formattedEmployee = {
      ...newEmployee,
      id: parseInt(newEmployee.id, 10),
      dept_id: parseInt(newEmployee.dept_id, 10),
      role_id: parseInt(newEmployee.role_id, 10),
    };
    console.log("editEmployee.id", editEmployee.id)
    console.log("formattedEmployee", formattedEmployee)



    try {
      const formData = new FormData();
      formData.append("id", parseInt(newEmployee.id, 10));
      formData.append("name", newEmployee.name);
      formData.append("lname", newEmployee.lname);
      formData.append("nlock", parseInt(newEmployee.nlock, 10));
      formData.append("sex", newEmployee.sex);
      formData.append("email", newEmployee.email);
      formData.append("password", newEmployee.password);
      formData.append("dept_id", parseInt(newEmployee.dept_id, 10));
      formData.append("role_id", parseInt(newEmployee.role_id, 10));

      console.log("Sending data to API (Update):", formattedEmployee);
      await axios.put(`https://bookingweb-sxkw.onrender.com/employees/${editEmployee.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });;


      setEmployees(
        employees.map((emp) => (emp.id === editEmployee.id ? { ...emp, ...formattedEmployee } : emp))
      );
      setEditEmployee(null);
      setShowModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error updating employee:", error);
      setErrorMessage("ไม่สามารถแก้ไขข้อมูลพนักงานได้ กรุณาลองอีกครั้ง");
    }
  };

  const deleteEmployee = async (id) => {
    const token = localStorage.getItem('token');

    if (window.confirm("คุณต้องการลบพนักงานคนนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`https://bookingweb-sxkw.onrender.com/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });;
        setEmployees(employees.filter((employee) => employee.id !== id));
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };



  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.name && employee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.id && employee.id.toString().includes(searchTerm.toLowerCase())) ||
      (employee.lname && employee.lname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.role_name && employee.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const closetab = async () => {
    setEditEmployee(null)
    setShowModal(false)
  }
  return (
    <div className="container mt-5">
      <h1 className="mb-3">จัดการพนักงาน</h1>

      {/* Search bar */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="ค้นหาด้วยชื่อหรือรหัสพนักงานหรือEmail"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6 text-end">
          <button className="btn btn-primary btn-lg" onClick={() => {
            setNewEmployee({
              id: "",
              name: "",
              lname: "",
              nlock: "0", // ตั้งค่าเริ่มต้นเป็น 0
              sex: "Male",
              email: "",
              password: "",
              dept_id: "",
              role_id: "",
              img: "",
            });
            setShowModal(true);


          }}>
            เพิ่มพนักงาน
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="row">
        <div className="col-md-12">
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
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="card mb-4 shadow-sm border-0">
              <div className="row g-0">
                <div className="col-md-2 d-flex flex-column align-items-center ms-3">
                  <img
                    src={employee.profile_image || "path_to_placeholder_image"}
                    alt="Employee"
                    className="img-fluid rounded-circle border border-dark border-2"
                    style={{ objectFit: "cover", height: "130px", width: "140px" }}
                  />
                  {/* ปุ่มแก้ไขรูปภาพ */}
                  {(employee.id !=4 && employee.id !=5) && (
                    <>
                      <button
                        className="btn btn-warning mt-2"
                        style={{ width: '140px' }}
                        onClick={() => {
                          setEditEmployee(employee);
                          setShowEditImageModal(true); // เปิด Modal สำหรับแก้ไขรูปภาพ
                        }}
                      >
                        แก้ไขรูปภาพ
                      </button>
                    </>
                  )
                  }
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      ชื่อ : {employee.name} {employee.lname}
                    </h5>
                    <p>รหัสพนักงาน : {employee.id}</p>
                    <p>Email : {employee.email}</p>
                    <p>ตำแหน่ง : {employee.role_name}</p>
                  </div>
                </div>
                <div className="col-md-3 d-flex flex-column align-items-end">
                    

                   
                      <button
                        className="btn btn-secondary mb-2 mt-3"
                        style={{ width: '200px' }}
                        onClick={() => {
                          setEditEmployee(employee);
                          setNewEmployee(employee); // กำหนดข้อมูลพนักงานที่จะแก้ไข
                          setShowModal(true);
                        }}
                      >
                        แก้ไขข้อมูล
                      </button>
                      <div
                      className="text-secondary fs-5">   เนื่องจากเว็บไซต์นี้เปิดให้ผู้ใช้ทุกคนเข้าถึงได้ ปุ่มลบจึงถูกปิดใช้งาน

                    </div>
                      {/* <button
                        className="btn btn-danger mb-2"
                        style={{ width: '200px' }}
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        ลบพนักงาน
                      </button> */}
                      <button
                        className="btn btn-info mb-2"
                        style={{ width: '200px' }}
                        onClick={() => setShowDetails(employee)}
                      >
                        แสดงรายละเอียด
                      </button>
                   
                </div>
              </div>
            </div>
          ))}
          </>)}
        </div>
      </div>

      {/* Modal สำหรับเพิ่ม/แก้ไขพนักงาน */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editEmployee ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงาน"}
                </h5>
                <button type="button" className="btn-close" onClick={closetab}></button>
              </div>
              <div className="modal-body">
                {/* Error message */}
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                {editEmployee &&
                  <>
                    <div className="mb-3">
                      <label>รหัสพนักงาน</label>
                      <div style={{
                        border: "1px solid black", borderRadius: "4%",
                        backgroundColor: "#f8f9fa"
                      }}
                        className='p-2'>
                        {newEmployee.id}
                      </div>
                    </div>
                  </>}

                <div className="mb-3">
                  <label>ชื่อ</label>
                  <input
                    type="text"
                    pattern="[A-Za-z]+"
                    onKeyDown={(e) => {
                      if (/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="form-control"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label>นามสกุล</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newEmployee.lname}
                    onKeyDown={(e) => {
                      if (/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lname: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label>เพศ</label>
                  <select
                    className="form-control"
                    value={newEmployee.sex}
                    onChange={(e) => setNewEmployee({ ...newEmployee, sex: e.target.value })}
                  >
                    <option value="Male">ชาย</option>
                    <option value="Female">หญิง</option>
                  </select>
                </div>
                {editEmployee ? (
                  <>
                    <div className="mb-3">
                      <label>อีเมล</label>
                      <div style={{
                        border: "1px solid black", borderRadius: "4%",
                        backgroundColor: "#f8f9fa"
                      }}
                        className='p-2'>
                        {newEmployee.email}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label>รหัสผ่าน</label>
                      <div style={{
                        border: "1px solid black", borderRadius: "4%",
                        backgroundColor: "#f8f9fa", type: 'password'
                      }}
                        className='p-2'>
                        {"*".repeat(newEmployee.password.length)}
                      </div>
                    </div>
                  </>) : (
                  <>
                    <div className="mb-3">
                      <label>อีเมล</label>
                      <input
                        type="email"
                        className="form-control"
                        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"


                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label>รหัสผ่าน</label>
                      <input type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label>ยืนยันรหัสผ่าน</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
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
                  </>
                )}


                <div className="mb-3">
                  <label>แผนก</label>
                  <select
                    className="form-control"
                    value={newEmployee.dept_id}
                    onChange={(e) => setNewEmployee({ ...newEmployee, dept_id: e.target.value })}
                  >
                    <option value="">เลือกแผนก</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>ตำแหน่ง</label>
                  <select
                    className="form-control"
                    value={newEmployee.role_id}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role_id: e.target.value })}
                  >
                    <option value="">เลือกตำแหน่ง</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closetab}>
                  ปิด
                </button>
                <button
                  className="btn btn-primary"
                  onClick={editEmployee ? updateEmployee : addNewEmployee}
                >
                  {editEmployee ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal แสดงรายละเอียดพนักงาน */}
      {showDetails && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  รายละเอียดพนักงาน: {showDetails.name} {showDetails.lname}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetails(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>รหัสพนักงาน: {showDetails.id}</p>
                <p>ชื่อ: {showDetails.name}</p>
                <p>นามสกุล: {showDetails.lname}</p>
                <p>รหัสล็อก: {showDetails.nlock}</p> {/* แสดงรหัสล็อกที่นี่ */}
                <p>เพศ: {showDetails.sex}</p>
                <p>อีเมล: {showDetails.email}</p>
                <p>รหัสผ่าน:{"*".repeat(newEmployee.password.length)}
                </p>
                <p>แผนก: {showDetails.dept_name}</p>
                <p>ตำแหน่ง: {showDetails.role_name}</p>
                {showDetails.img && (
                  <div className="mt-3">
                    <img
                      src={showDetails.img}
                      alt="Employee"
                      className="img-fluid rounded"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDetails(null)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditImageModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">

                <h5 className="modal-title">แก้ไขรูปภาพ</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditImageModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setNewEmployee({
                      ...newEmployee,
                      img: e.target.files[0], // อัปเดต URL รูปภาพทันที
                      check: 1,
                    });
                  }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowEditImageModal(false)}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleImageUpload}
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeManagement;