#!/usr/bin/env node

/**
 * MongoDB CRUD API Test Suite
 * Tests all REST API endpoints
 */

const BASE_URL = "http://localhost:5000/api";

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

async function runTests() {
  console.log("🧪 MongoDB CRUD API Test Suite\n");
  console.log("=".repeat(60) + "\n");

  // Health Check
  await test("Health Check", async () => {
    const data = await request("GET", "/health");
    if (!data.status) throw new Error("Invalid health response");
  });

  // Get Collections
  let collections = [];
  await test("GET /collections", async () => {
    const data = await request("GET", "/collections");
    if (!Array.isArray(data)) throw new Error("Expected array");
    collections = data;
  });

  // Test with first collection
  if (collections.length === 0) {
    console.error("\n⚠️  No collections found in database");
    return;
  }

  const testCollection = collections[0];
  console.log(`\n📦 Testing collection: "${testCollection}"\n`);

  // Get Collection Schema
  let schemaInfo = {};
  await test("GET /collections/:name/schema", async () => {
    const data = await request("GET", `/collections/${testCollection}/schema`);
    if (!data.name || typeof data.count !== "number") {
      throw new Error("Invalid schema response");
    }
    schemaInfo = data;
  });

  // Get Documents (Paginated)
  let existingDocId = null;
  await test("GET /collections/:name/documents (paginated)", async () => {
    const data = await request(
      "GET",
      `/collections/${testCollection}/documents?page=1&limit=10`,
    );
    if (
      typeof data.page !== "number" ||
      typeof data.total !== "number" ||
      !Array.isArray(data.documents)
    ) {
      throw new Error("Invalid documents response");
    }

    if (data.documents.length > 0) {
      existingDocId = String(data.documents[0]._id);
    }
  });

  // Get Single Document (if exists)
  if (existingDocId) {
    await test(`GET /collections/:name/documents/:id (single)`, async () => {
      const data = await request(
        "GET",
        `/collections/${testCollection}/documents/${existingDocId}`,
      );
      if (!data._id) throw new Error("Invalid document response");
    });
  }

  // Create New Document
  let newDocId = null;
  const testDocument = {
    test_field_string: "test value",
    test_field_number: 123,
    test_field_bool: true,
  };

  await test("POST /collections/:name/documents (create)", async () => {
    const data = await request(
      "POST",
      `/collections/${testCollection}/documents`,
      testDocument,
    );
    if (!data._id) throw new Error("No _id in response");
    newDocId = String(data._id);
  });

  // Update Document
  if (newDocId) {
    await test("PUT /collections/:name/documents/:id (update)", async () => {
      const updateData = {
        test_field_string: "updated value",
        test_field_number: 456,
      };
      const data = await request(
        "PUT",
        `/collections/${testCollection}/documents/${newDocId}`,
        updateData,
      );
      if (!data._id) throw new Error("No _id in response");
    });

    // Verify Update
    await test("Verify updated document", async () => {
      const data = await request(
        "GET",
        `/collections/${testCollection}/documents/${newDocId}`,
      );
      if (data.test_field_string !== "updated value") {
        throw new Error("Update not reflected");
      }
    });

    // Delete Document
    await test("DELETE /collections/:name/documents/:id", async () => {
      const data = await request(
        "DELETE",
        `/collections/${testCollection}/documents/${newDocId}`,
      );
      if (!data.message) throw new Error("Invalid delete response");
    });

    // Verify Delete
    await test("Verify deleted document", async () => {
      try {
        await request(
          "GET",
          `/collections/${testCollection}/documents/${newDocId}`,
        );
        throw new Error("Document still exists after delete");
      } catch (e) {
        if (e.message.includes("still exists")) throw e;
        // 404 expected
      }
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Test suite completed!\n");
}

// Run tests
runTests().catch((error) => {
  console.error("\n❌ Fatal error:", error.message);
  process.exit(1);
});
