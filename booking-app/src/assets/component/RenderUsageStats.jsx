import axios from 'axios';
import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

const RenderRoomUsageStats = () => {
	const [selectedMonth, setSelectedMonth] = useState('เลือกเดือน');
	const [month, setMonth] = useState(null);
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

	const fetchData = async (month) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`https://bookingweb-sxkw.onrender.com/reports/roomUsed?month=${month}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log(response.data)
			const data = response.data;
			const labels = data.map((entry) => entry.room_name);
			const usageData = data.map((entry) => entry.usage_count);

			setUsageStatsData({
				labels: labels,
				datasets: [
					{
						label: 'จำนวนครั้งที่ใช้ (ครั้ง)',
						data: usageData,
						backgroundColor: 'rgba(54, 162, 235, 0.6)',
					},
				],
			});
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const handleSelectMonth = (monthP, monthName) => {
		const formattedMonth = `2024-${monthP}`;
		setMonth(formattedMonth);
		setSelectedMonth(monthName);
		fetchData(formattedMonth);
	};

	return (
		<Card className="p-3 shadow-sm">
			<h4 className="text-center mb-4">สถิติการใช้ห้อง</h4>
			<Dropdown className="mb-3">
				<Dropdown.Toggle variant="light" id="dropdown-basic">
					{selectedMonth}
				</Dropdown.Toggle>
				<Dropdown.Menu>
					<Dropdown.Item onClick={() => handleSelectMonth('01', 'มกราคม')}>มกราคม</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('02', 'กุมภาพันธ์')}>กุมภาพันธ์</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('03', 'มีนาคม')}>มีนาคม</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('04', 'เมษายน')}>เมษายน</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('05', 'พฤษภาคม')}>พฤษภาคม</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('06', 'มิถุนายน')}>มิถุนายน</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('07', 'กรกฎาคม')}>กรกฎาคม</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('08', 'สิงหาคม')}>สิงหาคม</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('09', 'กันยายน')}>กันยายน</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('10', 'ตุลาคม')}>ตุลาคม</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('11', 'พฤศจิกายน')}>พฤศจิกายน</Dropdown.Item>
					<Dropdown.Item onClick={() => handleSelectMonth('12', 'ธันวาคม')}>ธันวาคม</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
			<div className="chart">
				<Bar data={usageStatsData} />
			</div>
		</Card>
	);
};

export default RenderRoomUsageStats;
