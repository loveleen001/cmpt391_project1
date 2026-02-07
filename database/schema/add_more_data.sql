USE CollegeDB;
GO

-- Add more departments
INSERT INTO Department (Dept_name, Building, Budget) VALUES 
    ('English', 'Building D', 350000),
    ('Biology', 'Building E', 450000),
    ('Psychology', 'Building F', 375000);

-- Add more instructors
INSERT INTO Instructor (Name, Salary, Dept_name) VALUES 
    ('Dr. William Thompson', 85000, 'English'),
    ('Prof. Mary Martinez', 83000, 'English'),
    ('Dr. Karen Jackson', 90000, 'Biology'),
    ('Prof. Steven Harris', 88000, 'Biology'),
    ('Dr. Nancy Clark', 89000, 'Psychology'),
    ('Prof. Daniel Lewis', 87000, 'Psychology');

-- Update department heads
UPDATE Department SET Head_Instructor_ID = 7 WHERE Dept_name = 'English';
UPDATE Department SET Head_Instructor_ID = 9 WHERE Dept_name = 'Biology';
UPDATE Department SET Head_Instructor_ID = 11 WHERE Dept_name = 'Psychology';

-- Add more courses
INSERT INTO Course (Course_ID, Course_name, Credits, Dept_name) VALUES 
    -- More CS courses
    ('CMPT302', 'Operating Systems', 3, 'Computer Science'),
    ('CMPT401', 'Software Engineering', 3, 'Computer Science'),
    ('CMPT402', 'Artificial Intelligence', 3, 'Computer Science'),
    ('CMPT403', 'Computer Networks', 3, 'Computer Science'),
    ('CMPT404', 'Web Development', 3, 'Computer Science'),
    
    -- More Math courses
    ('MATH201', 'Linear Algebra', 3, 'Mathematics'),
    ('MATH202', 'Discrete Mathematics', 3, 'Mathematics'),
    ('MATH301', 'Statistics', 3, 'Mathematics'),
    
    -- Business courses
    ('BUS201', 'Marketing Fundamentals', 3, 'Business'),
    ('BUS202', 'Financial Accounting', 3, 'Business'),
    ('BUS301', 'Business Strategy', 3, 'Business'),
    
    -- English courses
    ('ENGL101', 'English Composition', 3, 'English'),
    ('ENGL201', 'World Literature', 3, 'English'),
    ('ENGL301', 'Advanced Writing', 3, 'English'),
    
    -- Biology courses
    ('BIOL101', 'General Biology', 4, 'Biology'),
    ('BIOL201', 'Cell Biology', 4, 'Biology'),
    ('BIOL301', 'Genetics', 4, 'Biology'),
    
    -- Psychology courses
    ('PSYC101', 'Introduction to Psychology', 3, 'Psychology'),
    ('PSYC201', 'Developmental Psychology', 3, 'Psychology'),
    ('PSYC301', 'Cognitive Psychology', 3, 'Psychology');

-- Add more prerequisites
INSERT INTO Prerequisite (Course_ID, Prereq_course_ID) VALUES 
    ('CMPT302', 'CMPT201'),
    ('CMPT401', 'CMPT301'),
    ('CMPT402', 'CMPT201'),
    ('CMPT403', 'CMPT302'),
    ('CMPT404', 'CMPT101'),
    ('MATH201', 'MATH101'),
    ('BUS201', 'BUS101'),
    ('BUS301', 'BUS101'),
    ('BIOL201', 'BIOL101'),
    ('BIOL301', 'BIOL201'),
    ('ENGL201', 'ENGL101'),
    ('ENGL301', 'ENGL201'),
    ('PSYC201', 'PSYC101'),
    ('PSYC301', 'PSYC201');

-- Add more time slots
INSERT INTO Time_Slot (Day, Start_time, End_time) VALUES 
    ('Tuesday', '08:00:00', '09:30:00'),
    ('Tuesday', '10:00:00', '11:30:00'),
    ('Tuesday', '12:00:00', '13:30:00'),
    ('Tuesday', '14:00:00', '15:30:00'),
    ('Thursday', '08:00:00', '09:30:00'),
    ('Thursday', '10:00:00', '11:30:00'),
    ('Thursday', '12:00:00', '13:30:00'),
    ('Thursday', '14:00:00', '15:30:00');

-- Add more classrooms
INSERT INTO Classroom (Building, Room_number, Capacity) VALUES 
    ('Building A', '201', 40),
    ('Building B', '102', 25),
    ('Building B', '201', 35),
    ('Building C', '201', 40),
    ('Building D', '101', 30),
    ('Building E', '101', 35),
    ('Building F', '101', 30);

-- Add more sections (Winter 2026)
INSERT INTO Section (Course_ID, Semester, Year, Instructor_ID, Time_slot_ID, Building, Room_number, Max_enrollment, Current_enrollment) VALUES 
    -- More CS sections
    ('CMPT302', 'Winter', 2026, 2, 7, 'Building A', '102', 30, 0),
    ('CMPT401', 'Winter', 2026, 3, 8, 'Building A', '201', 30, 0),
    ('CMPT402', 'Winter', 2026, 1, 9, 'Building A', '102', 35, 0),
    ('CMPT404', 'Winter', 2026, 2, 10, 'Building A', '101', 30, 0),
    
    -- Math sections
    ('MATH201', 'Winter', 2026, 4, 11, 'Building B', '101', 30, 0),
    ('MATH202', 'Winter', 2026, 5, 12, 'Building B', '102', 25, 0),
    
    -- Business sections
    ('BUS201', 'Winter', 2026, 6, 13, 'Building C', '101', 45, 0),
    ('BUS202', 'Winter', 2026, 6, 14, 'Building C', '201', 40, 0),
    
    -- Other departments
    ('ENGL101', 'Winter', 2026, 7, 1, 'Building D', '101', 30, 0),
    ('ENGL201', 'Winter', 2026, 8, 6, 'Building D', '101', 30, 0),
    ('BIOL101', 'Winter', 2026, 9, 2, 'Building E', '101', 35, 0),
    ('PSYC101', 'Winter', 2026, 11, 3, 'Building F', '101', 30, 0);

-- Add more students
INSERT INTO Student (Name, Total_cred, Dept_name, Instructor_ID) VALUES 
    ('Fiona Lee', 45, 'Computer Science', 1),
    ('George Clark', 30, 'Computer Science', 2),
    ('Hannah White', 60, 'Computer Science', 1),
    ('Ian Rodriguez', 15, 'Mathematics', 4),
    ('Julia Kim', 90, 'Business', 6);

PRINT 'Additional data loaded successfully!';
SELECT 'Courses' AS Item, COUNT(*) AS Count FROM Course
UNION ALL
SELECT 'Sections', COUNT(*) FROM Section
UNION ALL
SELECT 'Students', COUNT(*) FROM Student;
GO