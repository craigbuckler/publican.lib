// feed formatting functions

// RSS feed content - remove invalid attributes and use absolute URLs
export function rss( str, domain = '//', root = '/' ) {

  const
    absRegEx = new RegExp(`(\\s(action|cite|data|href|ping|poster|src|srcset)="{0,1})${ root }`, 'gi'),
    replace = `$1${ domain }${ root }`;

  return (str || '')
    .trim()
    .replaceAll(/\s*tabindex="*.*?"*>/gi, '>')              // remove tabindexes
    .replaceAll(/\s*<a.*?class="*headlink"*>#<\/a>/gi, '')  // remove headlinks
    .replaceAll(absRegEx, replace);                         // use absolute URLs

}

// JSON feed - RSS processing plus special character removal
export function json( str, domain = '//', root = '/' ) {

  return rss(str, domain, root)
    .replaceAll('"', '&feedquot;')
    .replaceAll('\r', '')
    .replaceAll('\t', '&feedtab;')
    .replaceAll('\n', '&feedcr;');

}

// escape HTML and XML
export function escape( str ) {

  return (str || '')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');

}
