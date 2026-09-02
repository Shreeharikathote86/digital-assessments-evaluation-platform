// Script to migrate existing marks from internal/external to ISA1/ISA2/ESA
// and then remove the internal/external fields
require('dotenv').config();
const mongoose = require('mongoose');
const Marks = require('./models/Other/marks.model.js');

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

// Migrate all marks records and remove old fields
const migrateAndRemoveOldFields = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongo();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      return;
    }

    // Find all marks records
    const allMarks = await Marks.find({});
    console.log(`Found ${allMarks.length} marks records to migrate`);

    // Process each record
    for (const mark of allMarks) {
      let updated = false;

      // Migrate internal to ISA1 if needed
      if (mark.internal && Object.keys(mark.internal).length > 0) {
        if (!mark.isa1) {
          mark.isa1 = {};
        }
        
        // Copy all internal marks to ISA1
        Object.keys(mark.internal).forEach(subject => {
          mark.isa1[subject] = mark.internal[subject];
        });
        
        updated = true;
        console.log(`Migrated internal marks to ISA1 for student ${mark.enrollmentNo}`);
      }

      // Migrate external to ESA if needed
      if (mark.external && Object.keys(mark.external).length > 0) {
        if (!mark.esa) {
          mark.esa = {};
        }
        
        // Copy all external marks to ESA
        Object.keys(mark.external).forEach(subject => {
          mark.esa[subject] = mark.external[subject];
        });
        
        updated = true;
        console.log(`Migrated external marks to ESA for student ${mark.enrollmentNo}`);
      }

      // Now remove the internal and external fields using MongoDB's unset operator
      await Marks.updateOne(
        { _id: mark._id },
        { $unset: { internal: "", external: "" } }
      );
      
      console.log(`Removed internal and external fields for student ${mark.enrollmentNo}`);
      
      // Save the updated record if other changes were made
      if (updated) {
        await mark.save();
        console.log(`Saved updated marks for student ${mark.enrollmentNo}`);
      }
    }

    console.log('Migration and field removal completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateAndRemoveOldFields();
