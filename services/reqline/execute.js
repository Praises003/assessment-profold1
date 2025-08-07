const httpRequest = require('@app-core/http-request');

function parseReqline(reqline) {
  const segments = reqline.split('|').map((s) => s.trim());
  const result = {};

  for (const segment of segments) {
    const [keyword, ...rest] = segment.split(' ');
    const value = rest.join(' ').trim();

    switch (keyword) {
      case 'HTTP':
        if (!['GET', 'POST'].includes(value)) throw new Error('Invalid method');
        result.method = value;
        break;
      case 'URL':
        result.url = value;
        break;
      case 'HEADERS':
        result.headers = JSON.parse(value);
        break;
      case 'QUERY':
        result.query = JSON.parse(value);
        break;
      case 'BODY':
        result.body = JSON.parse(value);
        break;
      default:
        throw new Error(`Unknown segment: ${keyword}`);
    }
  }

  if (!result.method || !result.url) throw new Error('HTTP and URL are required');

  return result;
}

function buildFullUrl(url, query) {
  if (!query) return url;

  const queryString = Object.entries(query)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join('&');

  return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
}

async function executeReqline({ reqline }) {
  try {
    const parsed = parseReqline(reqline);
    const full_url = buildFullUrl(parsed.url, parsed.query);

    const start = Date.now();

    const response = await httpRequest({
      method: parsed.method.toLowerCase(),
      url: full_url,
      headers: parsed.headers || {},
      data: parsed.body || {},
    });

    const stop = Date.now();

    return {
      request: {
        method: parsed.method,
        full_url,
        headers: parsed.headers || {},
        query: parsed.query || {},
        body: parsed.body || {},
      },
      response: {
        http_status: response.status,
        duration: stop - start,
        request_start_timestamp: start,
        request_stop_timestamp: stop,
        response_data: response.data,
      },
    };
  } catch (err) {
    return { error: true, message: err.message };
  }
}

module.exports = executeReqline;
