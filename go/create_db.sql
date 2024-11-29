-- Building
DROP TABLE building CASCADE CONSTRAINTS;
CREATE TABLE building
(
	id INT PRIMARY KEY,
	name VARCHAR2(30)
);

DROP TABLE floor CASCADE CONSTRAINTS;
CREATE TABLE floor
(
	id INT PRIMARY KEY,
	name VARCHAR2(30)
);

DROP TABLE building_floor CASCADE CONSTRAINTS;
CREATE TABLE building_floor 
(
	id INT PRIMARY KEY,
	building_id INT,
	floor_id INT,
	FOREIGN KEY (building_id) REFERENCES building(id) ON DELETE SET NULL,
	FOREIGN KEY (floor_id) REFERENCES floor(id) ON DELETE SET NULL
);

-- Role
DROP TABLE employee_role CASCADE CONSTRAINTS;
CREATE TABLE employee_role
(
	id INT PRIMARY KEY,
	name VARCHAR2(30)
);

DROP TABLE menu CASCADE CONSTRAINTS;
CREATE TABLE menu
(
	id INT PRIMARY KEY,
	name VARCHAR2(50)
);

DROP TABLE permission CASCADE CONSTRAINTS;
CREATE TABLE permission 
(
	employee_role_id INT,
	menu_id INT,
	FOREIGN KEY (employee_role_id) REFERENCES employee_role(id) ON DELETE SET NULL,
	FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE SET NULL,
	PRIMARY KEY (employee_role_id, menu_id)
);

-- Department
DROP TABLE department CASCADE CONSTRAINTS;
CREATE TABLE department
(
	id INT PRIMARY KEY,
	name VARCHAR2(30)
);

-- Employee
DROP TABLE employee CASCADE CONSTRAINTS;
CREATE TABLE employee
(
	id INT PRIMARY KEY,
	name VARCHAR2(30),
	lname VARCHAR2(30),
	nlock NUMBER(1),
	sex VARCHAR2(10),
	email VARCHAR2(30),
	password VARCHAR2(255),
	dept_id INT,
	role_id INT,
	profile_pic VARCHAR2(100),
	FOREIGN KEY (dept_id) REFERENCES department(id) ON DELETE SET NULL,
	FOREIGN KEY (role_id) REFERENCES employee_role(id) ON DELETE SET NULL
);

-- Employee_Locked
DROP TABLE employee_locked CASCADE CONSTRAINTS;
CREATE TABLE employee_locked
(
	id INT PRIMARY KEY,
	date_locked DATE,
	employee_id INT,
	FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE SET NULL
);

-- Room
DROP TABLE room_type CASCADE CONSTRAINTS;
CREATE TABLE room_type
(
	id INT PRIMARY KEY,
	name VARCHAR2(30)
);

DROP TABLE room_status CASCADE CONSTRAINTS;
CREATE TABLE room_status
(
	id INT PRIMARY KEY,
	name VARCHAR2(30)
);

DROP TABLE room CASCADE CONSTRAINTS;
CREATE TABLE room
(
	id INT PRIMARY KEY,
	name VARCHAR2(30),
	description VARCHAR2(80),
	cap NUMBER(3),
	room_pic VARCHAR2(100),
	room_status_id INT,
	room_type_id INT,
	address_id INT,
	FOREIGN KEY (room_status_id) REFERENCES room_status(id) ON DELETE SET NULL,
	FOREIGN KEY (room_type_id) REFERENCES room_type(id) ON DELETE SET NULL,
	FOREIGN KEY (address_id) REFERENCES building_floor(id) ON DELETE SET NULL
);

-- Booking
DROP TABLE booking_status CASCADE CONSTRAINTS;
CREATE TABLE booking_status
(
	id INT PRIMARY KEY,
	name VARCHAR2(30)
);

DROP TABLE booking CASCADE CONSTRAINTS;
CREATE TABLE booking
(
	id INT PRIMARY KEY,
	booking_date DATE,
	start_time DATE,
	end_time DATE,
	qr VARCHAR2(100),
	request_message VARCHAR2(80),
	approved_id INT,
	status_id INT,
	room_id INT,
	emp_id INT,
	FOREIGN KEY (status_id) REFERENCES booking_status(id) ON DELETE SET NULL,
	FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE SET NULL,
	FOREIGN KEY (emp_id) REFERENCES employee(id) ON DELETE SET NULL
);

-- Cancel List
DROP TABLE cancel CASCADE CONSTRAINTS;
CREATE TABLE cancel
(
	id INT PRIMARY KEY,
	reason VARCHAR2(80),
	booking_id INT,
	employee_id INT,
	FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE SET NULL,
	FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE SET NULL
);