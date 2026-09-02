// Script to directly remove internal and external fields from all marks documents
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectToMongo = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, { useNewUrlParser: true });
    console.log('Connected to MongoDB Successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
};

// Remove internal and external fields from all marks documents
const removeInternalExternal = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongo();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      return;
    }

    // Get the Marks collection directly to bypass schema validation
    const db = mongoose.connection.db;
    const marksCollection = db.collection('marks');
    
    // First, find all documents that have internal or external fields
    const docsWithInternalOrExternal = await marksCollection.find({
      $or: [
        { internal: { $exists: true } },
        { external: { $exists: true } }
      ]
    }).toArray();
    
    console.log(`Found ${docsWithInternalOrExternal.length} documents with internal or external fields`);
    
    // Update all documents to remove internal and external fields
    const result = await marksCollection.updateMany(
      {}, // Match all documents
      { $unset: { internal: "", external: "" } }
    );
    
    console.log(`Modified ${result.modifiedCount} documents`);
    console.log('Removed internal and external fields from all marks documents');

  } catch (error) {
    console.error('Error during operation:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the operation
removeInternalExternal();
