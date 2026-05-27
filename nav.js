// navigation functions

/*
nested main menu navigation
pass tacs, current page, allOpen (-1=never, 0=when child is active, 1=always), maxLevel, and array of directories to omit

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
*/
export function menuMain( tacs, currentPage, allOpen = 0, maxLevel = 5, omit = [] ) {

  return '<menu>' + recurseNav( tacs.nav ) + '</menu>';

  function recurseNav(nav, level = 0) {

    return nav.map(n => {

      // format title
      const data = n.data;

      if (!data.menu) return '';

      // get children
      const children = level + 1 >= maxLevel || omit.includes( data.directory ) ? null : recurseNav( n.children, level + 1 ).trim();

      let ret = data.menu;
      if (!data.link) {
        ret = ret.slice(0, 1).toUpperCase() + ret.slice(1).toLowerCase();
      }
      else {
        if (currentPage === data.link) ret = `<strong>${ ret }</strong>`;
        else ret = `<a href="${ data.link }">${ ret }</a>`;
      }

      if (children) {
        const id = allOpen === 1 && (data.link || '').replace(/^\W+/g, '').replace(/\W+$/g, '').replace(/\W+/g, '-').toLowerCase();
        ret = `\n<details${ id ? ` data-menu="mm_${ id }"` : ''}${ allOpen === 1 || (allOpen === 0 && children.includes('<strong>')) ? ' open' : ''}>\n<summary>${ ret }</summary>\n<menu>\n${ children }</menu>\n</details>\n`;
      }

      return data.link || children ? `<li>${ ret }</li>\n` : '';

    }).join('\n');

  }

}

/*
menu for a specific directory
pass tacs, directory name, current page, and maxLevel
*/
export function menuDir( tacs, rootDir, currentPage, maxLevel = 5 ) {

  if (!rootDir) return;

  return '<menu>' + recurseNav( tacs.nav ) + '</menu>';

  function recurseNav(nav, level = 0, dirFound) {

    return nav.map(n => {

      // format title
      const data = n.data;

      if (!data.menu || (!dirFound && data.directory !== rootDir)) return '';

      // get children
      const children = level >= maxLevel ? null : recurseNav( n.children, level + 1, true ).trim();

      let ret = data.menu;
      if (!data.link) {
        ret = ret.slice(0, 1).toUpperCase() + ret.slice(1).toLowerCase();
      }
      else {
        if (currentPage === data.link) ret = `<strong>${ ret }</strong>`;
        else if (!children || data.index !== false) ret = `<a href="${ data.link }">${ ret }</a>`;
      }

      if (children) {
        const id = (data.link || '').replace(/^\W+/g, '').replace(/\W+$/g, '').replace(/\W+/g, '-').toLowerCase();
        ret = dirFound ? `\n<details${ id ? ` data-menu="md_${ id }"` : ''} open>\n<summary>${ ret }</summary>\n<menu>\n${ children }</menu>\n</details>\n` : children;
      }

      return dirFound ? `<li>${ ret }</li>\n` : ret;

    }).join('\n');

  }

}


// breadcrumb navigation
export function breadcrumb( tacs, currentPage ) {

  const crumb = [];
  recurseNav( tacs.nav );

  const ret = crumb
    .map(n => `<li>${ n.link && n.index ? `<a href="${ n.link }">` : ''}${ n.menu }${ n.link && n.index ? '</a>' : ''}</li>`)
    .join('\n');

  return ret ? `<nav class="breadcrumb">\n<ol>\n${ ret }</ol>\n</nav>` : '';

  function recurseNav(nav) {

    let found;

    nav.forEach(n => {

      found = found || currentPage === n.data.link;

      if (!found) {
        found = recurseNav(n.children);
        if (found) crumb.unshift(n.data);
      }

    });

    return found;

  }

}


// site tag list
export function tagList(tacs, classPrefix = 'taglist', classMin = 1, classMax = 5) {

  if (!tacs?.tagList?.length) return;

  const
    minCount = tacs.tagList.at(-1).count,
    maxCount = tacs.tagList.at(0).count,
    rangeCount = maxCount - minCount;

  let ret = tacs.tagList.map(i => {

    const classNum = Math.round(((i.count - minCount) / rangeCount) * (classMax - classMin)) + classMin;
    return `<li class="${ classPrefix + classNum }"><a href="${ i.link }">${ i.tag } <sup>${ i.count }</sup></a></li>`;

  }).join('\n');

  if (ret) ret = `<nav class="${ classPrefix }"><ul>\n${ ret }\n</ul></nav>`;

  return ret;

}


// paged navigation
export function pagination( pagination ) {

  if (!(pagination?.href?.length > 1)) return;

  const
    pt = pagination.pageTotal,
    pc = pagination.pageCurrent;

  let ret = '', last = 0;

  // back
  ret += `<li class="back">${ pagination.hrefBack ? `<a href="${ pagination.hrefBack }" title="previous index page">` : '<span>' }&#9668;${ pagination.hrefBack ? '</a>' : '</span>' }</li>\n`;

  pagination.href.forEach((page, pIdx) => {

    const
      maxp = pc === 0 || pc + 1 === pt ? 3 : 2,
      current = pIdx === pc;

    if (current || pIdx === 0 || pIdx + 1 === pt || pt < 7 || (pIdx + maxp > pc && pIdx - maxp < pc)) {

      last = pIdx;
      if (current) {
        ret += `<li class="current"><strong>${ pIdx + 1 }</strong></li>`;
      }
      else {
        ret += `<li><a href="${ page }">${ pIdx + 1 }</a></li>`;
      }

    }
    else {

      if (last + 1 === pIdx) {
        ret += '<li class="gap">&hellip;</li>';
      }

    }

  });


  // next
  ret += `<li class="next">${ pagination.hrefNext ? `<a href="${ pagination.hrefNext }" title="next index page">` : '<span>' }&#9658;${ pagination.hrefNext ? '</a>' : '</span>' }</li>\n`;

  return `<nav class="pagination"><ul>${ ret }</ul></nav>`;

}
