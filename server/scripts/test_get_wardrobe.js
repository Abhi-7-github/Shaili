require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const WardrobeItem = require('../models/WardrobeItem');
const User = require('../models/User');

const testGet = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: 'gopichandmankina5@gmail.com' });
    console.log('User found:', user._id, user.email);

    // Test 1: No filters
    const query1 = { userId: user._id };
    const items1 = await WardrobeItem.find(query1);
    console.log(`Test 1 (All): Found ${items1.length} items`);

    // Test 2: Category = Tops
    const category = 'Tops';
    const c = String(category).toLowerCase().trim();
    const query2 = { userId: user._id };
    if (c.includes('top')) {
      query2.category = { $in: ['top', 'tops', 'Tops'] };
    }
    const items2 = await WardrobeItem.find(query2);
    console.log(`Test 2 (Category=Tops): Found ${items2.length} items`);
    items2.forEach(i => console.log(` - ${i.title} (${i.category})`));

    // Test 3: Category = Bottoms
    const categoryB = 'Bottoms';
    const cB = String(categoryB).toLowerCase().trim();
    const query3 = { userId: user._id };
    if (cB.includes('bottom')) {
      query3.category = { $in: ['bottom', 'bottoms', 'Bottoms'] };
    }
    const items3 = await WardrobeItem.find(query3);
    console.log(`Test 3 (Category=Bottoms): Found ${items3.length} items`);
    items3.forEach(i => console.log(` - ${i.title} (${i.category})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testGet();
