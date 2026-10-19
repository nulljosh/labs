import { createClient } from './spark-client.js';

// Accounts and leads live in the spark-api Worker (Cloudflare D1). The signed-in user's own token is the only credential.
export const spark = createClient('https://api.jaybulb.com');

// Leads the website has captured but the dashboard has not turned into jobs yet.
export async function fetchNewLeads() {
  const { data, error } = await spark
    .from('bcgd_leads')
    .select('id, created_at, name, phone, service, message')
    .eq('status', 'Lead')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markLeadsImported(ids) {
  if (!ids.length) return;
  const { error } = await spark
    .from('bcgd_leads')
    .update({ status: 'Imported' })
    .in('id', ids);
  if (error) throw error;
}
