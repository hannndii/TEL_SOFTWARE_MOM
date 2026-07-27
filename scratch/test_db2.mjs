import { createClient } from '@supabase/supabase-js'; 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); 
supabase.rpc('get_table_schema', { table_name: 'user_devices' }).then(res => console.log(res));
// Fallback if rpc is not there
supabase.from('user_devices').select('*').limit(5).then(res => console.log(res.data));
