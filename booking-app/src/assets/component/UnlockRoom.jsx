// src/pages/UnlockRoom.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

function UnlockRoom() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [rooms, setRooms] = useState([]);
	const [bookings, setBookings] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("No token found in localStorage");
				}

				const [bookingsResponse, roomsResponse] = await Promise.all([
					axios.get('http://localhost:5020/userBooking', {
						headers: { "Authorization": `Bearer ${token}` },
					}),
					axios.get('http://localhost:5020/rooms', {
						headers: { "Authorization": `Bearer ${token}` },
					}),
				]);

				const roomsData = roomsResponse.data;
				setRooms(roomsData);
				console.log(roomsData)

				const enrichedBookings = bookingsResponse.data.map((booking) => {
					const roomDetails = roomsData.find(room => room.id === booking.room_id);
					return { ...booking, roomDetails };
				});

				setBookings(enrichedBookings);
				console.log(enrichedBookings);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);

	const handleUnlock = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("No token found in localStorage");
			}
			console.log(token)
			const response = await axios.put(
				`http://localhost:5020/unlockRoom/${id}`,
				{}, // Empty object for body for put, post
				{
					headers: { "Authorization": `Bearer ${token}` },
				}
			);
			if (response.data.message === "Unlock Room Successfully") {
				alert("Room unlocked successfully!");
				navigate("/home");
			} else {
				alert("Failed to unlock the room. Please try again.");
			}
		} catch (error) {
			console.error("Failed to unlock the room:", error);
		}
	};

	const handleCancel = () => {
		navigate("/home");
	};
	const booking = bookings.find(booking => booking.id === parseInt(id));
	const room = booking ? rooms.find(room => room.id === booking.room_id) : null;

	if (!booking) {
		console.error("Booking not found");
		return <div>Booking not found</div>; 
	}

	if (!room) {
		console.error("Room not found for the given booking");
		return <div>Room not found</div>;
	}

	return (
		<div>
			<h1>
				Room Id: {id}, Room Name: {room ? room.name : "Room not found"}
			</h1>
			<p>Would you like to unlock this room?</p>
			<button onClick={handleUnlock} disabled={!room}>Unlock</button>
			<button onClick={handleCancel} style={{ marginLeft: "10px" }}>Cancel</button>
		</div>
	);

}

export default UnlockRoom;
