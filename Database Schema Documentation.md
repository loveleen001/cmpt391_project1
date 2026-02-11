# CMPT 391 – Database Schema Documentation – Group 8

## General Information
- Database: Microsoft SQL Server (MSSQL)
- Backend: Node.js (Express)
- Frontend: React.js
- All database modifications are handled through stored procedures
- Stored procedures use TRY/CATCH with transaction rollback for data integrity
- SERIALIZABLE isolation level is used to prevent concurrent modification issues
- Audit and registration activity is logged at the database level

## Overview (Tables)
- Student
- Department
- Instructor
- Course
- Section
- Time_Slot
- Enrollment
- Prerequisite
- Shopping_Cart
- Registration_Log

## Application Flow
1. The system starts on the **Student Selection** screen.
   - When a student is selected, student information is loaded from the `Student` table and the current schedule is retrieved using the `vw_StudentSchedule` materialized view.
2. The schedule view displays registered sections, course details, instructor, time slot, and location.
   - A semester/year selector allows students to view or plan courses for different terms.
3. Available sections are retrieved using `vw_SectionAvailability`, which shows only sections with available seats for the selected semester and year.
4. Students may add sections to the **Shopping Cart**.
   - Adding a section calls `sp_AddToShoppingCart`, which validates:
     - Prerequisite completion
     - Schedule conflicts
     - Duplicate sections or courses
     - Previously completed courses
5. Valid entries are stored in `Shopping_Cart` with a **Pending** status and timestamp.
6. When the student registers, `sp_RegisterStudent` is executed inside a **SERIALIZABLE** transaction.
   - Section capacity and maximum course limits are enforced
   - Successful registrations insert records into `Enrollment`
   - `Section.Current_enrollment` is updated
   - Corresponding shopping cart entries are removed
7. All registration attempts (successful or failed) are recorded in `Registration_Log` for auditing and concurrency tracking.
8. Prerequisites are managed through the `Prerequisite` table, and completed courses are identified through `Enrollment` records with non-NULL grades.

## Stored Procedures
- `sp_AddToShoppingCart`: Validates business rules before adding a section to the shopping cart
- `sp_RemoveFromCart`: Removes a section from the student’s shopping cart
- `sp_RegisterStudent`: Performs final registration with capacity checks, transactional safety, and audit logging

## Materialized Views
- `vw_StudentSchedule`: Displays a student’s registered courses, instructors, and time slots
- `vw_SectionAvailability`: Provides real-time section availability and seat counts
- `vw_StudentCompletedCourses`: Lists completed courses with passing grades for prerequisite validation
