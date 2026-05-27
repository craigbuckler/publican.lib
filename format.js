// formatting functions

// default language
let localeDefault = 'en-US';

// set locale
export function setLocale(locale) {
  localeDefault = locale;
}

// default language
function lang(locale) {
  return locale || localeDefault || [];
}

// friendly number format
export function number(num, locale) {

  return new Intl.NumberFormat(lang(locale), {})
    .format( num );

}

// friendly currency format
export function currency(num, currency, locale) {

  return new Intl.NumberFormat(lang(locale), { 'style': 'currency', currency, 'currencyDisplay': 'narrowSymbol'})
    .format( num );

}

// number rounding (to 1 under 1000, 10 under 10,000, 100 under 100,000 etc.)
export function numberRound(num, locale) {

  const round = Math.pow(10, Math.max(0, String( parseInt(num) ).length - 3));
  return number( Math.ceil(num / round) * round, locale );

}

// create a date
function cDate(d) {
  d = new Date(d);
  return +d && !isNaN(d) && d instanceof Date ? d : new Date();
}

// friendly date format
export function dateHuman(d, locale) {

  return new Intl.DateTimeFormat(lang(locale), { dateStyle: 'long' })
    .format( cDate(d) );

}

// UTC date format, e.g. "Wed, 1 Jan 2025 07:30:00 GMT"
export function dateUTC( d ) {
  return cDate(d).toUTCString();
}

// ISO date format, e.g. "2025-01-01"
export function dateISO( d ) {
  return cDate(d).toISOString().slice(0, 10);
}

// full ISO date format, e.g. "2025-01-01T01:30:00.000Z"
export function dateISOfull( d ) {
  return cDate(d).toISOString();
}

// date year, e.g. "2025"
export function dateYear( d ) {
  return cDate(d).getUTCFullYear().toString();
}
