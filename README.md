# MongoDB CRUD Web Interface

A simple, modern web interface for managing MongoDB collections and documents with full CRUD operations.

## Features

- 📊 **Browse Collections**: View all collections in your MongoDB database
- 🔍 **View Documents**: Display documents with pagination
- ➕ **Create Documents**: Add new documents to any collection
- ✏️ **Edit Documents**: Modify existing document fields
- 🗑️ **Delete Documents**: Remove documents from collections
- 🎨 **Modern UI**: Clean, responsive interface with gradient design
- 📱 **Mobile Friendly**: Works on desktop and mobile devices
- ⚡ **Fast API**: Express.js backend with REST endpoints

## Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB Atlas account with connection string

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment**

   Create/update `.env` file:

   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   NODE_ENV=development
   ```

3. **Start Server**

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

4. **Access Dashboard**

   Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

## Project Structure

```
.
├── server.js              # Express server & API routes
├── package.json           # Dependencies
├── .env                   # Environment variables
├── public/
│   └── index.html        # Web interface
└── README.md             # This file
```

## API Endpoints

### Collections

- `GET /api/collections` - List all collections
- `GET /api/collections/:name/schema` - Get collection metadata
- `GET /api/collections/:name/documents` - List documents (paginated)

### Documents

- `GET /api/collections/:name/documents/:id` - Get single document
- `POST /api/collections/:name/documents` - Create document
- `PUT /api/collections/:name/documents/:id` - Update document
- `DELETE /api/collections/:name/documents/:id` - Delete document

### Health

- `GET /api/health` - Server status

## Usage Examples

### List Collections

```bash
curl http://localhost:3000/api/collections
```

### Get Documents from Collection

```bash
curl http://localhost:3000/api/collections/users/documents?page=1&limit=50
```

### Create Document

```bash
curl -X POST http://localhost:3000/api/collections/users/documents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

### Update Document

```bash
curl -X PUT http://localhost:3000/api/collections/users/documents/[ID] \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "age": 31
  }'
```

### Delete Document

```bash
curl -X DELETE http://localhost:3000/api/collections/users/documents/[ID]
```

## Deployment

### Heroku

1. Create a `Procfile`:

   ```
   web: node server.js
   ```

2. Deploy:
   ```bash
   git push heroku main
   ```

### Vercel (Serverless)

1. Requires restructuring for serverless format
2. Create `/api/` directory with route files

### Railway.app

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t mongodb-crud .
docker run -p 3000:3000 --env-file .env mongodb-crud
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use Network Access List** - Restrict MongoDB access to your server IP
3. **Create Database User** - Don't use atlas admin credentials in production
4. **Add Authentication** - Implement user login for the web interface
5. **Validate Input** - Add input validation before database operations
6. **Use HTTPS** - Enable SSL/TLS in production
7. **Rate Limiting** - Add rate limiting to prevent abuse
8. **CORS Settings** - Restrict to specific domains in production

## Features to Add

- 🔐 User authentication & authorization
- 🔍 Advanced search and filtering
- 📤 Export/Import data (JSON, CSV)
- 🎯 Collection management (create/delete)
- 📊 Database statistics dashboard
- 🔄 Real-time updates
- 📋 Query builder
- 🌙 Dark mode

## Troubleshooting

### Connection Error

- Check MongoDB URI in `.env`
- Verify network access list in MongoDB Atlas
- Ensure IP whitelist includes your server

### Documents Not Loading

- Check browser console for API errors
- Verify collection name exists
- Check MongoDB user permissions

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# macOS/Linux
lsof -i :3000
kill -9 [PID]
```

## License

MIT License - feel free to use and modify

## Support

For issues or questions, check the MongoDB documentation:

- [MongoDB Docs](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
