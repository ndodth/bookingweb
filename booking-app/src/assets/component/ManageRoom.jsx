import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
// import room1 from "/img/rooms/catfortest.jpeg"; //for test img
import axios from 'axios';

function RoomManagement() {

  const [loading, setLoading] = useState(false); // สถานะการโหลด

  const [rooms, setRooms] = useState([]);
  const [editRoom, setEditRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDescription, setShowDescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingtypeOptions, setbuildingtypeOptions] = useState([]);
  const [roomtypeOptions, setroomtypeOptions] = useState([]);
  const [floortypeOptions, setfloorOptions] = useState([]);
  const [statustypeOptions, setstatustypeOptions] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedfloor, setSelectedfloor] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditImageModal, setShowEditImageModal] = useState(false);






  const [rawdata, setRawdata] = useState([]);
  const [rawdatafloor, setRawdatafloor] = useState([]);

  const [Address_send, setAddress_send] = useState([]);

  const fetchRooms = async () => {

    try {
      setLoading(true)
      const token = localStorage.getItem('token');

      const response = await axios.get('https://bookingweb-sxkw.onrender.com/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });;
      const buildingtype = await axios.get('https://bookingweb-sxkw.onrender.com/buildingtype')
      const roomtype = await axios.get('https://bookingweb-sxkw.onrender.com/roomtype')
      const statustype = await axios.get('https://bookingweb-sxkw.onrender.com/statustype')
      const Address_idforcheck = await axios.get('https://bookingweb-sxkw.onrender.com/address')
      const floor = await axios.get(('https://bookingweb-sxkw.onrender.com/floortype'))

      setRawdatafloor(floor.data)
      console.log(floor.data)
      setAddress_send(Address_idforcheck)
      setRawdata(buildingtype.data);

      console.log(response.data)
      const buildopt = buildingtype.data.reduce((acc, building) => {
        const existingBuilding = acc.find(item => item.label === building.name);

        if (existingBuilding) {
          existingBuilding.floor.push(building.floor);
        } else {
          acc.push({ value: building.id, label: building.name, floor: [building.floor] });
        }

        return acc;
      }, []);

      const roomOptions = Array.from(new Set(roomtype.data.map(room => room.name)))
        .map(name => {
          const roomObj = roomtype.data.find(room => room.name === name);
          return { value: roomObj.id, label: name };
        });




      const statusOptions = Array.from(new Set(statustype.data.map(status => status.name)))
        .map(name => {
          const statusObj = statustype.data.find(status => status.name === name);
          return { value: statusObj.id, label: name };

        });




      setRooms(response.data)
      setbuildingtypeOptions(buildopt);
      setroomtypeOptions(roomOptions)
      setstatustypeOptions(statusOptions)

    } catch (error) {
      console.error('Error fetching rooms:', error);
    }finally{
      setLoading(false)
    }
  };
  useEffect(() => {
    fetchRooms()

  }, []);


  const [newRoom, setNewRoom] = useState({
    id: "",
    name: "",
    description: "",
    status: "",
    cap: "",
    room_type_id: "",
    address_id: "",
    roompic: "",
    building: "",
    floor: "",
    check: ""

  });


  const handleImageUpload = async (e, employeeId) => {
    if (!newRoom.roompic) {
      setErrorMessage("ไม่มีไฟล์รูปภาพให้ส่ง");

      return;
    }

    // ตรวจสอบขนาดไฟล์
    if (newRoom.roompic.size > 200 * 1024) { // 200 KB
      setErrorMessage("ไฟล์ต้องมีขนาดไม่เกิน 200 KB");
      return;
    }
    const token = localStorage.getItem('token');


    const formData = new FormData();
    formData.append("image", newRoom.roompic);

    try {
      const response = await axios.put(`https://bookingweb-sxkw.onrender.com/rooms/${editRoom.id}/upload`, formData, {
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
    fetchRooms();
  };
  const addNewRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const matchingfloorid = rawdatafloor.find(floor => floor.name === selectedfloor)


      const matchingAddresses = Address_send.data.filter(address =>
        parseInt(address.building_id, 10) === parseInt(selectedBuilding, 10) &&
        parseInt(address.floor_id, 10) === parseInt(matchingfloorid.id, 10)
      );



      const formData = new FormData();

      if (matchingAddresses.length > 0) {
        setNewRoom(prevRoom => {
          const updatedRoom = { ...prevRoom, address_id: matchingAddresses[0].id };
          return updatedRoom;
        });


        formData.append("name", newRoom.name);
        formData.append("description", newRoom.description);
        formData.append("status", newRoom.status);
        formData.append("cap", newRoom.cap);
        formData.append("room_type_id", newRoom.room_type_id);
        formData.append("address_id", matchingAddresses[0].id);
        console.log("formData", formData)
        const response2 = await axios.post(`https://bookingweb-sxkw.onrender.com/rooms/create`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        console.log(response2);
      } else {
        console.error("No matching addresses found");
      }

    } catch (error) {
      console.error("Error add room:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มห้อง");
    }

    setRooms([...rooms, newRoom]);
    fetchRooms();
    setShowModal(false);
  }

  const deleteRoom = async (id) => {

    const confirmDelete = window.confirm("คุณต้องการลบห้องนี้ใช่หรือไม่?");
    if (confirmDelete) {
      setRooms(rooms.filter((room) => room.id !== id));
      const token = localStorage.getItem('token');
      console.log("id", id)

      await axios.delete(`https://bookingweb-sxkw.onrender.com/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    }
    fetchRooms();
  };

  const editRoomDetails = (room) => {
    setEditRoom(room);
    setNewRoom(room);
    setShowModal(true);
  };

  const saveEditRoom = async () => {
    console.log(newRoom.id)

    try {
      const token = localStorage.getItem('token');
      const matchingfloorid = rawdatafloor.find(floor => floor.name === selectedfloor)


      const matchingAddresses = Address_send.data.filter(address =>
        parseInt(address.building_id, 10) === parseInt(selectedBuilding, 10) &&
        parseInt(address.floor_id, 10) === parseInt(matchingfloorid.id, 10)
      );
      console.log("selectedBuilding", selectedBuilding)
      console.log("selectedFLoor", selectedfloor)




      if (matchingAddresses.length > 0) {
        setNewRoom(prevRoom => {
          const updatedRoom = { ...prevRoom, address_id: matchingAddresses[0].id };
          return updatedRoom;
        });
        console.log("matchingAddresses", matchingAddresses)
        const formData = new FormData();
        formData.append("id", newRoom.id);
        formData.append("name", newRoom.name);
        formData.append("description", newRoom.description);
        formData.append("status", newRoom.status);
        formData.append("cap", newRoom.cap);
        formData.append("room_type_id", newRoom.room_type_id);
        formData.append("address_id", matchingAddresses[0].id);
        formData.append("image", newRoom.roompic);
        console.log("formData", formData)


        await axios.put(`https://bookingweb-sxkw.onrender.com/rooms/${newRoom.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      } else {
        console.error("No matching addresses found");
      }

    } catch (error) {
      console.error("Error add room:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขห้อง");
    }

    setRooms([...rooms, newRoom]);
    fetchRooms();
    setShowModal(false);
  }


  const handleBuildingChange = (e) => {
    const buildingId = Number(e.target.value);
    const { name, value } = e.target;

    setSelectedBuilding(value);
    console.log("buildingname", name)
    console.log("buildingvalue", value)



    setNewRoom({ ...newRoom, [name]: value });

    const floors = rawdata
      .filter(item => item.id === buildingId) // กรองอาคารที่เลือก
      .map(item => ({
        id: item.Id_floor,
        label: item.floor,
      }));
    setfloorOptions(floors);



  };
  const floorchage = (e) => {
    const floorid = Number(e.target.value); // e.target.value จะเป็นตัวเลข
    const { name, value } = e.target;
    console.log("floogname", name)
    console.log("floorvalue", value)
    setSelectedfloor(value);

    setNewRoom({ ...newRoom, [name]: floorid });
  };

  const filteredRooms = rooms.filter(
    (room) =>
      String(room.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(room.id).toLowerCase().includes(searchTerm.toLowerCase())
  );


  const closetab = async () => {
    setEditRoom(null)
    setShowModal(false)
  }
  return (
    <div className="container mt-5">
      {/* Top Section */}
      <div className="mb-4">
        <h1 className="mb-3">จัดการห้องประชุม</h1>

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
          <div className="col-md-7 d-flex justify-content-end mb-3">
            <button
              className="btn btn-primary btn-lg me-3"
              style={{ backgroundColor: "#49647C", width: "200px" }}
              onClick={() => {
                setNewRoom({
                  id: "",
                  name: "",
                  description: "",
                  status: "",
                  cap: "",
                  room_type_id: "",
                  address_id: "",
                  roompic: "",
                  building: "",
                  floor: "",
                  check: "",


                });
                setSelectedBuilding("");
                setSelectedfloor("");

                setShowModal(true);
              }}
            >
              เพิ่มห้อง
            </button>
          </div>
        </div>
      </div>

      {/* Room List */}
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
          {filteredRooms.map((room) => (
            <div key={room.id} className="card mb-4 shadow-sm border-0">
              <div className="row g-0">
                <div className="col-md-2 d-flex flex-column align-items-center ms-3">
                  {/* ใช้ img จาก room object แทน */}
                  <img
                    src={room.roompic} // ใช้รูป placeholder ถ้ายังไม่มีรูป
                    alt="Room"
                    className="img-fluid rounded-circle border border-dark border-2 mb-5"
                    style={{
                      objectFit: "cover",
                      height: "130px",
                      width: "140px",
                    }}
                  /> {/* ปุ่มแก้ไขรูปภาพ */}
                  {((room.id !== 1) && (room.id !== 3)) &&
                    (
                      <>
                        <button
                          className="btn btn-warning mt-2"
                          style={{ width: '140px' }}
                          onClick={() => {
                            setEditRoom(room);
                            setShowEditImageModal(true);
                          }}
                        >
                          แก้ไขรูปภาพ
                        </button>
                      </>
                    )}
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title mb-2">ชื่อ : {room.name}</h5>
                    <p className="card-text mb-2">รหัส : {room.id}</p>
                    <p className="card-text mb-2">ตึก : {room.building_name}</p>
                    <p className="card-text mb-2">ชั้น : {room.floor_name}</p>
                    <p className="card-text mb-2">ความจุ : {room.cap} คน</p>
                    <p className={`card-text mb-2 ${room.status_name === "ON" ? "text-success" : "text-danger"}`}>
                      สถานะ : {room.status_name
                      }
                    </p>
                    <p className="card-text mb-2">ประเภท : {room.room_type_name}</p>

                  </div>
                </div>


                <div className="col-md-3 d-flex flex-column justify-content-center align-items-end">
              
                     <button
                       className="btn btn-secondary mb-2 btn-lg"
                       onClick={() => editRoomDetails(room)}
                       style={{ width: "300px", backgroundColor: "#35374B" }}
                     >
                       แก้ไขข้อมูล
                     </button>
                    <div className='fs-5 mb-2'> ปิดปุ่มลบรายการไว้เนื่องจากเป็นไอดีที่ทุกคนเข้าดูได้</div>
                     {/* <button
                       className="btn btn-danger btn-lg mb-2"
                       onClick={() => deleteRoom(room.id)}
                       style={{ width: "300px", backgroundColor: "#AC5050" }}
                     >
                       ลบห้อง
                     </button> */}
                     <button className="btn btn-info btn-lg border-light"
                       onClick={() => setShowDescription(room)}
                       style={{ width: "300px", backgroundColor: "#DAEEF7" }} >
                       ดูรายละเอียด
                     </button>
                  
                </div>

              </div>
            </div>
          ))}
          </>)}
        </div>
      </div>

      {/* Modal สำหรับแสดงรายละเอียดห้อง */}
      {showDescription && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">รายละเอียดห้อง: {showDescription.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDescription(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>รหัสห้อง: {showDescription.id}</p>
                <p>ตึก: {showDescription.building_name}</p>
                <p>ชั้น: {showDescription.floor_name}</p>
                <p>ความจุ: {showDescription.cap} คน</p>
                <p>สถานะ: {showDescription.status_name}</p>
                <p>ประเภท: {showDescription.room_type_name}</p>
                <p>รายละเอียด: {showDescription.description}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDescription(null)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal สำหรับเพิ่ม/แก้ไขห้อง */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editRoom ? "แก้ไขข้อมูลห้อง" : "เพิ่มห้อง"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closetab}
                ></button>
              </div>
              <div className="modal-body">
                {/* ชื่อห้อง */}
                <div className="mb-3 " >
                  <label className="form-label">ชื่อห้อง</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      border: !newRoom.name ? "1px solid red" : "1px solid black"
                    }}
                    value={newRoom.name}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, name: e.target.value })
                    }

                  />
                </div>
                {editRoom &&
                  <>
                    {/* รหัสห้อง */}
                    <div className="mb-3">
                      <label className="form-label">รหัสห้อง</label>
                      <div style={{
                        border: "1px solid black", borderRadius: "4%",
                        backgroundColor: "#f8f9fa"
                      }}
                        className='p-2'>
                        {newRoom.id}
                      </div>
                    </div>
                  </>}
                {/* ตึก */}
                <div className="mb-3">
                  <label className="form-label">ตึก</label>
                  <select
                    className="form-select"
                    style={{
                      border: "1px solid grey"
                    }}
                    value={newRoom.buildwding}
                    onChange={handleBuildingChange}
                  >   <option value="">เลือกตึก</option>
                    {buildingtypeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* ชั้น */}
                <div className="mb-3">
                  <label className="form-label">ชั้น</label>
                  <select
                    className="form-select"
                    style={{
                      border: "1px solid black"
                    }}
                    value={newRoom.fldwdoor}
                    onChange={floorchage}
                  // onChange={(e) =>{
                  //   setNewRoom({ ...newRoom, floor: parseInt(e.target.value, 10)});
                  //   setSelectedfloor(e.target.value);
                  // }}
                  > <option value="">เลือกชั้น</option>
                    {floortypeOptions.map((floor) => (
                      <option key={floor.value} value={floor.value}>
                        {floor.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* สถานะห้อง */}
                <div className="mb-3">
                  <label className="form-label">สถานะห้อง</label>
                  <select
                    className="form-select"
                    style={{
                      border: !newRoom.status ? "1px solid red" : "1px solid black"
                    }}
                    value={newRoom.status}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        status: parseInt(e.target.value, 10),
                        statusColor: e.target.value === "ON" ? "text-success" : "text-danger",
                      })
                    }
                  > <option value="">เลือกสถานะห้อง</option>
                    {statustypeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* ประเภทห้อง */}
                <div className="mb-3">
                  <label className="form-label">ประเภทห้อง</label>
                  <select
                    className="form-select"
                    style={{
                      border: !newRoom.room_type_id ? "1px solid red" : "1px solid black"
                    }}
                    value={newRoom.room_type_id}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, room_type_id: e.target.value })
                    }
                  ><option value="">เลือกประเภท</option>
                    {roomtypeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* ความจุ */}
                <div className="mb-3">
                  <label className="form-label">ความจุ (คน)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{
                      border: !newRoom.cap ? "1px solid red" : "1px solid black"
                    }}
                    value={newRoom.cap}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, cap: e.target.value })
                    }
                  />
                </div>
                {/* รายละเอียด */}
                <div className="mb-3">
                  <label className="form-label">รายละเอียด</label>
                  <textarea
                    className="form-control"
                    style={{
                      border: !newRoom.description ? "1px solid red" : "1px solid black"
                    }}
                    value={newRoom.description}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, description: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closetab}
                >
                  ปิด
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    !newRoom.name ||
                    !newRoom.description ||
                    !newRoom.cap ||
                    !newRoom.room_type_id ||
                    !newRoom.status ||
                    !selectedBuilding ||
                    !selectedfloor ||
                    !newRoom.roompic

                  }
                  onClick={editRoom ? saveEditRoom : addNewRoom}
                >
                  {editRoom ? "บันทึกการแก้ไข" : "บันทึก"}

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
                    setNewRoom({
                      ...newRoom,
                      roompic: e.target.files[0], // อัปเดต URL รูปภาพทันที
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

export default RoomManagement;
