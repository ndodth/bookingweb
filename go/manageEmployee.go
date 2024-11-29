package main

import (
	"database/sql"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ManageEmployee แสดงข้อมูลพนักงานทั้งหมด
func ManageEmployee(c *fiber.Ctx) error {
	fmt.Println("ffc")
	var profiletmp sql.NullString

	rows, err := db.Query(`
		SELECT e.id, e.name, e.lname, e.nlock, e.sex, e.email, e.password, e.dept_id, e.role_id, er.name AS role_name, dp.name AS dept_name,e.profile_pic
		FROM EMPLOYEE e 
		JOIN EMPLOYEE_ROLE er ON e.role_id = er.id
		JOIN DEPARTMENT dp ON e.dept_id = dp.id
	`)
	if err != nil {
		fmt.Println("Error fetching employee data:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch employee data"})
	}
	defer rows.Close()

	var employees []map[string]interface{}
	for rows.Next() {
		var id, nlock int
		var name, lname, sex, email, password, role_name, dept_name, profile_image string
		var dept_id, role_id int

		if err := rows.Scan(&id, &name, &lname, &nlock, &sex, &email, &password, &dept_id, &role_id, &role_name, &dept_name, &profiletmp); err != nil {
			fmt.Println("Error scanning row:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to scan employee data"})
		}
		if profiletmp.Valid {
			profile_image = profiletmp.String
		} else {
			profile_image = "profile.png"
		}
		profile_image = fmt.Sprintf("/img/profile/%s", profile_image)
		fmt.Println(profile_image)

		employees = append(employees, map[string]interface{}{
			"id":            id,
			"name":          name,
			"lname":         lname,
			"nlock":         nlock,
			"sex":           sex,
			"email":         email,
			"password":      password,
			"dept_id":       dept_id,
			"role_id":       role_id,
			"role_name":     role_name,
			"dept_name":     dept_name,
			"profile_image": profile_image,
		})
	}

	if len(employees) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "No employees found"})
	}

	return c.JSON(employees)
}

// AddEmployee เพิ่มข้อมูลพนักงานใหม่
func AddEmployee(c *fiber.Ctx) error {
	fmt.Println("AddEmployee")
	type Employee struct {
		ID       int    `json:"id"`
		Name     string `json:"name"`
		Lname    string `json:"lname"`
		Nlock    int    `json:"nlock"`
		Sex      string `json:"sex"`
		Email    string `json:"email"`
		Password string `json:"password"`
		DeptID   int    `json:"dept_id"`
		RoleID   int    `json:"role_id"`
		Pic      string `json:"pic"`
	}

	var employee Employee
	employee.Name = c.FormValue("name")
	employee.Lname = c.FormValue("lname")
	employee.Nlock, _ = strconv.Atoi(c.FormValue("nlock"))
	employee.Sex = c.FormValue("sex")
	employee.Email = c.FormValue("email")
	employee.Password = c.FormValue("password")
	employee.DeptID, _ = strconv.Atoi(c.FormValue("dept_id"))
	employee.RoleID, _ = strconv.Atoi(c.FormValue("role_id"))

	// var id int

	// query := `SELECT email FROM employee WHERE email=:1 `

	// err := db.QueryRow(query, employee.Email).Scan(&id)
	// if err != sql.ErrNoRows {
	// 	return fiber.ErrConflict
	// }
	img, err := c.FormFile("img") // key image
	if err != nil && err != fiber.ErrBadRequest {
		fmt.Println(err)
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	if img != nil {
		err = c.SaveFile(img, "../booking app/public/img/profile/"+img.Filename)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString(err.Error())
		}
		employee.Pic = img.Filename // เก็บชื่อไฟล์ภาพลงใน room.Roompic
	}

	var employee_id int
	query := `SELECT max(id) from employee`
	err = db.QueryRow(query).Scan(&employee_id)
	if err != nil {
		return err
	}
	employee.ID = employee_id + 1
	// SQL Query สำหรับการเพิ่มข้อมูล
	query = `
        INSERT INTO employee (id, name, lname, nlock, sex, email, password, dept_id, role_id,profile_pic)
        VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9,:10)
    `

	_, err = db.Exec(query, employee.ID, employee.Name, employee.Lname, employee.Nlock, employee.Sex, employee.Email, employee.Password, employee.DeptID, employee.RoleID, employee.Pic)
	if err != nil {
		fmt.Println("Error inserting employee:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add employee"})
	}

	return c.JSON(fiber.Map{"message": "Employee added successfully"})
}

// UpdateEmployee แก้ไขข้อมูลพนักงาน
func UpdateEmployee(c *fiber.Ctx) error {
	fmt.Println("UpdateEmployee")

	id := c.Params("id")
	fmt.Println("UpdateEmployee")

	type Employee struct {
		Name     string `json:"name"`
		Lname    string `json:"lname"`
		Nlock    int    `json:"nlock"`
		Sex      string `json:"sex"`
		Email    string `json:"email"`
		Password string `json:"password"`
		DeptID   int    `json:"dept_id"`
		RoleID   int    `json:"role_id"`
	}

	var employee Employee
	fmt.Printf("Received Payload: %+v\n", employee)

	employee.Name = c.FormValue("name")
	employee.Lname = c.FormValue("lname")
	employee.Nlock, _ = strconv.Atoi(c.FormValue("nlock"))
	employee.Sex = c.FormValue("sex")
	employee.Email = c.FormValue("email")
	employee.Password = c.FormValue("password")
	employee.DeptID, _ = strconv.Atoi(c.FormValue("dept_id"))
	employee.RoleID, _ = strconv.Atoi(c.FormValue("role_id"))
	fmt.Printf("Received Payload: %+v\n", employee)

	_, err := db.Exec(`
		UPDATE employee SET name = :1, lname = :2, nlock = :3, sex = :4, email = :5, password = :6, dept_id = :7, role_id = :8
		WHERE id = :9
	`, employee.Name, employee.Lname, employee.Nlock, employee.Sex, employee.Email, employee.Password, employee.DeptID, employee.RoleID, id)

	if err != nil {
		fmt.Println("Error updating employee:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update employee"})
	}

	return c.JSON(fiber.Map{"message": "Employee updated successfully"})
}

// DeleteEmployee ลบข้อมูลพนักงาน
func DeleteEmployee(c *fiber.Ctx) error {
	id := c.Params("id")

	_, err := db.Exec("DELETE FROM employee WHERE id = :1", id)
	if err != nil {
		fmt.Println("Error deleting employee:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete employee"})
	}

	return c.JSON(fiber.Map{"message": "Employee deleted successfully"})
}
