const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
const env = envStr.split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key) acc[key] = val;
  return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAddAnimal() {
  const defaults = {
    'Cow': { shares: 7, advance: 500 },
  };
  
  const { error } = await supabase
    .from('animals')
    .insert([{
      type: 'Cow',
      identifier: 'Cow-Test',
      total_shares: 7,
      advance_price: 500,
      actual_price: null,
      price_per_share: 500
    }]);

  console.log('Insert Error:', error);
}

testAddAnimal();
