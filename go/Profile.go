package main

import (
	"database/sql"
	"fmt"

	"github.com/gofiber/fiber/v2"
	_ "github.com/sijms/go-ora/v2"
)

// Profile แสดงข้อมูลพนักงานที่ถูกล็อค(email string) ([]Booking, error) {
func getProfile(email string) (*EmployeeInfo, error) {
	fmt.Println("getProfile")
	var profiletmp sql.NullString
	employeeInfo := &EmployeeInfo{}

	err := db.QueryRow(`SELECT e.id, e.name, e.lname, e.dept_id, er.name AS role_name, dp.name AS dept_name, e.sex, e.email, e.profile_pic
			FROM EMPLOYEE e
			JOIN EMPLOYEE_ROLE er ON e.role_id = er.id
			JOIN DEPARTMENT dp ON e.dept_id = dp.id
			WHERE e.email = :1`, email).Scan(&employeeInfo.ID, &employeeInfo.Name, &employeeInfo.Lname, &employeeInfo.DeptID, &employeeInfo.RoleName, &employeeInfo.DeptName, &employeeInfo.Sex, &employeeInfo.Email, &profiletmp)
	fmt.Println("after")
	if profiletmp.Valid {
		employeeInfo.ProfileImage = profiletmp.String
	} else {
		employeeInfo.ProfileImage = "profile.png"
	}
	employeeInfo.ProfileImage = fmt.Sprintf("/img/profile/%s", employeeInfo.ProfileImage)
	fmt.Println(employeeInfo.ProfileImage)
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

	fmt.Printf("Updating employee: %+v\n", employee)

	// SQL query to update the employee
	query := `
        UPDATE employee 
        SET name = :1, lname = :2, email = :3, sex = :4
        WHERE id = :5
    `

	// Executing the query with data from the parsed employee struct
	_, err := db.Exec(query, employee.Name, employee.Lname, employee.Email, employee.Sex, employee.ID)
	if err != nil {
		fmt.Println("Error executing query:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update employee",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Employee updated successfully",
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
