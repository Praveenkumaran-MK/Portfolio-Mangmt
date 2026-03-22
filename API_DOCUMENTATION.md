# MongoDB CRUD API Documentation

## ✅ All APIs Implemented & Working

### Base URL

```
http://localhost:5000/api
```

---

## 🔧 API Endpoints

### 1. **Health Check**

```
GET /health
```

**Response:**

```json
{
  "status": "Server is running",
  "timestamp": "2026-03-21T20:59:27.646Z"
}
```

---

### 2. **List All Collections**

```
GET /collections
```

**Response:**

```json
[
  "Datas",
  "stats",
  "sitedatas",
  "skills",
  "achievements",
  "projects",
  "certbooks"
]
```

---

### 3. **Get Collection Schema & Metadata**

```
GET /collections/:collectionName/schema
```

**Parameters:**

- `collectionName` - Name of the collection

**Response:**

```json
{
  "name": "skills",
  "count": 12,
  "fields": ["_id", "name", "score", "tool", "__v"],
  "sampleDocument": {
    "_id": "69bed5eb86bfb3a63aa28f2f",
    "name": "React / Next.js",
    "score": 95,
    "tool": "VS Code",
    "__v": 0
  }
}
```

---

### 4. **Get Documents (Paginated)**

```
GET /collections/:collectionName/documents?page=1&limit=50
```

**Parameters:**

- `collectionName` - Name of the collection
- `page` - Page number (default: 1)
- `limit` - Documents per page (default: 50)

**Response:**

```json
{
  "collection": "skills",
  "page": 1,
  "limit": 50,
  "total": 12,
  "pages": 1,
  "documents": [
    {
      "_id": "69bed5eb86bfb3a63aa28f2f",
      "name": "React / Next.js",
      "score": 95,
      "tool": "VS Code",
      "__v": 0
    }
  ]
}
```

---

### 5. **Get Single Document**

```
GET /collections/:collectionName/documents/:id
```

**Parameters:**

- `collectionName` - Name of the collection
- `id` - Document ID (MongoDB ObjectId or custom string)

**Response:**

```json
{
  "_id": "69bed5eb86bfb3a63aa28f2f",
  "name": "React / Next.js",
  "score": 95,
  "tool": "VS Code",
  "__v": 0
}
```

**Error Response (404):**

```json
{
  "error": "Document not found"
}
```

---

### 6. **Create New Document** ✨

```
POST /collections/:collectionName/documents
```

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Python",
  "score": 88,
  "tool": "PyCharm"
}
```

**Response (201):**

```json
{
  "_id": "new_generated_id",
  "name": "Python",
  "score": 88,
  "tool": "PyCharm"
}
```

**Features:**

- ✅ Automatically generates `_id` if not provided
- ✅ Supports all field types: strings, numbers, booleans, dates, objects, arrays
- ✅ Dynamic field creation - no predefined schema required
- ✅ Web form automatically loads existing fields from collection schema

---

### 7. **Update Document**

```
PUT /collections/:collectionName/documents/:id
```

**Headers:**

```
Content-Type: application/json
```

**Body (only send fields to update):**

```json
{
  "score": 92,
  "tool": "VS Code"
}
```

**Response (200):**

```json
{
  "_id": "69bed5eb86bfb3a63aa28f2f",
  "name": "React / Next.js",
  "score": 92,
  "tool": "VS Code",
  "__v": 0
}
```

**Features:**

- ✅ Partial updates supported
- ✅ Preserves unmodified fields
- ✅ Returns updated document
- ✅ Works with any field type

---

### 8. **Delete Document**

```
DELETE /collections/:collectionName/documents/:id
```

**Response (200):**

```json
{
  "message": "Document deleted successfully"
}
```

**Features:**

- ✅ Permanently removes document
- ✅ Confirmation required in web UI
- ✅ 404 if document doesn't exist

---

## 📝 Form Features in Web Interface

When creating a new document:

1. **Auto-populate fields** - Form automatically shows fields from existing documents
2. **Field type hints** - Each field displays its type (string, number, date, etc.)
3. **Smart validation** - Type conversion based on selected field type:
   - **Text**: Stored as string
   - **Number**: Parsed as float/integer
   - **Boolean**: Converts "true", "1", "yes" to true
   - **JSON/Object**: Parsed as JSON
   - **Array**: Parsed as JSON array
   - **Date**: Converted to ISO string

4. **Add custom fields**: Click "+ Add New Field" to add fields not in existing documents
5. **Field removal**: Remove custom fields before saving
6. **Required indicators**:
   - `✱` = New document (all fields required)
   - `✎` = Editing (optional fields)

---

## 🧪 Testing APIs

### Using cURL

```bash
# Get collections
curl http://localhost:5000/api/collections

# Get documents
curl "http://localhost:5000/api/collections/skills/documents?page=1&limit=10"

# Create document
curl -X POST "http://localhost:5000/api/collections/skills/documents" \
  -H "Content-Type: application/json" \
  -d '{"name":"Go","score":75,"tool":"VS Code"}'

# Update document
curl -X PUT "http://localhost:5000/api/collections/skills/documents/[ID]" \
  -H "Content-Type: application/json" \
  -d '{"score":85}'

# Delete document
curl -X DELETE "http://localhost:5000/api/collections/skills/documents/[ID]"
```

### Using PowerShell

```powershell
# Get collections
curl.exe -s http://localhost:5000/api/collections | ConvertFrom-Json

# Create document
$body = @{
  name = "Rust"
  score = 70
  tool = "VS Code"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/collections/skills/documents" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

### Using Node.js Test Script

```bash
node test-api.js
```

---

## 🔒 Error Handling

All errors include descriptive messages:

| Status | Error                | Cause                     |
| ------ | -------------------- | ------------------------- |
| 400    | Invalid JSON         | Malformed request body    |
| 404    | Document not found   | ID doesn't exist          |
| 404    | Collection not found | Collection name wrong     |
| 500    | Server error         | Database connection issue |

---

## 📊 Data Type Support

The API handles all MongoDB data types:

| Type     | Example                | Format           |
| -------- | ---------------------- | ---------------- |
| String   | "hello"                | Text field       |
| Number   | 42, 3.14               | Number field     |
| Boolean  | true/false             | Boolean field    |
| Date     | "2026-03-21T20:59:27Z" | ISO string       |
| Object   | {id: 1}                | JSON             |
| Array    | [1, 2, 3]              | JSON array       |
| ObjectId | "69bed5eb..."          | MongoDB ObjectId |
| Null     | null                   | JSON null        |

---

## ✨ Summary

All APIs are **fully functional** and support:

✅ **CRUD Operations** - Create, Read, Update, Delete  
✅ **Pagination** - Efficient large dataset handling  
✅ **Type Safety** - Automatic type conversion  
✅ **Error Handling** - Clear error messages  
✅ **Flexible Schema** - No rigid structure required  
✅ **Form Integration** - Web UI auto-discovers fields

Ready to use! 🚀
