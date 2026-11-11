
# Smart Learning & Online Examination Platform

A full-stack Smart Learning and Online Examination Platform built using React.js, FastAPI, and PostgreSQL with a microservices architecture.

The platform allows students to browse courses, enroll in courses, attend online assessments, and view examination results. Instructors can create and manage courses, prepare assessments, add MCQ questions, and evaluate student performance. Administrators can manage users, courses, and platform analytics.

## Project Overview

The Smart Learning Platform provides a centralized environment for online learning and examination management.

The application follows a microservices architecture where each service handles a specific business responsibility and communicates through an API Gateway.

## Features

### Authentication & User Management
- User registration and login.
- JWT-based authentication.
- Role-based access control.
- Support for Admin, Instructor, and Student roles.
- Protected API endpoints.

### Student Features
- Browse published courses.
- View course details.
- Enroll in courses.
- View enrolled courses.
- View published assessments.
- Attend online MCQ examinations.
- Submit assessment answers.
- View examination results.
- Track assessment performance.

### Instructor Features
- Create and manage courses.
- Update and delete courses.
- Publish and unpublish courses.
- View instructor-owned courses.
- Create assessments.
- Add multiple-choice questions.
- Configure assessment duration and deadlines.
- Enable or disable assessment retakes.
- Publish and unpublish assessments.
- View student assessment results.

### Admin Features
- Admin dashboard.
- Manage users.
- Manage courses.
- View platform analytics.
- Monitor platform statistics.

### Assessment Features
- Multiple-choice questions with four options.
- Correct answer configuration.
- Automatic score calculation.
- Total marks calculation.
- Assessment deadlines.
- Retake restrictions.
- Student submission history.

### Analytics Features
- Total students.
- Total courses.
- Active enrollments.
- Total assessments.
- Student submissions.
- Course statistics.
- Assessment statistics.
- Top student performance.

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Toastify

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- HTTPX

### Database
- PostgreSQL

### Architecture
- Microservices Architecture
- API Gateway
- REST APIs
- Inter-Service Communication

## Microservices Architecture

The application consists of the following services:

| Service | Port | Responsibility |
|---|---:|---|
| API Gateway | 8000 | Central API routing and request forwarding |
| Authentication Service | 8001 | Registration, login, authentication and user management |
| Course Service | 8002 | Course creation and management |
| Enrollment Service | 8003 | Student course enrollment |
| Assessment Service | 8004 | Assessments, questions, submissions and results |
| Notification Service | 8005 | Notification management |
| Analytics Service | 8006 | Platform analytics and performance statistics |

## Project Structure

```text
Smart-Learning/
│
├── backend/
│   ├── api-gateway/
│   │   └── app/
│   │
│   ├── auth-service/
│   │   └── app/
│   │
│   ├── course-service/
│   │   └── app/
│   │
│   ├── enrollment-service/
│   │   └── app/
│   │
│   ├── assessment-service/
│   │   └── app/
│   │
│   ├── notification-service/
│   │   └── app/
│   │
│   ├── analytics-service/
│   │   └── app/
│   │
│   └── .env
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   │   ├── auth/
    │   │   ├── courses/
    │   │   ├── student/
    │   │   ├── instructor/
    │   │   └── admin/
    │   ├── routes/
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── package.json
    └── vite.config.js
```

## Prerequisites

Install the following before running the application:

- Python 3.10 or higher.
- Node.js and npm.
- PostgreSQL.
- Git.
- VS Code or another code editor.

## Database Setup

Create the following PostgreSQL databases:

```sql
CREATE DATABASE smart_learning_auth;
CREATE DATABASE smart_learning_courses;
CREATE DATABASE smart_learning_enrollments;
CREATE DATABASE smart_learning_assessments;
CREATE DATABASE smart_learning_notifications;
```

Each microservice uses its own database connection.

## Backend Installation

Open the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install fastapi uvicorn sqlalchemy psycopg[binary] pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] bcrypt python-multipart httpx email-validator
```

Install any additional packages required by the individual services.

## Environment Configuration

Create a `.env` file inside the backend directory.

Example configuration:

```env
AUTH_SERVICE_URL=http://127.0.0.1:8001
COURSE_SERVICE_URL=http://127.0.0.1:8002
ENROLLMENT_SERVICE_URL=http://127.0.0.1:8003
ASSESSMENT_SERVICE_URL=http://127.0.0.1:8004
NOTIFICATION_SERVICE_URL=http://127.0.0.1:8005
ANALYTICS_SERVICE_URL=http://127.0.0.1:8006

AUTH_DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/smart_learning_auth
COURSE_DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/smart_learning_courses
ENROLLMENT_DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/smart_learning_enrollments
ASSESSMENT_DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/smart_learning_assessments
NOTIFICATION_DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/smart_learning_notifications

SECRET_KEY=YOUR_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Use the actual environment variable names expected by each service's configuration. Keep secrets and database credentials private. Do not commit `.env` to GitHub.

## Running Backend Services

Run each microservice from its respective directory in a separate terminal.

### 1. Authentication Service

```bash
cd backend/auth-service
uvicorn app.main:app --reload --port 8001
```

### 2. Course Service

```bash
cd backend/course-service
uvicorn app.main:app --reload --port 8002
```

### 3. Enrollment Service

```bash
cd backend/enrollment-service
uvicorn app.main:app --reload --port 8003
```

### 4. Assessment Service

```bash
cd backend/assessment-service
uvicorn app.main:app --reload --port 8004
```

### 5. Notification Service

```bash
cd backend/notification-service
uvicorn app.main:app --reload --port 8005
```

### 6. Analytics Service

```bash
cd backend/analytics-service
uvicorn app.main:app --reload --port 8006
```

### 7. API Gateway

```bash
cd backend/api-gateway
uvicorn app.main:app --reload --port 8000
```

## API Documentation

FastAPI provides interactive Swagger documentation.

| Service | Swagger URL |
|---|---|
| API Gateway | http://127.0.0.1:8000/docs |
| Authentication | http://127.0.0.1:8001/docs |
| Course | http://127.0.0.1:8002/docs |
| Enrollment | http://127.0.0.1:8003/docs |
| Assessment | http://127.0.0.1:8004/docs |
| Notification | http://127.0.0.1:8005/docs |
| Analytics | http://127.0.0.1:8006/docs |

## Frontend Installation

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Frontend URL:

http://localhost:5173

Make sure the Axios base URL points to the API Gateway:

```javascript
baseURL: "http://127.0.0.1:8000"
```

## Application Workflow

### Student Workflow

1. Register and log in.
2. Browse published courses.
3. View course details.
4. Enroll in a course.
5. View enrolled courses.
6. Access published assessments.
7. Attend MCQ examinations.
8. Submit answers.
9. View examination results.

### Instructor Workflow

1. Log in as an instructor.
2. Create courses.
3. Manage and publish courses.
4. Create assessments.
5. Add MCQ questions.
6. Configure duration, deadlines, and retake settings.
7. Publish assessments.
8. View student examination results.

### Admin Workflow

1. Log in as an administrator.
2. View the admin dashboard.
3. Manage users.
4. Manage courses.
5. View platform analytics.
6. Monitor student and course statistics.

## Testing

The application can be tested using FastAPI Swagger UI and the React frontend.

Recommended testing sequence:

1. Start all backend services.
2. Verify API Gateway connectivity.
3. Test user registration and login.
4. Test JWT authentication.
5. Test role-based authorization.
6. Create and publish courses.
7. Test student enrollment.
8. Create assessments.
9. Add examination questions.
10. Publish assessments.
11. Test student assessment access.
12. Submit examination answers.
13. Verify automatic score calculation.
14. View student results.
15. Test admin analytics.
16. Test frontend workflows for all roles.

## Security

- JWT-based authentication.
- Role-based access control.
- Protected API routes.
- Course ownership validation.
- Student enrollment verification before accessing assessments.
- Assessment submission validation.
- Environment-based secret management.

## Future Enhancements

- Online video course integration.
- PDF and learning material uploads.
- Assessment countdown timer and auto-submission.
- Advanced examination monitoring.
- Email and in-app notifications.
- Advanced student performance analytics.
- Course completion certificates.
- Automated test coverage using Pytest.
- Docker-based deployment.
- Cloud deployment and CI/CD integration.

