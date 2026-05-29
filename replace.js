// string replacement
import { dateYear } from './format.js';

export function replaceMap(root = '/') {

  return new Map([

    // text replace
    [ '__/', root ],
    [ '--ROOT--', root ],
    [ '--COPYRIGHT--', `&copy;<time datetime="${ dateYear() }">${ dateYear() }</time>` ],

    // style replace
    [ ' style="text-align:left"', '' ],
    [ ' style="text-align:start"', '' ],
    [ ' style="text-align:end"', ' class="right"' ],
    [ ' style="text-align:right"', ' class="right"' ],
    [ ' style="text-align:center"', ' class="center"' ],

    // table scrolling
    [ /(?<!<div class="tablescroll">)<table>/gm, '<div class="tablescroll"><table>' ],
    [ /<\/table>(?!<\/div>)/gm, '</table></div>' ],

    // unnecessary <p> container
    [ /<p>(<img.+?>)<\/p>/gim, '$1' ],
    [ /<p>(<svg.+?<\/svg>)<\/p>/gim, '$1' ],
    [ /<p>(<iframe.+?<\/iframe>)<\/p>/gim, '$1' ],
    [ /<p>(<youtube-lite.+?<\/youtube-lite>)<\/p>/gim, '$1' ],

    // multiple <blockquote>
    [ /<\/blockquote>\s*<blockquote>/gi, '' ],

    // <img> alt
    [ /<img(\b(?![^>]*\balt\s*=)[^>]*)\/{0,1}>/gism, '<img$1 alt="illustration">' ],
    [ /alt=""/gim, 'alt="decoration"' ],

    // <img> lazy load
    [ /<img(\b(?![^>]*\bloading\s*=)[^>]*)\/>/gism, '<img$1 loading="lazy">' ],
    [ /<img(\b(?![^>]*\bloading\s*=)[^>]*)>/gism, '<img$1 loading="lazy">' ],

    // JSON feed encoding
    [ '&feedquot;', '\\"' ],
    [ '&feedtab;', '\\t' ],
    [ '&feedcr;', '\\n' ],

  ]);

}
