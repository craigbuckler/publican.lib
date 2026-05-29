# Publican.lib

A standard library of functions and utilities for [Publican static sites](https://publican.dev/). Refer to [publican.dev/tools/publican.lib/](https://publican.dev/tools/publican.lib/) for full documentation.


## Import everything

Install Publican.lib in your Publican project:

```bash
npm install publican.lib
```

Then import it into your Publican configuration file:

```js
// Publican configuration
import { libInit } from 'publican.lib';
```

Pass `publican` and `tacs` to the `libInit()` initialization function before calling `await publican.build();`

```js
// ...set Publican defaults...

// initialize publican.lib
libInit(publican, tacs);

// optionally set the default language
tacs.lib.format.setLocale( 'en-US' );

// build
await publican.build();
```


## Import individual utilities

Rather than using all functionality, you can choose to import specific functions. For example, to use all formatting and the `nav.pagination()`:

```js
// Publican configuration
import { Publican, tacs } from 'publican';

// import from Publican.lib
import * as format from 'publican.lib/format';
import { pagination } from 'publican.lib/nav';

// create a global functions object
tacs.fn = tacs.fn || {};

// use all tacs.fn.format functions in templates
tacs.fn.format = format;

// use tacs.fn.nav.pagination() function in templates
tacs.fn.nav = { pagination };
```


## Utility functions

The `util` library provides utility functions you can use in your Publican configuration file or elsewhere.


### `env(name [, default])`

Fetches an environment variable, converts to a numeric value where possible, and reverts to a default when necessary:

```js
// isDev true when NODE_ENV is explicitly set to "development"
const isDev = (env('NODE_ENV', 'production') === 'development');
```


### `apiFetch(object)`

Make an HTTP request, format the response, and cache when required. The object parameter properties:

* `uri` - required
* `method` such as `"GET"` (the default) or `"POST"`
* `headers` - optional object with name/value pairs
* `authKey` - optional request header `Authorization` token
* `contentType` - optional request header `Content-Type` (JSON by default)
* `body` - request body as a querystring, object, or array of arrays
* `timeout` - in millseconds (default of 10000 -- 10 seconds)
* `cacheDir` - cache directory location (not used by default)
* `cacheMin` - the number of minutes to cache data

The function returns an object with the following properties:

* `ok`: either `true` or `false`
* `status`: the HTTP status code (`200` for OK)
* `body`: the resulting text or JSON response (or error message)
* `error`: error code
* `cache`: the cache file name when returning cached results

Example that caches a response for 10 minutes:

```js
const res = await apiFetch({
  uri: 'https://api.site.com/call',
  authKey: 'mytoken',
  cacheDir: './_cache/'
});

if (res.ok) console.log(res.body);
```


### `normalize(str)`

Normalizes a string to lowercase characters with hyphens in place of spaces:

```js
normalize(' Publican Library 1 ');
// returns "publican-library-1"
```


### `strHash(str)`

Hashes a string to an MD5 hex value.

```js
strHash('Publican Library');
```

[`apiFetch()`](#apifetchobject) uses a hash of the HTTP URI, headers, and body as a filename when caching response data.


### `cspScript(code [, type])`

When passed client-side JavaScript code in a string and an optional [`type` attribute](https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/script/type), `cspScript()` returns an object with the properties:

* `code`: the inline code inside a `<script>` tag, and
* `hash`: a SHA-256 hash for [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/Guides/CSP) `script-src` settings.

```js
const tacs.myScript = cspScript('alert("Hello!")');
```

You can use this in a template:

```html
<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy" content="
default-src 'self';
script-src 'self' 'sha256-${ tacs.myScript.hash }';
">

<!-- add inline <script> -->
${ tacs.myScript.code }
```

> Note: Publican [minifies inline JavaScript](https://publican.dev/docs/reference/publican-options/#html-minification) by default. Always pass a minified script to `cspScript()` to ensure it's not minified and the CSP hash remains the same.


### `sortBy(prop)`

A function to sort an array using property values, e.g.

```js
const obj = [
  { name: "Craig" },
  { name: "Bob" },
  { name: "Anne" },
].sort( sortBy('name') );
// in order: Anne, Bob, Craig
```


### `fileInfo(path)`

When passed a file path, it returns an object with the following properties:

* `exists`: true or false
* `isFile`: true when a file
* `isDir`: true when a directory
* `modified`: the last modification timestamp

Returns an object with file information:

```js
const
  file = './somefile.txt',
  info = fileInfo(file);

if (info.exists) {

  console.log(file);

  if (info.isFile) {
    console.log('is a file');
  }
  else if (info.isDir) {
    console.log('is a directory');
  }

}
```


## Event hook functions

The `hook` [event functions](https://publican.dev/docs/reference/event-functions/) append supplemental data and change some aspects of static site rendering.

### `processFileDate()`

A [processContent hook](https://publican.dev/docs/reference/event-functions/#processcontent) that sets the content [`date`](https://publican.dev/docs/reference/content-properties/#datadate) and `modified` properties for any content file using a file name pattern `YYYY-MM-DD_something.md`.

It does not alter the [rendered file slug](https://publican.dev/docs/reference/content-properties/#dataslug), but you can remove the date with:

```js
// slug replacement strings - remove YYYY-MM-DD
publican.config.slugReplace.set(/\d{4}-\d{2}-\d{2}_/g, '');
```


### `contentFilename()`

A [processContent hook](https://publican.dev/docs/reference/event-functions/#processcontent) that parses a  `{{ filename }}` above a code block in a markdown file. You can style the resulting HTML to show a tab or similar:

```html
<p class="filename language-js">
  <dfn>myfile.js</dfn>
</p>
<pre class="language-js">...
```


### `htmlBlocks()`

A [processContent hook](https://publican.dev/docs/reference/event-functions/#processcontent) that replaces markdown lines starting `:::` with HTML tags. For example:

```md
::: div id="mydiv"

Some content

::: /div
```

results in the HTML:

```html
<div id="mydiv">

  <p>Some content<p>

</div>
```


### `renderstartData()`

A [processRenderStart hook](https://publican.dev/docs/reference/event-functions/#processrenderstart) that modifies the title and description of all tag index files to create friendlier text such as:

* "JavaScript" posts
* List of 23 posts using the tag "JavaScript".


### `renderstartInlineScripts()`

A [processRenderStart hook](https://publican.dev/docs/reference/event-functions/#processrenderstart) that creates a global `tacs.script` JavaScript Map that defines [inline scripts using cspScript()](#cspscriptcode--type):

1. `tacs.script.get('theme')`: an inline script that appends a `data-theme` attribute to the root `<html>` element using a localStorage value
1. `tacs.script.get('speculation')`: an inline [speculation rules definition](https://developer.mozilla.org/docs/Web/API/Speculation_Rules_API)


### `prerenderInlineScripts()`

A [processPreRender hook](https://publican.dev/docs/reference/event-functions/#processprerender) that creates a `data.script` JavaScript Map for every page that defines an [inline script using cspScript()](#cspscriptcode--type):

1. `data.script.get('schema')`: an inline [schema.org](https://schema.org/) structured data block.


### `renderstartTagScore()`

A [processRenderStart hook](https://publican.dev/docs/reference/event-functions/#processrenderstart) that creates a global `tacs.tagScore` JavaScript Map object that calculates a score for each tag (lesser-used tags have a higher score). This helps determine related articles.


### `prerenderRelated()`

A [processPreRender hook](https://publican.dev/docs/reference/event-functions/#processprerender) that appends a `data.related` array to every page with a list of related articles in order of relevancy. To output the three most-relevant related articles:

```html
${ data?.related?.length ? `
  <aside>
    <h2>Related posts</h2>
    <nav>
      ${ data.related
          .slice(0,3)
          .map(p => `<p><a href="{ p.link }">${ p.title }</a></p>`)
          .join('') }
    </nav>
  </aside>
` : ''}
```


### `postrenderMeta()`

A [processPostRender hook](https://publican.dev/docs/reference/event-functions/#processpostrender) that inserts a Publican `<meta name="generator">` tag into the head of every HTML page.


## Formatting functions

The `format` functions display locale-specific values such as dates and numbers.


### `setLocale(locale)`

Defines the default locale when none is explicitly set in other formatting functions.

```js
tacs.lib.format.setLocale( 'es-ES' );
```


### `number(num [, locale])`

Returns a formatted number with appropriate thousand and fraction symbols.

```html
<p>US: ${ tacs.lib.format.number( 12345.678 ) }</p>
<p>ES: ${ tacs.lib.format.number( 12345.678, 'es-ES' ) }</p>
```

US: 12,345.678

ES: 12.345,678


### `currency(num, currency [, locale])`

Returns a formatted currency with appropriate thousand and fraction symbols.

```html
<p>US: ${ tacs.lib.format.currency( 12345.678, 'USD' ) }</p>
<p>ES: ${ tacs.lib.format.currency( 12345.678, 'USD', 'es-ES' ) }</p>
```

US: $12,345.68

ES: 12.345,68 $


### `numberRound(num [, locale])`

Rounds a number up depending on its size:

* < 1,000: to nearest 1
* \> 1,000 and < 10,000: to nearest 10
* \> 10,000 and < 100,000: to nearest 100
* etc.

```html
<p>${ tacs.lib.format.numberRound( 12345 ) }</p>
<p>${ tacs.lib.format.numberRound( 123456 ) }</p>
```

12,400

124,000


### `dateHuman(date [, locale])`

Returns a date in human-readable format:

```html
<p>US: ${ tacs.lib.format.dateHuman('2026-09-05', 'en-US') }</p>
<p>UK: ${ tacs.lib.format.dateHuman('2026-09-05', 'en-GB') }</p>
<p>ES: ${ tacs.lib.format.dateHuman('2026-09-05', 'es-ES') }</p>
```

US: September 5, 2026

UK: 5 September 2026

ES: 5 de septiembre de 2026


### `dateUTC(date)`

Returns a date in UTC format.

```html
<pre>${ tacs.lib.format.dateUTC('2026-09-05T01:23:45') }</pre>
```

```txt
Sat, 05 Sep 2026 00:23:45 GMT
```


### `dateISO(date)`

Returns a date in ISO format.

```html
<pre>tacs.lib.format.dateISO('2026-09-05T01:23:45')</pre>
```

```txt
2026-09-05
```


### `dateISOfull(date)`

Returns a full datetime in ISO format.

```html
<pre>tacs.lib.format.dateISOfull('2026-09-05T01:23:45')</pre>
```

```txt
2026-09-05T00:23:45.000Z
```


### `dateYear(date)`

Returns a year.

```html
<pre>tacs.lib.format.dateYear('2026-09-05T01:23:45')</pre>
```

```txt
2025
```


## Navigation functions

The `nav` functions provide HTML menus and pagination.


### `menuMain()`

Creates a hierarchical main menu using the HTML `<menu>` structure with `<details>` and `<summary>` elements:

```html
<menu>
  <li>
    <details>
      <summary><a href="/one/">Level One</a></summary>
      <menu>
        <li><strong>Active page</strong></li>
        <li>
          <details>
            <summary><a href="/two/">Level Two</a></summary>
            <menu>
              <li><a href="/sub2-1/">Sub-menu 2-1</a></li>
              <li><a href="/sub2-2/">Sub-menu 2-2</a></li>
            </menu>
          </details>
        </li>
      </menu>
    <details>
  </li>
</menu>
```

The function parameters in order:

* `tacs`: the global `tacs` object (required)
* `currentPage`: the current page's URL from `data.link` (required)
* `allOpen`: either -1=never open `<details>`, 0=when child is active, or 1=always
* `maxLevel`: the maximum depth of links
* `omit`: an array of root directory names to omit

Use in a template:

```html
<nav id="main">
  ${ tacs.lib.nav.menuMain( tacs, data.link ) }
</nav>
```


### `menuDir()`

Creates a hierarchical menu for a specific directory using a similar structure to [`menuMain`](#menumain), but all `<details>` have an `open` attribute set.

Parameters:

* `tacs`: the global `tacs` object (required)
* `rootDir`: the directory name (required)
* `currentPage`: the current page's URL from `data.link` (required)
* `maxLevel`: the maximum depth of links

Use in a template:

```html
<nav id="documentation">
  ${ tacs.lib.nav.menuDir( tacs, 'doc', data.link ) }
</nav>
```


### `breadcrumb()`

Creates a breadcrumb trail to the current page using the HTML structure:

```html
<nav class="breadcrumb">
  <ol>
    <li><a href="/grandparent/">Grand parent</a></li>
    <li><a href="/parent/">Parent</a></li>
  </ol>
</nav>
```

Parameters:

* `tacs`: the global `tacs` object (required)
* `currentPage`: the current page's URL from `data.link` (required)

Use in a template:

```html
${ tacs.lib.nav.breadcrumb( tacs, data.link ) }
```


### `tagList()`

Generates a list of all tags ordered by ascending count of the articles using those tags. It results in the HTML structure:

```html
<nav class="taglist">
  <ul>
    <li class="taglist5"><a href="/tag/one/">one <sup>19</sup></a></li>
    <li class="taglist4"><a href="/tag/two/">two <sup>17</sup></a></li>
    <li class="taglist3"><a href="/tag/three/">three <sup>15</sup></a></li>
    <li class="taglist2"><a href="/tag/four/">four <sup>13</sup></a></li>
    <li class="taglist2"><a href="/tag/five/">five <sup>13</sup></a></li>
    <li class="taglist1"><a href="/tag/six/">six <sup>10</sup></a></li>
  </ul>
</nav>
```

Parameters:

* `tacs`: the global `tacs` object (required)
* `classPrefix`: a `class` name to use (`taglist` by default)
* `classMin`: the minimum size class (1 by default)
* `classMax`: the maximum size class (5 by default)

The most-used tag has a class of `taglist5`. The least-used tag has a class of `taglist1`. All other tags have a value between.

Use in a template:

```html
${ tacs.lib.nav.tagList(tacs) }
```


### `pagination()`

Generates pagination for directory and tag index pages using the HTML structure:

```html
<nav class="pagination">
  <ul>
    <li class="back"><span>◄</span></li>
    <li class="current"><strong>1</strong></li>
    <li><a href="/tag/one/1/">2</a></li>
    <li class="next"><a href="/tag/one/1/" title="next index page">►</a></li>
  </ul>
</nav>
```

Parameters:

* `pagination`: the page's `data.pagination` object (required)

```html
${ tacs.lib.nav.pagination( data.pagination ) }
```


## Feed functions

The `feed` functions help create machine-readable files in JSON and XML format.


### `rss(str, domain, root)`

Removes invalid HTML attributes and ensures all URIs use absolute references.

```xml
<content:encoded><![CDATA[
${ tacs.lib.feed.rss( data.contentRendered, tacs.config.domain, tacs.root ) }
]]></content:encoded>
```


### `json(str, domain, root)`

Does the same as [`rss()`](#rssstr-domain-root) but also applies special encodings for JSON feeds that [are replaced](#json-characters).

```json
"content_html": "${ tacs.lib.feed.json( data.contentRendered, tacs.config.domain, tacs.root ) }"
```


### `escape(str)`

Escapes single-line HTML and XML strings.

```html
<title>${ tacs.lib.feed.escape( data.title ) }</title>
```


## String replacements

The `replace` library provides a single `replaceMap()` function. It's passed the root path and returns a JavaScript Map with [string replacement](https://publican.dev/docs/setup/string-replacement/) definitions.


### Text replacements

* `＿＿/` (double underscore then slash) or `−−ROOT−−` is replaced with the root path
* `−−COPYRIGHT−−` is replaced with `©<CURRENT_YEAR>`


### Style replacements

All elements with a `style` attribute setting the text alignment have `class="center"` or `class="right"` assigned accordingly.


### Table scrolling

All `<table>` elements get a `<div class="tablescroll">` container to help with scrolling on smaller devices (set `overflow-inline: auto;` in CSS).


### Unnecessary paragraphs

Unnecessary `<p>` tags are removed from around `<img>`, `<svg>`, and `<iframe>` elements.


### Image handling

When not explicitly set on `<img>` tags:

* `alt` attributes are added, and
* `loading="lazy"` is set


### JSON characters

Special characters for [JSON feeds](#jsonstr-domain-root) are replaced.
