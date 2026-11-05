export default async function handler(req, res) {
  // السماح بالوصول من أي نطاق (حل مشكلة CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, domain, fromweb, lang');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // استخراج الـ Endpoint المطلوب من الرابط
  const { endpoint, ...queryParams } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Endpoint is required' });

  const targetUrl = `https://api.fareeqsanadalkhair.com${endpoint}?${new URLSearchParams(queryParams)}`;
  
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'domain': 'fareeqsanadalkhair.com',
        'fromWeb': 'true',
        'lang': 'ar',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // تمرير التوكن إذا كان موجوداً في الهيدر
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
      // تمرير البيانات (Body) فقط في حال كان الطلب POST أو PUT
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : undefined,
    });

    // قراءة الرد من السيرفر (سواء كان JSON أو نص)
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy Error', details: error.message });
  }
}