// append functions to publican and tacs objects
import * as feed from './feed.js';
import * as format from './format.js';
import * as hook from './hook.js';
import * as nav from './nav.js';
import { replaceMap } from './replace.js';
export * from './util.js';


export function libInit(publican, tacs) {

  if (publican) {

    // event hooks

    // post date from filename
    publican.config.processContent.add( hook.processFileDate );

    // processContent hook: custom {{ filename }} code tabs
    publican.config.processContent.add( hook.contentFilename );

    // processContent hook: replace ::: tags
    publican.config.processContent.add( hook.htmlBlocks );

    // processRenderStart hook: modify titles, descriptions, etc.
    publican.config.processRenderStart.add( hook.renderstartData );

    // processRenderStart hook: generate site inline scripts and CSP hashes
    publican.config.processRenderStart.add( hook.renderstartInlineScripts );

    // processRenderStart hook: create tacs.tagScore Map
    publican.config.processRenderStart.add( hook.renderstartTagScore );

    // processPreRender hook: determine related posts
    publican.config.processPreRender.add( hook.prerenderRelated );

    // processPreRender hook: generate page inline scripts and CSP hashes
    publican.config.processPreRender.add( hook.prerenderInlineScripts );

    // processPostRender hook: add <meta> tags
    publican.config.processPostRender.add( hook.postrenderMeta );


    // string replacement
    publican.config.replace = new Map([
      ...publican.config.replace,
      ...replaceMap( publican.config.root ),
    ]);

  }

  if (tacs) {

    // library functions
    tacs.lib = tacs.lib || {};

    tacs.lib.feed = feed;
    tacs.lib.format = format;
    tacs.lib.nav = nav;

  }

}
