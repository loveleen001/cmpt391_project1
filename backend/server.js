const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

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

let pool;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server - CollegeDB');
        console.log(`📊 User: ${config.user}`);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
}

connectDB();


app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.request()
            .query('SELECT Student_ID, Name, Total_cred, Dept_name FROM Student ORDER BY Name');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sections/available', async (req, res) => {
    try {
        const { semester = 'Winter', year = 2026, search = '' } = req.query;
        
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
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching sections:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/student/:id/schedule', async (req, res) => {
  try {
    const { semester, year } = req.query;

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

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/cart/:studentId', async (req, res) => {
    try {
        const { semester, year } = req.query;
        
        const result = await pool.request()
            .input('StudentID', sql.Int, req.params.studentId)
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
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cart/add', async (req, res) => {
    const { studentId, sectionId } = req.body;
    
    try {
        const result = await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('SectionID', sql.Int, sectionId)
            .output('Success', sql.Bit)
            .output('Message', sql.VarChar(sql.MAX))
            .execute('sp_AddToShoppingCart');
        
        res.json({
            success: result.output.Success,
            message: result.output.Message
        });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

app.post('/api/cart/remove', async (req, res) => {
    const { studentId, sectionId } = req.body;
    
    try {
        const result = await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('SectionID', sql.Int, sectionId)
            .output('Success', sql.Bit)
            .output('Message', sql.VarChar(sql.MAX))
            .execute('sp_RemoveFromCart');
        
        res.json({
            success: result.output.Success,
            message: result.output.Message
        });
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

app.post('/api/register', async (req, res) => {
    const { studentId, sectionId } = req.body;
    
    try {
        const result = await pool.request()
            .input('StudentID', sql.Int, studentId)
            .input('SectionID', sql.Int, sectionId)
            .output('Success', sql.Bit)
            .output('Message', sql.VarChar(sql.MAX))
            .execute('sp_RegisterStudent');
        
        res.json({
            success: result.output.Success,
            message: result.output.Message
        });
    } catch (err) {
        console.error('Error registering:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

app.post('/api/register-all', async (req, res) => {
    const { studentId, sectionIds } = req.body;
    
    try {
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        
        for (const sectionId of sectionIds) {
            const result = await pool.request()
                .input('StudentID', sql.Int, studentId)
                .input('SectionID', sql.Int, sectionId)
                .output('Success', sql.Bit)
                .output('Message', sql.VarChar(sql.MAX))
                .execute('sp_RegisterStudent');
            
            if (result.output.Success) {
                successCount++;
            } else {
                failureCount++;
            }
            
            results.push({
                sectionId,
                success: result.output.Success,
                message: result.output.Message
            });
        }
        
        res.json({
            success: failureCount === 0,
            successCount,
            failureCount,
            results
        });
    } catch (err) {
        console.error('Error in bulk registration:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

app.get('/api/course/:courseId/prerequisites', async (req, res) => {
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
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching prerequisites:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${config.database}`);
    console.log(`💻 Server: ${config.server}`);
});