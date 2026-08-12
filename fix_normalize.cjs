const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  `function normalizeEventTitle(eventStr: string): string {
  let e = (eventStr || '').toLowerCase().trim();
  e = e.replace(/^usd\\s*-\\s*/g, '').replace(/\\(usd\\)/g, '');

  if (e.includes('non-farm') || e.includes('nonfarm') || e.includes('nfp') || e.includes('pekerjaan bukan ladang')) {
    return 'nfp';
  }
  if (e.includes('cpi') || e.includes('consumer price') || e.includes('indeks harga pengguna')) {
    if (e.includes('core') || e.includes('teras')) return 'core_cpi';
    return 'cpi';
  }
  if (e.includes('ppi') || e.includes('producer price') || e.includes('indeks harga pengeluar')) {
    if (e.includes('core') || e.includes('teras')) return 'core_ppi';
    return 'ppi';
  }
  if (e.includes('pmi')) {
    if (e.includes('manufacturing')) return 'manufacturing_pmi';
    if (e.includes('services')) return 'services_pmi';
    return 'pmi';
  }
  if (e.includes('fomc')) {
    if (e.includes('statement')) return 'fomc_statement';
    if (e.includes('minutes')) return 'fomc_minutes';
    if (e.includes('press')) return 'fomc_press_conference';
    return 'fomc';
  }
  if (e.includes('retail sales')) {
    if (e.includes('core')) return 'core_retail_sales';
    return 'retail_sales';
  }
  if (e.includes('unemployment claims') || e.includes('jobless claims')) {
    return 'unemployment_claims';
  }

  return e.replace(/[^a-z0-9]/g, '');
}`,
  `function normalizeEventTitle(eventStr: string): string {
  let e = (eventStr || '').toLowerCase().trim();
  e = e.replace(/^usd\\s*-\\s*/g, '').replace(/\\(usd\\)/g, '');

  // Keep track of freq to distinguish m/m, y/y, q/q
  let freq = "";
  if (e.includes("m/m")) freq = "_mm";
  if (e.includes("y/y")) freq = "_yy";
  if (e.includes("q/q")) freq = "_qq";

  let base = "";
  if (e.includes('non-farm') || e.includes('nonfarm') || e.includes('nfp') || e.includes('pekerjaan bukan ladang')) {
    base = 'nfp';
  } else if (e.includes('cpi') || e.includes('consumer price') || e.includes('indeks harga pengguna')) {
    if (e.includes('core') || e.includes('teras')) base = 'core_cpi';
    else base = 'cpi';
  } else if (e.includes('ppi') || e.includes('producer price') || e.includes('indeks harga pengeluar')) {
    if (e.includes('core') || e.includes('teras')) base = 'core_ppi';
    else base = 'ppi';
  } else if (e.includes('pmi')) {
    if (e.includes('manufacturing')) base = 'manufacturing_pmi';
    else if (e.includes('services')) base = 'services_pmi';
    else base = 'pmi';
  } else if (e.includes('fomc')) {
    if (e.includes('statement')) base = 'fomc_statement';
    else if (e.includes('minutes')) base = 'fomc_minutes';
    else if (e.includes('press')) base = 'fomc_press_conference';
    else base = 'fomc';
  } else if (e.includes('retail sales')) {
    if (e.includes('core')) base = 'core_retail_sales';
    else base = 'retail_sales';
  } else if (e.includes('unemployment claims') || e.includes('jobless claims')) {
    base = 'unemployment_claims';
  } else {
    base = e.replace(/[^a-z0-9]/g, '');
  }

  return base + freq;
}`
);

fs.writeFileSync('server.ts', server);
