# CodeCraftHub test cases

Start the server first (`npm start`), then run these commands in a second terminal. They were run against the API and gave the results below.

| # | Test | Command | Expected result |
| --- | --- | --- | --- |
| 1 | Add a course | `curl -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'` | `201`, the course with `id` 1 and a `created_at` timestamp |
| 2 | Add a second course | `curl -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d '{"name":"Node.js Basics","description":"Learn Node and Express","target_date":"2026-03-15","status":"In Progress"}'` | `201`, the course with `id` 2 |
| 3 | Get all courses | `curl http://localhost:5000/api/courses` | `200`, an array with both courses |
| 4 | Get one course | `curl http://localhost:5000/api/courses/1` | `200`, the course with `id` 1 |
| 5 | Update the status | `curl -X PUT http://localhost:5000/api/courses/1 -H "Content-Type: application/json" -d '{"status":"In Progress"}'` | `200`, the course now has `"status":"In Progress"` |
| 6 | Statistics | `curl http://localhost:5000/api/courses/stats` | `200`, `{"total":2,"by_status":{"Not Started":0,"In Progress":2,"Completed":0}}` |
| 7 | Course not found | `curl http://localhost:5000/api/courses/99` | `404`, `{"error":"Course with id 99 was not found"}` |
| 8 | Missing fields | `curl -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d '{"name":"x"}'` | `400`, `{"error":"Missing required field(s): description, target_date, status"}` |
| 9 | Invalid status | `curl -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d '{"name":"x","description":"y","target_date":"2025-12-31","status":"Done"}'` | `400`, `{"error":"status must be one of: Not Started, In Progress, Completed"}` |
| 10 | Invalid date | `curl -X PUT http://localhost:5000/api/courses/1 -H "Content-Type: application/json" -d '{"target_date":"31-12-2025"}'` | `400`, `{"error":"target_date must be a valid date in the format YYYY-MM-DD"}` |
| 11 | Delete a course | `curl -X DELETE http://localhost:5000/api/courses/1` | `200`, `{"message":"Course deleted successfully", ...}` |
| 12 | Data persists | Stop and restart the server, then `curl http://localhost:5000/api/courses` | The remaining course is still returned, because it is stored in `courses.json` |
