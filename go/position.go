package main

import (
	"database/sql"
	"fmt"

	//"database/sql"
	"github.com/gofiber/fiber/v2"
	_ "github.com/sijms/go-ora/v2"
)

// Position โครงสร้างสำหรับข้อมูลตำแหน่ง
type Position struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	RoleAccess string `json:"role_access"` // จะเก็บชื่อของเมนูที่ตำแหน่งนี้สามารถเข้าถึงได้
}
type addPosition struct {
	ID         int    `json:"id"` // เปลี่ยน ID เป็น string
	Name       string `json:"name"`
	RoleAccess []int  `json:"role_access"`
}

// ฟังก์ชัน GetPositions

func GetallPositions(c *fiber.Ctx) error {
	query := `
	SELECT er.id, er.name, m.name
	FROM employee_role er
	JOIN permission p ON er.id = p.employee_role_id
	JOIN menu m ON p.menu_id = m.id
	ORDER BY er.id, m.id
`

	rows, err := db.Query(query)
	if err != nil {
		fmt.Println("Error fetching positions:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch positions"})
	}
	return c.JSON(rows)

}
func GetPositions(c *fiber.Ctx) error {
	query := `
		SELECT er.id, er.name, m.name
		FROM employee_role er
		LEFT JOIN permission p ON er.id = p.employee_role_id
		LEFT JOIN menu m ON p.menu_id = m.id
		ORDER BY er.id, m.id
	`

	rows, err := db.Query(query)
	if err != nil {
		fmt.Println("Error fetching positions:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch positions"})
	}
	defer rows.Close()

	var positions []Position

	for rows.Next() {
		var position Position
		var roleAccess sql.NullString

		if err := rows.Scan(&position.ID, &position.Name, &roleAccess); err != nil {
			fmt.Println("Error scanning row:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to scan position data"})
		}
		if roleAccess.Valid {
			position.RoleAccess = roleAccess.String
		} else {
			position.RoleAccess = "" // หรือกำหนดค่า default อื่น ๆ
		}
		positions = append(positions, position)
	}

	return c.JSON(positions)
}

// GetAllMenus: Get all available menus
func GetAllMenus(c *fiber.Ctx) error {
	query := `SELECT id, name FROM menu`

	rows, err := db.Query(query)
	if err != nil {
		fmt.Println("Error fetching menus:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch menus"})
	}
	defer rows.Close()

	var menus []Menu
	for rows.Next() {
		var menu Menu
		if err := rows.Scan(&menu.ID, &menu.Name); err != nil {
			fmt.Println("Error scanning menu row:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to scan menu data"})
		}
		menus = append(menus, menu)
	}

	return c.JSON(menus)
}

// AddPosition ฟังก์ชันสำหรับเพิ่มตำแหน่งใหม่พร้อมสิทธิ์เมนู
func AddPosition(c *fiber.Ctx) error {
	fmt.Println("AddPosition")
	var position addPosition
	// รับค่าจาก Body
	if err := c.BodyParser(&position); err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	var position_id int
	query := `SELECT max(id) from employee_role`
	err := db.QueryRow(query).Scan(&position_id)
	if err != nil {
		fmt.Println("err bookRoom")
		return err
	}
	position.ID = position_id + 1

	// เพิ่มตำแหน่งใหม่ใน employee_role
	_, err = db.Exec("INSERT INTO employee_role (id, name) VALUES ($1, $2)", position.ID, position.Name)
	if err != nil {
		fmt.Println("Error adding position:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add position"})
	}

	// เพิ่มสิทธิ์เมนูใน permission
	for _, menuName := range position.RoleAccess {
		_, err = db.Exec(`
            INSERT INTO permission (menu_id, employee_role_id)
            VALUES ((SELECT id FROM menu WHERE id = $1), $2)`, menuName, position.ID)
		if err != nil {
			fmt.Println("Error adding permission:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add permission"})
		}
	}

	return c.JSON(fiber.Map{"message": "Position added successfully"})
}

// UpdatePosition ฟังก์ชันสำหรับแก้ไขตำแหน่ง
func UpdatePosition(c *fiber.Ctx) error {
	fmt.Println("UpdatePosition")
	id := c.Params("id") // รับ ID ของตำแหน่งที่อัปเดต
	var payload struct {
		PermissionIds []int `json:"permissionIds"` // รับค่าที่เป็นอาร์เรย์ของ Permission IDs
	}

	// ตรวจสอบการแปลง JSON
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// เริ่มต้น transaction
	tx, err := db.Begin()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to start transaction"})
	}
	defer tx.Rollback() // หากมีข้อผิดพลาด จะทำการ rollback

	// อัปเดต permissions ใหม่
	for _, permissionId := range payload.PermissionIds {
		_, err := tx.Exec(`INSERT INTO permission (employee_role_id,menu_id) VALUES ($1, $2)`, id, permissionId)
		if err != nil {
			fmt.Println("Error updating position:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update position"})
		}
	}

	// commit transaction
	if err = tx.Commit(); err != nil {
		fmt.Println("Error committing transaction:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to commit transaction"})
	}

	return c.JSON(fiber.Map{"message": "Position updated successfully"})
}

func DeleteRole(c *fiber.Ctx) error {
	id := c.Params("id")

	_, err := db.Exec("UPDATE employee SET role_id = 2 WHERE role_id = $1", id)
	if err != nil {
		fmt.Println("Error deleting permissions:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete permissions"})
	}
	_, err3 := db.Exec("DELETE FROM permission WHERE employee_role_id = $1 ", id)
	if err3 != nil {
		fmt.Println("Error permission permissions:", err3)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete permissions"})
	}
	_, err2 := db.Exec("DELETE FROM employee_role WHERE id = $1 ", id)
	if err2 != nil {
		fmt.Println("Error employee_role permissions:", err2)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete permissions"})
	}

	return c.JSON(fiber.Map{"message": "DeleteRole successfully"})

}

// DeletePermision ฟังก์ชันสำหรับลบตำแหน่ง
func DeletePermision(c *fiber.Ctx) error {
	fmt.Println("DeletePosition")
	id := c.Params("id")

	// รับค่า permissions เป็น array จาก query parameter
	permissions := c.Query("permissions")
	fmt.Println("id :", id)
	fmt.Printf("id type:%T\n", id)

	fmt.Println("Permissions :", permissions)

	_, err := db.Exec("DELETE FROM permission WHERE employee_role_id = $1 AND MENU_ID = (SELECT id FROM menu WHERE name = $2)", id, permissions)
	if err != nil {
		fmt.Println("Error deleting permissions:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete permissions"})
	}

	return c.JSON(fiber.Map{"message": "Position deleted successfully"})
}
