// utility functions
import { stat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';


// process an environment variable
export function env(name, def = null) {

  const val = process.env[name];
  if (!val) return def;
  const num = +val;
  return isNaN(num) ? val : num;

}


// normalize a string - lower case alphanumerics with dash instead of spaces
export function normalize(str) {

  return str
    .toLowerCase()
    .replace(/\W/g, ' ')
    .trim()
    .replace(/\s+/g, '-');

}


// create hash a string
export function strHash(str) {

  return createHash('md5').update(str).digest('hex');

}


// create CSP hash for <script> block
export function cspScript(code, type) {
  return {
    code: `<script${ type ? ` type="${ type }"` : '' }>${ code }</script>`,
    hash: createHash('sha256').update(code).digest('base64')
  };
}


// sortBy object property function
export function sortBy(prop) {
  return (a, b) => {
    if (a[ prop ] < b[ prop ]) return -1;
    else if (a[ prop ] > b[ prop ]) return 1;
    else return 0;
  };
}


// fetch with timeout, caching, and parsing
const jsonType = 'application/json';

export async function apiFetch({
  uri = null,
  method = 'GET',
  headers = {},
  authKey = null,
  contentType = null,
  body = null,
  timeout = 10000,
  cacheDir = null,
  cacheMin = 10
} = {}) {

  // default response
  const response = { ok: false, status: 0, body: null };

  // no URI set?
  if (!uri) return response;

  // fetch method
  method = method.trim().toUpperCase();

  // format fetch headers
  if (authKey && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${ authKey }`;
  }

  contentType = contentType || jsonType;
  if (contentType && !headers['Content-Type']) {
    headers['Content-Type'] = contentType;
  }

  // validate cacheMin
  cacheMin = +cacheMin;
  cacheMin = isNaN(cacheMin) ? 0 : cacheMin * 60000;

  // cache file name
  const cache = cacheDir && cacheMin ?
    join(cacheDir, strHash(uri + method + JSON.stringify(headers) + JSON.stringify(body))) :
    false;

  // use cached data?
  if (cache) {

    const cInfo = await fileInfo(cache);

    // read cache
    if (cInfo.isFile && Date.now() - cInfo.modified < cacheMin) {

      try {

        const content = JSON.parse( await readFile( cache, { encoding: 'utf8' } ) );
        return { ok: true, status: 200, body: content, cache };

      }
      catch(err) {
        // ignore cache read error
      }

    }

  }

  // fetch data
  const
    url = new URL(uri),
    opt = {
      method,
      headers
    };

  // format data
  if (body) {
    if (method === 'GET') {
      url.search = new URLSearchParams(body);
    }
    else {
      opt.body = JSON.stringify(body);
    }
  }

  // timeout
  if (timeout) {
    opt.signal = AbortSignal.timeout(timeout);
  }

  try {

    // fetch data
    const res = await fetch(url, opt);

    // parse response
    response.ok = res.status === 200;
    response.status = res.status;

    if (res?.headers?.get('content-type') === jsonType) {
      response.body = await res.json();
    }
    else {
      response.body = await res.text();
    }

  }
  catch(err) {

    // fetch error
    response.status = response.status || (err.name === 'TimeoutError' ? 408 : 400);
    response.error = err.name;
    response.body = err.message;

  }


  // cache data?
  if (response.ok && cache) {

    try {

      await mkdir(cacheDir, { recursive: true });
      await writeFile(cache, JSON.stringify(response.body));

    }
    catch (err) {
      // ignore cache write error
    }

  }

  return response;

}


// get file information
export async function fileInfo(path) {

  const info = {
    exists: false,
    isFile: false,
    isDir: false,
    modified: undefined
  };

  try {
    const i = await stat(path);

    info.exists = true;
    info.isFile = i.isFile();
    info.isDir = i.isDirectory();
    info.modified = i.mtimeMs;

  }
  catch (e) {}

  return info;

}
