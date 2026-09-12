require('dotenv').config();
const mongoose = require('mongoose');
const Image = require('../models/Image');
const User = require('../models/User');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const SEED_SOURCE = 'memory-vault-demo-v1';

const categoriesData = [
  // Wedding (5)
  { cat: 'wedding', keywords: 'indian,wedding,bride', gender: 'women', tags: ['wedding', 'indian-wedding', 'bride', 'saree', 'traditional', 'celebration'], desc: 'Beautiful Indian bride in traditional attire.' },
  { cat: 'wedding', keywords: 'indian,wedding,groom', gender: 'men', tags: ['wedding', 'indian-wedding', 'groom', 'sherwani', 'traditional', 'celebration'], desc: 'Groom looking sharp in a sherwani.' },
  { cat: 'wedding', keywords: 'indian,wedding,couple', gender: 'unisex', tags: ['wedding', 'indian-wedding', 'couple', 'mandap', 'celebration'], desc: 'Wedding ceremony moments.' },
  { cat: 'wedding', keywords: 'indian,wedding,guest', gender: 'women', tags: ['wedding', 'guest', 'lehenga', 'celebration', 'fashion'], desc: 'Wedding guest in beautiful lehenga.' },
  { cat: 'wedding', keywords: 'indian,wedding,family', gender: 'unisex', tags: ['wedding', 'family', 'relatives', 'gathering', 'celebration'], desc: 'Family picture at the wedding reception.' },

  // Birthday (5)
  { cat: 'birthday', keywords: 'indian,birthday,cake', gender: 'unisex', tags: ['birthday', 'cake', 'celebration', 'party'], desc: 'Cutting the birthday cake.' },
  { cat: 'birthday', keywords: 'indian,birthday,girl', gender: 'women', tags: ['birthday', 'celebration', 'party', 'friends'], desc: 'Birthday girl celebrating.' },
  { cat: 'birthday', keywords: 'indian,birthday,boy', gender: 'men', tags: ['birthday', 'celebration', 'party', 'gift'], desc: 'Birthday boy opening gifts.' },
  { cat: 'birthday', keywords: 'indian,birthday,family', gender: 'unisex', tags: ['birthday', 'family', 'gathering', 'celebration'], desc: 'Family gathering for a birthday.' },
  { cat: 'birthday', keywords: 'indian,birthday,decorations', gender: 'unisex', tags: ['birthday', 'party', 'decorations', 'celebration'], desc: 'Birthday party decorations.' },

  // Party (5)
  { cat: 'party', keywords: 'indian,party,friends', gender: 'unisex', tags: ['party', 'friends', 'celebration', 'nightout'], desc: 'Friends enjoying the party.' },
  { cat: 'party', keywords: 'indian,party,dancing', gender: 'unisex', tags: ['party', 'dancing', 'celebration', 'fun'], desc: 'Dancing at the party.' },
  { cat: 'party', keywords: 'indian,party,drinks', gender: 'men', tags: ['party', 'drinks', 'friends', 'nightout'], desc: 'Having drinks with friends.' },
  { cat: 'party', keywords: 'indian,party,women', gender: 'women', tags: ['party', 'friends', 'celebration', 'casual'], desc: 'Girls night out.' },
  { cat: 'party', keywords: 'indian,party,gathering', gender: 'unisex', tags: ['party', 'gathering', 'fun', 'celebration'], desc: 'A casual house party.' },

  // Travel (5)
  { cat: 'travel', keywords: 'india,travel,tajmahal', gender: 'unisex', tags: ['travel', 'india', 'tourism', 'taj-mahal', 'monument'], desc: 'Visit to the Taj Mahal.' },
  { cat: 'travel', keywords: 'india,travel,mountains', gender: 'unisex', tags: ['travel', 'india', 'mountains', 'himalayas', 'adventure'], desc: 'Trekking in the Himalayas.' },
  { cat: 'travel', keywords: 'india,travel,man', gender: 'men', tags: ['travel', 'india', 'solo', 'adventure'], desc: 'Solo travel adventure.' },
  { cat: 'travel', keywords: 'india,travel,woman', gender: 'women', tags: ['travel', 'india', 'solo', 'tourism'], desc: 'Exploring a new city.' },
  { cat: 'travel', keywords: 'india,travel,rajasthan', gender: 'unisex', tags: ['travel', 'india', 'rajasthan', 'culture', 'heritage'], desc: 'Cultural tour of Rajasthan.' },

  // Family (5)
  { cat: 'family', keywords: 'indian,family,parents', gender: 'unisex', tags: ['family', 'indian-family', 'parents', 'love'], desc: 'Parents at home.' },
  { cat: 'family', keywords: 'indian,family,grandparents', gender: 'unisex', tags: ['family', 'grandparents', 'generation', 'love'], desc: 'Grandparents blessing the family.' },
  { cat: 'family', keywords: 'indian,family,children', gender: 'unisex', tags: ['family', 'kids', 'children', 'home'], desc: 'Kids playing in the courtyard.' },
  { cat: 'family', keywords: 'indian,family,dinner', gender: 'unisex', tags: ['family', 'gathering', 'dinner', 'food'], desc: 'Family dinner time.' },
  { cat: 'family', keywords: 'indian,family,portrait', gender: 'unisex', tags: ['family', 'indian-family', 'portrait', 'together'], desc: 'A traditional family portrait.' },

  // Friends (5)
  { cat: 'friends', keywords: 'indian,friends,group', gender: 'unisex', tags: ['friends', 'group', 'hangout', 'fun'], desc: 'Group of friends hanging out.' },
  { cat: 'friends', keywords: 'indian,friends,cafe', gender: 'unisex', tags: ['friends', 'cafe', 'meetup', 'coffee'], desc: 'Catching up at a cafe.' },
  { cat: 'friends', keywords: 'indian,friends,women', gender: 'women', tags: ['friends', 'besties', 'outing', 'fun'], desc: 'Besties out for a walk.' },
  { cat: 'friends', keywords: 'indian,friends,men', gender: 'men', tags: ['friends', 'buddies', 'hangout', 'casual'], desc: 'The boys hanging out.' },
  { cat: 'friends', keywords: 'indian,friends,selfie', gender: 'unisex', tags: ['friends', 'selfie', 'group', 'memories'], desc: 'Group selfie with friends.' },

  // College (5)
  { cat: 'college', keywords: 'indian,college,campus', gender: 'unisex', tags: ['college', 'campus', 'students', 'india'], desc: 'Walking across the college campus.' },
  { cat: 'college', keywords: 'indian,college,classroom', gender: 'unisex', tags: ['college', 'classroom', 'lecture', 'students'], desc: 'Attending a lecture.' },
  { cat: 'college', keywords: 'indian,college,friends', gender: 'unisex', tags: ['college', 'friends', 'classmates', 'fun'], desc: 'College friends in the canteen.' },
  { cat: 'college', keywords: 'indian,college,library', gender: 'unisex', tags: ['college', 'library', 'studying', 'students'], desc: 'Studying in the library.' },
  { cat: 'college', keywords: 'indian,college,event', gender: 'unisex', tags: ['college', 'event', 'fest', 'students'], desc: 'College cultural fest.' },

  // Sports (5)
  { cat: 'sports', keywords: 'indian,cricket,playing', gender: 'men', tags: ['sports', 'cricket', 'playing', 'india', 'match'], desc: 'Playing cricket with the local team.' },
  { cat: 'sports', keywords: 'indian,badminton,playing', gender: 'unisex', tags: ['sports', 'badminton', 'playing', 'fitness'], desc: 'A game of badminton.' },
  { cat: 'sports', keywords: 'indian,football,playing', gender: 'men', tags: ['sports', 'football', 'soccer', 'match'], desc: 'Football match.' },
  { cat: 'sports', keywords: 'indian,running,fitness', gender: 'women', tags: ['sports', 'running', 'fitness', 'workout'], desc: 'Morning run in the park.' },
  { cat: 'sports', keywords: 'indian,yoga', gender: 'unisex', tags: ['sports', 'yoga', 'fitness', 'health'], desc: 'Practicing yoga.' },

  // Festival (5)
  { cat: 'festival', keywords: 'indian,diwali,festival', gender: 'unisex', tags: ['festival', 'diwali', 'india', 'celebration', 'lights'], desc: 'Celebrating Diwali with diyas.' },
  { cat: 'festival', keywords: 'indian,holi,festival', gender: 'unisex', tags: ['festival', 'holi', 'india', 'celebration', 'colors'], desc: 'Playing Holi with colors.' },
  { cat: 'festival', keywords: 'indian,festival,traditional', gender: 'women', tags: ['festival', 'traditional', 'celebration', 'saree'], desc: 'Dressed up for the festival.' },
  { cat: 'festival', keywords: 'indian,festival,sweets', gender: 'unisex', tags: ['festival', 'sweets', 'celebration', 'food'], desc: 'Festival sweets and treats.' },
  { cat: 'festival', keywords: 'indian,navratri,festival', gender: 'unisex', tags: ['festival', 'navratri', 'celebration', 'garba'], desc: 'Navratri celebrations.' },

  // Fashion (5)
  { cat: 'fashion', keywords: 'indian,fashion,saree', gender: 'women', tags: ['fashion', 'saree', 'traditional', 'style', 'india'], desc: 'Elegant saree look.' },
  { cat: 'fashion', keywords: 'indian,fashion,kurta', gender: 'men', tags: ['fashion', 'kurta', 'traditional', 'style', 'menswear'], desc: 'Stylish kurta for men.' },
  { cat: 'fashion', keywords: 'indian,fashion,lehenga', gender: 'women', tags: ['fashion', 'lehenga', 'traditional', 'style'], desc: 'Beautiful lehenga design.' },
  { cat: 'fashion', keywords: 'indian,fashion,modern', gender: 'women', tags: ['fashion', 'modern', 'indo-western', 'style'], desc: 'Modern Indo-western fusion wear.' },
  { cat: 'fashion', keywords: 'indian,fashion,street', gender: 'men', tags: ['fashion', 'streetwear', 'casual', 'style'], desc: 'Casual Indian streetwear.' },

  // Food (5)
  { cat: 'food', keywords: 'indian,food,thali', gender: 'unisex', tags: ['food', 'indian-food', 'thali', 'meal', 'delicious'], desc: 'A complete Indian thali meal.' },
  { cat: 'food', keywords: 'indian,food,biryani', gender: 'unisex', tags: ['food', 'biryani', 'meal', 'spicy'], desc: 'Delicious chicken biryani.' },
  { cat: 'food', keywords: 'indian,food,street', gender: 'unisex', tags: ['food', 'street-food', 'snacks', 'india'], desc: 'Spicy Indian street food.' },
  { cat: 'food', keywords: 'indian,food,dosa', gender: 'unisex', tags: ['food', 'dosa', 'south-indian', 'breakfast'], desc: 'Crispy dosa for breakfast.' },
  { cat: 'food', keywords: 'indian,food,sweets', gender: 'unisex', tags: ['food', 'sweets', 'dessert', 'indian'], desc: 'Assorted Indian sweets.' },

  // Nature (5)
  { cat: 'nature', keywords: 'india,nature,landscape', gender: 'unisex', tags: ['nature', 'landscape', 'india', 'scenery'], desc: 'Beautiful Indian landscape.' },
  { cat: 'nature', keywords: 'india,nature,hills', gender: 'unisex', tags: ['nature', 'hills', 'mountains', 'scenery'], desc: 'Lush green hills.' },
  { cat: 'nature', keywords: 'india,nature,waterfall', gender: 'unisex', tags: ['nature', 'waterfall', 'forest', 'scenery'], desc: 'A hidden waterfall in the forest.' },
  { cat: 'nature', keywords: 'india,nature,sunset', gender: 'unisex', tags: ['nature', 'sunset', 'evening', 'sky'], desc: 'Sunset over the Indian countryside.' },
  { cat: 'nature', keywords: 'india,nature,river', gender: 'unisex', tags: ['nature', 'river', 'water', 'landscape'], desc: 'A peaceful river flowing.' },

  // Work (5)
  { cat: 'work', keywords: 'indian,office,work', gender: 'unisex', tags: ['work', 'office', 'corporate', 'meeting'], desc: 'Working in the office.' },
  { cat: 'work', keywords: 'indian,office,professional', gender: 'men', tags: ['work', 'professional', 'office', 'career'], desc: 'Professional man at work.' },
  { cat: 'work', keywords: 'indian,office,woman', gender: 'women', tags: ['work', 'professional', 'office', 'career'], desc: 'Professional woman working.' },
  { cat: 'work', keywords: 'indian,office,team', gender: 'unisex', tags: ['work', 'team', 'colleagues', 'meeting'], desc: 'Team meeting in progress.' },
  { cat: 'work', keywords: 'indian,office,desk', gender: 'unisex', tags: ['work', 'desk', 'laptop', 'corporate'], desc: 'Working from the desk.' },

  // Graduation (5)
  { cat: 'graduation', keywords: 'indian,graduation,students', gender: 'unisex', tags: ['graduation', 'students', 'college', 'degree'], desc: 'Graduation day with friends.' },
  { cat: 'graduation', keywords: 'indian,graduation,girl', gender: 'women', tags: ['graduation', 'student', 'achievement', 'college'], desc: 'Proud graduate.' },
  { cat: 'graduation', keywords: 'indian,graduation,boy', gender: 'men', tags: ['graduation', 'student', 'achievement', 'college'], desc: 'Receiving the degree.' },
  { cat: 'graduation', keywords: 'indian,graduation,family', gender: 'unisex', tags: ['graduation', 'family', 'celebration', 'proud'], desc: 'Family celebrating graduation.' },
  { cat: 'graduation', keywords: 'indian,graduation,ceremony', gender: 'unisex', tags: ['graduation', 'ceremony', 'college', 'event'], desc: 'The graduation ceremony.' },

  // Pets (5)
  { cat: 'pets', keywords: 'indian,dog,pet', gender: 'unisex', tags: ['pets', 'dog', 'puppy', 'animal'], desc: 'Playing with the dog.' },
  { cat: 'pets', keywords: 'indian,cat,pet', gender: 'unisex', tags: ['pets', 'cat', 'kitten', 'animal'], desc: 'Cute pet cat.' },
  { cat: 'pets', keywords: 'indian,street,dog', gender: 'unisex', tags: ['pets', 'dog', 'street-dog', 'india'], desc: 'A friendly Indian street dog.' },
  { cat: 'pets', keywords: 'indian,girl,dog', gender: 'women', tags: ['pets', 'dog', 'owner', 'love'], desc: 'Girl with her pet dog.' },
  { cat: 'pets', keywords: 'indian,boy,dog', gender: 'men', tags: ['pets', 'dog', 'owner', 'playing'], desc: 'Boy playing with his dog.' },

  // Music (5)
  { cat: 'music', keywords: 'indian,music,traditional', gender: 'unisex', tags: ['music', 'traditional', 'instruments', 'culture'], desc: 'Traditional Indian music performance.' },
  { cat: 'music', keywords: 'indian,music,concert', gender: 'unisex', tags: ['music', 'concert', 'performance', 'event'], desc: 'Attending a live music concert.' },
  { cat: 'music', keywords: 'indian,music,guitar', gender: 'men', tags: ['music', 'guitar', 'playing', 'hobby'], desc: 'Playing the guitar.' },
  { cat: 'music', keywords: 'indian,music,singer', gender: 'women', tags: ['music', 'singer', 'performance', 'art'], desc: 'Classical Indian singing.' },
  { cat: 'music', keywords: 'indian,music,band', gender: 'unisex', tags: ['music', 'band', 'performance', 'friends'], desc: 'College music band performing.' },

  // Events (5)
  { cat: 'events', keywords: 'indian,cultural,event', gender: 'unisex', tags: ['events', 'cultural', 'india', 'performance'], desc: 'A cultural event performance.' },
  { cat: 'events', keywords: 'indian,conference,event', gender: 'unisex', tags: ['events', 'conference', 'professional', 'meeting'], desc: 'Attending a professional conference.' },
  { cat: 'events', keywords: 'indian,wedding,event', gender: 'unisex', tags: ['events', 'wedding', 'celebration', 'gathering'], desc: 'A large wedding event.' },
  { cat: 'events', keywords: 'indian,college,fest', gender: 'unisex', tags: ['events', 'college', 'fest', 'students'], desc: 'College fest event.' },
  { cat: 'events', keywords: 'indian,public,event', gender: 'unisex', tags: ['events', 'public', 'gathering', 'crowd'], desc: 'A public community event.' },

  // Memories (5)
  { cat: 'memories', keywords: 'indian,vintage,photo', gender: 'unisex', tags: ['memories', 'vintage', 'old', 'nostalgia'], desc: 'A vintage family photo memory.' },
  { cat: 'memories', keywords: 'indian,childhood,memory', gender: 'unisex', tags: ['memories', 'childhood', 'kids', 'nostalgia'], desc: 'Childhood memories.' },
  { cat: 'memories', keywords: 'indian,school,memory', gender: 'unisex', tags: ['memories', 'school', 'friends', 'throwback'], desc: 'School days throwback.' },
  { cat: 'memories', keywords: 'indian,polaroid,memory', gender: 'unisex', tags: ['memories', 'polaroid', 'photo', 'candid'], desc: 'A candid polaroid memory.' },
  { cat: 'memories', keywords: 'indian,album,memory', gender: 'unisex', tags: ['memories', 'album', 'photos', 'family'], desc: 'Looking through the old photo album.' },

  // Road-Trip (5)
  { cat: 'road-trip', keywords: 'india,road,trip', gender: 'unisex', tags: ['road-trip', 'travel', 'car', 'highway', 'india'], desc: 'Driving on the Indian highway.' },
  { cat: 'road-trip', keywords: 'india,road,trip,friends', gender: 'unisex', tags: ['road-trip', 'friends', 'travel', 'fun'], desc: 'Road trip with friends.' },
  { cat: 'road-trip', keywords: 'india,road,trip,mountains', gender: 'unisex', tags: ['road-trip', 'mountains', 'travel', 'scenic'], desc: 'Scenic mountain road trip.' },
  { cat: 'road-trip', keywords: 'india,road,trip,car', gender: 'unisex', tags: ['road-trip', 'car', 'drive', 'travel'], desc: 'Taking a break during the drive.' },
  { cat: 'road-trip', keywords: 'india,road,trip,bike', gender: 'men', tags: ['road-trip', 'bike', 'motorcycle', 'adventure'], desc: 'Motorcycle road trip adventure.' },

  // Beach (5)
  { cat: 'beach', keywords: 'india,goa,beach', gender: 'unisex', tags: ['beach', 'goa', 'travel', 'sea', 'india'], desc: 'Relaxing at Goa beach.' },
  { cat: 'beach', keywords: 'india,beach,sunset', gender: 'unisex', tags: ['beach', 'sunset', 'sea', 'travel', 'beautiful'], desc: 'Beautiful sunset at the beach.' },
  { cat: 'beach', keywords: 'india,beach,friends', gender: 'unisex', tags: ['beach', 'friends', 'travel', 'fun'], desc: 'Friends having fun at the beach.' },
  { cat: 'beach', keywords: 'india,beach,woman', gender: 'women', tags: ['beach', 'travel', 'vacation', 'sea'], desc: 'Walking along the shore.' },
  { cat: 'beach', keywords: 'india,beach,family', gender: 'unisex', tags: ['beach', 'family', 'vacation', 'fun'], desc: 'Family vacation at the beach.' }
];

async function seedDatabase() {
  const seedUserId = process.env.SEED_USER_ID;
  
  if (!seedUserId) {
    console.error('ERROR: SEED_USER_ID environment variable is missing.');
    console.error('Please run the script with: SEED_USER_ID=<your_user_id> node server/scripts/seedMemoryVault.js');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Verify user exists
    const user = await User.findById(seedUserId);
    if (!user) {
      console.error('ERROR: User not found for ID:', seedUserId);
      process.exit(1);
    }
    console.log(`Seeding data for user: ${user.email}`);

    let createdCount = 0;
    let updatedCount = 0;
    let categoryCounts = {};

    for (let i = 0; i < categoriesData.length; i++) {
      const data = categoriesData[i];
      const seedKey = `demo-${data.cat}-${i}`;

      // Check if image already exists
      let existingImage = await Image.findOne({ userId: seedUserId, seedKey });

      if (existingImage) {
        // Update tags and description if needed, but do not re-upload
        existingImage.tags = data.tags;
        existingImage.description = data.desc;
        existingImage.categories = [data.cat];
        existingImage.gender = data.gender;
        await existingImage.save();
        updatedCount++;
        categoryCounts[data.cat] = (categoryCounts[data.cat] || 0) + 1;
        console.log(`[UPDATED] ${seedKey}`);
        continue;
      }

      // Download image and upload to Cloudinary
      const loremFlickrUrl = `https://loremflickr.com/800/600/${data.keywords.replace(/,/g, ',')}?lock=${i + 1}`;
      console.log(`Fetching image for ${data.cat} (${seedKey})`);
      
      try {
        const response = await fetch(loremFlickrUrl);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await uploadToCloudinary(buffer, seedUserId, `seed_${data.cat}_${i}.jpg`);
        
        await Image.create({
          userId: seedUserId,
          cloudinaryPublicId: uploadResult.publicId,
          cloudinaryUrl: uploadResult.secureUrl,
          originalName: `demo_${data.cat}_${i}.jpg`,
          categories: [data.cat],
          tags: data.tags,
          description: data.desc,
          gender: data.gender,
          seedSource: SEED_SOURCE,
          seedKey: seedKey
        });

        createdCount++;
        categoryCounts[data.cat] = (categoryCounts[data.cat] || 0) + 1;
        console.log(`[CREATED] ${seedKey} -> ${uploadResult.secureUrl}`);
      } catch (err) {
        console.error(`Failed to process image ${seedKey}: ${err.message}`);
      }
    }

    console.log('\n--- Seeding Complete ---');
    console.log(`Total created: ${createdCount}`);
    console.log(`Total updated: ${updatedCount}`);
    console.log('Categories seeded:', categoryCounts);

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();
