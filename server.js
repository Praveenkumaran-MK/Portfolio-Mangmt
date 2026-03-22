const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

let db;
let client;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

// Get all collections
app.get("/api/collections", async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    res.json(collectionNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get collection schema/sample
app.get("/api/collections/:collectionName/schema", async (req, res) => {
  try {
    const { collectionName } = req.params;
    const collection = db.collection(collectionName);
    const sampleDoc = await collection.findOne();
    const count = await collection.countDocuments();

    res.json({
      name: collectionName,
      count,
      sampleDocument: sampleDoc,
      fields: sampleDoc ? Object.keys(sampleDoc) : [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all documents from a collection (with pagination)
app.get("/api/collections/:collectionName/documents", async (req, res) => {
  try {
    const { collectionName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const collection = db.collection(collectionName);
    const documents = await collection.find().skip(skip).limit(limit).toArray();

    const total = await collection.countDocuments();

    res.json({
      collection: collectionName,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      documents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single document
app.get("/api/collections/:collectionName/documents/:id", async (req, res) => {
  try {
    const { collectionName, id } = req.params;
    const collection = db.collection(collectionName);

    let document;
    try {
      document = await collection.findOne({ _id: new ObjectId(id) });
    } catch {
      document = await collection.findOne({ _id: id });
    }

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create document
app.post("/api/collections/:collectionName/documents", async (req, res) => {
  try {
    const { collectionName } = req.params;
    const collection = db.collection(collectionName);

    const docData = { ...req.body };
    delete docData._id; // Ensure _id isn't manually inserted if it already exists

    const result = await collection.insertOne(docData);

    res.status(201).json({
      _id: result.insertedId,
      ...docData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update document
app.put("/api/collections/:collectionName/documents/:id", async (req, res) => {
  try {
    const { collectionName, id } = req.params;
    const collection = db.collection(collectionName);

    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const updateData = { ...req.body };
    delete updateData._id; // IMPORTANT: Prevent "Immutable field _id" error

    const result = await collection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: "after" },
    );

    // In MongoDB Driver 6.x, findOneAndUpdate returns the document directly
    // or an object with a 'value' property depending on options/environment.
    const updatedDoc = result.value || result;

    if (!updatedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
app.delete(
  "/api/collections/:collectionName/documents/:id",
  async (req, res) => {
    try {
      const { collectionName, id } = req.params;
      const collection = db.collection(collectionName);

      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch {
        query = { _id: id };
      }

      const result = await collection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Authentication - Verify password
app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password === ADMIN_PASSWORD) {
    res.json({
      success: true,
      message: "Authentication successful",
      token: Buffer.from(`auth_${Date.now()}`).toString("base64"),
    });
  } else {
    res.status(401).json({ success: false, error: "Invalid password" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard at http://localhost:${PORT}/index.html`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("\n✓ MongoDB connection closed");
  }
  process.exit(0);
});
