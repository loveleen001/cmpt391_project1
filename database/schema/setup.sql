USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'CollegeDB')
BEGIN
    ALTER DATABASE CollegeDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE CollegeDB;
END
GO

CREATE DATABASE CollegeDB;
GO

USE CollegeDB;
GO

PRINT 'Creating tables...';

CREATE TABLE Department (
    Dept_name VARCHAR(50) PRIMARY KEY,
    Building VARCHAR(50),
    Budget DECIMAL(12,2),
    Head_Instructor_ID INT NULL
);

CREATE TABLE Instructor (
    Instructor_ID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Salary DECIMAL(10,2),
    Dept_name VARCHAR(50) NOT NULL,
    CONSTRAINT FK_Instructor_Department 
        FOREIGN KEY (Dept_name) REFERENCES Department(Dept_name)
);

ALTER TABLE Department
ADD CONSTRAINT FK_Department_Head
    FOREIGN KEY (Head_Instructor_ID) REFERENCES Instructor(Instructor_ID);

CREATE TABLE Course (
    Course_ID VARCHAR(20) PRIMARY KEY,
    Course_name VARCHAR(100) NOT NULL,
    Credits INT NOT NULL CHECK (Credits > 0),
    Dept_name VARCHAR(50) NOT NULL,
    CONSTRAINT FK_Course_Department 
        FOREIGN KEY (Dept_name) REFERENCES Department(Dept_name)
);

CREATE TABLE Time_Slot (
    Time_slot_ID INT PRIMARY KEY IDENTITY(1,1),
    Day VARCHAR(10) NOT NULL,
    Start_time TIME NOT NULL,
    End_time TIME NOT NULL,
    CONSTRAINT CHK_Time_Valid CHECK (End_time > Start_time)
);

CREATE TABLE Classroom (
    Building VARCHAR(50) NOT NULL,
    Room_number VARCHAR(10) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    CONSTRAINT PK_Classroom PRIMARY KEY (Building, Room_number)
);

CREATE TABLE Student (
    Student_ID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Total_cred INT DEFAULT 0 CHECK (Total_cred >= 0),
    Dept_name VARCHAR(50) NOT NULL,
    Instructor_ID INT NULL,
    CONSTRAINT FK_Student_Department 
        FOREIGN KEY (Dept_name) REFERENCES Department(Dept_name),
    CONSTRAINT FK_Student_Instructor 
        FOREIGN KEY (Instructor_ID) REFERENCES Instructor(Instructor_ID)
);

CREATE TABLE Section (
    Section_ID INT PRIMARY KEY IDENTITY(1,1),
    Course_ID VARCHAR(20) NOT NULL,
    Semester VARCHAR(10) NOT NULL,
    Year INT NOT NULL,
    Instructor_ID INT NULL,
    Time_slot_ID INT NULL,
    Building VARCHAR(50) NULL,
    Room_number VARCHAR(10) NULL,
    Max_enrollment INT DEFAULT 30,
    Current_enrollment INT DEFAULT 0,
    CONSTRAINT FK_Section_Course 
        FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID),
    CONSTRAINT FK_Section_Instructor 
        FOREIGN KEY (Instructor_ID) REFERENCES Instructor(Instructor_ID),
    CONSTRAINT FK_Section_TimeSlot 
        FOREIGN KEY (Time_slot_ID) REFERENCES Time_Slot(Time_slot_ID),
    CONSTRAINT FK_Section_Classroom 
        FOREIGN KEY (Building, Room_number) REFERENCES Classroom(Building, Room_number)
);

CREATE TABLE Prerequisite (
    Course_ID VARCHAR(20) NOT NULL,
    Prereq_course_ID VARCHAR(20) NOT NULL,
    CONSTRAINT PK_Prerequisite PRIMARY KEY (Course_ID, Prereq_course_ID),
    CONSTRAINT FK_Prereq_Course 
        FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID),
    CONSTRAINT FK_Prereq_Prereq 
        FOREIGN KEY (Prereq_course_ID) REFERENCES Course(Course_ID)
);

CREATE TABLE Takes (
    Student_ID INT NOT NULL,
    Section_ID INT NOT NULL,
    Grade VARCHAR(2) NULL,
    Enrollment_date DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_Takes PRIMARY KEY (Student_ID, Section_ID),
    CONSTRAINT FK_Takes_Student 
        FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID),
    CONSTRAINT FK_Takes_Section 
        FOREIGN KEY (Section_ID) REFERENCES Section(Section_ID)
);

CREATE TABLE Shopping_Cart (
    Cart_ID INT PRIMARY KEY IDENTITY(1,1),
    Student_ID INT NOT NULL,
    Section_ID INT NOT NULL,
    Date_added DATETIME DEFAULT GETDATE(),
    Status VARCHAR(20) DEFAULT 'Pending',
    CONSTRAINT FK_Cart_Student 
        FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID),
    CONSTRAINT FK_Cart_Section 
        FOREIGN KEY (Section_ID) REFERENCES Section(Section_ID)
);

CREATE TABLE Registration_Log (
    Log_ID INT PRIMARY KEY IDENTITY(1,1),
    Student_ID INT NOT NULL,
    Section_ID INT NOT NULL,
    Action VARCHAR(20) NOT NULL,
    Action_date DATETIME DEFAULT GETDATE(),
    Success BIT NOT NULL,
    Error_message VARCHAR(500) NULL
);

PRINT 'Tables created!';
PRINT 'Inserting sample data...';

INSERT INTO Department (Dept_name, Building, Budget) VALUES 
    ('Computer Science', 'Building A', 500000),
    ('Mathematics', 'Building B', 400000),
    ('Business', 'Building C', 600000);

INSERT INTO Instructor (Name, Salary, Dept_name) VALUES 
    ('Dr. Sarah Johnson', 95000, 'Computer Science'),
    ('Prof. Michael Chen', 92000, 'Computer Science'),
    ('Dr. Emily Rodriguez', 88000, 'Computer Science'),
    ('Dr. Robert Smith', 93000, 'Mathematics'),
    ('Prof. Jennifer Brown', 89000, 'Mathematics'),
    ('Dr. James Wilson', 98000, 'Business');

UPDATE Department SET Head_Instructor_ID = 1 WHERE Dept_name = 'Computer Science';
UPDATE Department SET Head_Instructor_ID = 4 WHERE Dept_name = 'Mathematics';
UPDATE Department SET Head_Instructor_ID = 6 WHERE Dept_name = 'Business';

INSERT INTO Time_Slot (Day, Start_time, End_time) VALUES 
    ('Monday', '08:00:00', '09:30:00'),
    ('Monday', '10:00:00', '11:30:00'),
    ('Monday', '12:00:00', '13:30:00'),
    ('Wednesday', '08:00:00', '09:30:00'),
    ('Wednesday', '10:00:00', '11:30:00'),
    ('Friday', '08:00:00', '09:30:00');

INSERT INTO Classroom (Building, Room_number, Capacity) VALUES 
    ('Building A', '101', 30),
    ('Building A', '102', 35),
    ('Building B', '101', 30),
    ('Building C', '101', 45);

INSERT INTO Course (Course_ID, Course_name, Credits, Dept_name) VALUES 
    ('CMPT101', 'Introduction to Programming', 3, 'Computer Science'),
    ('CMPT102', 'Data Structures', 3, 'Computer Science'),
    ('CMPT201', 'Algorithms', 3, 'Computer Science'),
    ('CMPT301', 'Database Management Systems', 3, 'Computer Science'),
    ('MATH101', 'Calculus I', 3, 'Mathematics'),
    ('MATH102', 'Calculus II', 3, 'Mathematics'),
    ('BUS101', 'Introduction to Business', 3, 'Business');

INSERT INTO Prerequisite (Course_ID, Prereq_course_ID) VALUES 
    ('CMPT102', 'CMPT101'),
    ('CMPT201', 'CMPT102'),
    ('CMPT301', 'CMPT102'),
    ('MATH102', 'MATH101');

INSERT INTO Student (Name, Total_cred, Dept_name, Instructor_ID) VALUES 
    ('Alice Thompson', 45, 'Computer Science', 1),
    ('Bob Martinez', 30, 'Computer Science', 2),
    ('Charlie Davis', 60, 'Computer Science', 1),
    ('Diana Wilson', 15, 'Computer Science', 3),
    ('Ethan Brown', 75, 'Computer Science', 2);

INSERT INTO Section (Course_ID, Semester, Year, Instructor_ID, Time_slot_ID, Building, Room_number, Max_enrollment, Current_enrollment) VALUES 
    ('CMPT101', 'Winter', 2026, 1, 1, 'Building A', '101', 30, 2),
    ('CMPT102', 'Winter', 2026, 2, 2, 'Building A', '102', 30, 2),
    ('CMPT201', 'Winter', 2026, 1, 3, 'Building A', '101', 30, 0),
    ('CMPT301', 'Winter', 2026, 3, 4, 'Building A', '102', 30, 0),
    ('MATH101', 'Winter', 2026, 4, 5, 'Building B', '101', 30, 0),
    ('BUS101', 'Winter', 2026, 6, 6, 'Building C', '101', 45, 0);

INSERT INTO Takes (Student_ID, Section_ID, Grade) VALUES 
    (1, 1, 'A'),
    (1, 2, 'B+'),
    (2, 1, 'B'),
    (3, 1, 'A'),
    (3, 2, 'A-');

PRINT 'Sample data loaded!';
PRINT 'Creating stored procedures...';
GO

CREATE OR ALTER PROCEDURE sp_CheckPrerequisites
    @StudentID INT,
    @CourseID VARCHAR(20),
    @HasPrerequisites BIT OUTPUT,
    @MissingPrereqs VARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MissingCount INT;
    
    SELECT @MissingCount = COUNT(*)
    FROM Prerequisite p
    WHERE p.Course_ID = @CourseID
    AND p.Prereq_course_ID NOT IN (
        SELECT s.Course_ID 
        FROM Takes t
        INNER JOIN Section s ON t.Section_ID = s.Section_ID
        WHERE t.Student_ID = @StudentID
        AND t.Grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C')
    );
    
    IF @MissingCount = 0
        SET @HasPrerequisites = 1;
    ELSE
        SET @HasPrerequisites = 0;
    
    SELECT @MissingPrereqs = STRING_AGG(Prereq_course_ID, ', ')
    FROM Prerequisite
    WHERE Course_ID = @CourseID
    AND Prereq_course_ID NOT IN (
        SELECT s.Course_ID 
        FROM Takes t
        INNER JOIN Section s ON t.Section_ID = s.Section_ID
        WHERE t.Student_ID = @StudentID
        AND t.Grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C')
    );
END;
GO

CREATE OR ALTER PROCEDURE sp_RegisterStudent
    @StudentID INT,
    @SectionID INT,
    @Success BIT OUTPUT,
    @Message VARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DECLARE @CourseID VARCHAR(20);
        DECLARE @HasPrereqs BIT;
        DECLARE @MissingPrereqs VARCHAR(MAX);
        DECLARE @CurrentEnroll INT;
        DECLARE @MaxEnroll INT;
        
        SELECT @CourseID = Course_ID, 
               @CurrentEnroll = Current_enrollment,
               @MaxEnroll = Max_enrollment
        FROM Section WHERE Section_ID = @SectionID;
        
        IF EXISTS (SELECT 1 FROM Takes WHERE Student_ID = @StudentID AND Section_ID = @SectionID)
        BEGIN
            SET @Success = 0;
            SET @Message = 'Already enrolled in this section.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF @CurrentEnroll >= @MaxEnroll
        BEGIN
            SET @Success = 0;
            SET @Message = 'Section is full.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        EXEC sp_CheckPrerequisites @StudentID, @CourseID, @HasPrereqs OUTPUT, @MissingPrereqs OUTPUT;
        
        IF @HasPrereqs = 0
        BEGIN
            SET @Success = 0;
            SET @Message = 'Missing prerequisites: ' + ISNULL(@MissingPrereqs, '');
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        INSERT INTO Takes (Student_ID, Section_ID, Grade)
        VALUES (@StudentID, @SectionID, NULL);
        
        UPDATE Section
        SET Current_enrollment = Current_enrollment + 1
        WHERE Section_ID = @SectionID;
        
        SET @Success = 1;
        SET @Message = 'Registration successful!';
        
        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Success = 0;
        SET @Message = 'Error: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

PRINT 'Stored procedures created!';
PRINT '========================================';
PRINT 'SETUP COMPLETE!';
PRINT 'Database: CollegeDB';
PRINT 'Tables: 11';
PRINT 'Sample Students: 5';
PRINT 'Sample Courses: 7';
PRINT 'Sample Sections: 6';
PRINT '========================================';

SELECT 'Departments' AS TableName, COUNT(*) AS RecordCount FROM Department
UNION ALL
SELECT 'Instructors', COUNT(*) FROM Instructor
UNION ALL
SELECT 'Courses', COUNT(*) FROM Course
UNION ALL
SELECT 'Students', COUNT(*) FROM Student
UNION ALL
SELECT 'Sections', COUNT(*) FROM Section;
GO


-- USE CollegeDB;
-- GO

-- DECLARE @Success BIT, @Msg VARCHAR(MAX);

-- EXEC sp_RegisterStudent 
--     @StudentID = 1,
--     @SectionID = 3,
--     @Success = @Success OUTPUT,
--     @Message = @Msg OUTPUT;

-- SELECT @Success AS Success, @Msg AS Message;