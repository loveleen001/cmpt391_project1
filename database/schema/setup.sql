USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'collegeapp')
BEGIN
    CREATE LOGIN collegeapp WITH PASSWORD = 'StrongPassword123!';
END
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

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'collegeapp')
BEGIN
    CREATE USER collegeapp FOR LOGIN collegeapp;
    ALTER ROLE db_owner ADD MEMBER collegeapp;
END
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

INSERT INTO Department (Dept_name, Building, Budget) VALUES 
    ('Computer Science', 'Building A', 500000),
    ('Mathematics', 'Building B', 400000),
    ('Business', 'Building C', 600000),
    ('English', 'Building D', 350000),
    ('Biology', 'Building E', 450000),
    ('Psychology', 'Building F', 375000);

INSERT INTO Instructor (Name, Salary, Dept_name) VALUES 
    ('Dr. Sarah Johnson', 95000, 'Computer Science'),
    ('Prof. Michael Chen', 92000, 'Computer Science'),
    ('Dr. Emily Rodriguez', 88000, 'Computer Science'),
    ('Dr. Robert Smith', 93000, 'Mathematics'),
    ('Prof. Jennifer Brown', 89000, 'Mathematics'),
    ('Dr. James Wilson', 98000, 'Business'),
    ('Dr. William Thompson', 85000, 'English'),
    ('Prof. Mary Martinez', 83000, 'English'),
    ('Dr. Karen Jackson', 90000, 'Biology'),
    ('Prof. Steven Harris', 88000, 'Biology'),
    ('Dr. Nancy Clark', 89000, 'Psychology'),
    ('Prof. Daniel Lewis', 87000, 'Psychology');

UPDATE Department SET Head_Instructor_ID = 1 WHERE Dept_name = 'Computer Science';
UPDATE Department SET Head_Instructor_ID = 4 WHERE Dept_name = 'Mathematics';
UPDATE Department SET Head_Instructor_ID = 6 WHERE Dept_name = 'Business';
UPDATE Department SET Head_Instructor_ID = 7 WHERE Dept_name = 'English';
UPDATE Department SET Head_Instructor_ID = 9 WHERE Dept_name = 'Biology';
UPDATE Department SET Head_Instructor_ID = 11 WHERE Dept_name = 'Psychology';

INSERT INTO Time_Slot (Day, Start_time, End_time) VALUES 
    ('Monday', '08:00:00', '09:30:00'),
    ('Monday', '10:00:00', '11:30:00'),
    ('Monday', '12:00:00', '13:30:00'),
    ('Monday', '14:00:00', '15:30:00'),
    ('Wednesday', '08:00:00', '09:30:00'),
    ('Wednesday', '10:00:00', '11:30:00'),
    ('Wednesday', '12:00:00', '13:30:00'),
    ('Wednesday', '14:00:00', '15:30:00'),
    ('Friday', '08:00:00', '09:30:00'),
    ('Friday', '10:00:00', '11:30:00'),
    ('Friday', '12:00:00', '13:30:00'),
    ('Friday', '14:00:00', '15:30:00'),
    ('Tuesday', '08:00:00', '09:30:00'),
    ('Tuesday', '10:00:00', '11:30:00'),
    ('Tuesday', '12:00:00', '13:30:00'),
    ('Tuesday', '14:00:00', '15:30:00'),
    ('Thursday', '08:00:00', '09:30:00'),
    ('Thursday', '10:00:00', '11:30:00'),
    ('Thursday', '12:00:00', '13:30:00'),
    ('Thursday', '14:00:00', '15:30:00');

INSERT INTO Classroom (Building, Room_number, Capacity) VALUES 
    ('Building A', '101', 30),
    ('Building A', '102', 35),
    ('Building A', '201', 40),
    ('Building B', '101', 30),
    ('Building B', '102', 25),
    ('Building B', '201', 35),
    ('Building C', '101', 45),
    ('Building C', '201', 40),
    ('Building D', '101', 30),
    ('Building E', '101', 35),
    ('Building F', '101', 30);

INSERT INTO Course (Course_ID, Course_name, Credits, Dept_name) VALUES 
    ('CMPT101', 'Introduction to Programming', 3, 'Computer Science'),
    ('CMPT102', 'Data Structures', 3, 'Computer Science'),
    ('CMPT201', 'Algorithms', 3, 'Computer Science'),
    ('CMPT301', 'Database Management Systems', 3, 'Computer Science'),
    ('CMPT302', 'Operating Systems', 3, 'Computer Science'),
    ('CMPT401', 'Software Engineering', 3, 'Computer Science'),
    ('CMPT402', 'Artificial Intelligence', 3, 'Computer Science'),
    ('CMPT403', 'Computer Networks', 3, 'Computer Science'),
    ('CMPT404', 'Web Development', 3, 'Computer Science'),
    ('MATH101', 'Calculus I', 3, 'Mathematics'),
    ('MATH102', 'Calculus II', 3, 'Mathematics'),
    ('MATH201', 'Linear Algebra', 3, 'Mathematics'),
    ('MATH202', 'Discrete Mathematics', 3, 'Mathematics'),
    ('MATH301', 'Statistics', 3, 'Mathematics'),
    ('BUS101', 'Introduction to Business', 3, 'Business'),
    ('BUS201', 'Marketing Fundamentals', 3, 'Business'),
    ('BUS202', 'Financial Accounting', 3, 'Business'),
    ('BUS301', 'Business Strategy', 3, 'Business'),
    ('ENGL101', 'English Composition', 3, 'English'),
    ('ENGL201', 'World Literature', 3, 'English'),
    ('ENGL301', 'Advanced Writing', 3, 'English'),
    ('BIOL101', 'General Biology', 3, 'Biology'),
    ('BIOL201', 'Cell Biology', 3, 'Biology'),
    ('BIOL301', 'Genetics', 3, 'Biology'),
    ('PSYC101', 'Introduction to Psychology', 3, 'Psychology'),
    ('PSYC201', 'Developmental Psychology', 3, 'Psychology'),
    ('PSYC301', 'Cognitive Psychology', 3, 'Psychology');

INSERT INTO Prerequisite (Course_ID, Prereq_course_ID) VALUES 
    ('CMPT102', 'CMPT101'),
    ('CMPT201', 'CMPT102'),
    ('CMPT301', 'CMPT102'),
    ('CMPT302', 'CMPT201'),
    ('CMPT401', 'CMPT301'),
    ('CMPT402', 'CMPT201'),
    ('CMPT403', 'CMPT302'),
    ('CMPT404', 'CMPT101'),
    ('MATH102', 'MATH101'),
    ('MATH201', 'MATH101'),
    ('BUS201', 'BUS101'),
    ('BUS301', 'BUS101'),
    ('BIOL201', 'BIOL101'),
    ('BIOL301', 'BIOL201'),
    ('ENGL201', 'ENGL101'),
    ('ENGL301', 'ENGL201'),
    ('PSYC201', 'PSYC101'),
    ('PSYC301', 'PSYC201');

INSERT INTO Student (Name, Total_cred, Dept_name, Instructor_ID) VALUES 
    ('Alice Thompson', 45, 'Computer Science', 1),
    ('Bob Martinez', 30, 'Computer Science', 2),
    ('Charlie Davis', 60, 'Computer Science', 1),
    ('Diana Wilson', 15, 'Computer Science', 3),
    ('Ethan Brown', 75, 'Computer Science', 2),
    ('Fiona Lee', 45, 'Computer Science', 1),
    ('George Clark', 30, 'Computer Science', 2),
    ('Hannah White', 60, 'Mathematics', 4),
    ('Ian Rodriguez', 15, 'Mathematics', 5),
    ('Julia Kim', 90, 'Business', 6);

DECLARE @i INT = 11;
WHILE @i <= 40
BEGIN
    INSERT INTO Student (Name, Total_cred, Dept_name, Instructor_ID) 
    VALUES ('Test Student ' + CAST(@i AS VARCHAR), 0, 'Computer Science', 1);
    SET @i = @i + 1;
END

INSERT INTO Section (Course_ID, Semester, Year, Instructor_ID, Time_slot_ID, Building, Room_number, Max_enrollment, Current_enrollment) VALUES 
    ('CMPT101', 'Winter', 2026, 1, 1, 'Building A', '101', 30, 0),
    ('CMPT101', 'Winter', 2026, 2, 5, 'Building A', '102', 30, 0),
    ('CMPT102', 'Winter', 2026, 2, 2, 'Building A', '102', 30, 0),
    ('CMPT102', 'Winter', 2026, 3, 6, 'Building A', '201', 35, 0),
    ('CMPT201', 'Winter', 2026, 1, 3, 'Building A', '101', 30, 0),
    ('CMPT301', 'Winter', 2026, 3, 4, 'Building A', '102', 30, 0),
    ('CMPT302', 'Winter', 2026, 2, 7, 'Building A', '201', 30, 0),
    ('CMPT401', 'Winter', 2026, 3, 8, 'Building A', '102', 30, 0),
    ('CMPT402', 'Winter', 2026, 1, 9, 'Building A', '201', 35, 0),
    ('CMPT404', 'Winter', 2026, 2, 10, 'Building A', '101', 30, 0),
    ('MATH101', 'Winter', 2026, 4, 13, 'Building B', '101', 30, 0),
    ('MATH101', 'Winter', 2026, 5, 5, 'Building B', '102', 25, 0),
    ('MATH102', 'Winter', 2026, 4, 14, 'Building B', '101', 30, 0),
    ('MATH201', 'Winter', 2026, 5, 15, 'Building B', '201', 35, 0),
    ('MATH202', 'Winter', 2026, 4, 16, 'Building B', '101', 30, 0),
    ('BUS101', 'Winter', 2026, 6, 17, 'Building C', '101', 45, 0),
    ('BUS201', 'Winter', 2026, 6, 18, 'Building C', '201', 40, 0),
    ('BUS202', 'Winter', 2026, 6, 19, 'Building C', '101', 40, 0),
    ('ENGL101', 'Winter', 2026, 7, 1, 'Building D', '101', 30, 0),
    ('ENGL201', 'Winter', 2026, 8, 6, 'Building D', '101', 30, 0),
    ('BIOL101', 'Winter', 2026, 9, 2, 'Building E', '101', 35, 0),
    ('BIOL201', 'Winter', 2026, 10, 7, 'Building E', '101', 35, 0),
    ('PSYC101', 'Winter', 2026, 11, 3, 'Building F', '101', 30, 0),
    ('PSYC201', 'Winter', 2026, 12, 8, 'Building F', '101', 30, 0),
    ('CMPT101', 'Spring', 2026, 1, 1, 'Building A', '101', 30, 0),
    ('CMPT102', 'Spring', 2026, 2, 2, 'Building A', '102', 30, 0),
    ('CMPT201', 'Spring', 2026, 1, 3, 'Building A', '101', 30, 0),
    ('MATH101', 'Spring', 2026, 4, 5, 'Building B', '101', 30, 0),
    ('BUS101', 'Spring', 2026, 6, 6, 'Building C', '101', 45, 0),
    ('CMPT301', 'Fall', 2026, 3, 4, 'Building A', '102', 30, 0),
    ('CMPT302', 'Fall', 2026, 2, 7, 'Building A', '201', 30, 0),
    ('MATH102', 'Fall', 2026, 4, 14, 'Building B', '101', 30, 0),
    ('BUS201', 'Fall', 2026, 6, 18, 'Building C', '201', 40, 0);

INSERT INTO Takes (Student_ID, Section_ID, Grade) VALUES 
    (1, 1, 'A'),
    (1, 3, 'B+'),
    (2, 1, 'B'),
    (3, 1, 'A'),
    (3, 3, 'A-');

DECLARE @j INT = 11;
WHILE @j <= 30
BEGIN
    INSERT INTO Takes (Student_ID, Section_ID, Grade)
    VALUES (@j, 1, NULL);
    SET @j = @j + 1;
END

UPDATE Section SET Current_enrollment = 30 WHERE Section_ID = 1;

PRINT 'Sample data loaded!';
GO

PRINT 'Creating materialized views...';
GO

CREATE VIEW vw_StudentSchedule
WITH SCHEMABINDING
AS
SELECT 
    t.Student_ID,
    t.Section_ID,
    s.Course_ID,
    c.Course_name,
    c.Credits,
    s.Semester,
    s.Year,
    i.Name AS Instructor_name,
    i.Instructor_ID,
    ts.Time_slot_ID,
    ts.Day,
    ts.Start_time,
    ts.End_time,
    s.Building,
    s.Room_number,
    t.Grade
FROM dbo.Takes t
INNER JOIN dbo.Section s ON t.Section_ID = s.Section_ID
INNER JOIN dbo.Course c ON s.Course_ID = c.Course_ID
LEFT JOIN dbo.Instructor i ON s.Instructor_ID = i.Instructor_ID
LEFT JOIN dbo.Time_Slot ts ON s.Time_slot_ID = ts.Time_slot_ID;
GO

CREATE UNIQUE CLUSTERED INDEX IDX_StudentSchedule 
ON vw_StudentSchedule(Student_ID, Section_ID);
GO

CREATE VIEW vw_SectionAvailability
WITH SCHEMABINDING
AS
SELECT 
    s.Section_ID,
    s.Course_ID,
    c.Course_name,
    c.Credits,
    c.Dept_name,
    s.Semester,
    s.Year,
    s.Max_enrollment,
    s.Current_enrollment,
    (s.Max_enrollment - s.Current_enrollment) AS Available_seats,
    CASE 
        WHEN s.Current_enrollment >= s.Max_enrollment THEN 0
        ELSE 1
    END AS Is_available,
    i.Name AS Instructor_name,
    i.Instructor_ID,
    ts.Time_slot_ID,
    ts.Day,
    ts.Start_time,
    ts.End_time,
    s.Building,
    s.Room_number
FROM dbo.Section s
INNER JOIN dbo.Course c ON s.Course_ID = c.Course_ID
LEFT JOIN dbo.Instructor i ON s.Instructor_ID = i.Instructor_ID
LEFT JOIN dbo.Time_Slot ts ON s.Time_slot_ID = ts.Time_slot_ID;
GO

CREATE UNIQUE CLUSTERED INDEX IDX_SectionAvailability 
ON vw_SectionAvailability(Section_ID);
GO

CREATE VIEW vw_StudentCompletedCourses
WITH SCHEMABINDING
AS
SELECT 
    t.Student_ID,
    s.Course_ID,
    c.Course_name,
    t.Grade,
    s.Semester,
    s.Year
FROM dbo.Takes t
INNER JOIN dbo.Section s ON t.Section_ID = s.Section_ID
INNER JOIN dbo.Course c ON s.Course_ID = c.Course_ID
WHERE t.Grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C');
GO

CREATE UNIQUE CLUSTERED INDEX IDX_StudentCompleted 
ON vw_StudentCompletedCourses(Student_ID, Course_ID);
GO

PRINT 'Materialized views created!';
GO

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
    
    BEGIN TRY
        DECLARE @MissingCount INT;
        
        SELECT @MissingCount = COUNT(*)
        FROM Prerequisite p
        WHERE p.Course_ID = @CourseID
        AND p.Prereq_course_ID NOT IN (
            SELECT Course_ID 
            FROM vw_StudentCompletedCourses 
            WHERE Student_ID = @StudentID
        );
        
        IF @MissingCount = 0
            SET @HasPrerequisites = 1;
        ELSE
            SET @HasPrerequisites = 0;
        
        SELECT @MissingPrereqs = STRING_AGG(Prereq_course_ID, ', ')
        FROM Prerequisite
        WHERE Course_ID = @CourseID
        AND Prereq_course_ID NOT IN (
            SELECT Course_ID 
            FROM vw_StudentCompletedCourses 
            WHERE Student_ID = @StudentID
        );
    END TRY
    BEGIN CATCH
        SET @HasPrerequisites = 0;
        SET @MissingPrereqs = 'Error checking prerequisites: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_CheckScheduleConflict
    @StudentID INT,
    @SectionID INT,
    @HasConflict BIT OUTPUT,
    @ConflictDetails VARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @Semester VARCHAR(10);
        DECLARE @Year INT;
        DECLARE @TimeSlotID INT;
        DECLARE @Day VARCHAR(10);
        DECLARE @StartTime TIME;
        DECLARE @EndTime TIME;
        
        SELECT 
            @Semester = Semester,
            @Year = Year,
            @TimeSlotID = Time_slot_ID
        FROM Section
        WHERE Section_ID = @SectionID;
        
        IF @TimeSlotID IS NULL
        BEGIN
            SET @HasConflict = 0;
            SET @ConflictDetails = '';
            RETURN;
        END
        
        SELECT @Day = Day, @StartTime = Start_time, @EndTime = End_time
        FROM Time_Slot
        WHERE Time_slot_ID = @TimeSlotID;
        
        IF EXISTS (
            SELECT 1
            FROM vw_StudentSchedule vs
            WHERE vs.Student_ID = @StudentID
            AND vs.Semester = @Semester
            AND vs.Year = @Year
            AND vs.Grade IS NULL
            AND vs.Day = @Day
            AND vs.Start_time < @EndTime
            AND vs.End_time > @StartTime
        )
        BEGIN
            SET @HasConflict = 1;
            SELECT @ConflictDetails = STRING_AGG(Course_name + ' (' + Day + ' ' + 
                CONVERT(VARCHAR(5), Start_time, 108) + '-' + 
                CONVERT(VARCHAR(5), End_time, 108) + ')', '; ')
            FROM vw_StudentSchedule
            WHERE Student_ID = @StudentID
            AND Semester = @Semester
            AND Year = @Year
            AND Grade IS NULL
            AND Day = @Day
            AND Start_time < @EndTime
            AND End_time > @StartTime;
        END
        ELSE
        BEGIN
            SET @HasConflict = 0;
            SET @ConflictDetails = '';
        END
    END TRY
    BEGIN CATCH
        SET @HasConflict = 1;
        SET @ConflictDetails = 'Error checking conflicts: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_AddToShoppingCart
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
        DECLARE @HasConflict BIT;
        DECLARE @ConflictDetails VARCHAR(MAX);
        DECLARE @Semester VARCHAR(10);
        DECLARE @Year INT;
        
        SELECT 
            @CourseID = Course_ID,
            @Semester = Semester,
            @Year = Year
        FROM Section WHERE Section_ID = @SectionID;
        
        IF EXISTS (SELECT 1 FROM Shopping_Cart 
                   WHERE Student_ID = @StudentID 
                   AND Section_ID = @SectionID 
                   AND Status = 'Pending')
        BEGIN
            SET @Success = 0;
            SET @Message = 'Section already in shopping cart.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF EXISTS (
            SELECT 1 FROM Shopping_Cart sc
            INNER JOIN Section s ON sc.Section_ID = s.Section_ID
            WHERE sc.Student_ID = @StudentID 
            AND s.Semester = @Semester
            AND s.Year = @Year
            AND s.Course_ID = @CourseID
            AND sc.Status = 'Pending'
        )
        BEGIN
            SET @Success = 0;
            SET @Message = 'You already have another section of ' + @CourseID + ' in your cart.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF EXISTS (SELECT 1 FROM Takes 
                   WHERE Student_ID = @StudentID 
                   AND Section_ID = @SectionID)
        BEGIN
            SET @Success = 0;
            SET @Message = 'Already enrolled in this section.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        IF EXISTS (
            SELECT 1 FROM Takes t
            INNER JOIN Section s ON t.Section_ID = s.Section_ID
            WHERE t.Student_ID = @StudentID 
            AND s.Course_ID = @CourseID
        )
        BEGIN
            SET @Success = 0;
            SET @Message = 'You are already enrolled in or have completed ' + @CourseID + '.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        EXEC sp_CheckPrerequisites 
            @StudentID, 
            @CourseID, 
            @HasPrereqs OUTPUT, 
            @MissingPrereqs OUTPUT;
        
        IF @HasPrereqs = 0
        BEGIN
            SET @Success = 0;
            SET @Message = 'Missing prerequisites: ' + ISNULL(@MissingPrereqs, '');
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        EXEC sp_CheckScheduleConflict 
            @StudentID, 
            @SectionID, 
            @HasConflict OUTPUT, 
            @ConflictDetails OUTPUT;
        
        IF @HasConflict = 1
        BEGIN
            SET @Success = 0;
            SET @Message = 'Time conflict with: ' + @ConflictDetails;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        INSERT INTO Shopping_Cart (Student_ID, Section_ID, Status)
        VALUES (@StudentID, @SectionID, 'Pending');
        
        SET @Success = 1;
        SET @Message = 'Added to shopping cart successfully!';
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Success = 0;
        SET @Message = 'Error: ' + ERROR_MESSAGE();
    END CATCH
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
        DECLARE @CurrentEnroll INT;
        DECLARE @MaxEnroll INT;
        DECLARE @Semester VARCHAR(10);
        DECLARE @Year INT;
        DECLARE @CurrentCourseCount INT;
        
        SELECT 
            @CurrentEnroll = Current_enrollment,
            @MaxEnroll = Max_enrollment,
            @Semester = Semester,
            @Year = Year
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
            SET @Message = 'Section is full. No seats available.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        SELECT @CurrentCourseCount = COUNT(*)
        FROM Takes t
        INNER JOIN Section s ON t.Section_ID = s.Section_ID
        WHERE t.Student_ID = @StudentID
        AND s.Semester = @Semester
        AND s.Year = @Year
        AND t.Grade IS NULL;
        
        IF @CurrentCourseCount >= 5
        BEGIN
            SET @Success = 0;
            SET @Message = 'Registration failed: maximum of 5 courses (15 credits) per term.';
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        INSERT INTO Takes (Student_ID, Section_ID, Grade)
        VALUES (@StudentID, @SectionID, NULL);
        
        UPDATE Section
        SET Current_enrollment = Current_enrollment + 1
        WHERE Section_ID = @SectionID;
        
        UPDATE Shopping_Cart
        SET Status = 'Registered'
        WHERE Student_ID = @StudentID 
        AND Section_ID = @SectionID 
        AND Status = 'Pending';
        
        INSERT INTO Registration_Log (Student_ID, Section_ID, Action, Success, Error_message)
        VALUES (@StudentID, @SectionID, 'REGISTER', 1, NULL);
        
        SET @Success = 1;
        SET @Message = 'Registration successful!';
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        INSERT INTO Registration_Log (Student_ID, Section_ID, Action, Success, Error_message)
        VALUES (@StudentID, @SectionID, 'REGISTER', 0, ERROR_MESSAGE());
        
        SET @Success = 0;
        SET @Message = 'Registration failed: ' + ERROR_MESSAGE();
    END CATCH
END;
GO


CREATE OR ALTER PROCEDURE sp_RemoveFromCart
    @StudentID INT,
    @SectionID INT,
    @Success BIT OUTPUT,
    @Message VARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Shopping_Cart 
                       WHERE Student_ID = @StudentID 
                       AND Section_ID = @SectionID 
                       AND Status = 'Pending')
        BEGIN
            SET @Success = 0;
            SET @Message = 'Section not found in shopping cart.';
            RETURN;
        END
        
        UPDATE Shopping_Cart
        SET Status = 'Removed'
        WHERE Student_ID = @StudentID 
        AND Section_ID = @SectionID 
        AND Status = 'Pending';
        
        SET @Success = 1;
        SET @Message = 'Removed from cart successfully.';
    END TRY
    BEGIN CATCH
        SET @Success = 0;
        SET @Message = 'Error: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE sp_GetShoppingCart
    @StudentID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT 
            sc.Cart_ID,
            sc.Section_ID,
            s.Course_ID,
            c.Course_name,
            c.Credits,
            s.Semester,
            s.Year,
            i.Name AS Instructor_name,
            ts.Day,
            ts.Start_time,
            ts.End_time,
            s.Building,
            s.Room_number,
            (s.Max_enrollment - s.Current_enrollment) AS Available_seats,
            sc.Date_added
        FROM Shopping_Cart sc
        INNER JOIN Section s ON sc.Section_ID = s.Section_ID
        INNER JOIN Course c ON s.Course_ID = c.Course_ID
        LEFT JOIN Instructor i ON s.Instructor_ID = i.Instructor_ID
        LEFT JOIN Time_Slot ts ON s.Time_slot_ID = ts.Time_slot_ID
        WHERE sc.Student_ID = @StudentID 
        AND sc.Status = 'Pending'
        ORDER BY sc.Date_added;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS Error;
    END CATCH
END;
GO

PRINT 'Stored procedures created!';
PRINT '========================================';
PRINT 'SETUP COMPLETE!';
PRINT '========================================';

SELECT 'Departments' AS Item, COUNT(*) AS Count FROM Department
UNION ALL
SELECT 'Instructors', COUNT(*) FROM Instructor
UNION ALL
SELECT 'Courses', COUNT(*) FROM Course
UNION ALL
SELECT 'Students', COUNT(*) FROM Student
UNION ALL
SELECT 'Sections', COUNT(*) FROM Section
UNION ALL
SELECT 'Prerequisites', COUNT(*) FROM Prerequisite;

PRINT '';
PRINT 'Section 1 (CMPT101) is FULL (30/30) - Test full class validation!';
PRINT 'Multiple semesters available: Winter 2026, Spring 2026, Fall 2026';
PRINT '15 credit limit enforced per term';
GO


