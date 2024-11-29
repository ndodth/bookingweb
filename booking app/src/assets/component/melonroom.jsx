// File: RoomDetails.jsx
import React from 'react';
import '../css/bootstrap.min.css';
import '../js/bootstrap.js';
import { Navigate, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function melonroom() {
  const location = useLocation();
  const { roomData, roompic,from_reserve } = location.state || {};
  const navigate = useNavigate();

  console.log(roomData);
  console.log(from_reserve)
  return (
    <div className="container py-4" style={{ backgroundColor: '#E0F2F1', borderRadius: '15px', maxWidth: '1000px' }}>
      {/* Main Container */}
      <div className="row gx-5">
        {/* Image and Room secondaryrmation */}
        <div className="col-md-6">
          <div className="card" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              {/* Room Image */}

              <img
                src={roompic}
                alt="Room"
                className="card-img-top"
                style={{ height: '250px', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  backgroundColor: roomData.type_name === 'VIP Room' ? 'rgba(255, 215, 0, 0.8)' : '#72B676',
                  color: 'black',
                  padding: '5px',
                  borderRadius: '5px',
                }}
              >
                {roomData.type_name}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#EED1A2',
                  color: 'black',
                  padding: '5px',
                  borderRadius: '5px',
                }}
              >
                {roomData.capacity} People
              </div>
            </div>


            <div className="card-body">
              {/* Room Title */}
              <h5 className="card-title text-center fs-2 ">{roomData.name}</h5>
              {/* Room Details */}
              <p className={`mb-1 fs-5`}><strong>รหัสห้อง :</strong> <span className={`mb-1 text-secondary`}>{roomData.id}</span></p>
              <p className={`mb-1 fs-5`}><strong>สถานะ :</strong> <span className={`mb-1 ${roomData.statusColor}`}>{roomData.status}</span></p>
              <p className={`mb-1 fs-5`}><strong>สถานที่ :</strong> <span className={`mb-1 text-secondary`}>MUT ตึก {roomData.building} ชั้น {roomData.floor}</span></p>
             {from_reserve && (
              <>
              <p className={`mb-1 fs-3`}><strong>คุณกำลังจองห้องนี้อยู่</strong></p>

              <p className={`mb-1 fs-5`}><strong>วันที่:</strong> <span className={`mb-1 text-secondary`}>{roomData.date}</span></p>

              <p className={`mb-1 fs-5`}><strong>เวลา :</strong><span className={`mb-1 text-secondary`}>{roomData.time}</span></p>
              </>
             )}
             {!from_reserve && (
              <>
              <p className={`mb-1 fs-5`}><strong>เวลา :</strong><span className={`mb-1 text-secondary`}>สามารถจองได้</span></p>
              </>
             )}
             
           


            </div>
          </div>
        </div>

        {/* Room Description */}
        <div className="col-md-6">
          <div className="card" style={{ borderRadius: '15px', padding: '20px', backgroundColor: 'white' }}>
            <h5 className="card-title text-center">รายละเอียดห้อง</h5>
            <p>{roomData.description}</p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      {/* <div className="text-center mt-4">
        <button
          className="btn btn-secondary px-5 py-2"
          onClick={() => history.go(-1)}
          style={{ borderRadius: '10px' }}
        >
          กลับ
        </button>



      </div> */}
    </div>
  );
}

export default melonroom;