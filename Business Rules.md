# Business Rules Document
**CMPT 391 – Winter 2026 – Group 8**

## 1. Department & Instructor Rules
1. **Each department must have exactly one head instructor.**  
2. **An instructor can belong to only one department.**  
3. **A student can belong to only one department.**  
4. **An instructor can teach multiple courses.**  
5. **A department head must be an instructor from that same department.**

## 2. Course & Section Rules
1. Each course is offered by exactly one department.  
2. Each course must have a positive number of credits (minimum 1).  
3. A course can have multiple sections in different semesters/years.  
4. Each section is taught by only one instructor.  
5. Each section can have multiple prerequisite courses defined.  
6. Each section is scheduled for exactly one time slot.  

## 3. Student Enrollment Rules
1. Students can enroll in multiple courses per term.  
2. **Maximum Course Limit:** Students cannot enroll in more than 5 courses (15 credits) per term.  
3. Students cannot enroll in the same section twice.  
4. Students cannot enroll in multiple sections of the same course simultaneously.  
5. Students cannot re-enroll in a course they have already completed (regardless of section).  
   > *Future implementations could allow this perhaps with dean’s permission number.*

## 4. Prerequisite Rules
1. Students must complete all prerequisite courses before enrolling in a course that requires them.  
2. **Minimum Passing Grade:** Only grades of C or higher satisfy prerequisite requirements (A, A-, B+, B, B-, C+, C).  
3. In-progress courses (NULL grade) do not satisfy prerequisites.  
4. Failed courses (D, F) do not satisfy prerequisites.  

## 5. Schedule Conflict Rules
1. Students cannot enroll in sections with overlapping time slots.  
2. Schedule conflicts are checked only for the same semester and year.  
3. Completed courses (with grades) do not cause schedule conflicts.  
4. Conflicts are detected based on day and time overlap (e.g., Monday 8:00-9:30 conflicts with Monday 9:00-10:30).  

## 6. Section Capacity Rules
1. Each section has a maximum enrollment capacity.  
2. **Capacity Validation:** Students cannot register for sections that have reached maximum capacity.  
3. Current enrollment count is automatically incremented upon successful registration.  
4. Section capacity is enforced only during registration (not when adding to shopping cart)  
   > *to allow for future waitlist implementations.*

## 7. Shopping Cart Rules
1. Students can add courses to a shopping cart before registering.  
2. **Cart Validation when adding to Cart:**
   - Section is not already in the cart  
   - No other section of the same course is in cart  
   - Student is not already enrolled in that section  
   - Student has not completed that course  
   - All prerequisites are met  
   - No schedule conflicts exist  
3. Students can remove courses from their shopping cart at any time.  
4. Cart items maintain a "Pending" status until registered or removed.  

## 8. Registration Rules
1. **Registration Validation:** The following checks are performed during registration:
   - Section has available seats  
   - Student has not exceeded the 5-course limit for that term  
2. Prerequisites and schedule conflicts are NOT re-checked during registration (they are validated at cart addition).  
3. All registration attempts (success and failure) are logged in the `Registration_Log` table.  
4. Registration uses **SERIALIZABLE transaction isolation** to prevent race conditions.  

## 10. Data Integrity Rules
1. **Rollbacks/Transactions:** All database modifications use transactions with rollbacks on error.  
2. **Constraints:** All foreign key relationships are enforced through database constraints.  
3. **Audit Log:** All registration attempts are logged with timestamp, student, section, success status, and error messages.  
4. **Concurrency:** SERIALIZABLE isolation level prevents double-booking and race conditions during registration.  

## 11. Grade & Credit Rules
1. Enrolled students have a NULL grade until the course is completed.  
2. Only completed courses (non-NULL grades) contribute to student's total credits.  
3. Valid grades are: A, A-, B+, B, B-, C+, C, D, F.  
4. Student total credits must be non-negative (≥ 0).  

## 12. Views
1. **Materialized Views:** Indexed views are used for frequently queried data:
   - `vw_StudentSchedule` - Student enrollment and course details  
   - `vw_SectionAvailability` - Real-time seat availability  
   - `vw_StudentCompletedCourses` - Passing grades only (for prerequisites)  
2. Available seats are calculated as:  Max_enrollment - Current_enrollment
3: Sections are marked unavailable when Current_enrollment >= Max_enrollment
