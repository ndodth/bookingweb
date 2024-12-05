import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import RenderBookingStats from './RenderBookingStats';
import RenderUsageStats from './RenderUsageStats';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportMenu = () => {
  const [activeMenu, setActiveMenu] = useState('usageStats');

  return (
    <Container fluid className="mt-5" style={{ backgroundColor: '#e9f4fb', height: '100vh' }}>
      <h3 className="text-center mb-3">รายงานการจองห้อง</h3>
      <Row className="justify-content-center">
        <Col md={10}>
          {activeMenu === 'usageStats' && <RenderUsageStats />}
          {activeMenu === 'bookingStats' && <RenderBookingStats />}
        </Col>
      </Row>

      <Row className="mt-3 justify-content-end fixed-bottom pb-3 pr-3 " style={{ width: '80%' }}>
        <Col md={2}>
          <Button
            className={`w-100 ${activeMenu === 'usageStats' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveMenu('usageStats')}
            style={{ fontSize: '0.9rem', backgroundColor: activeMenu === 'usageStats' ? "#007bff" : "#cce5ff", color: activeMenu === 'usageStats' ? "#fff" : "#004085" }}
          >
            สถิติการใช้ห้อง
          </Button>
        </Col>
        <Col md={2}>
          <Button
            className={`w-100 ${activeMenu === 'bookingStats' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveMenu('bookingStats')}
            style={{ fontSize: '0.9rem', backgroundColor: activeMenu === 'bookingStats' ? "#007bff" : "#cce5ff", color: activeMenu === 'bookingStats' ? "#fff" : "#004085" }}
          >
            การจองและยกเลิกห้อง
          </Button>
        </Col>
        
      </Row>
    </Container>
  );
}

export default ReportMenu;