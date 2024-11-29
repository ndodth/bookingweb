package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	_ "github.com/sijms/go-ora/v2"
)

func AddDepartment(c *fiber.Ctx) error {
	type Department struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}

	dept := new(Department)
	if err := c.BodyParser(dept); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	_, err := db.Exec("INSERT INTO department (id, name) VALUES (:1, :2)", dept.ID, dept.Name)
	if err != nil {
		fmt.Println("Error adding department:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to add department"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "Department added successfully"})
}

func UpdateDepartment(c *fiber.Ctx) error {
	type Department struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}

	deptID := c.Params("id") // รหัสเดิมของแถวที่จะถูกอัปเดต
	dept := new(Department)
	if err := c.BodyParser(dept); err != nil {
		fmt.Println("Error parsing JSON:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// ตรวจสอบค่า Name และ ID ใหม่ว่ามีข้อมูลครบถ้วนหรือไม่
	if dept.ID == "" || dept.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ID and Name cannot be empty"})
	}
	fmt.Println("deptID", deptID)
	fmt.Println("dept.ID", dept.ID)

	// อัปเดต ID และ Name ในแถวที่ตรงกับ deptID
	_, err := db.Exec("UPDATE employee SET dept_id = NULL WHERE dept_id = :2", deptID)
	if err != nil {
		fmt.Println("Error updating employee:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update department"})
	}
	_, err2 := db.Exec("UPDATE department SET id = :1, name = :2 WHERE id = :3", dept.ID, dept.Name, deptID)
	if err2 != nil {
		fmt.Println("Error updating department:", err2)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update department"})

	}
	_, err3 := db.Exec("UPDATE employee SET dept_id = :1 WHERE dept_id IS NULL", dept.ID)
	if err3 != nil {
		fmt.Println("Error updating employee2:", err3)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update department"})
	}

	return c.JSON(fiber.Map{"message": "Department updated successfully"})
}

// ลบแผนก
func DeleteDepartment(c *fiber.Ctx) error {
	deptID := c.Params("id")

	_, err := db.Exec("DELETE FROM department WHERE id = :1", deptID)
	if err != nil {
		fmt.Println("Error deleting department:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete department"})
	}

	return c.JSON(fiber.Map{"message": "Department deleted successfully"})
}
