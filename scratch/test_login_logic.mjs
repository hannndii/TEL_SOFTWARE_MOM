import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

async function test() {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const user_id = '4bc38d95-5a88-4dbb-a4e3-8766b40123c3'; // From earlier DB test
  
  for(let i = 0; i < 4; i++) {
    const deviceId = crypto.randomUUID();
    
    console.log(`\n--- Login ${i+1} ---`);
    await supabaseAdmin.from('user_devices').upsert({
      user_id,
      device_id: deviceId,
      last_active: new Date().toISOString()
    }, { onConflict: 'user_id, device_id' });

    const { data: activeDevices, error } = await supabaseAdmin
      .from('user_devices')
      .select('id, device_id')
      .eq('user_id', user_id)
      .order('last_active', { ascending: true });

    console.log('Active Devices:', activeDevices?.length);
    if (error) console.log('Error:', error);

    if (activeDevices && activeDevices.length > 2) {
      const devicesToDelete = activeDevices.slice(0, activeDevices.length - 2);
      console.log('Deleting:', devicesToDelete.length);
      for (const device of devicesToDelete) {
        await supabaseAdmin.from('user_devices').delete().eq('id', device.id);
      }
    }
  }

  const { data: finalDevices } = await supabaseAdmin.from('user_devices').select('id, device_id').eq('user_id', user_id);
  console.log('\nFinal Devices in DB:', finalDevices?.length);
}

test();
