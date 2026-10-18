# CodeCraftHub

CodeCraftHub is a simple personalized learning platform API where developers can track the courses they want to learn. It is a beginner-friendly REST API built with Node.js and Express, and it stores its data in a plain JSON file, so no database is needed.

## Features

- Add, list, view, update and delete courses (full CRUD)
- Each course tracks a name, description, target completion date and status
- Status is limited to `Not Started`, `In Progress` or `Completed`
- Data is saved to `courses.json`, which is created automatically if it does not exist
- Clear error messages for missing fields, invalid values and unknown courses
- Bonus endpoint with course statistics

## Installation

1. Make sure Node.js (version 14 or later) is installed.
2. Open a terminal in the project folder and run:

```bash
npm install
```

## Running the application

```bash
npm start
```

You should see:

```
CodeCraftHub API is starting...
Data will be stored in: /path/to/courses.json
API is available at: http://localhost:5000
```

To use a different port, set the `PORT` environment variable, for example `PORT=5055 npm start`.

## API documentation

Base URL: `http://localhost:5000`

Each course has these fields:

| Field | Description |
| --- | --- |
| `id` | Generated automatically, starting from 1 |
| `name` | Required |
| `description` | Required |
| `target_date` | Required, format `YYYY-MM-DD` |
| `status` | Required: `Not Started`, `In Progress` or `Completed` |
| `created_at` | Generated automatically (ISO timestamp) |

### Add a course

`POST /api/courses`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'
```

Returns `201 Created` with the new course.

### Get all courses

`GET /api/courses`

```bash
curl http://localhost:5000/api/courses
```

### Get one course

`GET /api/courses/:id`

```bash
curl http://localhost:5000/api/courses/1
```

### Update a course

`PUT /api/courses/:id` (send only the fields you want to change)

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

### Delete a course

`DELETE /api/courses/:id`

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

### Course statistics (bonus)

`GET /api/courses/stats`

```bash
curl http://localhost:5000/api/courses/stats
```

Example response:

```json
{"total": 2, "by_status": {"Not Started": 0, "In Progress": 2, "Completed": 0}}
```

### Error responses

| Status | When it happens |
| --- | --- |
| `400` | A required field is missing, `status` is invalid or `target_date` is not `YYYY-MM-DD` |
| `404` | The course id does not exist, or the route is unknown |
| `500` | `courses.json` could not be read or written |

Errors look like this:

```json
{"error": "Course with id 99 was not found"}
```

## Troubleshooting

- **`EADDRINUSE` (port already in use):** another program is using port 5000. Stop it, or start CodeCraftHub on another port with `PORT=5055 npm start`.
- **`Cannot find module 'express'`:** run `npm install` first.
- **Empty or broken `courses.json`:** delete the file and restart the server. It will be recreated.
- **`400` errors when adding a course:** check that all four fields are present, the date is `YYYY-MM-DD` and the status matches exactly (it is case sensitive).
- **`curl` complains about the JSON:** make sure you send the `Content-Type: application/json` header and use valid JSON.

## Test cases

See [TEST_CASES.md](TEST_CASES.md) for the curl-based test cases and their expected results.
