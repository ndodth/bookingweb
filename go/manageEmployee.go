package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/supabase-community/auth-go"
	"github.com/supabase-community/auth-go/types"
)

// ManageEmployee แสดงข้อมูลพนักงานทั้งหมด
func ManageEmployee(c *fiber.Ctx) error {
	fmt.Println("ffc")
	var profiletmp sql.NullString
	supabaseURL := os.Getenv("SUPABASE_URL1")
	rows, err := db.Query(`
		SELECT e.id, e.name, e.lname, e.nlock, e.sex, e.email, e.password, e.dept_id, e.role_id, er.name AS role_name, dp.name AS dept_name, e.profile_pic
		FROM EMPLOYEE e 
		JOIN EMPLOYEE_ROLE er ON e.role_id = er.id
		JOIN DEPARTMENT dp ON e.dept_id = dp.id
		ORDER BY e.id

	`)
	if err != nil {
		fmt.Println("Error fetching employee data:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch employee data"})
	}
	defer rows.Close()

	var employees []map[string]interface{}
	for rows.Next() {
		var id, nlock int
		var name, lname, sex, email, password, role_name, dept_name string
		var dept_id, role_id int

		if err := rows.Scan(&id, &name, &lname, &nlock, &sex, &email, &password, &dept_id, &role_id, &role_name, &dept_name, &profiletmp); err != nil {
			fmt.Println("Error scanning row:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to scan employee data"})
		}

		// ตรวจสอบว่า profile_pic มีค่าในฐานข้อมูลหรือไม่
		var profile_image string
		var path_file string

		if profiletmp.Valid {
			// ถ้ามีค่า profile_pic จะเป็น URL ของภาพที่เก็บใน Supabase
			path_file = profiletmp.String
		} else {
			// ถ้าไม่มีค่ากำหนดเป็นภาพเริ่มต้น
			path_file = "profile.png"
		}

		// สร้าง URL สำหรับแสดงภาพจาก Supabase Storage
		profile_image = supabaseURL + "/storage/v1/object/public/profile-pictures/" + path_file
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

func sanitizeFileName(fileName string) string {
	// ลบอักขระพิเศษและช่องว่าง
	reg := regexp.MustCompile(`[^\w\d\-_\.]+`)
	cleanName := reg.ReplaceAllString(fileName, "_")
	return cleanName
}

func AddEmployee(c *fiber.Ctx) error {
	// ตั้งค่า Supabase URL และ API Key

	fmt.Println("AddEmployee")

	// โครงสร้างพนักงาน

	var employee Employee
	employee.Name = c.FormValue("name")
	employee.LName = c.FormValue("lname")
	employee.Sex = c.FormValue("sex")
	employee.Email = c.FormValue("email")
	employee.Password = c.FormValue("password")
	employee.DeptID, _ = strconv.Atoi(c.FormValue("dept_id"))
	employee.RoleID, _ = strconv.Atoi(c.FormValue("role_id"))

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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err = db.Exec(query, id+1, employee.Name, employee.LName, 0, employee.Sex, employee.Email, employee.Password, employee.DeptID, employee.RoleID)
	if err != nil {
		return fmt.Errorf("failed to insert into database: %v", err)
	}

	return nil
}

// UpdateEmployee แก้ไขข้อมูลพนักงาน
func UpdateEmployee(c *fiber.Ctx) error {
	fmt.Println("UpdateEmployee")

	id := c.Params("id")

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
		UPDATE employee SET name = $1, lname = $2, nlock = $3, sex = $4, email = $5, password = $6, dept_id = $7, role_id = $8
		WHERE id = $9
	`, employee.Name, employee.Lname, employee.Nlock, employee.Sex, employee.Email, employee.Password, employee.DeptID, employee.RoleID, id)

	if err != nil {
		fmt.Println("Error updating employee:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update employee"})
	}

	return c.JSON(fiber.Map{"message": "Employee updated successfully"})
}
func image(c *fiber.Ctx) error {
	employeeID := c.Params("id")

	// ดึง URL ของไฟล์เดิมจากฐานข้อมูล
	var oldFileName sql.NullString
	err := db.QueryRow(`SELECT profile_pic FROM employee WHERE id = $1`, employeeID).Scan(&oldFileName)
	if err != nil {
		fmt.Println("Error fetching old profile_pic:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch employee data"})
	}

	// รับไฟล์รูปภาพใหม่
	img, err := c.FormFile("image")
	if err != nil {
		fmt.Println("FormFile Error:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No image file provided"})
	}

	if img.Size == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File is empty"})
	}

	file, err := img.Open()
	if err != nil {
		fmt.Println("Open file error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to open image"})
	}
	defer file.Close()

	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println("Read file error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read file"})
	}

	fileType := http.DetectContentType(fileBytes)

	supabaseURL := os.Getenv("SUPABASE_URL1")
	supabaseKey := os.Getenv("SUPABASE_SERVICE")
	originalFileName := img.Filename
	sanitizedFileName := sanitizeFileName(originalFileName)
	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), sanitizedFileName)
	filePath := fmt.Sprintf("profile-pictures/%s", fileName)

	// ตรวจสอบการอ้างอิงของรูปภาพเก่า
	if oldFileName.Valid && oldFileName.String != "" {
		var usageCount int
		err := db.QueryRow(`SELECT COUNT(*) FROM employee WHERE profile_pic = $1`, oldFileName).Scan(&usageCount)
		if err != nil {
			fmt.Println("Error checking usage count:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check usage count"})
		}

		if usageCount == 1 { // ลบไฟล์เฉพาะเมื่อไม่มีการใช้งานแล้ว
			oldFilePath := fmt.Sprintf("profile-pictures/%s", oldFileName.String)
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

	// อัปโหลดไฟล์ใหม่
	requestURL := fmt.Sprintf("%s/storage/v1/object/%s", supabaseURL, filePath)
	req, err := http.NewRequest("POST", requestURL, bytes.NewReader(fileBytes))
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload request"})
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", fileType)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to upload file"})
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to upload file to Supabase", "details": string(body)})
	}

	uploadedFileURL := fmt.Sprintf("%s/storage/v1/object/public/%s", supabaseURL, filePath)

	// อัปเดตไฟล์ใหม่ในฐานข้อมูล
	_, err = db.Exec(`UPDATE employee SET profile_pic = $1 WHERE id = $2`, fileName, employeeID)
	if err != nil {
		fmt.Println("Error updating employee:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update employee"})
	}

	return c.JSON(fiber.Map{"message": "Image updated successfully", "url": uploadedFileURL})
}

// DeleteEmployee ลบข้อมูลพนักงาน
func DeleteEmployee(c *fiber.Ctx) error {
	id := c.Params("id")
	supabaseURL := os.Getenv("SUPABASE_URL1")
	supabaseKey := os.Getenv("SUPABASE_SERVICE")

	var oldFileName sql.NullString
	var email string
	err := db.QueryRow(`SELECT profile_pic FROM employee WHERE id = $1`, id).Scan(&oldFileName)
	if err != nil {
		fmt.Println("Error fetching old profile_pic:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch employee data"})
	}
	if oldFileName.Valid && oldFileName.String != "" {
		var usageCount int
		err := db.QueryRow(`SELECT COUNT(*) FROM employee WHERE profile_pic = $1`, oldFileName).Scan(&usageCount)
		if err != nil {
			fmt.Println("Error checking usage count:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check usage count"})
		}
		if usageCount == 1 {
			oldFilePath := fmt.Sprintf("profile-pictures/%s", oldFileName.String)
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
	err = db.QueryRow(`SELECT email FROM employee WHERE id = $1`, id).Scan(&email)
	if err != nil {
		fmt.Println("Error fetching  email:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch employee data"})
	}
	fmt.Println("email", email)
	_, err = db.Exec("DELETE FROM employee WHERE id = $1", id)
	if err != nil {
		fmt.Println("Error deleting employee:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete employee"})
	}
	_, err = db.Exec("DELETE FROM auth.users WHERE email = $1", email)
	if err != nil {
		fmt.Println("Error deleting employee auth:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete in auth"})
	}

	return c.JSON(fiber.Map{"message": "Employee deleted successfully"})
}
