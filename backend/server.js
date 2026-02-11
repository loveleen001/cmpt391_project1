// Importing Modules.
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

// Express App Setup.
const app = express();
app.use(cors());
app.use(express.json());

// SQL Server Authentication (not Windows Auth)
const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'CollegeDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// pool Will Be The Connection To SQL Server Database.
let pool;

// Connecting To The Database.
async function connectDB() {
    try {
        // Attempt To Connect To The Database, If Sucessful log Sucess Message.
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server - CollegeDB');
        console.log(`📊 User: ${config.user}`);
    } catch (err) {
        // In The Case of An Error With sql.connect(), log Error Message and Exit Process.
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
}

// Test If The Backend Is Working.
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Fetch All Students from the Students Table.
app.get('/api/students', async (req, res) => {
    try {
        // For All Students in The Students Table Request: Student_ID, Name, Total_cred and Dept_name Columns.
        // Instructor_ID Is The Only Column In Student Table Not Selected.
        // Order The Results By The Name Column.
        const result = await pool.request()
            .query('SELECT Student_ID, Name, Total_cred, Dept_name FROM Student ORDER BY Name');
        // Send Results Back To Client
        res.json(result.recordset);
    } catch (err) {
        // In The Case of An Error Fetching Students, Return an Error Message.
        console.error('Error fetching students:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fetch All Available Course Sections from Sections Table.
// Sections Availability Is Determined Through The vw_Section Availability View
// Inside the Availability View There Is an Is_available Column with A Value of 0 or 1.
app.get('/api/sections/available', async (req, res) => {
    try {
        // Extracting Values into semester, year and search.
        // If no value provided it defaults to 'Winter', 2026 and ''.
        const { semester = 'Winter', year = 2026, search = '' } = req.query;
        
        // Based on The semester, year and search Values Provided, Select All Available Sections and Order By CourseID and SectionID
        const result = await pool.request()
            .input('Semester', sql.VarChar, semester)
            .input('Year', sql.Int, parseInt(year))
            .input('Search', sql.VarChar, `%${search}%`)
            .query(`
                SELECT 
                    Section_ID,
                    Course_ID,
                    Course_name,
                    Credits,
                    Dept_name,
                    Semester,
                    Year,
                    Max_enrollment,
                    Current_enrollment,
                    Available_seats,
                    Is_available,
                    Instructor_name,
                    Instructor_ID,
                    Time_slot_ID,
                    Day,
                    CONVERT(VARCHAR(5), Start_time, 108) AS Start_time,  -- Fixed format
                    CONVERT(VARCHAR(5), End_time, 108) AS End_time,      -- Fixed format
                    Building,
                    Room_number
                FROM vw_SectionAvailability
                WHERE Semester = @Semester 
                AND Year = @Year
                AND Is_available = 1
                AND (Course_ID LIKE @Search OR Course_name LIKE @Search)
                ORDER BY Course_ID, Section_ID
            `);
        // Send Results Back To Client
        res.json(result.recordset);
    // In The Case of an Error Return an Error Message.
    } catch (err) {
        console.error('Error fetching sections:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fetch a Students Schedule With StudentID and The Specified Semester and Year
// We are Pulling From the StudentSchedule View We've Created.
app.get('/api/student/:id/schedule', async (req, res) => {
  try {
    // Extracting semester and year Values.
    const { semester, year } = req.query;

    // Based on StudentID, Semester and Year Grab All Items Needed To Make Up a Students Schedule From The StudentSchedule View and Order by Course_ID.
    const result = await pool.request()
      .input('StudentID', sql.Int, req.params.id)
      .input('Semester', sql.VarChar, semester)
      .input('Year', sql.Int, parseInt(year))
      .query(`
        SELECT 
            Student_ID,
            Section_ID,
            Course_ID,
            Course_name,
            Credits,
            Semester,
            Year,
            Instructor_name,
            Instructor_ID,
            Time_slot_ID,
            Day,
            CONVERT(VARCHAR(5), Start_time, 108) AS Start_time,
            CONVERT(VARCHAR(5), End_time, 108) AS End_time,
            Building,
            Room_number,
            Grade
        FROM vw_StudentSchedule 
        WHERE Student_ID = @StudentID
          AND Semester = @Semester
          AND Year = @Year
        ORDER BY Course_ID
      `);

    // Send Results Back To Client
    res.json(result.recordset);
  // In The Case of an Error Return an Error Message.
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch All The Items in a Students Cart
// for a Specified Semester and Year With Their StudentID
app.get('/api/cart/:studentId', async (req, res) => {
    try {
        // Extracting semester and year Values.
        const { semester, year } = req.query;
        // Based on The StudentID Grab All Items Associated With That Student From The Shopping Cart Table.
        // To Grab More Info About The Class Besides The Section_ID, Joins Are Used To Pull Information from Other Tables.
        // Due To The Nature of Shopping Carts Chaning Often Joins Are More Realistic Instead of Creating a View.
        const result = await pool.request()
            .input('StudentID', sql.Int, req.params.studentId)
            .input('Semester', sql.VarChar, semester || 'Winter')
            .input('Year', sql.Int, parseInt(year) || 2026)
            .query(`
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
                    CONVERT(VARCHAR(5), ts.Start_time, 108) AS Start_time,  -- Fixed format
                    CONVERT(VARCHAR(5), ts.End_time, 108) AS End_time,      -- Fixed format
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
                AND s.Semester = @Semester
                AND s.Year = @Year
                AND sc.Status = 'Pending'
                ORDER BY sc.Date_added
            `);
        // Send Results Back To Client
        res.json(result.recordset);
    // In The Case of an Error Return an Error Message.
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add an Item To a Students Cart Using a Stored Procedure.
app.post('/api/cart/add', async (req, res) => {
    // Extracting studentId and sectionId Values.
    const { studentId, sectionId } = req.body;
    
    // Using The sp_AddToShoppingCart Stored Procedure, Attempt To Add The New Table Entry To Shopping Cart.
    try {
        const result = await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('SectionID', sql.Int, sectionId)
            .output('Success', sql.Bit)
            .output('Message', sql.VarChar(sql.MAX))
            .execute('sp_AddToShoppingCart');
        // Send Response Message Back To Client.
        res.json({
            success: result.output.Success,
            message: result.output.Message
        });
    // In The Case of an Error Return an Error Message.
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// Remove an Item From a Students Cart Using a Stored Procedure.
app.post('/api/cart/remove', async (req, res) => {
    // Extracting studentId and sectionId Values.
    const { studentId, sectionId } = req.body;
    // Using The sp_RemoveFromCart Stored Procedure, Attempt To Removed Specified Entry.
    try {
        const result = await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('SectionID', sql.Int, sectionId)
            .output('Success', sql.Bit)
            .output('Message', sql.VarChar(sql.MAX))
            .execute('sp_RemoveFromCart');
        // Send Response Message Back To Client.
        res.json({
            success: result.output.Success,
            message: result.output.Message
        });
    // In The Case of an Error Return an Error Message.
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// Register a Student for a Course Using a Stored Procedure.
app.post('/api/register', async (req, res) => {
    // Extracting studentId and sectionId Values.
    const { studentId, sectionId } = req.body;
    // Using The sp_RegisterStudent Stored Procedure, Attempt To Register Them for a Specified Course.
    // sp_RegisterStudent Handles All The Logic of Checking If A Student Should be Able To Register for a Course (Section Capacity, Already Enrolled, Etc.)
    try {
        const result = await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('SectionID', sql.Int, sectionId)
            .output('Success', sql.Bit)
            .output('Message', sql.VarChar(sql.MAX))
            .execute('sp_RegisterStudent');
        // Send Response Message Back To Client.
        res.json({
            success: result.output.Success,
            message: result.output.Message
        });
    // In The Case of an Error Return an Error Message.
    } catch (err) {
        console.error('Error registering:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// Bulk Registers a Student For All Classes In Cart.
// Uses Stored Procedure sp_RegisterStudent for Each Registration.
app.post('/api/register-all', async (req, res) => {
    // Extracting studentId and Multiple sectionId Values.
    const { studentId, sectionIds } = req.body;
    // Loop Through Each sectionId Trying To Register The Student for That Course.
    try {
        // Holds Result Of Each Registration Attempt.
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        // Loop Through All SectionIds
        for (const sectionId of sectionIds) {
            const result = await pool.request()
                .input('StudentID', sql.Int, studentId)
                .input('SectionID', sql.Int, sectionId)
                .output('Success', sql.Bit)
                .output('Message', sql.VarChar(sql.MAX))
                .execute('sp_RegisterStudent');
            // If Registration Sucessful Increase sucessCount by 1.
            if (result.output.Success) {
                successCount++;
            // If Registration Unsucessful Increase failureCount by 1.
            } else {
                failureCount++;
            }
            // Push Each Registration Result into results Array Created Above.
            results.push({
                sectionId,
                success: result.output.Success,
                message: result.output.Message
            });
        }
        // Send Response Message Back To Client.
        res.json({
            success: failureCount === 0,
            successCount,
            failureCount,
            results
        });
    // In The Case of an Error Return an Error Message.
    } catch (err) {
        console.error('Error in bulk registration:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

// Fetch Course Requirements for a Specific CourseID.
app.get('/api/course/:courseId/prerequisites', async (req, res) => {
    // Using CourseID, Joins Prerequisite and Course Table To Get The Prereq_course_ID and Course_name of Each Prerequisite Course, Ordered by Prereq_course_ID.
    try {
        const result = await pool.request()
            .input('CourseID', sql.VarChar, req.params.courseId)
            .query(`
                SELECT 
                    p.Prereq_course_ID,
                    c.Course_name
                FROM Prerequisite p
                INNER JOIN Course c ON p.Prereq_course_ID = c.Course_ID
                WHERE p.Course_ID = @CourseID
                ORDER BY p.Prereq_course_ID
            `);
        // Send Response Message Back To Client.
        res.json(result.recordset);
    // In The Case of an Error Return an Error Message.
    } catch (err) {
        console.error('Error fetching prerequisites:', err);
        res.status(500).json({ error: err.message });
    }
});

// FIXED: Start server only AFTER database connection is established
async function startServer() {
    // Connect to database first
    await connectDB();
    
    // THEN start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Database: ${config.database}`);
        console.log(`💻 Server: ${config.server}`);
    });
}

// Run the startup function
startServer();