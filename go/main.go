package main

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	jwtware "github.com/gofiber/jwt/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // PostgreSQL driver
)

var db *sql.DB

func main() {

	app := fiber.New()

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}
	// Get DSN from environment variable
	dsn := os.Getenv("DSN")
	if dsn == "" {
		panic("DSN environment variable is not set")
	}
	// Initialize the database connection
	db, err = sql.Open("postgres", dsn)
	if err != nil {
		panic(err)
	}

	defer db.Close()
	// Ping the database to verify connection
	if err := db.Ping(); err != nil {
		panic(err)
	}
	fmt.Println("Connected to postgres Database using go-ora")

	// Apply CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Adjust this to be more restrictive if needed
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))
	fmt.Println("test to postgres Database using go-ora")

	app.Get("/home", home)

	app.Get("/departments", getDepartmentsHandler)
	app.Get("/roomTypes", getRoomTypesHandler)
	app.Get("/menus", getMenusHandler)
	// app.Post("/uploadImageRoom/:id", uploadImageRoomHandler)
	app.Get("/getImageRoom/:id", getImageRoomHandler)
	app.Post("/uploadImageProfile/:id", uploadImageProfileHandler)
	app.Get("/getImageProfile/:id", getImageProfileHandler)
	app.Get("/getImageQr/:id", getImageQrHandler)
	app.Get("/addresses", getAddressesHandler)

	// Login
	app.Post("/login", loginHandler)
	app.Post("/register", registerHandler)
	app.Get("/home", home)
	app.Get("/buildingtype", getbuildingtype)
	app.Get("/roomtype", getroomtype)
	app.Get("/floortype", getfloortype)
	app.Get("/statustype", getstatustype)
	app.Get("/address", getAddress_id)
	app.Get("/rooms", getRoomsHandler)

	// JWT Middleware
	app.Use(jwtware.New(jwtware.Config{
		SigningKey: []byte(os.Getenv("JWT_SECRET")),
	}))
	// Middleware to extract user data from JWT
	app.Use(extractDataFromJWT)
	// API HANDLER
	app.Get("/userBooking", getUserBookingHandler)
	app.Get("/historyBooking", getHistoryBookingHandler)
	app.Get("/userPermissions", getUserPermissionsHandler) // get permission of jwt (user)
	app.Get("/roles", getRolesHandler)
	app.Get("/Profile", Profile)
	app.Put("/Profile", EditProfile) // เพิ่มการรองรับ method PUT สำหรับ /Profile
	app.Get("/amILocked", amILocked)

	// Book rooms
	app.Post("/bookRoom", bookRoomHandler)
	app.Put("/unlockRoom/:id", unlockRoomHandler)
	app.Put("/cancelRoom/:id", cancelRoomHandler)

	// Rooms
	roomsGroupApi := app.Group("/rooms")                      // Group routes under /rooms
	roomsGroupApi.Use(checkPermissionRooms)                   // Apply the checkPermissionRooms middleware only to the /rooms routes
	roomsGroupApi.Get("/allBooked", getRoomsAllBookedHandler) // example result /rooms/allBooked
	roomsGroupApi.Get("/:id", getRoomHandler)
	roomsGroupApi.Post("/create", createRoomHandler)
	roomsGroupApi.Put("/:id", updateRoomHandler)
	roomsGroupApi.Delete("/:id", deleteRoomHandler)
	roomsGroupApi.Put("/:id/upload", uploadImageRoom)

	// Employees
	employeesGroupApi := app.Group("/employees")
	employeesGroupApi.Use(checkPermissionEmployees)
	employeesGroupApi.Get("/", ManageEmployee)
	employeesGroupApi.Get("/:id", getEmployeeHandler)
	employeesGroupApi.Post("/", AddEmployee)
	employeesGroupApi.Put("/:id", UpdateEmployee)
	employeesGroupApi.Delete("/:id", DeleteEmployee)
	employeesGroupApi.Put("/:id/upload", image)

	// Permissions
	permissionsGroupApi := app.Group("/permissions")
	permissionsGroupApi.Use(checkPermissionRoles)
	permissionsGroupApi.Get("/", GetPositions)
	permissionsGroupApi.Get("/all", GetallPositions)
	permissionsGroupApi.Post("/", AddPosition)
	permissionsGroupApi.Put("/:id", UpdatePosition)
	permissionsGroupApi.Delete("/:id", DeletePermision)

	deleterole := app.Group("/deleterole")
	deleterole.Use(checkPermissionRoles)
	deleterole.Delete("/:id", DeleteRole)

	// Departments
	departmentsGroupApi := app.Group("/departments")
	departmentsGroupApi.Use(checkPermissionDepartments)
	departmentsGroupApi.Get("/", GetDepartments)
	departmentsGroupApi.Post("/", AddDepartment)
	departmentsGroupApi.Put("/:id", UpdateDepartment)
	departmentsGroupApi.Delete("/:id", DeleteDepartment)

	// Locks
	locksGroupApi := app.Group("/locks")
	locksGroupApi.Use(checkPermissionLocks)
	locksGroupApi.Get("/LockListManagement", LockListManagement)
	locksGroupApi.Put("/resetEmployeeLock/:id", ResetEmployeeLock)

	// request
	requestGroupApi := app.Group("/request") // Group routes under /rooms
	requestGroupApi.Use(checkPermissionRooms)
	requestGroupApi.Get("/", GetAllRequests)
	requestGroupApi.Put("/:id", updatebook)

	// Reports
	reportsGroupApi := app.Group("/reports")
	reportsGroupApi.Use(checkPermissionReports)
	reportsGroupApi.Get("/roomUsed", getReportRoomUsedHandler)
	reportsGroupApi.Get("/usedCanceled", getReportUsedCanceledHandler)
	reportsGroupApi.Get("/lockedEmployees", getReportLockedEmployeesHandler)

	// CronJob
	go CronQRStartJobs()
	go CronLockStartJobs()
	go CronCompleteStartJobs()

	if err := app.Listen(":5020"); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
		panic(err)
	}
}

// userContextKey is the key used to store user data in the Fiber context
const userContextKey = "user"

// extractUserFromJWT is a middleware that extracts user data from the JWT token
func extractDataFromJWT(c *fiber.Ctx) error {
	user := &Auth{}
	// Extract the token from the Fiber context (inserted by the JWT middleware)
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	user.Email = claims["Email"].(string)
	expFloat64 := claims["Exp"].(float64)
	user.ExpiredAt = time.Unix(int64(expFloat64), 0) // Convert Unix timestamp to time.Time
	// Store the user data in the Fiber context
	c.Locals(userContextKey, user)
	return c.Next()
}

func checkPermissionLocks(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	query := `SELECT employee_role_id, menu_id
                FROM permission
                WHERE employee_role_id=(SELECT role_id FROM employee WHERE email=$1)
                AND menu_id=(SELECT id FROM menu WHERE name=$2)`
	var permission Permission
	err := db.QueryRow(query, userEmail, "Lock Management").Scan(&permission.EmployeeRoleID, &permission.MenuID)
	if err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	return c.Next()
}

func checkPermissionReports(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	query := `SELECT employee_role_id, menu_id
                FROM permission
                WHERE employee_role_id=(SELECT role_id FROM employee WHERE email=$1)
                AND menu_id=(SELECT id FROM menu WHERE name=$2)`
	var permission Permission
	err := db.QueryRow(query, userEmail, "Report Management").Scan(&permission.EmployeeRoleID, &permission.MenuID)
	if err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	return c.Next()
}

func checkPermissionRooms(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email

	query := `SELECT employee_role_id, menu_id
                FROM permission
                WHERE employee_role_id=(SELECT role_id FROM employee WHERE email=$1)
                AND menu_id=(SELECT id FROM menu WHERE name=$2)`
	var permission Permission
	err := db.QueryRow(query, userEmail, "Room Management").Scan(&permission.EmployeeRoleID, &permission.MenuID)
	if err != nil {
		fmt.Println("checkPermissionRooms")
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	return c.Next()
}

func checkPermissionRoles(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	query := `SELECT employee_role_id, menu_id
                FROM permission
                WHERE employee_role_id=(SELECT role_id FROM employee WHERE email=$1)
                AND menu_id=(SELECT id FROM menu WHERE name=$2)`
	var permission Permission
	err := db.QueryRow(query, userEmail, "Role Management").Scan(&permission.EmployeeRoleID, &permission.MenuID)
	if err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	return c.Next()
}

func checkPermissionDepartments(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	userEmail := token.Email
	query := `SELECT employee_role_id, menu_id
                FROM permission
                WHERE employee_role_id=(SELECT role_id FROM employee WHERE email=$1)
                AND menu_id=(SELECT id FROM menu WHERE name=$2)`
	var permission Permission
	err := db.QueryRow(query, userEmail, "Department Management").Scan(&permission.EmployeeRoleID, &permission.MenuID)
	if err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	return c.Next()
}

func checkPermissionEmployees(c *fiber.Ctx) error {
	token := c.Locals(userContextKey).(*Auth)
	fmt.Println("checkPermissionEmployees")
	userEmail := token.Email
	query := `SELECT employee_role_id, menu_id
                FROM permission
                WHERE employee_role_id=(SELECT role_id FROM employee WHERE email=$1)
                AND menu_id=(SELECT id FROM menu WHERE name=$2)`
	var permission Permission
	err := db.QueryRow(query, userEmail, "Employee Management").Scan(&permission.EmployeeRoleID, &permission.MenuID)
	if err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	return c.Next()
}
