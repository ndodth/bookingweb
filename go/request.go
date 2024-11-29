package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	_ "github.com/sijms/go-ora/v2"
)

// BookingRequest โครงสร้างข้อมูลสำหรับคำร้องขอใช้งานห้อง
type BookingRequest struct {
	ID             int    `json:"id"`
	Roomid         string `json:"room_id"`
	RoomName       string `json:"room_name"`
	BookingDate    string `json:"booking_date"`
	StartTime      string `json:"start_time"`
	EndTime        string `json:"end_time"`
	RequestMessage string `json:"request_message"`
}

// GetAllRequests ฟังก์ชันสำหรับดึงข้อมูลคำร้องขอใช้งานห้องทั้งหมด
func GetAllRequests(c *fiber.Ctx) error {
	fmt.Println("GetAllRequests")
	rows, err := db.Query(`
		SELECT b.id, r.name AS room_name, b.booking_date, b.start_time, b.end_time, b.request_message, b.room_id
		FROM booking b
		JOIN room r ON b.room_id = r.id
		WHERE b.status_id = 1
	`)
	if err != nil {
		fmt.Println("Error fetching booking requests:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch booking requests"})
	}
	defer rows.Close()

	var requests []BookingRequest
	for rows.Next() {
		var request BookingRequest
		if err := rows.Scan(&request.ID, &request.RoomName, &request.BookingDate, &request.StartTime, &request.EndTime, &request.RequestMessage, &request.Roomid); err != nil {
			fmt.Println("Error scanning booking request:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to scan booking request"})
		}
		requests = append(requests, request)
	}

	return c.JSON(requests)
}

func updatebook(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)

	userEmail := token.Email
	fmt.Println("updatebook")
	bookingid := c.Params("id")
	_, err := db.Exec("UPDATE booking SET status_id = (SELECT id FROM booking_status WHERE name = 'Using') , approved_id = (SELECT id FROM employee WHERE email=:1) WHERE id = :2", userEmail, bookingid)
	if err != nil {
		fmt.Println("Error updating booking:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update department"})
	}

	return c.JSON(fiber.Map{"message": "Department updated successfully"})
}
