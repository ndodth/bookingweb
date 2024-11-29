package main

import (
	"database/sql"
	"fmt"
	"image/jpeg"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/skip2/go-qrcode"
)

func getRoom(id int) (Room, error) {
	var room Room
	row := db.QueryRow("SELECT id, name, description, status, cap, room_type_id, address_id FROM room WHERE id = :1", id)
	err := row.Scan(&room.ID, &room.Name, &room.Description, &room.Status, &room.Cap, &room.RoomTypeID, &room.AddressID)
	if err != nil {
		return Room{}, err
	}
	return room, nil
}

func updateRoom(id int, room *Room) error {
	query := `
		UPDATE room
		SET name=:1, description=:2, room_status_id=:3, cap=:4, room_type_id=:5, address_id=:6, room_pic=:7
		WHERE id=:8
	`
	fmt.Println(room)

	_, err := db.Exec(query, room.Name, room.Description, room.Status, room.Cap, room.RoomTypeID, room.AddressID, room.Roompic, id)
	if err != nil {
		fmt.Println("err", err)
		return err
	}
	return nil
}

func createRoom(room *Room) error {
	// var id int
	// err := db.QueryRow("SELECT id FROM room WHERE id=:1", room.ID).
	// 	Scan(&id)

	// if err != sql.ErrNoRows {
	// 	fmt.Println("Room already exists")
	// 	return fiber.ErrConflict
	// }
	var room_id int
	query := `SELECT max(id) from room`
	err := db.QueryRow(query).Scan(&room_id)
	if err != nil {
		fmt.Println("err bookRoom")
		return err
	}
	room.ID = room_id + 1

	query = `
		INSERT INTO room (id, name, description, room_status_id, cap, room_type_id, address_id, room_pic)
		VALUES (:1, :2, :3, :4, :5, :6, :7, :8)
	`

	_, err = db.Exec(query, room.ID, room.Name, room.Description, room.Status, room.Cap, room.RoomTypeID, room.AddressID, room.Roompic)
	if err != nil {
		fmt.Println("Error executing insert:", err)
		return err
	}

	return nil
}

func deleteRoom(id int) error {
	query := `
		DELETE FROM room
		WHERE id=:1
	`
	_, err := db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}

func getAddress() ([]BuildingFloor, error) {
	var BuildingFloors []BuildingFloor
	rows, err := db.Query(`SELECT DISTINCT id, building_id, floor_id FROM building_floor`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var BuildingFloor BuildingFloor

		err := rows.Scan(&BuildingFloor.ID, &BuildingFloor.BuildingID, &BuildingFloor.FloorID)
		if err != nil {

			return nil, err
		}
		BuildingFloors = append(BuildingFloors, BuildingFloor)
	}
	if err = rows.Err(); err != nil {

		return nil, err
	}
	return BuildingFloors, nil
}
func uploadImageRoom(path string, id int) error {
	query := `UPDATE room
			  SET room_pic=:1
			  WHERE id=:2`
	_, err := db.Exec(query, path, id)
	if err != nil {
		return err
	}
	return nil
}
func statustype() ([]StatusType, error) {
	var StatusTypes []StatusType
	rows, err := db.Query(`SELECT DISTINCT id,name FROM room_status`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var StatusType StatusType

		err := rows.Scan(&StatusType.ID, &StatusType.Name)
		if err != nil {

			return nil, err
		}
		StatusTypes = append(StatusTypes, StatusType)
	}
	if err = rows.Err(); err != nil {

		return nil, err
	}
	return StatusTypes, nil
}
func floortype() ([]Floor, error) {
	var FloorTypes []Floor
	rows, err := db.Query(`SELECT DISTINCT id,name FROM floor`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var FloorType Floor

		err := rows.Scan(&FloorType.ID, &FloorType.Name)
		if err != nil {

			return nil, err
		}
		FloorTypes = append(FloorTypes, FloorType)
	}
	if err = rows.Err(); err != nil {

		return nil, err
	}
	return FloorTypes, nil
}
func getUserPermissions(email string) ([]Permission, error) {
	var permiss []Permission
	query := `SELECT employee_role_id, menu_id FROM permission 
				WHERE employee_role_id=(SELECT role_id FROM employee WHERE email=:1)`
	rows, err := db.Query(query, email)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var permis Permission
		err = rows.Scan(&permis.EmployeeRoleID, &permis.MenuID)
		if err != nil {
			return nil, err
		}
		permiss = append(permiss, permis)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return permiss, nil
}

func roomtype() ([]RoomType, error) {
	var RoomTypes []RoomType
	rows, err := db.Query(`SELECT DISTINCT id,name FROM room_type`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var RoomType RoomType

		err := rows.Scan(&RoomType.ID, &RoomType.Name)
		if err != nil {

			return nil, err
		}
		RoomTypes = append(RoomTypes, RoomType)
	}
	if err = rows.Err(); err != nil {

		return nil, err
	}
	return RoomTypes, nil
}

func buildingtype() ([]SearchAddress, error) {
	var SearchAddresss []SearchAddress
	rows, err := db.Query(`SELECT DISTINCT b.id,b.name,f.name,f.id  FROM building_floor bf 
							JOIN building b ON bf.building_id = b.id
							JOIN floor f ON bf.floor_id = f.id`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var SearchAddress SearchAddress

		err := rows.Scan(&SearchAddress.ID, &SearchAddress.Name, &SearchAddress.Floor, &SearchAddress.Id_floor)
		if err != nil {

			return nil, err
		}
		SearchAddresss = append(SearchAddresss, SearchAddress)
	}
	if err = rows.Err(); err != nil {
		fmt.Println("buildingtype erro 2")

		return nil, err
	}
	return SearchAddresss, nil
}

func getRooms() ([]Roomformangage, error) {
	fmt.Println("getRooms")

	var rooms []Roomformangage
	rows, err := db.Query(`SELECT DISTINCT r.id, r.name, r.DESCRIPTION, r.room_status_id, r.cap, r.room_type_id, f.name,f.id, b.name, rt.name, rs.name, r.address_id, r.room_pic
	FROM room r
	JOIN room_type rt ON r.room_type_id = rt.id
	JOIN room_status rs ON  r.room_status_id = rs.id
    JOIN building_floor bf ON r.address_id = bf.id 
    JOIN FLOOR f ON f.id = bf.floor_id 
	JOIN building b ON b.id = bf.building_id ORDER BY r.id ASC
`)
	if err != nil {
		fmt.Println("getRooms err")

		return nil, err

	}
	for rows.Next() {
		var room Roomformangage
		var roomPic sql.NullString
		var err = rows.Scan(&room.ID, &room.Name, &room.Description, &room.Status, &room.Cap, &room.RoomTypeID, &room.FloorName, &room.FlooriD, &room.BuildingName, &room.RoomTypeName, &room.StatusName, &room.AddressID, &roomPic)
		if err != nil {
			fmt.Println("Next err")
			return nil, err

		}
		// Check if roomPic is valid and set the Roompic field accordingly
		if roomPic.Valid {
			room.Roompic = roomPic.String
		}
		room.Roompic = fmt.Sprintf("/img/rooms/%s", room.Roompic)

		rooms = append(rooms, room)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return rooms, nil
}

func getDepartments() ([]Department, error) {
	var departments []Department
	rows, err := db.Query("SELECT id, name FROM department")
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var dept Department
		err := rows.Scan(&dept.ID, &dept.Name)
		if err != nil {
			return nil, err
		}
		departments = append(departments, dept)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return departments, nil
}

func getRoles() ([]EmployeeRole, error) {
	var roles []EmployeeRole
	rows, err := db.Query("SELECT id, name FROM employee_role")
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var role EmployeeRole
		err = rows.Scan(&role.ID, &role.Name)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return roles, nil
}

func getMenus() ([]Menu, error) {
	var menus []Menu
	rows, err := db.Query("SELECT id, name FROM menu")
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var menu Menu
		err = rows.Scan(&menu.ID, &menu.Name)
		if err != nil {
			return nil, err
		}
		menus = append(menus, menu)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return menus, nil
}

func uploadImageProfile(path string, id int) error {
	query := `UPDATE employee
			  SET profile_pic=:1
			  WHERE id=:2`
	_, err := db.Exec(query, path, id)
	if err != nil {
		return err
	}
	return nil
}

func getPermissions() ([]Permission, error) {
	var permiss []Permission
	rows, err := db.Query("SELECT employee_role_id, menu_id FROM permission")
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var permis Permission
		err = rows.Scan(&permis.EmployeeRoleID, &permis.MenuID)
		if err != nil {
			return nil, err
		}
		permiss = append(permiss, permis)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return permiss, nil
}

func updatePermission(id int, permissions []Permission) error {
	deleteQuery := `DELETE FROM permission WHERE employee_role_id=:1`
	_, err := db.Exec(deleteQuery, id)
	if err != nil {
		fmt.Println(err)
		return err
	}

	insertQuery := `INSERT INTO permission (employee_role_id, menu_id) VALUES (:1, :2)`
	for _, perm := range permissions {
		_, err := db.Exec(insertQuery, perm.EmployeeRoleID, perm.MenuID)
		if err != nil {
			fmt.Println(err)
			return err
		}
	}
	return nil
}

func bookRoom(booking *Booking) error {
	var booking_id int
	query := `SELECT max(id) from booking`
	err := db.QueryRow(query).Scan(&booking_id)
	if err != nil {
		fmt.Println("err bookRoom")
		return err
	}
	booking.ID = booking_id + 1
	bookingDate, err := time.Parse("2006-01-02 15:04:05", booking.BookingDate)
	if err != nil {
		fmt.Println("Error parsing BookingDate:", err)
		return err
	}

	formattedStartTime := strings.Replace(booking.StartTime, ".", ":", -1)
	formattedEndTime := strings.Replace(booking.EndTime, ".", ":", -1)

	startTime, err := time.Parse("2006-01-02 15:04", formattedStartTime)
	if err != nil {
		fmt.Println("Error parsing StartTime:", err)
		return err
	}

	endTime, err := time.Parse("2006-01-02 15:04", formattedEndTime)
	if err != nil {
		fmt.Println("Error parsing EndTime:", err)
		return err
	}
	query = `
    INSERT INTO booking (id, booking_date, start_time, end_time, qr, request_message, approved_id, status_id, room_id, emp_id) 
    VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)
`

	_, err = db.Exec(query, booking.ID, bookingDate, startTime, endTime, nil, booking.RequestMessage, nil, booking.StatusID, booking.RoomID, booking.EmpID)
	if err != nil {
		fmt.Println("err bookRoom Exec:", err)
		return err
	}

	return nil
}
func getBookings() ([]BookingCron, error) {
	var bookings []BookingCron
	var req_tmp sql.NullString
	rows, err := db.Query("SELECT id, booking_date, start_time, end_time, request_message, COALESCE(approved_id, 0), status_id, room_id, emp_id from booking")
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var booking BookingCron
		err = rows.Scan(&booking.ID, &booking.BookingDate, &booking.StartTime,
			&booking.EndTime, &req_tmp, &booking.ApprovedID,
			&booking.StatusID, &booking.RoomID, &booking.EmpID,
		)
		if err != nil {
			return nil, err
		}
		if req_tmp.Valid {
			booking.RequestMessage = req_tmp.String
		} else {
			booking.RequestMessage = "No Request Message"
		}
		bookings = append(bookings, booking)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return bookings, nil
}

func getEmployees() ([]Employee, error) {
	var employees []Employee
	query := `SELECT id, name, role_id FROM employee`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var employee Employee
		err = rows.Scan(&employee.ID, &employee.Name, &employee.RoleID)
		if err != nil {
			return nil, err
		}
		employees = append(employees, employee)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return employees, nil
}

func getEmployee(id int) (Employee, error) {
	var employee Employee
	query := `SELECT name, lname, sex, email, dept_id, role_id FROM employee WHERE id:1`
	err := db.QueryRow(query, id).Scan(&employee.Name, &employee.LName, &employee.Sex, &employee.Email, &employee.DeptID, &employee.RoleID)
	if err != nil {
		return Employee{}, err
	}
	return employee, err
}

func verifyUser(email string, password string) error {
	var user User
	row := db.QueryRow("SELECT email, password FROM employee WHERE email=$1 AND password=$2", email, password)
	err := row.Scan(&user.Email, &user.Password)
	if err != nil {
		return fiber.ErrUnauthorized
	}

	return nil
}

func updateEmployee(id int, employee *Employee) error {
	query := `UPDATE employee
			SET name=:1, lname=:2, sex=:3, email=:4, dept_id=:4, role_id=:5
			WHERE id=:7`
	_, err := db.Exec(query, employee.Name, employee.LName,
		employee.Sex, employee.Email, employee.DeptID,
		employee.RoleID, id)
	if err != nil {
		return err
	}
	return nil
}

func unlockRoom(id int) error {
	var status_id int
	query := `  SELECT status_id 
				FROM booking 
				WHERE status_id=(SELECT id FROM booking_status WHERE name = 'Waiting')
				AND id=:1
			`
	err := db.QueryRow(query, id).Scan(&status_id)
	if err != nil {
		return err
	}
	query = `
		UPDATE booking
		SET status_id=(SELECT id FROM booking_status WHERE name='Using')
		WHERE id=:2
	`
	_, err = db.Exec(query, status_id, id)
	if err != nil {
		return err
	}
	return nil
}

func getAddresses() ([]Address, error) {
	var addresses []Address
	query := `SELECT building_floor.id, building.name, floor.name 
								FROM building_floor, building, floor 
                                WHERE building_id=building.id 
                                AND floor_id=floor.id`
	rows, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	for rows.Next() {
		var address Address
		err = rows.Scan(&address.ID, &address.BuildingName, &address.FloorName)
		if err != nil {
			return nil, err
		}
		addresses = append(addresses, address)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return addresses, nil
}

func cancelRoom(id int, cancel Cancel) error {
	// เริ่ม transaction
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback() // ถ้าเกิด panic ให้ rollback
			panic(p)
		} else if err != nil {
			tx.Rollback() // ถ้า error ให้ rollback
		} else {
			err = tx.Commit() // ถ้าไม่มี error ให้ commit
		}
	}()

	var status_id int
	query := `SELECT id FROM booking_status WHERE name=:1`
	err = tx.QueryRow(query, "Canceled").Scan(&status_id)
	if err != nil {
		return err
	}

	query = `
		UPDATE booking
		SET status_id=:1
		WHERE id=:2
	`
	_, err = tx.Exec(query, status_id, id)
	if err != nil {
		return err
	}

	var cancel_id int
	query = `SELECT max(id) from cancel`
	err = tx.QueryRow(query).Scan(&cancel_id)
	if err != nil {
		return err
	}

	query = `INSERT INTO cancel(id, reason, booking_id, employee_id)
			VALUES(:1, :2, :3, :4)`
	_, err = tx.Exec(query, cancel_id+1, cancel.Reason, cancel.BookingID, cancel.EmployeeID)
	if err != nil {
		return err
	}

	return nil
}

func getReportUsedCanceled() ([]Booking, error) {
	query := `SELECT id, status_id FROM booking
			WHERE status_id=(SELECT id FROM booking_status WHERE name=:1)
			OR status_id=(SELECT id FROM booking_status WHERE name=:2)
	`
	var bookingList []Booking
	rows, err := db.Query(query, "Completed", "Canceled")
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var booking Booking
		err = rows.Scan(&booking.ID, &booking.StatusID)
		if err != nil {
			return nil, err
		}
		bookingList = append(bookingList, booking)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return bookingList, nil
}

func getReportLockEmployee(dept_id int) ([]EmployeeLocked, error) {
	var employeesLocked []EmployeeLocked
	query := `SELECT id, date_locked, employee_id FROM employee_locked`
	if dept_id != 0 {
		query += " WHERE " + "employee_id in (SELECT id from employee WHERE dept_id=" + strconv.Itoa(dept_id) + ")"
	}
	fmt.Println(query)
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var employeeLocked EmployeeLocked
		err = rows.Scan(&employeeLocked.ID, &employeeLocked.DateLocked, &employeeLocked.EmployeeID)
		if err != nil {
			return nil, err
		}
		employeesLocked = append(employeesLocked, employeeLocked)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return employeesLocked, nil
}

func getRoomTypes() ([]RoomType, error) {
	var roomTypes []RoomType
	query := `SELECT id, name FROM room_type`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var roomType RoomType
		err = rows.Scan(&roomType.ID, &roomType.Name)
		if err != nil {
			return nil, err
		}
		roomTypes = append(roomTypes, roomType)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return roomTypes, nil
}

func getUserBooking(email string) ([]Booking, error) {
	var bookings []Booking
	var req_tmp sql.NullString
	fmt.Println("getUserBooking")
	query := `	SELECT id, booking_date, start_time, end_time, request_message, COALESCE(approved_id, 0),
					status_id, room_id, emp_id
				FROM booking
				WHERE status_id in ( SELECT id FROM booking_status
									 WHERE name='Waiting' 
									 OR name='Pending'
									 OR name='Using' ) 
				AND emp_id = (  SELECT id 
								FROM employee
								WHERE email=:1)
			`
	rows, err := db.Query(query, email)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var booking Booking
		err = rows.Scan(&booking.ID, &booking.BookingDate, &booking.StartTime, &booking.EndTime,
			&req_tmp, &booking.ApprovedID, &booking.StatusID,
			&booking.RoomID, &booking.EmpID)
		if err != nil {
			return nil, err
		}
		if req_tmp.Valid {
			booking.RequestMessage = req_tmp.String
		} else {
			booking.RequestMessage = "No Request Message"
		}
		bookings = append(bookings, booking)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return bookings, err
}

func getHistoryBooking(email string) ([]Booking, error) {
	var bookings []Booking
	query := `	SELECT id, booking_date, start_time, end_time, request_message, COALESCE(approved_id, 0),
				status_id, room_id, emp_id
			FROM booking
			WHERE status_id in ( SELECT id FROM booking_status
								WHERE name='Completed' 
								OR name='Canceled' 
								OR name='Expired') 
			AND emp_id = (  SELECT id 
							FROM employee
							WHERE email=:1 )
			`
	rows, err := db.Query(query, email)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var booking Booking
		err = rows.Scan(&booking.ID, &booking.BookingDate, &booking.StartTime, &booking.EndTime,
			&booking.RequestMessage, &booking.ApprovedID, &booking.StatusID,
			&booking.RoomID, &booking.EmpID)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, booking)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return bookings, err
}

func getReportRoomUsed(selectedRoom string, selectedDate string) ([]Booking, error) {
	// Base SQL query
	query := "SELECT id, booking_date, start_time, end_time, request_message, NVL(approved_id, 0), status_id, room_id, emp_id FROM booking"
	var conditions []string
	var args []interface{}

	if selectedRoom != "" {
		conditions = append(conditions, "room_id = :1")
		args = append(args, selectedRoom)
	}
	if selectedDate != "" {
		date := formatTime(selectedDate)
		conditions = append(conditions, "TRUNC(start_time) = TO_DATE(:2, 'YYYY-MM-DD')")
		args = append(args, date)
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	// Execute the query
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []Booking
	for rows.Next() {
		var booking Booking
		err := rows.Scan(&booking.ID, &booking.BookingDate, &booking.StartTime, &booking.EndTime, &booking.RequestMessage, &booking.ApprovedID, &booking.StatusID, &booking.RoomID, &booking.EmpID)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, booking)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return bookings, nil
}

func generateQR(id int) error {
	url := fmt.Sprintf("http://localhost:3000/unlockRoom/%d", id)
	var qrPath sql.NullString
	err := db.QueryRow("SELECT qr FROM booking WHERE id=:1", id).Scan(&qrPath)
	//fmt.Println(id, qrPath, err)
	if err != nil {
		return err
	}
	// If qrPath.Valid is true, a valid QR path exists; skip generating a new QR code
	if qrPath.Valid {
		return nil
	}
	qr, err := qrcode.New(url, qrcode.Medium)
	if err != nil {
		return err
	}

	// Create a random file name
	fileName := "./img/qr_codes/" + generateRandomFileName() + ".jpg"

	// Create a file to save the QR code as a JPEG
	file, err := os.Create(fileName)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = db.Exec(`UPDATE booking SET qr=:1 WHERE id=:2`, fileName, id)
	if err != nil {
		return err
	}
	// Convert the QR code to an image
	img := qr.Image(256) // 256x256 size of the QR code

	// Encode the image as JPEG
	if err := jpeg.Encode(file, img, nil); err != nil {
		return err
	}
	//log.Printf("Generating qr: %s", fileName)
	return nil
}

func checkBookingStatus(bookingID int, wg *sync.WaitGroup) {
	defer wg.Done()
	tx, err := db.Begin()
	if err != nil {
		fmt.Println("failed to begin transaction: %w", err)
		return
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	var employeeID int
	var statusID int

	query := `SELECT emp_id, status_id 
              FROM booking 
              WHERE id = :1 
              AND status_id = (SELECT id FROM booking_status WHERE name = 'Waiting')`
	err = tx.QueryRow(query, bookingID).Scan(&employeeID, &statusID)
	if err != nil {
		return
	}

	var nlock int
	err = tx.QueryRow("SELECT nlock FROM employee WHERE id = :1", employeeID).Scan(&nlock)
	if err != nil {
		return
	}

	_, err = tx.Exec("UPDATE employee SET nlock = :1 WHERE id = :2", nlock+1, employeeID)
	if err != nil {
		return
	}

	_, err = tx.Exec("UPDATE booking SET status_id = (SELECT id FROM booking_status WHERE name = 'Expired') WHERE id = :1", bookingID)
	if err != nil {
		return
	}

	if err = tx.Commit(); err != nil {
		return
	}
}

func checkCompleteStatus(bookingID int, wg *sync.WaitGroup) {
	defer wg.Done()
	tx, err := db.Begin()
	if err != nil {
		return
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	var statusID int

	query := `SELECT status_id 
              FROM booking 
              WHERE id = :1 
              AND status_id = (SELECT id FROM booking_status WHERE name = 'Using')`
	err = tx.QueryRow(query, bookingID).Scan(&statusID)
	if err != nil {
		return
	}

	_, err = tx.Exec("UPDATE booking SET status_id = (SELECT id FROM booking_status WHERE name = 'Completed') WHERE id = :1", bookingID)
	if err != nil {
		return
	}

	if err = tx.Commit(); err != nil {
		return
	}
}
