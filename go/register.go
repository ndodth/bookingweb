package main

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/supabase-community/auth-go"
	"github.com/supabase-community/auth-go/types"
)

// Employee struct สำหรับรับข้อมูลจากผู้ใช้

// ฟังก์ชันสำหรับสร้างผู้ใช้ใหม่
func createEmployeeInDB(employee *Employee) error {
	// เชื่อมต่อกับ Supabase Auth
	authClient := auth.New(os.Getenv("SUPABASE_URL"), os.Getenv("SUPABASE_API_KEY"))

	signupRequest := types.SignupRequest{
		Email:    employee.Email,
		Password: employee.Password,
	}

	// สมัครสมาชิกผู้ใช้ใน Supabase
	user, err := authClient.Signup(signupRequest)
	if err != nil {
		return fmt.Errorf("failed to sign up user: %v", err)
	}

	if !user.ConfirmedAt.IsZero() {
		return fmt.Errorf("email already confirmed")
	}
	// ตรวจสอบว่าอีเมลมีในฐานข้อมูลอยู่แล้วหรือไม่
	var id int
	query := `SELECT email FROM employee WHERE email=$1`
	err = db.QueryRow(query, employee.Email).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("database query error: %v", err)
	}

	// ค้นหา ID สูงสุดในตาราง employee
	err = db.QueryRow("SELECT max(id) FROM employee").Scan(&id)
	if err != nil {
		return fmt.Errorf("failed to get max id: %v", err)
	}
	fmt.Println(employee.Sex)

	// เพิ่มผู้ใช้ใหม่ในตาราง employee
	query = `
    INSERT INTO employee (id, name, lname, nlock, sex, email, password, dept_id, role_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT id FROM employee_role WHERE name='Staff'))
	`
	_, err = db.Exec(query, id+1, employee.Name, employee.LName, 0, employee.Sex, employee.Email, employee.Password, employee.DeptID)
	if err != nil {
		return fmt.Errorf("failed to insert into database: %v", err)
	}

	return nil
}

// ฟังก์ชัน Handler สำหรับการลงทะเบียน
func registerHandler(c *fiber.Ctx) error {
	employee := new(Employee)

	// ตรวจสอบและแปลง Body ที่ส่งมาเป็น Struct
	err := c.BodyParser(&employee)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	// เรียกใช้ฟังก์ชันสร้างผู้ใช้ในฐานข้อมูล
	err = createEmployeeInDB(employee)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// ตอบกลับสำเร็จ
	return c.JSON(fiber.Map{
		"message": "Register Successfully",
	})
}
