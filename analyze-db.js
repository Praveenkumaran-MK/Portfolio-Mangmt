#!/usr/bin/env node

/**
 * MongoDB Database Analyzer
 * Generates a comprehensive report of your database structure
 *
 * Usage: node analyze-db.js
 */

const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

async function analyzeDatabase() {
  let client;

  try {
    console.log("\n🔍 Connecting to MongoDB...\n");
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();

    // Get database name
    const dbName = db.name;
    console.log(`📊 Database: ${dbName}\n`);
    console.log("=".repeat(80));

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📦 Total Collections: ${collections.length}\n`);

    // Analyze each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);

      // Get stats
      const count = await collection.countDocuments();
      const sampleDoc = await collection.findOne();
      let indexInfo = [];

      try {
        indexInfo = await collection.listIndexes().toArray();
      } catch (e) {
        // Index retrieval might fail, continue without it
      }

      console.log(`\n📋 Collection: "${collectionName}"`);
      console.log("-".repeat(80));
      console.log(`   Documents: ${count}`);

      if (sampleDoc) {
        const fields = Object.keys(sampleDoc);
        console.log(`   Fields (${fields.length}):`);

        fields.forEach((field) => {
          const value = sampleDoc[field];
          const type = getFieldType(value);
          console.log(`      • ${field}: ${type}`);
        });
      }

      if (indexInfo && indexInfo.length > 0) {
        console.log(`   Indexes (${indexInfo.length}):`);
        indexInfo.forEach((index) => {
          console.log(`      • ${JSON.stringify(index.key)}`);
        });
      }

      // Sample document preview
      if (sampleDoc) {
        console.log(`\n   Sample Document:`);
        console.log(
          "   " +
            JSON.stringify(sampleDoc, null, 2)
              .split("\n")
              .map((line) => line.substring(0, 100))
              .join("\n   "),
        );
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n✅ Database analysis complete!\n");
  } catch (error) {
    console.error("\n❌ Error analyzing database:");
    console.error(error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function getFieldType(value) {
  if (value === null) return "Null";
  if (value === undefined) return "Undefined";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return `Array[${value.length}]`;
    }
    if (value.constructor.name === "ObjectId") {
      return "ObjectId";
    }
    if (value.constructor.name === "Date") {
      return "Date";
    }
    return "Object";
  }
  return typeof value;
}

// Run analyzer
analyzeDatabase();
