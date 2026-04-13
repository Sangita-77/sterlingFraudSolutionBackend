# Quick Testing Guide - Language Detection API

## Test the API endpoints using curl or Postman

### 1️⃣ Get Available Languages
```bash
curl http://localhost:5000/api/languages
```

Expected Response:
```json
{
  "success": true,
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "fr", "name": "French" },
    { "code": "de", "name": "German" },
    { "code": "it", "name": "Italian" }
  ]
}
```

---

### 2️⃣ Detect Language by IP
```bash
curl http://localhost:5000/api/language/detect
```

Expected Response:
```json
{
  "success": true,
  "detectedLanguage": "en",
  "userIp": "127.0.0.1",
  "geoData": {
    "language": "en",
    "country": "US",
    "city": "New York",
    "timezone": "America/New_York"
  }
}
```

---

### 3️⃣ Register User (Auto Language Detection)
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "language": "en",
    "userIp": "127.0.0.1",
    "detectedCountry": "US",
    "createdAt": "2026-04-11T12:00:00.000Z"
  },
  "detectedLanguage": "en"
}
```

---

### 4️⃣ Login User
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userLanguage": "en"
}
```

---

### 5️⃣ Get User Language
```bash
curl http://localhost:5000/api/language/507f1f77bcf86cd799439011
```

Replace `507f1f77bcf86cd799439011` with the actual user ID from registration.

Expected Response:
```json
{
  "success": true,
  "language": "en",
  "email": "john@example.com"
}
```

---

### 6️⃣ Update User Language (Manual Override)
```bash
curl -X PUT http://localhost:5000/api/language/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "language": "fr"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Language updated successfully",
  "language": "fr"
}
```

---

## Testing with Postman

### Import Collection (JSON format):
```json
{
  "info": {
    "name": "Language Detection API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Languages",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/languages"
      }
    },
    {
      "name": "Detect Language",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/language/detect"
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/register",
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"John Doe\", \"email\": \"john@example.com\", \"password\": \"securePassword123\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"john@example.com\", \"password\": \"securePassword123\"}"
        }
      }
    }
  ]
}
```

---

## Environment Variables to Test

For testing from different countries, you can simulate IP addresses:

Add to request headers (some proxies support this):
```
x-forwarded-for: 195.154.120.1    (France)
x-forwarded-for: 82.165.157.243   (Germany)
x-forwarded-for: 79.31.39.239     (Italy)
x-forwarded-for: 198.209.47.1     (USA)
```

---

## Run the Server

```bash
npm run dev
```

Server will start on port defined in `.env` (default: 5000)
