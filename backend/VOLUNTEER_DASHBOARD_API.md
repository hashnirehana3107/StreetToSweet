# Volunteer Dashboard API Documentation

## Overview
This document describes the backend API endpoints for the Volunteer Dashboard system. All endpoints require authentication with a JWT token and volunteer role permissions.

## Authentication
All requests must include an Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/volunteer/dashboard
```

## Endpoints

### 1. Dashboard Overview
Get comprehensive dashboard statistics and overview data.

**GET** `/overview`

**Response:**
```json
{
  "status": "success",
  "data": {
    "volunteerInfo": {
      "_id": "volunteer_id",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "role": "volunteer"
    },
    "assignedDogs": [
      {
        "_id": "dog_id",
        "name": "Buddy",
        "breed": "Golden Retriever",
        "age": 3,
        "photo": "photo_url",
        "tasks": ["feeding", "walking"],
        "schedule": "2023-10-15T08:00:00Z",
        "lastActivity": "2023-10-15T10:30:00Z"
      }
    ],
    "statistics": {
      "totalTasks": 25,
      "completedTasks": 18,
      "pendingTasks": 7,
      "totalDistance": 45.5,
      "totalWalkTime": 120,
      "totalWalks": 15,
      "healthReports": 8,
      "blogPosts": 3,
      "volunteerHours": 62
    },
    "upcomingTasks": [...],
    "recentActivities": [...]
  }
}
```

### 2. Tasks & Care Management

#### Get Assigned Tasks
**GET** `/tasks?status=pending&dogId=dog_id`

Query Parameters:
- `status` (optional): Filter by task status (pending, completed, in_progress, cancelled)
- `dogId` (optional): Filter by specific dog

**Response:**
```json
{
  "status": "success",
  "data": {
    "tasksByDog": [
      {
        "dog": {
          "_id": "dog_id",
          "name": "Buddy",
          "breed": "Golden Retriever",
          "healthStatus": "Healthy"
        },
        "tasks": [
          {
            "_id": "task_id",
            "taskType": "feeding",
            "taskDescription": "Morning feeding for Buddy",
            "scheduledTime": "2023-10-15T08:00:00Z",
            "status": "pending",
            "priority": "high"
          }
        ]
      }
    ],
    "totalTasks": 10
  }
}
```

#### Complete Task
**PUT** `/tasks/:taskId/complete`

**Request Body:**
```json
{
  "notes": "Task completed successfully",
  "actualDuration": 30
}
```

### 3. Health Reporting

#### Submit Health Report
**POST** `/health-reports`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `dogId`: Dog ID (required)
- `eatingHabits`: normal|reduced|increased|none (required)
- `mood`: playful|quiet|anxious|aggressive|depressed|normal (required)
- `weight`: Number in kg (required)
- `observations`: Text description (required)
- `temperature`: Number in celsius (optional)
- `energyLevel`: very_low|low|normal|high|very_high (optional)
- `symptoms`: Array of symptoms (optional)
- `urgency`: low|medium|high|emergency (optional)
- `healthPhotos`: Image files (optional, max 5)

**Response:**
```json
{
  "status": "success",
  "message": "Health report submitted successfully",
  "data": {
    "healthReport": {
      "_id": "report_id",
      "dogId": {...},
      "eatingHabits": "normal",
      "mood": "playful",
      "weight": 25.5,
      "observations": "Dog is healthy and active",
      "urgency": "low",
      "photos": ["photo1.jpg", "photo2.jpg"],
      "createdAt": "2023-10-15T10:30:00Z"
    }
  }
}
```

#### Get Health Reports
**GET** `/health-reports?dogId=dog_id&page=1&limit=10`

Query Parameters:
- `dogId` (optional): Filter by specific dog
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### 4. Walking Tracker

#### Log a Walk
**POST** `/walks`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `dogId`: Dog ID (required)
- `distance`: Distance in km (required)
- `duration`: Duration in minutes (required)
- `startTime`: Start time ISO string (required)
- `endTime`: End time ISO string (required)
- `route`: Route description (optional)
- `notes`: Additional notes (optional)
- `weather`: sunny|cloudy|rainy|snowy|windy|other (optional)
- `walkQuality`: excellent|good|fair|poor (optional)
- `dogBehavior`: calm|excited|anxious|aggressive|playful|tired (optional)
- `walkPhotos`: Image files (optional, max 3)

**Response:**
```json
{
  "status": "success",
  "message": "Walk logged successfully",
  "data": {
    "walkLog": {
      "_id": "walk_id",
      "dogId": {...},
      "distance": 2.5,
      "duration": 45,
      "startTime": "2023-10-15T08:00:00Z",
      "endTime": "2023-10-15T08:45:00Z",
      "weather": "sunny",
      "walkQuality": "excellent",
      "caloriesBurned": 125,
      "photos": ["walk1.jpg"]
    }
  }
}
```

#### Get Walking Data
**GET** `/walks?dogId=dog_id&timeframe=week&page=1&limit=10`

Query Parameters:
- `dogId` (optional): Filter by specific dog
- `timeframe` (optional): all|week|month|year (default: all)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "walks": [...],
    "statistics": {
      "totalDistance": 45.5,
      "totalDuration": 300,
      "totalWalks": 15,
      "avgDistance": 3.03,
      "avgDuration": 20,
      "totalCalories": 2275,
      "dogsWalked": 5,
      "totalHours": 5.0
    },
    "pagination": {...}
  }
}
```

### 5. Events Management

#### Get Upcoming Events
**GET** `/events?status=upcoming&page=1&limit=10`

Query Parameters:
- `status` (optional): upcoming|ongoing|completed|cancelled (default: upcoming)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "events": [
      {
        "_id": "event_id",
        "title": "Vaccination Drive",
        "description": "Free vaccination for all shelter dogs",
        "date": "2023-10-20T00:00:00Z",
        "startTime": "10:00 AM",
        "endTime": "2:00 PM",
        "location": "Main Shelter",
        "eventType": "vaccination",
        "maxVolunteers": 15,
        "isRegistered": true,
        "registrationStatus": "confirmed",
        "availableSpots": 8
      }
    ],
    "pagination": {...}
  }
}
```

#### Register for Event (RSVP)
**POST** `/events/:eventId/register`

**Response:**
```json
{
  "status": "success",
  "message": "Successfully registered for event",
  "data": {
    "eventId": "event_id",
    "registeredAt": "2023-10-15T10:30:00Z"
  }
}
```

#### Cancel Event Registration
**DELETE** `/events/:eventId/register`

### 6. Blog & Stories

#### Create Blog Post
**POST** `/blog-posts`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `title`: Post title (required)
- `content`: Post content (required)
- `summary`: Brief summary (optional)
- `category`: rescue_story|adoption_success|volunteer_experience|education|event_recap|other (optional)
- `tags`: Comma-separated tags (optional)
- `relatedDogs`: Array of dog IDs (optional)
- `featuredImage`: Image file (optional)

**Response:**
```json
{
  "status": "success",
  "message": "Blog post created successfully",
  "data": {
    "blogPost": {
      "_id": "post_id",
      "title": "Buddy's Recovery Journey",
      "content": "...",
      "status": "pending",
      "category": "rescue_story",
      "readTime": 3,
      "createdAt": "2023-10-15T10:30:00Z"
    }
  }
}
```

#### Get Volunteer's Blog Posts
**GET** `/blog-posts?status=pending&page=1&limit=10`

Query Parameters:
- `status` (optional): draft|pending|published|rejected
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### Update Blog Post
**PUT** `/blog-posts/:postId`

**Content-Type:** `multipart/form-data`
(Same form data as create, only updatable if status is 'draft' or 'rejected')

#### Delete Blog Post
**DELETE** `/blog-posts/:postId`

(Only deletable if status is 'draft' or 'rejected')

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Access token required",
  "message": "Please provide a valid authentication token"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied",
  "message": "Access restricted to: volunteer, admin"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Internal server error",
  "error": "Error details"
}
```

## File Upload Guidelines

- **Health Report Photos:** Max 5 files, 5MB each
- **Walk Photos:** Max 3 files, 5MB each  
- **Blog Featured Image:** 1 file, 5MB max
- **Supported formats:** JPEG, JPG, PNG, GIF
- **Upload paths:**
  - Health reports: `/uploads/health-reports/`
  - Walk photos: `/uploads/walks/`
  - Blog images: `/uploads/blog/`

## Database Models

### VolunteerTask
- volunteerId, dogId, taskType, taskDescription
- scheduledTime, status, priority, notes
- completedAt, estimatedDuration, actualDuration

### HealthReport
- volunteerId, dogId, eatingHabits, mood, weight
- observations, photos, temperature, energyLevel
- symptoms, urgency, vetNotified, followUpRequired

### WalkingLog
- volunteerId, dogId, distance, duration
- route, notes, weather, walkQuality, dogBehavior
- startTime, endTime, photos, caloriesBurned

### Event
- title, description, date, startTime, endTime
- location, eventType, maxVolunteers, registeredVolunteers
- organizer, status, requirements, feedback

### BlogPost
- authorId, title, content, summary, status
- featuredImage, category, tags, relatedDogs
- publishedAt, viewCount, likes, comments
