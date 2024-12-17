import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card, Modal, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

const RenderBookingStats = () => {
	const [bookingStatsData, setBookingStatsData] = useState({
		labels: ['การจองสำเร็จ', 'การจองล้มเหลว'],
		datasets: [
			{
				label: 'จำนวนการจองห้อง',
				data: [0, 0], // Placeholder data
				backgroundColor: ['#4CAF50', '#FF5722'],
			},
		],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [modalData, setModalData] = useState(null); // สำหรับข้อมูลใน Modal
	const [showModal, setShowModal] = useState(false); // แสดงหรือซ่อน Modal

	const options = {
		plugins: {
			legend: {
				display: true,
				labels: {
					font: { weight: 'bold', size: 14 },
				},
			},
		},
		onClick: async (event, elements) => {
			if (elements.length > 0) {
				// ตรวจสอบแท่งที่ถูกคลิก
				const clickedIndex = elements[0].index;
				const status = bookingStatsData.labels[clickedIndex]; // 'การจองสำเร็จ' หรือ 'การจองล้มเหลว'
				await fetchEmployeeDetails(status); // ดึงข้อมูลพนักงานที่เกี่ยวข้อง
			}
		},
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get('https://bookingweb-sxkw.onrender.com/reports/usedCanceled', {
					headers: {
						Authorization: `Bearer ${token}`,
					}
				});
				const data = response.data; // กำหนดค่าเริ่มต้น
				setBookingStatsData({
					labels: ['การจองสำเร็จ', 'การจองล้มเหลว'],
					datasets: [
						{
							label: 'จำนวนการจองห้อง',
							data: [data.completed, data.canceled],
							backgroundColor: ['#88E39E', '#FF7D7D'],
						},
					],
				});
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const fetchEmployeeDetails = async (status) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`https://bookingweb-sxkw.onrender.com/reports/employeeDetails`,
				{
					params: { status }, // ส่งสถานะ ('Completed' หรือ 'Canceled')
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setModalData(response.data); // เก็บข้อมูลพนักงานใน Modal
			setShowModal(true); // เปิด Modal
		} catch (error) {
			alert(`Error fetching employee details: ${error.message}`);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<>
			<Card className="p-3 shadow-sm">
				<h4 className="text-center mb-4">การจองและยกเลิกห้อง</h4>
				<div className="chart">
					<Bar data={bookingStatsData} options={options} />
				</div>
			</Card>

			{/* Modal สำหรับแสดงรายชื่อพนักงาน */}
			<Modal show={showModal} onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>รายละเอียดพนักงาน</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{modalData ? (
						<ul>
							{modalData.map((employee) => (
								<li key={employee.id}>
									{employee.name} - {employee.count} ครั้ง
								</li>
							))}
						</ul>
					) : (
						<p>กำลังโหลดข้อมูล...</p>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowModal(false)}>
						ปิด
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default RenderBookingStats;
