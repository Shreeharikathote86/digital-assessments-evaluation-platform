# GradeHub

GradeHub is a responsive MERN Stack-based education management system with three different login portals for students, faculty, and admin.

## Tech Stack

**Client:** React, Redux, TailwindCSS, React Bootstrap

**Server:** Node, Express

**Database:** MongoDB

## Features

### Responsive Design
- **Mobile-First Approach**: Fully responsive on all devices (mobile, tablet, desktop)
- **Adaptive Sidebar**: Collapsible sidebar for mobile devices with smooth transitions
- **Responsive Tables**: All data tables adjust for smaller screens with horizontal scrolling
- **Optimized Charts**: Data visualizations that scale and remain readable on all devices
- **Touch-Friendly UI**: Larger tap targets and simplified navigation for touch devices

### Student Features

- Internal Marks: Access to view ISA1 and ISA2 marks for courses
- External Marks: Access to view ESA marks for courses
- Course Materials: Ability to download course materials
- Notices: Access to view notices
- Timetables: Access to view their own timetables
- Password Update: Ability for students to update their passwords
- **Assignments**: Submit assignments online with file uploads (PDF/Word)
- **Quizzes**: Take online quizzes with automatic evaluation
- **Enhanced Marks Dashboard**: View consolidated marks from assignments, quizzes, and exams with visual analytics

### Faculty Features

- Student Details: Ability for faculty to view student details
- Password Update: Ability for faculty to update their own passwords
- Notices: Ability for faculty to add notices
- Materials Upload: Ability for faculty to upload course materials
- Timetable Management: Ability for faculty to manage timetables
- Exam Mark Recording: Ability for faculty to record ISA1, ISA2, and ESA exam marks
- **Assignment Management**: Create, manage, and evaluate student assignments
- **Quiz System**: Create quizzes with AI-generated questions using Gemini AI
- **Assessment Analytics**: View detailed statistics on student performance

### Admin Features

- Account Creation: Ability for admins to add new students, faculty, and admin accounts
- Account Details Modification: Ability for admins to modify the details of each account
- Subject Management: Ability for admins to add/edit subjects
- Notices Management: Ability for admins to add/edit notices

## Digital Assessment Platform

The system includes a comprehensive digital assessment and evaluation platform with the following features:

### For Faculty
- **Assignment Management**: Create assignments with due dates, file submission requirements
- **Submission Tracking**: Track which students have submitted assignments and which haven't
- **Quiz Creation**: Create multiple-choice quizzes with customizable questions
- **AI-Powered Quiz Generation**: Generate quiz questions automatically using Google's Gemini AI
- **Evaluation Tools**: Grade assignments and quizzes with detailed feedback
- **Performance Analytics**: View statistics on student performance

### For Students
- **Assignment Submission**: Submit assignments online with file uploads (PDF/Word)
- **Quiz Taking**: Take quizzes online with immediate feedback
- **Progress Tracking**: View scores and feedback for all assessments
- **Enhanced Marks Dashboard**: See consolidated marks for ISA1, ISA2, and ESA components with visual charts and statistics

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/krish-7104/College-Management-System
   ```

2. **Install dependencies:**

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Setup environment variables:**

  - I have provided .env.sample in both frontend and backend using that create .env file
  - For the Gemini AI quiz generation feature, add your Gemini API key to the backend .env file:
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4. **Run the admin seeder:**

   ```bash
   cd backend
   npm run seed
   ```

   - **Login ID:** `123456`
   - **Password:** `admin123`
  
   - Using this login to the admin account and from admin you can add new faculty, student and admins!

5. **Run the backend server:**

   ```bash
   cd backend
   npm start
   ```

6. **Run the frontend server:**

   ```bash
   cd ../frontend
   npm start
   ```

## For Any Doubt Feel Free To Contact Me 🚀

- [My Website](http://krishjotaniya.netlify.app/)
- [Linkedin](https://www.linkedin.com/in/krishjotaniya/)
- [krishjotaniya71@gmail.com](mailto:krishjotaniya71@gmail.com)

## DevOps Project

This project demonstrates Git, GitHub, Docker, CI/CD, automated testing, deployment, environment variables, monitoring, releases, and rollback.
