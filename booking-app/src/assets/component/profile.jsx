import React, { useState, useEffect } from "react";
import "../css/bootstrap.min.css";
// import "../js/bootstrap.js";
import axios from "axios";

function Profile() {
  const [profile, setProfile] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [newEmployee, setNewEmployee] = useState({ img: null }); // for handling new employee image
  const [error, setError] = useState("");
  const [showEditImageModal, setShowEditImageModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://bookingweb-sxkw.onrender.com/Profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setEditedProfile(response.data);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์");
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async () => {
    const token = localStorage.getItem("token");
    console.log(profile.ID)
    if (!newEmployee.img) {
      console.error("ไม่มีไฟล์รูปภาพให้ส่ง");
      return;
    }

    const formData = new FormData();
    formData.append("image", newEmployee.img);

    try {
      const response = await axios.put(
        `https://bookingweb-sxkw.onrender.com/employees/${profile.ID}/upload`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // อัปเดตรูปภาพใหม่ในโปรไฟล์
        setProfile((prev) => ({
          ...prev,
          profile_image: URL.createObjectURL(newEmployee.img),
        }));
        setShowEditImageModal(false); // ปิด modal
      } else {
        console.error("การอัปโหลดล้มเหลว");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:", error);
    }
  };

  const handleEditField = (fieldName) => {
    setEditingField(fieldName);
  };

  const handleSaveField = async (fieldName) => {
    try {
      const token = localStorage.getItem("token");

      const updatedProfile = {
        ID: parseInt(profile.ID, 10),
        [fieldName]: profile[fieldName],
      };

      await axios.put("https://bookingweb-sxkw.onrender.com/Profile", updatedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile({ ...profile, ...updatedProfile });
      setEditingField(null);
      setError("");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(`Error saving ${fieldName}:`, err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  return (
    <div
      className="container p-4"
      style={{
        maxWidth: "1200px",
        backgroundColor: "#E8F4FB",
        borderRadius: "15px",
        marginTop: "20px",
        padding: "20px",
        fontSize: "18px",
      }}
    >
      <div
        className="card shadow-sm p-4 mb-3"
        style={{ borderRadius: "10px", backgroundColor: "#F0F8FF" }}
      >
        <div className="d-flex align-items-center">
          <div className="col-md-2 d-flex flex-column align-items-center ms-3">
            <img
              src={profile.profile_image}
              alt="profile"
              className="img-fluid rounded-circle border border-dark border-2"
              style={{ objectFit: "cover", height: "130px", width: "140px" }}
            />
            {/* ปุ่มแก้ไขรูปภาพ */}
            {profile.ID !== 4 ? (
              <>
                <button
                  className="btn btn-warning mt-2"
                  style={{ width: '140px' }}
                  onClick={() => {
                    setShowEditImageModal(true); // เปิด Modal สำหรับแก้ไขรูปภาพ
                  }}
                >
                  แก้ไขรูปภาพ
                </button>
              </>
            ):(<div className = "fs-4 text-secondary">     ปุ่มแก้ไขรูปภาพถูกปิดไว้สำหรับ ID นี้</div>)}
          </div>
          <div className="ms-4" style={{ width: "100%" }}>
            {["Name", "Lname", "Email", "Sex"].map((field) => (
              <p key={field} className="mb-2">
                <span>
                  {field === "Name"
                    ? "ชื่อ"
                    : field === "Lname"
                    ? "นามสกุล"
                    : field === "Email"
                    ? "อีเมล์"
                    : "เพศ"}
                  :
                </span>{" "}
                {editingField === field ? (
                  <div className="d-flex justify-content-between align-items-center">
                    {field === "Sex" ? (
                      <select
                        name="Sex"
                        value={editedProfile["Sex"] || ""}
                        onChange={handleInputChange}
                        className="form-select"
                        style={{ maxWidth: "300px" }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="อื่น ๆ">อื่น ๆ</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field}
                        value={editedProfile[field] || ""}
                        onChange={handleInputChange}
                        className="form-control"
                        style={{ maxWidth: "300px" }}
                      />
                    )}
                    <button
                      className="btn btn-success ms-2"
                      onClick={() => handleSaveField(field)}
                    >
                      บันทึก
                    </button>
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    <span className="me-auto">{profile[field] || "N/A"}</span>
                    {field !== "Email" || profile.ID !== 4 ? (
                      <button
                        className="btn btn-primary ms-auto"
                        onClick={() => handleEditField(field)}
                      >
                        แก้ไข
                      </button>
                    ) : (
                      <span className="text-secondary ms-2">
                        ปกติจะแก้ได้แต่ขอปิดไว้ก่อน
                      </span>
                    )}
                  </div>
                )}
              </p>
            ))}

            <p className="mb-2">ตำแหน่ง: {profile.RoleName || "N/A"}</p>
            <p className="mb-2">แผนก: {profile.DeptName || "N/A"}</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setNewEmployee({
                      ...newEmployee,
                      img: e.target.files[0], // อัปเดต URL รูปภาพทันที
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
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
