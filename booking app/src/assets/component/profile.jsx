import React, { useState, useEffect } from "react";
import "../css/bootstrap.min.css";
import "../js/bootstrap.js";
import axios from "axios";

function Profile() {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(""); // เพิ่ม state สำหรับจัดการ error

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get("http://localhost:5020/Profile",{
          headers: {
            Authorization: `Bearer ${token}`, 
          }
        });;
          setProfile(response.data);
          setEditedProfile(response.data);
        
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchRolesAndDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const roleResponse = await axios.get("http://localhost:5020/Roles",{
          headers: {
            Authorization: `Bearer ${token}`, 
          }
        });;
        const deptResponse = await axios.get("http://localhost:5020/Departments",{
          headers: {
            Authorization: `Bearer ${token}`, 
          }
        });;
        setRoles(roleResponse.data);
        setDepartments(deptResponse.data)
        ;        
        console.log("roleResponse.data",roleResponse.data)

        console.log("deptResponse.data",deptResponse.data)
      } catch (error) {
        console.error("Error fetching roles or departments:", error);
      }
    };

    fetchProfile();
    fetchRolesAndDepartments();
  }, []);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("handleInputChange",value)
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  const handleSaveClick = async () => {
  

    try {
      const token = localStorage.getItem('token')
      const updatedProfile = {
        ...editedProfile,
        ID: parseInt(editedProfile.ID, 10),
       
      };

      console.log("Sending data:", updatedProfile);
      await axios.put("http://localhost:5020/Profile", updatedProfile,{
        headers: {
          Authorization: `Bearer ${token}`, 
        }
      });;
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(""); // ล้างข้อความ error เมื่อบันทึกสำเร็จ
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div
      className="container p-10"
      style={{
        maxWidth: "1200px", // ขยายขนาด container
        backgroundColor: "#E8F4FB",
        borderRadius: "15px",
        marginTop: "20px",
        padding: "20px",
        fontSize: "18px" // เพิ่มขนาดฟอนต์
      }}
    >
      <div
        className="card shadow-sm p-4 mb-3"
        style={{ borderRadius: "10px", backgroundColor: "#F0F8FF" }}
      >
        <div className="d-flex align-items-center">
          <img
            src={profile.profile_image}
            alt="Profile"
            className="rounded-circle"
            style={{ width: "140px", height: "140px", objectFit: "cover" }} // เพิ่มขนาดรูปภาพ
          />
          <div className="ms-4" style={{ width: "100%" }}>
            <p className="mb-2">ชื่อ :{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="Name"
                  value={editedProfile.Name || ""}
                  onChange={handleInputChange}
                  className="form-control"
                />
              ) : (
                profile.Name || "N/A"
              )}
            </p>
            <p className="mb-2">นามสกุล :{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="Lname"
                  value={editedProfile.Lname || ""}
                  onChange={handleInputChange}
                  className="form-control"
                />
              ) : (
                profile.Lname || "N/A"
              )}
            </p>
            <p className="mb-2">ตำแหน่ง :{" "}
                { profile.RoleName|| "N/A"}
            </p>
            <p className="mb-2">แผนก :{" "}
               { profile.DeptName|| "N/A"}

            </p>
            <p className="mb-2">เพศ :{" "}
              {isEditing ? (
                <div>
                  <label className="me-3">
                    <input
                      type="radio"
                      name="Sex"
                      value="ชาย"
                      checked={editedProfile.Sex === "ชาย"}
                      onChange={handleInputChange}
                      className="form-check-input"
                    /> ชาย
                  </label>
                  <label className="me-3">
                    <input
                      type="radio"
                      name="Sex"
                      value="หญิง"
                      checked={editedProfile.Sex === "หญิง"}
                      onChange={handleInputChange}
                      className="form-check-input"
                    /> หญิง
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="Sex"
                      value="ไม่ระบุ"
                      checked={editedProfile.Sex === "ไม่ระบุ"}
                      onChange={handleInputChange}
                      className="form-check-input"
                    /> ไม่ระบุ
                  </label>
                </div>
              ) : (
                profile.Sex || "N/A"
              )}
            </p>
            <p className="mb-2">อีเมล์ :{" "}
              {isEditing ? (
                <input
                  type="email"
                  name="Email"
                  value={editedProfile.Email || ""}
                  onChange={handleInputChange}
                  className="form-control"
                />
              ) : (
                profile.Email || "N/A"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>} {/* แสดงข้อความแจ้ง error */}

      <div className="text-end">
        <button
          className="btn btn-lg" // เพิ่มขนาดปุ่มด้วย btn-lg
          style={{
            backgroundColor: "#4C6275",
            color: "white",
            border: "none",
            padding: "10px 20px",
            fontSize: "18px", // เพิ่มขนาดฟอนต์ในปุ่ม
          }}
          onClick={isEditing ? handleSaveClick : handleEditClick}
        >
          {isEditing ? "บันทึก" : "แก้ไขข้อมูล"}
        </button>
      </div>
    </div>
  );
}

export default Profile;
