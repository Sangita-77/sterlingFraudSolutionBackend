# Language Detection & Localization API Documentation

## Overview
This API provides auto language detection based on user IP tracking with support for English, French, German, and Italian. Users can activate auto-detected language or manually override it.

---

## ✅ Features Implemented

- 🌍 **Auto Language Detection**: Detects user location via IP tracking
- 🔄 **Auto Switch**: Automatically sets language based on country
- 🌐 **Supported Languages**: English (en), French (fr), German (de), Italian (it)
- ✋ **Manual Override**: Users can manually change their language preference

---

## 🔌 API Endpoints

### 1. Get Available Languages
```
GET /api/languages
```

**Response:**
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

### 2. Detect User Language by IP
```
GET /api/language/detect
```

**Response:**
```json
{
  "success": true,
  "detectedLanguage": "en",
  "userIp": "192.168.1.1",
  "geoData": {
    "language": "en",
    "country": "US",
    "city": "New York",
    "timezone": "America/New_York"
  }
}
```

---

### 3. Register User (Auto Language Detection)
```
POST /api/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "language": "en",
    "userIp": "192.168.1.1",
    "detectedCountry": "US",
    "createdAt": "2026-04-11T12:00:00.000Z"
  },
  "detectedLanguage": "en"
}
```

---

### 4. Login User
```
POST /api/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userLanguage": "en"
}
```

---

### 5. Get User Language
```
GET /api/language/:userId
```

**Response:**
```json
{
  "success": true,
  "language": "en",
  "email": "john@example.com"
}
```

---

### 6. Update User Language (Manual Override)
```
PUT /api/language/:userId
```

**Request Body:**
```json
{
  "language": "fr"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Language updated successfully",
  "language": "fr"
}
```

---

## 🗺️ Country to Language Mapping

| Countries | Language |
|-----------|----------|
| 🇫🇷 FR, BE, CH, CA, LU, MC, CI, SN, BJ, BF | French (fr) |
| 🇺🇸 US, GB, 🇦🇺 AU, NZ, 🇮🇪 IE, 🇮🇳 IN, 🇸🇬 SG | English (en) |
| 🇩🇪 DE, AT, 🇨🇭 CH, LU | German (de) |
| 🇮🇹 IT, 🇨🇭 CH | Italian (it) |

---

## 🔒 How It Works

### 1. **Request Detection**
   - When a user makes any request, the `languageDetectionMiddleware` automatically:
     - Extracts user IP from `x-forwarded-for`, `x-real-ip`, or connection headers
     - Detects country based on IP using `geoip-lite`
     - Maps country to language code

### 2. **Registration Flow**
   - User registers with name, email, password
   - System detects language from IP
   - Language is automatically set (or user can override)
   - User IP and country are saved

### 3. **Manual Override**
   - User can update their language preference anytime using the PUT endpoint
   - Override is persistent in database

---

## 📦 Required Dependencies

```bash
npm install geoip-lite
```

- **geoip-lite**: Fast IP geolocation lookup

---

## 🚀 Environment Setup

Ensure your `.env` file has:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

---

## 💡 Usage Example (Frontend)

```javascript
// 1. Auto-detect language for current user
const response = await fetch('/api/language/detect');
const { detectedLanguage } = await response.json();

// 2. Register user (language auto-detected)
const registerResponse = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});
const { data, detectedLanguage } = await registerResponse.json();

// 3. User manually changes language
const updateResponse = await fetch(`/api/language/${userId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'de' })
});
```

---

## ⚠️ Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common Errors:**
- `Invalid language` - Supported languages: en, fr, de, it
- `User not found` - Invalid userId
- `User already exists` - Email already registered

---

## 📋 File Structure

```
src/
├── services/
│   ├── language.service.js       # Language detection logic
│   └── user.service.js           # User creation/login
├── controllers/
│   ├── language.controller.js    # Language endpoints
│   └── user.controller.js        # User endpoints
├── middlewares/
│   └── language.middleware.js    # IP detection middleware
├── models/
│   └── user.model.js             # User schema with language
└── routes.js                     # API routes
```

---

## 🔄 Next Steps

1. Run `npm install` to install `geoip-lite`
2. Test endpoints using Postman or curl
3. Integrate language selection in frontend UI
4. Add language-specific content/translations in your frontend
