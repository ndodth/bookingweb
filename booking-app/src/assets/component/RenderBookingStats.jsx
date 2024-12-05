
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
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
	
	const options = {
		plugins: {
			legend: {
			  display: true, // Ensure the legend is displayed
			  labels: {
				font: {
				  weight: 'bold', // Make the label text bold
				  size: 14, // Optional: Adjust font size
				},
			  },
			},
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

                const data = response.data || { used: 0, unused: 0 }; // กำหนดค่าเริ่มต้น
				setBookingStatsData({
					labels: ['การจองสำเร็จ', 'การจองล้มเหลว'],
					datasets: [
						{
							label: 'จำนวนการจองห้อง',
                            data: [data.used , data.unused ],
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

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<Card className="p-3 shadow-sm">
			<h4 className="text-center mb-4">การจองและยกเลิกห้อง</h4>
			<div className="chart">
				<Bar data={bookingStatsData} options={options}/>
			</div>
		</Card>
	);
};

export default RenderBookingStats;
