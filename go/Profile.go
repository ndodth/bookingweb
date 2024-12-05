package main

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	_ "github.com/sijms/go-ora/v2"
)

// Profile แสดงข้อมูลพนักงานที่ถูกล็อค(email string) ([]Booking, error) {
func getProfile(email string) (*EmployeeInfo, error) {
	fmt.Println("getProfile")
	var profiletmp sql.NullString
	employeeInfo := &EmployeeInfo{}
	supabaseURL := os.Getenv("SUPABASE_URL1")

	err := db.QueryRow(`SELECT e.id, e.name, e.lname, e.dept_id, er.name AS role_name, dp.name AS dept_name, e.sex, e.email, e.profile_pic
			FROM EMPLOYEE e
			JOIN EMPLOYEE_ROLE er ON e.role_id = er.id
			JOIN DEPARTMENT dp ON e.dept_id = dp.id
			WHERE e.email = $1`, email).Scan(&employeeInfo.ID, &employeeInfo.Name, &employeeInfo.Lname, &employeeInfo.DeptID, &employeeInfo.RoleName, &employeeInfo.DeptName, &employeeInfo.Sex, &employeeInfo.Email, &profiletmp)
	fmt.Println("after")
	var path_file string

	if profiletmp.Valid {
		// ถ้ามีค่า profile_pic จะเป็น URL ของภาพที่เก็บใน Supabase
		path_file = profiletmp.String
	} else {
		// ถ้าไม่มีค่ากำหนดเป็นภาพเริ่มต้น
		path_file = "profile.png"
	}
	employeeInfo.ProfileImage = supabaseURL + "/storage/v1/object/public/profile-pictures/" + path_file

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		fmt.Println("err", err)

		return nil, fmt.Errorf("failed to fetch employee data: %v", err)
	}

	return employeeInfo, nil
}

// EditProfile อัปเดตข้อมูลพนักงาน
func EditProfile(c *fiber.Ctx) error {
	// Struct for parsing the incoming request
	type UpdateEmployee struct {
		ID    int    `json:"ID"`
		Name  string `json:"Name"`
		Lname string `json:"Lname"`
		Email string `json:"Email"`
		Sex   string `json:"Sex"`
	}

	var employee UpdateEmployee

	// Parsing request body
	if err := c.BodyParser(&employee); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// Validate that the ID is provided
	if employee.ID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID is required",
		})
	}

	fmt.Printf("Updating employee: %+v\n", employee)

	// Building SQL query dynamically based on the provided fields
	query := "UPDATE employee SET "
	params := []interface{}{}
	paramCount := 1

	// Only update the fields that are provided
	if employee.Name != "" {
		query += "name = $" + fmt.Sprintf("%d", paramCount) + ", "
		params = append(params, employee.Name)
		paramCount++
	}
	if employee.Lname != "" {
		query += "lname = $" + fmt.Sprintf("%d", paramCount) + ", "
		params = append(params, employee.Lname)
		paramCount++
	}
	if employee.Email != "" {
		query += "email = $" + fmt.Sprintf("%d", paramCount) + ", "
		params = append(params, employee.Email)
		paramCount++
	}
	if employee.Sex != "" {
		query += "sex = $" + fmt.Sprintf("%d", paramCount) + ", "
		params = append(params, employee.Sex)
		paramCount++
	}

	// Remove the trailing comma and space
	query = query[:len(query)-2]
	query += " WHERE id = $" + fmt.Sprintf("%d", paramCount)
	params = append(params, employee.ID)

	// Executing the query
	result, err := db.Exec(query, params...)
	if err != nil {
		fmt.Println("Error executing query:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update employee",
		})
	}

	// Check rows affected
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No employee found with the given ID",
		})
	}

	// Respond with updated employee data
	return c.JSON(fiber.Map{
		"message": "Employee updated successfully",
		"data":    employee,
	})
}

// GetRoles ดึงข้อมูลรายการตำแหน่ง (Roles)
func GetRoles(c *fiber.Ctx) error {
	rows, err := db.Query(`SELECT id, name FROM employee_role`)
	if err != nil {
		fmt.Println("Error fetching roles:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch roles",
		})
	}
	defer rows.Close()

	var roles []map[string]interface{}
	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			fmt.Println("Error scanning role:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to scan role",
			})
		}

		roles = append(roles, map[string]interface{}{
			"id":   id,
			"name": name,
		})
	}

	return c.JSON(roles)
}

// GetDepartments ดึงข้อมูลรายการแผนก (Departments)
func GetDepartments(c *fiber.Ctx) error {
	rows, err := db.Query(`SELECT id, name FROM department`)
	if err != nil {
		fmt.Println("Error fetching departments:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch departments",
		})
	}
	defer rows.Close()

	var departments []map[string]interface{}
	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			fmt.Println("Error scanning department:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to scan department",
			})
		}

		departments = append(departments, map[string]interface{}{
			"id":   id,
			"name": name,
		})
	}

	return c.JSON(departments)
}
