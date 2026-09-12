require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const WardrobeItem = require('../models/WardrobeItem');
const User = require('../models/User');

const checkDB = async () => {
  try {
    await connectDB();
    const users = await User.find({});
    console.log('--- ALL USERS IN DB ---');
    users.forEach(u => console.log(`User ID: ${u._id}, Email: ${u.email}, Name: ${u.name}`));

    const items = await WardrobeItem.find({});
    console.log(`\n--- ALL WARDROBE ITEMS IN DB (Total: ${items.length}) ---`);
    items.forEach((item, idx) => {
      console.log(`[${idx+1}] ID: ${item._id}, UserID: ${item.userId}, Title: "${item.title || item.type}", Category: "${item.category}", Color: "${item.primaryColor}", Style: "${item.style}"`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Check DB Error:', err);
    process.exit(1);
  }
};

checkDB();
