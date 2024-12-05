import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Row, Col, Dropdown } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

const RenderUsageStats = () => {
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedRoom, setSelectedRoom] = useState('เลือกห้อง')
	const [roomId, setRoomId] = useState(null)
	const [month, setMonth] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState('เลือกเดือน')
	const [booking, setBooking] = useState([]);
	const [usageStatsData, setUsageStatsData] = useState({
		labels: [],
		datasets: [
			{
				label: 'จำนวนครั้งที่ใช้ (ครั้ง)',
				data: [],
				backgroundColor: 'rgba(54, 162, 235, 0.6)',
			},
		],
	});

	const fetchData = async (id, month) => {
		try {
			const token = localStorage.getItem('token')
			const response = await axios.get(`http://localhost:5020/reports/roomUsed?room_id=${id}&month=${month}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setBooking(response.data)
			// Extract dates and room usage data for the chart
			const labels = response.data.map((entry) => entry.date);
			const data = response.data.map((entry) => entry.roomUsed);

			// Update the chart data with fetched values
			setUsageStatsData({
				labels: labels,
				datasets: [
					{
						label: 'จำนวนครั้งที่ใช้ (ครั้ง)',
						data: data,
						backgroundColor: 'rgba(54, 162, 235, 0.6)',
					},
				],
			});
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const fetchRooms = async () => {
			try {
				const token = localStorage.getItem('token')
				const response = await axios.get('http://localhost:5020/rooms', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setRooms(response.data)
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		}
		fetchRooms();
	}, [])

	const handleRoomSelect = (room) => {
		setSelectedRoom(room.name);
		setRoomId(room.id);
		if (month) fetchData(room.id, month);
	}

	const handleSelectMonth = (monthP, monthName) => {
		setMonth("2024-" + monthP);
		setSelectedMonth(monthName);
		if (roomId) fetchData(roomId, "2024-" + monthP);
	}

	//if (roomId && month) fetchData(roomId, month)
	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<Card className="p-3 shadow-sm">
			<h4 className="text-center mb-4">สถิติการใช้ห้อง</h4>
			<Row className="justify-content-center">
				<Col md={6}>
					<Dropdown className="mb-3">
						<Dropdown.Toggle variant="light" id="dropdown-basic">
							{selectedMonth}
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item onClick={() => handleSelectMonth("01", "มกราคม")}>มกราคม</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("02", "กุมภาพันธ์")}>กุมภาพันธ์</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("03", "มีนาคม")}>มีนาคม</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("04", "เมษายน")}>เมษายน</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("05", "พฤษภาคม")}>พฤษภาคม</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("06", "มิถุนายน")}>มิถุนายน</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("07", "กรกฏาคม")}>กรกฏาคม</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("08", "สิงหาคม")}>สิงหาคม</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("09", "กันยายน")}>กันยายน</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("10", "ตุลาคม")}>ตุลาคม</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("11", "พฤศจิกายน")}>พฤศจิกายน</Dropdown.Item>
							<Dropdown.Item onClick={() => handleSelectMonth("12", "ธันวาคม")}>ธันวาคม</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Col>
				<Col md={6}>
					<Dropdown className="mb-3">
						<Dropdown.Toggle variant="light" id="dropdown-basic">
							{selectedRoom}
						</Dropdown.Toggle>
						<Dropdown.Menu>
							{rooms.map((room) => (
								<Dropdown.Item key={room.id} onClick={() => handleRoomSelect(room)}>
									{room.name}
								</Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown>
				</Col>
			</Row>
			<div className="chart">
				<Bar data={usageStatsData} />
			</div>
		</Card>
	)
}
export default RenderUsageStats