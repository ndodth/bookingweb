import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function PositionManagement() {
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [allPermission, setAllPermission] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [positionName, setPositionName] = useState('');
  const [searchTerm, setSearchTerm] = useState("");

  const [remainingPermissions, setRemainingPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedDropdown, setSelectedDropdown] = useState("");

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch positions
      const response = await axios.get("http://localhost:5020/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch all permissions
      const allPermissionsResponse = await axios.get("http://localhost:5020/menus", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllPermission(allPermissionsResponse.data);
      console.log("All Permissions:", allPermissionsResponse.data);
      console.log("Positions:", response.data);

      // Group positions by id and combine role_access
      const groupedPositions = Object.values(response.data.reduce((acc, item) => {
        if (!acc[item.id]) {
          acc[item.id] = { ...item, role_access: new Set([item.role_access]) };
        } else {
          acc[item.id].role_access.add(item.role_access);
        }
        return acc;
      }, {})).map(position => ({
        ...position,
        role_access: Array.from(position.role_access),
      }));

      setPositions(groupedPositions);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const handleDeletePermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const permissionsToDelete = selectedDropdown;

      if (!selectedDropdown) {
        alert("กรุณาเลือกสิทธิ์ที่ต้องการลบ");
        return;
      }

      console.log("Permissions to Delete:", permissionsToDelete);

      await axios.delete(`http://localhost:5020/permissions/${selectedPosition.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { permissions: permissionsToDelete },
      });

      // Update positions state
      setPositions(prevPositions =>
        prevPositions.map(position =>
          position.id === selectedPosition.id
            ? { ...position, role_access: position.role_access.filter(access => !permissionsToDelete.includes(access)) }
            : position
        )
      );

      setShowModalDelete(false);
      setSelectedDropdown(""); // Reset selectedDropdown after successful deletion
    } catch (error) {
      console.error("Error deleting permissions:", error);
    }
  };

  const handleShowModalDelete = (position) => {
    setSelectedPosition(position);
    setShowModalDelete(true);
  };

  const getRemainingPermissions = (position) => {
    const existingPermissions = position.role_access.map((access) => access);
    return allPermission.filter((permission) => !existingPermissions.includes(permission.name));
  };

  const handleShowModal = (position) => {
    setSelectedPosition(position.id);
    setRemainingPermissions(getRemainingPermissions(position));
    setShowModal(true);
  };

  const handleCheckboxChange = (permissionId) => {
    setSelectedPermissions((prevSelected) => {
      if (prevSelected.includes(permissionId)) {
        return prevSelected.filter((id) => id !== permissionId); // Remove if already selected
      } else {
        return [...prevSelected, permissionId]; // Add if not selected
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');

      console.log("Selected Position:", selectedPosition);
      console.log("Selected Permissions:", selectedPermissions);

      await axios.put(`http://localhost:5020/permissions/${selectedPosition}`, {
        permissionIds: selectedPermissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('สิทธิ์ถูกเพิ่มเรียบร้อยแล้ว');
      setSelectedPermissions([]); // Reset state after successful submission
      fetchPositions();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสิทธิ์');
    }
  };

  const handleSelectChange = (event) => {
    const value = event.target.value;
    console.log("Selected Dropdown:", value);
    setSelectedDropdown(value); // Set new value for selectedDropdown
  };

  const handleAddPosition = async () => {
    try {
      const token = localStorage.getItem('token');

      const newPosition = {
        name: positionName,
        role_access: selectedPermissions, // Assuming you want to set permissions while adding a position
      };
      console.log("selectedPermissions", selectedPermissions)

      console.log("newPosition", newPosition)
      await axios.post('http://localhost:5020/permissions', newPosition, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('ตำแหน่งถูกเพิ่มเรียบร้อยแล้ว');
      setPositionName('');
      setSelectedPermissions([]);
      fetchPositions();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding position:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มตำแหน่ง');
    }
  };

  //Deleterole
  const confirmDeletePosition = async (position) => {
    console.log(position.id)
    const token = localStorage.getItem('token')
    if (window.confirm(`ต้องการลบตำแหน่ง ${position.name}?`)) {
      // ส่งคำขอลบไปยัง backend
      await axios.delete(`http://localhost:5020/deleterole/${position.id}`, {

        headers: { Authorization: `Bearer ${token}` }

      })
      fetchPositions()

    }
  }

  const filteredpositions = positions.filter(
    (position) =>
      String(position.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(position.id).toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="container mt-5">
      <div className="row align-items-center mb-3">
        <div className="col-sm-6">
          <h1 className="mb-0">จัดการตำแหน่ง</h1>
        </div>
        <div className="col-sm-6 d-flex justify-content-end">
          <button className="btn btn-success p-2 fs-4" onClick={() => setShowAddModal(true)}>เพิ่มตำแหน่ง</button>
        </div>
      </div>

      <div className="col-12 input-group mb-3">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="ค้นหาชื่อหรือรหัส"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredpositions.length > 0 ? (
        filteredpositions.map((position) => (
          <div key={position.id} className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">ตำแหน่ง: {position.name}</h5>
              <p className="card-text">รหัสตำแหน่ง: {position.id}</p>
              {position.id != 4 ? (
                <>
                  <div style={{ float: 'right', textAlign: 'right', marginTop: '-4rem' }}>
                    <button
                      className="btn btn-success mb-2 p-2 fs-4"
                      onClick={() => handleShowModal(position)}
                    >
                      เพิ่มสิทธิ์
                    </button>
                    <br />
                    <button
                      className="btn btn-danger mb-2 p-2 fs-4"
                      onClick={() => handleShowModalDelete(position)}
                    >ลบสิทธิ์
                    </button>
                    <br />
                    {position.id != 2 && (
                      <>
                        <button
                          className="btn btn-warning p-2 fs-4"
                          onClick={() => confirmDeletePosition(position)}
                        >ลบตำแหน่ง
                        </button>
                      </>
                    )}
                    {position.id == 2 && (
                      <>
                        <div className='fs-ภ text-Secondary'>*Staff ไม่สามารถลบได้</div>
                      </>
                    )}
             
                </div>
                                    </>

                ):( 
                  <div style={{ float: 'right', textAlign: 'right', marginTop: '-4rem' }}
                  className="fs-4">
                   ****ปิดไว้สำหรับตำแหน่งนี้****
                    </div>
              )}
              <div className="mt-3">
                <h6>สิทธิ์การเข้าถึงเมนู:</h6>
                <ul>
                  {position.role_access &&
                    position.role_access.map((access, index) => (
                      <li key={index}>{access}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>ไม่พบข้อมูลตำแหน่ง</p>
      )}

      {/* Modal for adding permissions */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">จัดการสิทธิ์</h5>
                <button
                  type="button"
                  className="btn-close p-2"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h6>เลือกสิทธิ์ที่ต้องการเพิ่ม:</h6>
                <div className="form-check">
                  {remainingPermissions.map((permission) => (
                    <div key={permission.id}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`permission-${permission.id}`}
                        value={permission.id}
                        onChange={() => handleCheckboxChange(permission.id)}
                        checked={selectedPermissions.includes(permission.id)}
                      />
                      <label className="form-check-label" htmlFor={`permission-${permission.id}`}>
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger p-2"
                  onClick={() => setShowModal(false)}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  className="btn btn-primary p-2"
                  onClick={handleSubmit}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for deleting permissions */}
      {showModalDelete && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ลบสิทธิ์</h5>
                <button
                  type="button"
                  className="btn-close p-2"
                  onClick={() => setShowModalDelete(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h6>เลือกสิทธิ์ที่ต้องการลบ:</h6>
                <select className="form-select" value={selectedDropdown} onChange={handleSelectChange}>
                  <option value="">เลือกสิทธิ์</option>
                  {allPermission
                    .filter(permission => selectedPosition?.role_access.includes(permission.name))
                    .map(permission => (
                      <option key={permission.id} value={permission.name}>{permission.name}</option>
                    ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger p-2"
                  onClick={() => setShowModalDelete(false)}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  className="btn btn-primary p-2"
                  onClick={handleDeletePermissions}
                >
                  ยืนยันการลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding a position */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">เพิ่มตำแหน่ง</h5>
                <button
                  type="button"
                  className="btn-close p-2"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">

                <div className="mb-3">
                  <label htmlFor="positionName" className="form-label">ชื่อตำแหน่ง</label>
                  <input
                    type="text"
                    className="form-control"
                    id="positionName"
                    value={positionName}
                    onChange={(e) => setPositionName(e.target.value)}
                    required
                  />
                </div>
                <h6>เลือกสิทธิ์สำหรับตำแหน่งใหม่:</h6>
                <div className="form-check">
                  {allPermission.map((permission) => (
                    <div key={permission.id}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`new-permission-${permission.id}`}
                        value={permission.id}
                        onChange={() => handleCheckboxChange(permission.id)}
                        checked={selectedPermissions.includes(permission.id)}
                      />
                      <label className="form-check-label" htmlFor={`new-permission-${permission.id}`}>
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger p-2"
                  onClick={() => setShowAddModal(false)}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  className="btn btn-primary p-2"
                  onClick={handleAddPosition}
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


export default PositionManagement;