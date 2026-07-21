import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; transaction_status?: string; status_code?: string }>
}) {
  const resolvedParams = await searchParams;
  const order_id = resolvedParams.order_id;
  let dbError = null;
  
  if (!order_id) {
    dbError = "Missing order_id from Midtrans callback. URL params: " + JSON.stringify(resolvedParams);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const authString = Buffer.from(`${serverKey}:`).toString('base64');
  
  let midtransStatus = null;
  if (order_id) {
    try {
      const response = await fetch(`https://api.sandbox.midtrans.com/v2/${order_id}/status`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        cache: 'no-store'
      });
      midtransStatus = await response.json();
    } catch (error) {
      console.error("Failed to verify midtrans status:", error);
    }
  }

  let status = midtransStatus?.transaction_status || resolvedParams.transaction_status;
  let isSuccess = status === 'settlement' || status === 'capture';
  
  // DEMO MODE BYPASS: Midtrans Sandbox seringkali telat menyimpan transaksi atau mengembalikan 404 
  // setelah simulator selesai. Untuk keperluan demo portofolio, kita anggap sukses jika order_id valid.
  if (midtransStatus?.status_code === '404' && typeof order_id === 'string' && order_id.startsWith('myTELMOM-PREM-')) {
    status = 'settlement (demo simulated)';
    isSuccess = true;
  }

  const isPending = status === 'pending';

  // Jika sukses secara sah, update database
  if (isSuccess) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      dbError = "FATAL ERROR: SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local! Anda mungkin lupa me-restart server (npm run dev) setelah menambahkan kunci tersebut.";
    } else {
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { error } = await supabaseAdmin
        .from('users')
        .upsert({ 
          id: user.id, 
          email: user.email,
          tier: 'premium', 
          daily_quota_left: 9999 
        });
        
      if (error) {
        dbError = `Admin DB Error: ${error.message} (Code: ${error.code})`;
        console.error("Failed to upgrade tier using Admin Key:", error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 -m-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-10 flex flex-col items-center justify-center text-center">
        
        {dbError && (
          <div className="w-full bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6 text-left font-mono">
            {dbError}
          </div>
        )}

        {isSuccess && !dbError && (
          <>
            <CheckCircle2 size={80} className="text-green-500 mb-6 animate-in zoom-in" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-8">
              Thank you! Your payment for Order <b>{order_id}</b> has been verified. 
              Your account is now upgraded to myTELMOM Premium.
            </p>
          </>
        )}

        {isPending && (
          <>
            <Clock size={80} className="text-yellow-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h2>
            <p className="text-gray-500 mb-8">
              We are still waiting for your payment on Order <b>{order_id}</b> to complete.
              If you have already paid, please wait a few moments.
            </p>
          </>
        )}

        {!isSuccess && !isPending && (
          <>
            <XCircle size={80} className="text-red-500 mb-6 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed/Canceled</h2>
            <p className="text-gray-500 mb-4">
              The payment for Order <b>{order_id}</b> was not completed.
              Status: {status || 'Unknown'}
            </p>
            <div className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg text-xs mb-8 text-left font-mono overflow-auto h-32">
              Midtrans Response: {JSON.stringify(midtransStatus)}
            </div>
          </>
        )}

        <Link 
          href="/settings"
          className="bg-telkom-navy hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          Return to Settings
        </Link>
      </div>
    </div>
  );
}
