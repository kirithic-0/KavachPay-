const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./firebase-credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🔍 Detect type (enhanced)
function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "array<empty>";
    const types = [...new Set(value.map(getType))];
    return `array<${types.join(" | ")}>`;
  }
  if (value instanceof admin.firestore.Timestamp) return "timestamp";
  if (typeof value === "object") return "map";
  return typeof value;
}

// 🔁 Process a document recursively
async function processDoc(docRef, schemaNode) {
  const docSnap = await docRef.get();
  if (!docSnap.exists) return;

  const data = docSnap.data();

  for (const key in data) {
    const value = data[key];

    // Nested object (map)
    if (typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof admin.firestore.Timestamp)) {
      if (!schemaNode[key]) schemaNode[key] = {};
      await processMap(value, schemaNode[key]);
    } else {
      const type = getType(value);

      if (!schemaNode[key]) {
        schemaNode[key] = new Set();
      }
      schemaNode[key].add(type);
    }
  }

  // 🔁 Handle subcollections
  const subcollections = await docRef.listCollections();

  for (const subcol of subcollections) {
    if (!schemaNode[subcol.id]) {
      schemaNode[subcol.id] = {};
    }

    const subSnap = await subcol.limit(3).get();

    for (const subDoc of subSnap.docs) {
      await processDoc(subDoc.ref, schemaNode[subcol.id]);
    }
  }
}

// 🔁 Process nested maps
async function processMap(obj, schemaNode) {
  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof admin.firestore.Timestamp)) {
      if (!schemaNode[key]) schemaNode[key] = {};
      await processMap(value, schemaNode[key]);
    } else {
      const type = getType(value);

      if (!schemaNode[key]) {
        schemaNode[key] = new Set();
      }
      schemaNode[key].add(type);
    }
  }
}

// 🔄 Convert Sets → clean strings
function cleanSchema(node) {
  for (const key in node) {
    if (node[key] instanceof Set) {
      const types = Array.from(node[key]);
      node[key] = types.length === 1 ? types[0] : types.join(" | ");
    } else if (typeof node[key] === "object") {
      cleanSchema(node[key]);
    }
  }
}

// 🚀 Main
async function extractSchema() {
  const schema = {};

  const collections = await db.listCollections();

  for (const col of collections) {
    const colName = col.id;
    schema[colName] = {};

    const snapshot = await col.limit(3).get();

    for (const doc of snapshot.docs) {
      await processDoc(doc.ref, schema[colName]);
    }
  }

  cleanSchema(schema);

  return schema;
}

// ▶️ Run
async function main() {
  const schema = await extractSchema();

  console.log("\n🔥 Firestore Schema:\n");
  console.log(JSON.stringify(schema, null, 2));

  fs.writeFileSync("firestore-schema.json", JSON.stringify(schema, null, 2));
  console.log("\n✅ Saved to firestore-schema.json");
}

main().catch(console.error);