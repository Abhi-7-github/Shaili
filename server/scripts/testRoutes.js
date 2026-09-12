/**
 * Comprehensive Backend API Test Suite for ShAili Smart Wardrobe
 * Tests all REST endpoints against running server at http://localhost:5000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

const makeRequest = (endpoint, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const headers = {};

    if (data && typeof data === 'object') {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, bodyRaw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('🚀 SHAILI SMART WARDROBE BACKEND ROUTE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  let authToken = null;

  // Test 1: Root Endpoint
  try {
    const res = await makeRequest('/');
    if (res.status === 200 && res.body.success) {
      console.log('✅ 1. GET / (Root Endpoint) - PASSED');
      passed++;
    } else {
      console.error('❌ 1. GET / - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 1. GET / - ERROR:', e.message);
    failed++;
  }

  // Test 2: Health Check Endpoint
  try {
    const res = await makeRequest('/api/health');
    if (res.status === 200 && res.body.success && res.body.data.database.connected) {
      console.log('✅ 2. GET /api/health - PASSED (Database Connected)');
      passed++;
    } else {
      console.error('❌ 2. GET /api/health - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 2. GET /api/health - ERROR:', e.message);
    failed++;
  }

  // Test 3: User Authentication (Login / Signup)
  const testUser = {
    email: `test_stylist_${Date.now()}@shaili.com`,
    password: 'Password123!',
    name: 'Test Stylist',
    gender: 'women',
  };

  try {
    const signupRes = await makeRequest('/api/auth/signup', 'POST', testUser);
    if ((signupRes.status === 201 || signupRes.status === 200) && signupRes.body.token) {
      authToken = signupRes.body.token;
      console.log('✅ 3. POST /api/auth/signup - PASSED (JWT Token Issued)');
      passed++;
    } else {
      // Try login if user already exists
      const loginRes = await makeRequest('/api/auth/login', 'POST', {
        email: testUser.email,
        password: testUser.password,
      });
      if (loginRes.status === 200 && loginRes.body.token) {
        authToken = loginRes.body.token;
        console.log('✅ 3. POST /api/auth/login - PASSED (JWT Token Issued)');
        passed++;
      } else {
        console.error('❌ 3. Authentication - FAILED:', signupRes, loginRes);
        failed++;
      }
    }
  } catch (e) {
    console.error('❌ 3. Authentication - ERROR:', e.message);
    failed++;
  }

  if (!authToken) {
    console.error('⚠️ Cannot proceed with protected route tests without auth token.');
    return;
  }

  // Test 4: Create / Upload Wardrobe Items
  let createdItemId = null;
  try {
    const itemData = {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample_shirt.jpg',
      category: 'top',
      type: 'shirt',
      primaryColor: 'white',
      secondaryColor: 'blue',
      pattern: 'striped',
      material: 'cotton',
      style: 'smart-casual',
      formality: 4,
      seasons: ['summer', 'monsoon'],
      occasions: ['college', 'office', 'casual'],
    };

    const res = await makeRequest('/api/wardrobe/upload', 'POST', itemData, authToken);
    if ((res.status === 201 || res.status === 200) && res.body.success && res.body.data._id) {
      createdItemId = res.body.data._id;
      console.log(`✅ 4. POST /api/wardrobe/upload - PASSED (Item Created ID: ${createdItemId})`);
      passed++;
    } else {
      console.error('❌ 4. POST /api/wardrobe/upload - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 4. POST /api/wardrobe/upload - ERROR:', e.message);
    failed++;
  }

  // Add a complementary bottom item for outfit generation
  try {
    const bottomData = {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample_jeans.jpg',
      category: 'bottom',
      type: 'jeans',
      primaryColor: 'navy',
      pattern: 'solid',
      material: 'denim',
      style: 'casual',
      formality: 3,
      seasons: ['summer', 'winter', 'monsoon'],
      occasions: ['college', 'casual', 'party'],
    };
    await makeRequest('/api/wardrobe/upload', 'POST', bottomData, authToken);
  } catch (e) {}

  // Test 5: GET /api/wardrobe (List & Filter)
  try {
    const res = await makeRequest('/api/wardrobe?category=top', 'GET', null, authToken);
    if (res.status === 200 && res.body.success && Array.isArray(res.body.data)) {
      console.log(`✅ 5. GET /api/wardrobe?category=top - PASSED (${res.body.count} items returned)`);
      passed++;
    } else {
      console.error('❌ 5. GET /api/wardrobe - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 5. GET /api/wardrobe - ERROR:', e.message);
    failed++;
  }

  // Test 6: GET /api/wardrobe/underused
  try {
    const res = await makeRequest('/api/wardrobe/underused', 'GET', null, authToken);
    if (res.status === 200 && res.body.success && Array.isArray(res.body.data)) {
      console.log(`✅ 6. GET /api/wardrobe/underused - PASSED (${res.body.count} underused items identified)`);
      passed++;
    } else {
      console.error('❌ 6. GET /api/wardrobe/underused - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 6. GET /api/wardrobe/underused - ERROR:', e.message);
    failed++;
  }

  // Test 7: POST /api/stylist/generate (AI Outfit Recommendation Engine)
  try {
    const requestData = {
      occasion: 'college',
      style: 'smart-casual',
      weather: { temperature: 28, condition: 'sunny' },
      preferences: { preferredColors: ['white', 'navy'], avoidColors: [] },
    };
    const res = await makeRequest('/api/stylist/generate', 'POST', requestData, authToken);
    if (res.status === 200 && res.body.success && res.body.data.outfits) {
      const topOutfit = res.body.data.outfits[0];
      console.log(`✅ 7. POST /api/stylist/generate - PASSED (Generated ${res.body.data.outfits.length} outfits, Top Score: ${topOutfit ? topOutfit.score : 'N/A'})`);
      passed++;
    } else {
      console.error('❌ 7. POST /api/stylist/generate - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 7. POST /api/stylist/generate - ERROR:', e.message);
    failed++;
  }

  // Test 8: POST /api/outfits (Save Outfit History)
  let outfitId = null;
  if (createdItemId) {
    try {
      const res = await makeRequest(
        '/api/outfits',
        'POST',
        {
          garmentIds: [createdItemId],
          occasion: 'college',
          style: 'smart-casual',
          weather: { temperature: 28, condition: 'sunny' },
          score: 93.5,
        },
        authToken
      );
      if ((res.status === 201 || res.status === 200) && res.body.success && res.body.data._id) {
        outfitId = res.body.data._id;
        console.log(`✅ 8. POST /api/outfits - PASSED (Outfit Saved ID: ${outfitId})`);
        passed++;
      } else {
        console.error('❌ 8. POST /api/outfits - FAILED:', res);
        failed++;
      }
    } catch (e) {
      console.error('❌ 8. POST /api/outfits - ERROR:', e.message);
      failed++;
    }
  }

  // Test 9: GET /api/outfits (Get Outfit History)
  try {
    const res = await makeRequest('/api/outfits', 'GET', null, authToken);
    if (res.status === 200 && res.body.success && Array.isArray(res.body.data)) {
      console.log(`✅ 9. GET /api/outfits - PASSED (${res.body.count} outfits retrieved)`);
      passed++;
    } else {
      console.error('❌ 9. GET /api/outfits - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 9. GET /api/outfits - ERROR:', e.message);
    failed++;
  }

  // Test 10: GET /api/insights (Wardrobe Analytics, Utilization % & Gap Detection)
  try {
    const res = await makeRequest('/api/insights', 'GET', null, authToken);
    if (res.status === 200 && res.body.success && res.body.data.totalGarments !== undefined) {
      const d = res.body.data;
      console.log(`✅ 10. GET /api/insights - PASSED (Total: ${d.totalGarments}, Utilization: ${d.wardrobeUtilizationPercentage}%, Gaps: ${d.wardrobeGaps.length})`);
      passed++;
    } else {
      console.error('❌ 10. GET /api/insights - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 10. GET /api/insights - ERROR:', e.message);
    failed++;
  }

  // Test 11: POST /api/chat/message (AI Stylist Chatbot Route)
  try {
    const res = await makeRequest(
      '/api/chat/message',
      'POST',
      { query: 'Suggest an outfit for a wedding' },
      authToken
    );
    if (res.status === 200 && res.body.success && res.body.message) {
      console.log('✅ 11. POST /api/chat/message - PASSED (Conversational AI Response Received)');
      passed++;
    } else {
      console.error('❌ 11. POST /api/chat/message - FAILED:', res);
      failed++;
    }
  } catch (e) {
    console.error('❌ 11. POST /api/chat/message - ERROR:', e.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED out of ${passed + failed} tests`);
  console.log('====================================================');
}

runTests();
