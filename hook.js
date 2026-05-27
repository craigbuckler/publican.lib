// Publican hook functions
import { number, dateISO } from './format.js';
import { cspScript } from './util.js';


// processContent hook: determine date from YYYY-MM-DD_filename
export function processFileDate( data, filename ) {

  // get date from filename if not set
  if (!data.date) {
    const d = filename.match(/(\d{4}-\d{2}-\d{2})_/);
    if (d?.length === 2) data.date = new Date( d[1] );
  }

  // parse date modified
  if (data.modified) {
    const d = new Date( data.modified );
    if (!isNaN(d) && d instanceof Date) data.modified = d;
    else delete data.modified;
  }

}


// processContent hook: format markdown {{ filename }} above ``` to a code block tab
export function contentFilename( data ) {
  data.content = data.content
    .replace(/<p>\{\{\s*(.+?)\s*\}\}<\/p>(\s*<pre class="(.+?)")/gi, '<p class="filename $3"><dfn>$1</dfn></p>$2');
}


// processContent hook: replace markdown "::: tag" with HTML tags
export function htmlBlocks( data ) {

  data.content = data.content
    .replace(/((<.+?>){0,1}\s*:::(.+?)(<\/.+?>){0,1}\n)/gi, (m, p1, p2, p3, p4, pos, str) => {

      // tag offset
      pos += (p2 || '').length + 3;

      if (str.lastIndexOf('<code', pos) > str.lastIndexOf('</code', pos)) {

        // inside a code block - no change
        return p1;

      }
      else {

        // replace ::: tag and smart quotes with HTML
        let tag = `<${
          p3.trim()
            .replace(/[\u2018\u2019]/g, '\'')
            .replace(/[\u201C\u201D]/g, '"')
        }>\n`;

        // swap outer tags
        if (!p2 || !p4) {
          tag = (p4 || '') + tag + (p2 || '');
        }

        return tag;

      }
    });

}


// processRenderStart hook: modify titles and descriptions
export function renderstartData( tacs ) {

  tacs.all.forEach(p => {

    if (p.isTagIndex) {

      const posts = `post${ p.childPageTotal === 1 ? '' : 's' }`;
      p.title = `&ldquo;${ p.isTagIndex }&rdquo; ${ posts }`;
      p.description = `List of ${ number( p.childPageTotal ) } ${ posts } using the tag &ldquo;${ p.isTagIndex }&rdquo;.`;

    }
  });

}


// processRenderStart hook: generate inline scripts and CSP hashes for all pages
export function renderstartInlineScripts( tacs ) {

  tacs.script = new Map();
  tacs.script.set('theme', cspScript('{let t=()=>{document.documentElement.dataset.theme=localStorage.getItem("theme")||""};window.addEventListener("pageshow",e=>{e.persisted&&t()}),t()}'));
  tacs.script.set('speculation', cspScript(`{"prerender":[{"where":{"href_matches":"${ tacs.root }*"},"eagerness":"moderate"}]}`, 'speculationrules'));

}


// processPreRender hook: generate page inline scripts and CSP hashes for single page
export function prerenderInlineScripts( data, tacs ) {

  data.script = new Map();
  data.script.set('schema', cspScript(
    '{' +
      '"@context":"http://schema.org/",' +
      '"@type":"TechArticle",' +
      '"proficiencyLevel":"beginner",' +
      `"headline":"${ data.title }",` +
      `"description":"${ data.description }",` +
      `"datePublished":"${ dateISO( data.date ) }T00:00:00+00:00",` +
      `"dateModified":"${ dateISO( data.modified || data.date ) }T00:00:00+00:00",` +
      `"mainEntityOfPage":{"@type":"WebPage","@id":"${ tacs.config.domain }${ data.link }"},` +
      `"image":"${ tacs.config.domain }${ tacs.root }${ data.hero || 'favicon.svg' }",` +
      `"author":{"@type":"Person","name":"${ data.author || tacs.config.author || 'Publican' }","url":"${ data.authorUrl || tacs.config.authorUrl || 'https://publican.dev/' }"},` +
      `"inLanguage":"${ tacs.config.language }",` +
      '"contentLocation":"online",' +
      '"accessMode":["textual"],' +
      '"accessModeSufficient":"textual",' +
      '"isFamilyFriendly":true,' +
      `"wordCount":${ data.wordCount || 0 }` +
    '}',
    'application/ld+json'
  ));

}


// processRenderStart hook: calculate tacs.tagScore { rel: score } Map
// lesser-used tags have a higher score
export function renderstartTagScore( tacs ) {

  if (!tacs.tagList.length) return;

  // maximum tag count
  const countMax = tacs.tagList[0].count + 1;

  // tag score Map
  tacs.tagScore = new Map();
  tacs.tagList.forEach(t => tacs.tagScore.set(t.ref, countMax - t.count));

}


// processPreRender hook: related posts, generated at pre-render time
export function prerenderRelated( data, tacs ) {

  if (!tacs.tagScore || !data.filename || !data.title || !data.isHTML || !data.tags) return;

  const relScore = [];

  // calculate other post relevency scores
  tacs.all.forEach((post, slug) => {

    if (data.slug == slug || !post.filename || !post.title || !post.isHTML || !post.tags) return;

    let score = 0;

    // calculate matching tag scores
    data.tags.forEach(dTag => {
      post.tags.forEach(pTag => {
        if (dTag.ref === pTag.ref) score += tacs.tagScore.get( dTag.ref );
      });
    });

    // calculate matching directory scores
    const
      dDir = data.link.split('/').filter(d => d),
      pDir = post.link.split('/').filter(d => d);

    let i = 0;
    while (i >= 0) {

      if (dDir[i] && dDir[i] === pDir[i]) {
        i++;
        score += i;
      }
      else i = -1;

    }

    // record related
    if (score) relScore.push( { slug, score } );

  });


  // add to related posts sorted by score
  data.related = relScore
    .sort((a, b) => b.score - a.score || b.date - a.date )
    .map(p => tacs.all.get( p.slug ) );

}


// processPostRender hook: add further HTML meta data
export function postrenderMeta( output, data ) {
  if (data.isHTML && data.index) {
    output = output.replace('</head>', '<meta name="generator" content="Publican.dev">\n</head>');
  }
  return output;
}
