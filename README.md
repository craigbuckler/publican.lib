# publican.lib

A standard library of functions and utilities for [Publican static sites](https://publican.dev/).


## Quickstart

Install `publican.lib` in your Publican project:

```bash
npm i publican.lib
```

Import it in your Publican configuration file (`publican.config.js`):

```js
// publican.config.js
import { libInit } from 'publican.lib';
```

Then pass `publican` and `tacs` to the `libInit()` initialization function before calling `await publican.build();`

```js
// set Publican defaults, e.g.
// publican.config.root = '/';

// initialize publican.dev
libInit(publican, tacs);

// optionally set the default language
tacs.lib.format.setLocale( 'en-US' );

// build
await publican.build();
```


## Advanced setup

The method above imports all library functions, but you can choose them on an individual basis, e.g.

```js
// Publican configuration
import { Publican, tacs } from 'publican';

import * as format from 'publican.lib/format';
import { pagination } from 'publican.lib/nav';

// create global object
tacs.fn = tacs.fn || {};

// use all tacs.fn.format functions in templates
tacs.fn.format = format;

// use tacs.fn.nav.pagination() function in templates
tacs.fn.nav = { pagination };
```


## feed

`feed` functions help with machine-readable feeds.

### `rss(str, domain, root)`

Removes invalid HTML attributes and ensures all URIs use absolute references. Available as `tacs.lib.feed.rss()` in templates after running `libInit()`:

```html
<content:encoded><![CDATA[
${ tacs.lib.feed.rss( data.contentRendered, tacs.config.domain, tacs.root ) }
]]></content:encoded>
```


### `json(str, domain, root)`

Does the same as [`rss()`](#rss-str-domain-root) but also applies special encodings for JSON feeds. Available as `tacs.lib.feed.json()` in templates after running `libInit()`:

```json
"content_html": "${ tacs.lib.feed.json( data.contentRendered, tacs.config.domain, tacs.root ) }"
```

Ensure special characters are fully replaced using [`replace`](#replace) settings.


## format

`format` functions display locale-specific values such as dates and numbers. All are available as `tacs.lib.format.<fn>` functions after running `libInit()`.


### `setLocale(locale)`

Defines the default locale when none is explicitly set in any of the following functions.

```js
tacs.lib.format.setLocale( 'es-ES' );
```


### `number(num [, locale])`

Returns a formatted number with appropriate thousand and fraction symbols.

```js
tacs.lib.format.number( 12345.678 ); // 12,345.678 - default US
tacs.lib.format.number( 12345.678, 'es-ES' ); // 12.345,678 - Spanish
```


### `currency(num, currency [, locale])`

Returns a formatted currency with appropriate thousand and fraction symbols.

```js
tacs.lib.format.currency( 12345.678, 'USD' ) // $12,345.68 - default US
tacs.lib.format.currency( 12345.678, 'USD', 'es-ES' ) // 12.345,68 $ - Spanish
```


### `numberRound(num [, locale])`

Rounds a number up depending on its size:

* < 1,000: to nearest 1
* > 1,000 and < 10,000: to nearest 10
* > 10,000 and < 100,000: to nearest 100
* etc.

```js
tacs.lib.format.numberRound( 12345 ) // 12,400
```


### `dateHuman(date [, locale])`

Returns a date in human-readable format:

```js
tacs.lib.format.dateHuman('2026-09-05', 'en-US') // September 5, 2026
tacs.lib.format.dateHuman('2026-09-05', 'en-GB') // 5 September 2026
tacs.lib.format.dateHuman('2026-09-05', 'es-ES') // 5 de septiembre de 2026
```


### `dateUTC(date)`

Returns a date in UTC format.

```js
tacs.lib.format.dateUTC('2026-09-05') // Sat, 5 Sep 2025 00:00:00 GMT
```


### `dateISO(date)`

Returns a date in ISO format.

```js
tacs.lib.format.dateISO('2026-09-05') // 2026-09-05
```


### `dateISOfull(date)`

Returns a full datetime in ISO format.

```js
tacs.lib.format.dateISOfull('2026-09-05') // 2026-09-05T00:00:00.000Z
```


### `dateYear(date)`

Returns a year.

```js
tacs.lib.format.dateYear('2026-09-05') // 2026
```


## hook

`hook` provides event functions to append supplemental data and can change static site rendering.


### processContent hook: `processFileDate()`

Sets the `date` and `modified` date values for content when the filename matches `YYYY-MM-DD_something.md`


### processContent hook: `contentFilename()`

Parses `{{ filename }}` above markdown code blocks to create code such as:

```html
<p class="filename language-js">
  <dfn><code class="language-js">format.js</code></dfn>
</p>
```


### processContent hook: `htmlBlocks()`

Replaces lines starting `:::` with HTML tags, e.g.

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


### processRenderStart hook: `renderstartData()`

Modifies the title and description of all tag index files, e.g.

* title: "JavaScript" posts
* description: List of 23 posts using the tag "JavaScript".


### processRenderStart hook: `renderstartInlineScripts()`

Creates a `tacs.script` Map that defines [CSP scripts](#cspscriptcode--type) for theming (theme) and prerender (speculation) inline scripts.


### processPreRender hook: `prerenderInlineScripts()`

Creates a `data.script` Map for every page that defines a [CSP script](#cspscriptcode--type) for structured data.


### processRenderStart hook: `renderstartTagScore()`

Creates a new `tacs.tagScore` Map object that calculates a score for each tag to help determine related articles. Lesser-used tags have a higher score.


### processPreRender hook: `prerenderRelated()`

Appends a `data.related` array to every page with a list of related articles in order of relevancy.


### postrenderMeta: `postrenderMeta()`

Appends a `<meta name="generator">` tag into every HTML page.


## nav

`nav` functions provide navigation functions for menus and pagination. All are available as `tacs.lib.nav.<fn>` functions after running `libInit()`.


### `menuMain(tacs, currentPage [, allOpen, maxLevel, omit])`

Creates a hierarchical main menu using the HTML structure:

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

Parameters:

* `tacs` - the global `tacs` object - required
* `currentPage` - the current page's URL from `data.link` - required
* `allOpen` - either -1=never, 0=when child is active, or 1=always
* `maxLevel` - the maximum depth of links
* `omit` - an array of root directory names to omit

Use in a template:

```html
<nav id="main">
  ${ tacs.lib.nav.menuMain( tacs, data.link ) }
</nav>
```


### `menuDir(tacs, rootDir, currentPage [, maxLevel])`

Creates a hierarchical menu for a specific directory using a similar structure to [`menuMain`](#menumaintacs-currentpage--allopen-maxlevel-omit), but all `<details>` have an `open` attribute set.

Parameters:

* `tacs` - the global `tacs` object - required
* `rootDir` - directory name - required
* `currentPage` - the current page's URL from `data.link` - required
* `maxLevel` - the maximum depth of links

Use in a template:

```html
<nav id="documentation">
  ${ tacs.lib.nav.menuDir( tacs, 'doc', data.link ) }
</nav>
```


### `breadcrumb(tacs, currentPage)`

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

* `tacs` - the global `tacs` object - required
* `currentPage` - the current page's URL from `data.link` - required

Use in a template:

```html
${ tacs.lib.nav.breadcrumb( tacs, data.link ) }
```


### `tagList(tacs [, classPrefix, classMin, classMax])`

Generates a list of all tags ordered by a count of the articles using those tags using the HTML structure:

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

* `tacs` - the global `tacs` object - required
* `classPrefix` - a `class` name to use (`taglist` by default)
* `classMin` - the minimum size counter (1 by default)
* `classMax` - the maximum size counter (5 by default)

The most-used tag has a class of `taglist5`. The least-used tag has a class of `taglist1`. All other tags have a value between.

Use in a template:

```html
${ tacs.lib.nav.tagList(tacs) }
```


### `pagination(pagination)`

Generates pagination on directory and tag index pages using the HTML structure:

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

Use in a template by passing the page's `data.pagination` object:

```html
${ tacs.lib.nav.pagination( data.pagination ) }
```


## replace

`replace` provides custom string replacements that fixes common HTML issues and JSON encoding.


### `replaceMap(root)`


## util

`util` provides utility functions you can import, e.g.

```js
import { env, apiFetch } from 'publican.lib';
```


### `env(name [, default])`

Fetches an environment variable, converts to a numeric value where possible, and reverts to a default when necessary:

```js
const isDev = (env('NODE_ENV', 'production') === 'development');
```


### `normalize(str)`

Normalizes a string to lowercase characters with hyphens in place of spaces:

```js
normalize(' Publican Library 1 '); // "publican-library-1"
```


### `strHash(str)`

Hashes a string to an MD5 hex value, as used by [`apiFetch()`](#apifetchobject) when caching HTTP requests:

```js
strHash('Publican Library');
```


### `cspScript(code [, type])`

Creates the `<script>` code with it's optional [`type` attribute](https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/script/type) and [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/Guides/CSP) `script-src` SHA-256 hash for inline scripts. It returns an object with `code` and `hash` properties, e.g.

```js
const myScript = cspScript('alert("Hello!")');
// {
//   code: "<script>alert("Hello")</script>",
//   hash: "abc..."
// }
```


### `sortBy(prop)`

A function to sort an array using property values, e.g.

```js
const obj = [
  { name: "Craig" },
  { name: "Bob" },
  { name: "Anne" },
].sort( sortBy('name') );
// now in Anne, Bob, Craig order
```


### `apiFetch(object)`

Make an HTTP request with optional caching. The object parameters:

* `uri` - required
* `method` such as `"GET"` (the default) or `"POST"`
* `headers` - optional object with name/value pairs
* `authKey` - optional request header Authorization token
* `contentType` - optional request header Content-Type (JSON by default)
* `body` - request body as a querystring, object, or array of arrays
* `timeout` - in millseconds (default of 10000)
* `cacheDir` - the location of the cache directory (not used by default)
* `cacheMin` - the number of minutes to cache request data

The function returns an object with the following properties:

* `ok`: either `true` or `false`
* `status`: the HTTP status code (200 for OK)
* `body`: the resulting text or JSON response (or error message)
* `error`: error code
* `cache`: the cache file name when returning cached results

Example:

```js
const res = await apiFetch({
  uri: 'https://api.site.com/call',
  authKey: 'mytoken'
});

if (res.ok) console.log(res.body);
```


### `fileInfo(path)`

Returns an object with file information:

```js
const info = fileInfo('./some-file.txt');
// {
//   exists: true,
//   isFile: true,
//   isDir: false,
//   modified: 12345678 (timestamp)
// }
```
