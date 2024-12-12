package main

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func getRoomHandler(c *fiber.Ctx) error {
	fmt.Println("getRoomHandler")
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	room, err := getRoom(id)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(room)
}

func getbuildingtype(c *fiber.Ctx) error {
	buildingtype, err := buildingtype()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(buildingtype)

}

func getroomtype(c *fiber.Ctx) error {
	roomtype, err := roomtype()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(roomtype)

}

func getAddress_id(c *fiber.Ctx) error {
	address, err := getAddress()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(address)

}
func getstatustype(c *fiber.Ctx) error {
	statustype, err := statustype()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(statustype)

}
func getfloortype(c *fiber.Ctx) error {
	floortype, err := floortype()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(floortype)

}
func getRoomsHandler(c *fiber.Ctx) error {
	fmt.Println("getRoomsHandler")
	rooms, err := getRooms()
	if err != nil {
		fmt.Println(err)
		if err == sql.ErrNoRows {
			fmt.Println("ErrNoRows")

			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(rooms)
}

func createRoomHandler(c *fiber.Ctx) error {
	room := new(Room)

	room.Cap, _ = strconv.Atoi(c.FormValue("cap"))
	room.RoomTypeID, _ = strconv.Atoi(c.FormValue("room_type_id"))
	room.AddressID, _ = strconv.Atoi(c.FormValue("address_id"))
	room.Status, _ = strconv.Atoi(c.FormValue("status"))
	room.Name = c.FormValue("name")
	room.Description = c.FormValue("description")

	if err := createRoom(room); err != nil {
		fmt.Println("Error creating room:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Cannot create room",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Create Room Successfully",
		"room":    room,
	})
}

func updateRoomHandler(c *fiber.Ctx) error {
	fmt.Println("updateRoomHandler")

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	room := new(Room)

	err = c.BodyParser(room)
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	room.RoomTypeID, _ = strconv.Atoi(c.FormValue("room_type_id"))
	room.AddressID, _ = strconv.Atoi(c.FormValue("address_id"))

	err = updateRoom(id, room)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(room)
}

func deleteRoomHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	supabaseURL := os.Getenv("SUPABASE_URL1")
	supabaseKey := os.Getenv("SUPABASE_SERVICE")

	var oldFileName sql.NullString
	err = db.QueryRow(`SELECT room_pic FROM room WHERE id = $1`, id).Scan(&oldFileName)
	if err != nil {
		fmt.Println("Error fetching old room_pic:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch room data"})
	}
	if oldFileName.Valid && oldFileName.String != "" {
		var usageCount int
		err := db.QueryRow(`SELECT COUNT(*) FROM room WHERE room_pic = $1`, oldFileName).Scan(&usageCount)
		if err != nil {
			fmt.Println("Error checking usage count:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check usage count"})
		}
		if usageCount == 1 {
			oldFilePath := fmt.Sprintf("room-pictures/%s", oldFileName)
			deleteURL := fmt.Sprintf("%s/storage/v1/object/%s", supabaseURL, oldFilePath)
			req, err := http.NewRequest("DELETE", deleteURL, nil)
			if err != nil {
				fmt.Println("Error creating DELETE request:", err)
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete old file"})
			}

			req.Header.Set("Authorization", "Bearer "+supabaseKey)
			client := &http.Client{}
			resp, err := client.Do(req)
			if err != nil || (resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent) {
				body, _ := io.ReadAll(resp.Body)
				fmt.Println("Error deleting file:", string(body))
			}
			defer resp.Body.Close()
		}
	}

	_, err = db.Exec("DELETE FROM room WHERE id = $1", id)
	if err != nil {
		fmt.Println("Error deleting employee:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete employee"})
	}

	return c.JSON(fiber.Map{"message": "Employee deleted successfully"})
}

func getRoomTypesHandler(c *fiber.Ctx) error {
	roomTypes, err := getRoomTypes()
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(roomTypes)
}

func getDepartmentsHandler(c *fiber.Ctx) error {
	departments, err := getDepartments()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(departments)
}

func Profile(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	fmt.Println("Profile")
	userEmail := token.Email
	profile, err := getProfile(userEmail)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(profile)
}
func getRolesHandler(c *fiber.Ctx) error {

	roles, err := getRoles()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(roles)
}

func getAddressesHandler(c *fiber.Ctx) error {
	address, err := getAddresses()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(address)
}

func getMenusHandler(c *fiber.Ctx) error {
	menus, err := getMenus()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(menus)
}

// func uploadImageRoomHandler(c *fiber.Ctx) error {
// 	img, err := c.FormFile("image") // key image // value path file
// 	if err != nil {
// 		fmt.Println(err)
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}
// 	id, err := strconv.Atoi(c.Params("id"))
// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}
// 	err = c.SaveFile(img, "../booking app/public/img/rooms/"+img.Filename)
// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}
// 	path := "../booking app/public/img/rooms/" + img.Filename
// 	err = uploadImageRoom(path, id)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).SendString("Error reading file content: " + err.Error())
// 	}
// 	return c.SendString("File uploaded successfully")
// }

func getImageRoomHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	// Convert id to int
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid ID format")
	}
	// Query the image data
	var imagePath string
	query := `SELECT room_pic FROM room WHERE id = :id`
	err = db.QueryRow(query, id).Scan(&imagePath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).SendString("Image not found: " + err.Error())
	}
	imageData, err := os.Open(imagePath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).SendString("Image not found: " + err.Error())
	}
	defer imageData.Close()
	// Set the content type as image/jpeg (adjust based on your image type)
	c.Set("Content-Type", getImageContentType(imagePath))
	return c.SendFile(imagePath)
}

func uploadImageProfileHandler(c *fiber.Ctx) error {
	img, err := c.FormFile("image") // key image // value path file
	if err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}
	err = c.SaveFile(img, "./img/profiles/"+img.Filename)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}
	path := "./img/profiles/" + img.Filename
	err = uploadImageProfile(path, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error reading file content: " + err.Error())
	}
	return c.SendString("File uploaded successfully")
}

func getImageProfileHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	// Convert id to int
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid ID format")
	}
	// Query the image data
	var imagePath string
	query := `SELECT profile_pic FROM employee WHERE id = :id`
	err = db.QueryRow(query, id).Scan(&imagePath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).SendString("Image not found: " + err.Error())
	}
	imageData, err := os.Open(imagePath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).SendString("Image not found: " + err.Error())
	}
	defer imageData.Close()
	// Set the content type as image/jpeg (adjust based on your image type)
	c.Set("Content-Type", getImageContentType(imagePath))
	return c.SendFile(imagePath)
}

func getEmployeesHandler(c *fiber.Ctx) error {
	employees, err := getEmployees()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(employees)
}

func getEmployeeHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	employees, err := getEmployee(id)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(employees)
}

func createEmployeeHandler(c *fiber.Ctx) error {
	employee := new(Employee)
	err := c.BodyParser(&employee)
	if err != nil {
		return err
	}
	err = createEmployeeInDB(employee)
	if err != nil {
		return err
	}
	return c.JSON(employee)
}

func updateEmployeeHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	var employee Employee
	err = c.BodyParser(employee)
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	err = updateEmployee(id, &employee)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(employee)
}

func getPermissionsHandler(c *fiber.Ctx) error {
	permissions, err := getPermissions()
	if err != nil {
		if err == sql.ErrNoRows {
			return c.SendStatus(fiber.StatusNotFound)
		}
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(permissions)
}

func getUserPermissionsHandler(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	permissions, err := getUserPermissions(userEmail)
	if err != nil {
		return c.SendStatus(fiber.StatusNotFound)
	}
	return c.JSON(permissions)
}

func updatePermissionsHandler(c *fiber.Ctx) error {
	var permissions []Permission
	err := c.BodyParser(&permissions)
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	err = updatePermission(id, permissions)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(fiber.Map{
		"message": "Update Permission Successfully",
	})
}

func getRoomsAllBookedHandler(c *fiber.Ctx) error {
	bookings, err := getBookings()
	if err != nil {
		return c.SendStatus(fiber.ErrBadGateway.Code)
	}
	return c.JSON(bookings)
}

func loginHandler(c *fiber.Ctx) error {
	fmt.Println("test")

	// รับข้อมูลผู้ใช้
	user := new(User)
	if err := c.BodyParser(user); err != nil {
		fmt.Println("BodyParser")
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	// ตรวจสอบการล็อกอินจาก Supabase
	if err := loginUser(user.Email, user.Password); err != nil {
		fmt.Println("loginUser")
		return c.Status(fiber.StatusUnauthorized).SendString(err.Error())
	}

	// สร้าง JWT token
	token := jwt.New(jwt.SigningMethodHS256)

	// ตั้งค่า claims
	claims := token.Claims.(jwt.MapClaims)
	claims["Email"] = user.Email
	claims["Exp"] = time.Now().Add(time.Hour * 72).Unix()

	// เซ็นต์และสร้าง token
	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	// ส่งกลับ token พร้อมข้อความสำเร็จ
	return c.JSON(fiber.Map{
		"message": "Login Success",
		"token":   t,
	})
}

func bookRoomHandler(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email

	book := new(Booking)

	if err := c.BodyParser(&book); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	err := db.QueryRow(`SELECT id FROM employee WHERE email = $1`, userEmail).Scan(&book.EmpID)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Employee not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to query employee ID",
		})
	}

	fmt.Println(book.StatusID)
	err = bookRoom(book)
	if err != nil {
		return err
	}

	return c.JSON(fiber.Map{
		"message": "Room booked successfully",
	})
}

func unlockRoomHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	err = unlockRoom(id)
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).SendString("Unlock Failed")
	}
	return c.JSON(fiber.Map{
		"message": "Unlock Room Successfully",
	})
}

func cancelRoomHandler(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		fmt.Println("strconv", err)

		return c.SendStatus(fiber.StatusBadRequest)
	}
	var cancel Cancel
	err = c.BodyParser(cancel)
	if err != nil {
		fmt.Println("BodyParser", err)
		return err
	}
	err = cancelRoom(id, cancel)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{
		"message": "Cancel Room Successfully",
	})
}

func getUserBookingHandler(c *fiber.Ctx) error {
	fmt.Println("getUserBookingHandler")
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	booking, err := getUserBooking(userEmail)
	if err != nil && err != sql.ErrNoRows {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	return c.JSON(booking)
}

func getHistoryBookingHandler(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	booking, err := getHistoryBooking(userEmail)
	if err != nil && err != sql.ErrNoRows {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	return c.JSON(booking)
}

// http://localhost:5020/reports/usedCanceled
func getReportUsedCanceledHandler(c *fiber.Ctx) error {
	report, err := getReportUsedCanceled()
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(report)
}

// http://localhost:5020/reports/lockedEmployees?dept_id=1
func getReportLockedEmployeesHandler(c *fiber.Ctx) error {
	dept_id, err := strconv.Atoi(c.Query("dept_id", "0"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	report, err := getReportLockEmployee(dept_id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	return c.JSON(report)
}

// http://localhost:5020/reports/roomUsed?room_id=3&date=2024-10
func getReportRoomUsedHandler(c *fiber.Ctx) error {
	selectedRoom := c.Query("room_id", "")
	selectedDate := c.Query("month", "")

	booking, err := getReportRoomUsed(selectedRoom, selectedDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	// Return the result as JSON
	return c.JSON(booking)
}

func generateQRHandler(c *fiber.Ctx) error {
	bookingID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	err = generateQR(bookingID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	// Send a success response with the file name
	return c.JSON(fiber.Map{
		"message": "QR code generated successfully",
	})
}

func getImageQrHandler(c *fiber.Ctx) error {
	idStr := c.Params("id")
	supabaseURL := os.Getenv("SUPABASE_URL1")

	// Convert id to int
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid ID format")
	}
	fmt.Println(id)
	var imagePath sql.NullString

	query := `SELECT qr FROM booking WHERE id = $1`
	err = db.QueryRow(query, id).Scan(&imagePath)
	if err != nil {
		fmt.Println("err", err)

		return c.Status(fiber.StatusNotFound).SendString("Image not found: " + err.Error())
	}
	var path_file string

	if imagePath.Valid {
		// ถ้ามีค่า profile_pic จะเป็น URL ของภาพที่เก็บใน Supabase
		path_file = imagePath.String
	} else {
		// ถ้าไม่มีค่ากำหนดเป็นภาพเริ่มต้น
		path_file = "profile.png"
	}

	img := supabaseURL + "/storage/v1/object/public/qr_codes/" + path_file
	fmt.Println("path", img)
	return c.JSON(fiber.Map{
		"image_url": img,
	})
}

func amILocked(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	var nlock int
	err := db.QueryRow("SELECT nlock FROM employee WHERE email=$1", userEmail).Scan(&nlock)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	if nlock >= 3 {
		return c.JSON(fiber.Map{
			"state": "locked",
		})
	}
	return c.JSON(fiber.Map{
		"state": "free",
	})
}
