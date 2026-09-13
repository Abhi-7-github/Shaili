const { Client, handle_file } = require('@gradio/client');
const path = require('path');

async function testCatVTONP2P() {
  try {
    console.log('Connecting to zhengchong/CatVTON space (testing /submit_function_p2p endpoint)...');
    const client = await Client.connect('zhengchong/CatVTON');

    const personPath = path.join(__dirname, '../../client/public/shaili_fashion_portrait.jpg');
    const clothPath = path.join(__dirname, '../../client/public/images/outerwear.png');

    console.log('Submitting prediction to /submit_function_p2p...');

    const result = await client.predict('/submit_function_p2p', [
      {
        background: handle_file(personPath),
        layers: [],
        composite: null
      },
      handle_file(clothPath),
      30,  // num_inference_steps
      2.5, // guidance_scale
      42   // seed
    ]);

    console.log('CatVTON P2P Prediction Success:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('CatVTON P2P Test Error:', err.message || err);
  }
}

testCatVTONP2P();
