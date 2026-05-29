const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Automatically migrate existing admins
    const Admin = require('../models/Admin');
    const adminsCount = await Admin.countDocuments();
    if (adminsCount === 1) {
      await Admin.updateMany({}, {
        $set: {
          role: 'superadmin',
          permissions: ['products', 'articles', 'inquiries', 'settings', 'admins']
        }
      });
      console.log('✅ Single admin migrated/upgraded to superadmin successfully.');
    } else {
      await Admin.updateMany(
        { $or: [{ role: { $exists: false } }, { role: '' }] },
        {
          $set: {
            role: 'superadmin',
            permissions: ['products', 'articles', 'inquiries', 'settings', 'admins']
          }
        }
      );
    }
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
