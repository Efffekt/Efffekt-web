import type { APIRoute } from 'astro';

const PIXEL_ID = '2400693193732959';
const ACCESS_TOKEN = import.meta.env.FB_CONVERSIONS_API_TOKEN;
const API_VERSION = 'v21.0';
const FB_ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const POST: APIRoute = async ({ request }) => {
  if (!ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Missing API token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: {
    event_name: string;
    event_id: string;
    event_source_url: string;
    user_data?: {
      email?: string;
      first_name?: string;
      fbp?: string;
      fbc?: string;
    };
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { event_name, event_id, event_source_url, user_data } = body;

  if (!event_name || !event_id) {
    return new Response(JSON.stringify({ error: 'Missing event_name or event_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build hashed user data
  const hashedUserData: Record<string, string> = {};

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const userAgent = request.headers.get('user-agent');

  if (clientIp) hashedUserData.client_ip_address = clientIp;
  if (userAgent) hashedUserData.client_user_agent = userAgent;
  if (user_data?.fbp) hashedUserData.fbp = user_data.fbp;
  if (user_data?.fbc) hashedUserData.fbc = user_data.fbc;
  if (user_data?.email) hashedUserData.em = await sha256(user_data.email);
  if (user_data?.first_name) hashedUserData.fn = await sha256(user_data.first_name);

  const eventData = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        event_source_url,
        action_source: 'website',
        user_data: hashedUserData,
      },
    ],
  };

  try {
    const response = await fetch(`${FB_ENDPOINT}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[FB CAPI] Error:', JSON.stringify(result));
      return new Response(JSON.stringify({ error: 'Facebook API error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[FB CAPI] Fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send event' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
