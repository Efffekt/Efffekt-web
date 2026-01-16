import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url).searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL mangler' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: 'Ugyldig URL-format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // First request to get HTML and initial timing
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.7,en;q=0.6',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache'
      },
      redirect: 'follow'
    });
    const responseTime = Date.now() - startTime;
    const html = await response.text();

    // Extract all resources for analysis
    const resources = extractResources(html);

    // Analyze the page with detailed checks
    const performanceResult = analyzePerformance(responseTime, html, resources);
    const seoResult = analyzeSEO(html, parsedUrl);
    const securityResult = analyzeSecurity(parsedUrl, response.headers, html);
    const mobileResult = analyzeMobile(html);
    const accessibilityResult = analyzeAccessibility(html);

    // Calculate weighted total score
    const totalScore = Math.round(
      (performanceResult.score * 0.25) +
      (seoResult.score * 0.25) +
      (securityResult.score * 0.20) +
      (mobileResult.score * 0.15) +
      (accessibilityResult.score * 0.15)
    );

    // Industry benchmarks (Norwegian average)
    const industryBenchmarks = {
      performance: 68,
      seo: 72,
      security: 65,
      mobile: 78,
      accessibility: 62
    };

    const result = {
      url: url,
      analyzedAt: new Date().toISOString(),
      responseTime: responseTime,
      totalScore: totalScore,
      benchmarks: industryBenchmarks,
      categories: {
        performance: {
          score: performanceResult.score,
          status: getStatus(performanceResult.score),
          details: performanceResult.details,
          benchmark: industryBenchmarks.performance
        },
        seo: {
          score: seoResult.score,
          status: getStatus(seoResult.score),
          details: seoResult.details,
          benchmark: industryBenchmarks.seo
        },
        security: {
          score: securityResult.score,
          status: getStatus(securityResult.score),
          details: securityResult.details,
          benchmark: industryBenchmarks.security
        },
        mobile: {
          score: mobileResult.score,
          status: getStatus(mobileResult.score),
          details: mobileResult.details,
          benchmark: industryBenchmarks.mobile
        },
        accessibility: {
          score: accessibilityResult.score,
          status: getStatus(accessibilityResult.score),
          details: accessibilityResult.details,
          benchmark: industryBenchmarks.accessibility
        }
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return new Response(JSON.stringify({ error: 'Kunne ikke analysere URL. Sjekk at nettsiden er tilgjengelig.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

interface Resource {
  src?: string | null;
  isInline?: boolean;
  isAsync?: boolean;
  isDefer?: boolean;
  isModule?: boolean;
  href?: string;
  isPreload?: boolean;
  hasAlt?: boolean;
  altText?: string | null;
  hasEmptyAlt?: boolean;
  hasDimensions?: boolean;
  width?: number | null;
  height?: number | null;
  hasLazyLoading?: boolean;
  hasSrcset?: boolean;
  isWebP?: boolean;
  isAvif?: boolean;
  isModernFormat?: boolean;
}

interface Resources {
  scripts: Resource[];
  stylesheets: Resource[];
  images: Resource[];
  fonts: Resource[];
  iframes: Resource[];
}

function extractResources(html: string): Resources {
  const resources: Resources = {
    scripts: [],
    stylesheets: [],
    images: [],
    fonts: [],
    iframes: []
  };

  // Extract scripts
  const scriptMatches = html.matchAll(/<script[^>]*(?:src=["']([^"']+)["'])?[^>]*>/gi);
  for (const match of scriptMatches) {
    resources.scripts.push({
      src: match[1] || null,
      isInline: !match[1],
      isAsync: /async/i.test(match[0]),
      isDefer: /defer/i.test(match[0]),
      isModule: /type=["']module["']/i.test(match[0])
    });
  }

  // Extract stylesheets
  const linkMatches = html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
  for (const match of linkMatches) {
    resources.stylesheets.push({
      href: match[1],
      isPreload: /rel=["']preload["']/i.test(match[0])
    });
  }

  // Extract images with detailed info
  const imgMatches = html.matchAll(/<img[^>]*>/gi);
  for (const match of imgMatches) {
    const srcMatch = match[0].match(/src=["']([^"']+)["']/i);
    const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
    const widthMatch = match[0].match(/width=["']?(\d+)/i);
    const heightMatch = match[0].match(/height=["']?(\d+)/i);
    const loadingMatch = match[0].match(/loading=["']([^"']+)["']/i);

    resources.images.push({
      src: srcMatch ? srcMatch[1] : null,
      hasAlt: !!altMatch,
      altText: altMatch ? altMatch[1] : null,
      hasEmptyAlt: altMatch ? altMatch[1] === '' : false,
      hasDimensions: !!(widthMatch && heightMatch),
      width: widthMatch ? parseInt(widthMatch[1]) : null,
      height: heightMatch ? parseInt(heightMatch[1]) : null,
      hasLazyLoading: loadingMatch ? loadingMatch[1] === 'lazy' : false,
      hasSrcset: /srcset=/i.test(match[0]),
      isWebP: srcMatch ? /\.webp/i.test(srcMatch[1]) : false,
      isAvif: srcMatch ? /\.avif/i.test(srcMatch[1]) : false,
      isModernFormat: srcMatch ? /\.(webp|avif)/i.test(srcMatch[1]) : false
    });
  }

  // Extract iframes
  const iframeMatches = html.matchAll(/<iframe[^>]*>/gi);
  for (const match of iframeMatches) {
    const srcMatch = match[0].match(/src=["']([^"']+)["']/i);
    resources.iframes.push({
      src: srcMatch ? srcMatch[1] : null,
      hasLazyLoading: /loading=["']lazy["']/i.test(match[0])
    });
  }

  return resources;
}

interface AnalysisResult {
  score: number;
  details: Array<{ severity?: string; type?: string; message: string }>;
  metrics?: Record<string, unknown>;
  headers?: Record<string, boolean>;
}

function analyzePerformance(responseTime: number, html: string, resources: Resources): AnalysisResult {
  let score = 100;
  const details: Array<{ severity?: string; type?: string; message: string }> = [];
  const issues: Array<{ severity: string; message: string }> = [];

  if (responseTime > 3000) {
    score -= 25;
    issues.push({ severity: 'critical', message: `Veldig treg server-respons: ${responseTime}ms (bør være under 600ms)` });
  } else if (responseTime > 1500) {
    score -= 15;
    issues.push({ severity: 'warning', message: `Treg server-respons: ${responseTime}ms (bør være under 600ms)` });
  } else if (responseTime > 600) {
    score -= 8;
    issues.push({ severity: 'info', message: `Server-respons kan forbedres: ${responseTime}ms` });
  } else {
    details.push({ type: 'success', message: `Rask server-respons: ${responseTime}ms` });
  }

  const htmlSize = html.length;
  const htmlSizeKB = Math.round(htmlSize / 1024);
  if (htmlSize > 500000) {
    score -= 15;
    issues.push({ severity: 'critical', message: `HTML-dokumentet er for stort: ${htmlSizeKB}KB (bør være under 100KB)` });
  } else if (htmlSize > 200000) {
    score -= 10;
    issues.push({ severity: 'warning', message: `HTML-dokumentet er stort: ${htmlSizeKB}KB` });
  } else if (htmlSize > 100000) {
    score -= 5;
    issues.push({ severity: 'info', message: `HTML-dokumentet er litt stort: ${htmlSizeKB}KB` });
  }

  const totalScripts = resources.scripts.length;
  const blockingScripts = resources.scripts.filter(s => !s.isInline && !s.isAsync && !s.isDefer).length;

  if (blockingScripts > 5) {
    score -= 12;
    issues.push({ severity: 'critical', message: `${blockingScripts} render-blokkerende scripts (bruk async/defer)` });
  } else if (blockingScripts > 2) {
    score -= 6;
    issues.push({ severity: 'warning', message: `${blockingScripts} render-blokkerende scripts` });
  }

  if (totalScripts > 25) {
    score -= 8;
    issues.push({ severity: 'warning', message: `For mange scripts: ${totalScripts} (bør konsolideres)` });
  } else if (totalScripts > 15) {
    score -= 4;
    issues.push({ severity: 'info', message: `Mange scripts: ${totalScripts}` });
  }

  const externalStylesheets = resources.stylesheets.length;
  const inlineStyleCount = (html.match(/<style[^>]*>/gi) || []).length;

  if (externalStylesheets > 8) {
    score -= 8;
    issues.push({ severity: 'warning', message: `For mange CSS-filer: ${externalStylesheets} (bør kombineres)` });
  } else if (externalStylesheets > 4) {
    score -= 4;
    issues.push({ severity: 'info', message: `Flere CSS-filer: ${externalStylesheets}` });
  }

  const images = resources.images;
  const imagesWithoutDimensions = images.filter(i => !i.hasDimensions).length;
  const imagesWithoutLazyLoad = images.filter((i, idx) => !i.hasLazyLoading && idx > 2).length;
  const imagesWithoutModernFormat = images.filter(i => i.src && !i.isModernFormat).length;

  if (images.length > 0) {
    if (imagesWithoutDimensions > 3) {
      score -= 6;
      issues.push({ severity: 'warning', message: `${imagesWithoutDimensions} bilder mangler width/height (forårsaker layout shift)` });
    }

    if (imagesWithoutLazyLoad > 5) {
      score -= 5;
      issues.push({ severity: 'warning', message: `${imagesWithoutLazyLoad} bilder under fold mangler lazy loading` });
    }

    if (imagesWithoutModernFormat > 5 && images.length > 3) {
      score -= 5;
      issues.push({ severity: 'info', message: `${imagesWithoutModernFormat} bilder bruker ikke moderne formater (WebP/AVIF)` });
    }
  }

  const iframes = resources.iframes;
  const iframesWithoutLazy = iframes.filter(i => !i.hasLazyLoading).length;
  if (iframesWithoutLazy > 0) {
    score -= 3;
    issues.push({ severity: 'info', message: `${iframesWithoutLazy} iframes mangler lazy loading` });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details: [...details, ...issues],
    metrics: {
      responseTime,
      htmlSize: htmlSizeKB,
      totalScripts,
      blockingScripts,
      totalStylesheets: externalStylesheets + inlineStyleCount,
      totalImages: images.length
    }
  };
}

function analyzeSEO(html: string, parsedUrl: URL): AnalysisResult {
  let score = 100;
  const details: Array<{ severity?: string; type?: string; message: string }> = [];
  const issues: Array<{ severity: string; message: string }> = [];

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch) {
    score -= 15;
    issues.push({ severity: 'critical', message: 'Mangler title-tag' });
  } else {
    const title = titleMatch[1].trim();
    if (title.length < 10) {
      score -= 10;
      issues.push({ severity: 'warning', message: `Title er for kort: ${title.length} tegn (anbefalt 50-60)` });
    } else if (title.length > 70) {
      score -= 5;
      issues.push({ severity: 'warning', message: `Title er for lang: ${title.length} tegn (anbefalt 50-60)` });
    } else if (title.length >= 50 && title.length <= 60) {
      details.push({ type: 'success', message: `Optimal title-lengde: ${title.length} tegn` });
    }
  }

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  if (!descMatch) {
    score -= 12;
    issues.push({ severity: 'critical', message: 'Mangler meta description' });
  } else {
    const desc = descMatch[1];
    if (desc.length < 70) {
      score -= 6;
      issues.push({ severity: 'warning', message: `Meta description er for kort: ${desc.length} tegn (anbefalt 150-160)` });
    } else if (desc.length > 160) {
      score -= 3;
      issues.push({ severity: 'info', message: `Meta description er litt lang: ${desc.length} tegn (kan bli avkortet)` });
    }
  }

  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length === 0) {
    score -= 10;
    issues.push({ severity: 'critical', message: 'Mangler H1-overskrift' });
  } else if (h1Matches.length > 1) {
    score -= 5;
    issues.push({ severity: 'warning', message: `Flere H1-overskrifter: ${h1Matches.length} (bør kun ha én)` });
  } else {
    details.push({ type: 'success', message: 'Korrekt bruk av H1-overskrift' });
  }

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (!canonicalMatch) {
    score -= 8;
    issues.push({ severity: 'warning', message: 'Mangler canonical URL' });
  } else {
    details.push({ type: 'success', message: 'Canonical URL er definert' });
  }

  const ogTitle = html.match(/<meta[^>]*property=["']og:title["']/i);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["']/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["']/i);
  const ogUrl = html.match(/<meta[^>]*property=["']og:url["']/i);

  const ogScore = [ogTitle, ogDesc, ogImage, ogUrl].filter(Boolean).length;
  if (ogScore === 0) {
    score -= 8;
    issues.push({ severity: 'warning', message: 'Mangler Open Graph-tags (påvirker deling på sosiale medier)' });
  } else if (ogScore < 4) {
    score -= 4;
    issues.push({ severity: 'info', message: `Ufullstendige Open Graph-tags (${ogScore}/4)` });
  } else {
    details.push({ type: 'success', message: 'Komplett Open Graph-implementasjon' });
  }

  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = imgTags.filter(img => !/alt=/i.test(img)).length;

  if (imagesWithoutAlt > 0) {
    const penalty = Math.min(10, imagesWithoutAlt * 2);
    score -= penalty;
    issues.push({ severity: 'warning', message: `${imagesWithoutAlt} bilder mangler alt-tekst` });
  }

  const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["']/i.test(html);
  const hasMicrodata = /itemscope|itemtype/i.test(html);

  if (!hasJsonLd && !hasMicrodata) {
    score -= 5;
    issues.push({ severity: 'info', message: 'Mangler strukturert data (Schema.org)' });
  } else {
    details.push({ type: 'success', message: 'Strukturert data er implementert' });
  }

  const hasLang = /<html[^>]*lang=["'][^"']+["']/i.test(html);
  if (!hasLang) {
    score -= 3;
    issues.push({ severity: 'info', message: 'Mangler språkdeklarasjon (lang-attributt)' });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details: [...details, ...issues]
  };
}

function analyzeSecurity(parsedUrl: URL, headers: Headers, html: string): AnalysisResult {
  let score = 100;
  const details: Array<{ severity?: string; type?: string; message: string }> = [];
  const issues: Array<{ severity: string; message: string }> = [];

  const headerObj: Record<string, string> = {};
  headers.forEach((value, key) => {
    headerObj[key.toLowerCase()] = value;
  });

  if (parsedUrl.protocol !== 'https:') {
    score -= 30;
    issues.push({ severity: 'critical', message: 'Siden bruker ikke HTTPS' });
  } else {
    details.push({ type: 'success', message: 'HTTPS er aktivert' });
  }

  const hsts = headerObj['strict-transport-security'];
  if (!hsts) {
    score -= 12;
    issues.push({ severity: 'warning', message: 'Mangler HSTS-header (Strict-Transport-Security)' });
  } else {
    details.push({ type: 'success', message: 'HSTS er korrekt konfigurert' });
  }

  const csp = headerObj['content-security-policy'];
  if (!csp) {
    score -= 10;
    issues.push({ severity: 'warning', message: 'Mangler Content-Security-Policy header' });
  } else {
    details.push({ type: 'success', message: 'CSP er implementert' });
  }

  const xfo = headerObj['x-frame-options'];
  if (!xfo && !csp?.includes('frame-ancestors')) {
    score -= 8;
    issues.push({ severity: 'warning', message: 'Mangler clickjacking-beskyttelse (X-Frame-Options)' });
  } else {
    details.push({ type: 'success', message: 'Clickjacking-beskyttelse er aktiv' });
  }

  if (!headerObj['x-content-type-options']) {
    score -= 6;
    issues.push({ severity: 'warning', message: 'Mangler X-Content-Type-Options: nosniff' });
  }

  const httpResources = html.match(/http:\/\/(?!localhost)[^"'\s>]+/gi) || [];
  if (httpResources.length > 0 && parsedUrl.protocol === 'https:') {
    score -= 5;
    issues.push({ severity: 'warning', message: `${httpResources.length} ressurser lastes over HTTP (mixed content)` });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details: [...details, ...issues],
    headers: {
      https: parsedUrl.protocol === 'https:',
      hsts: !!hsts,
      csp: !!csp,
      xfo: !!xfo,
      xcto: !!headerObj['x-content-type-options']
    }
  };
}

function analyzeMobile(html: string): AnalysisResult {
  let score = 100;
  const details: Array<{ severity?: string; type?: string; message: string }> = [];
  const issues: Array<{ severity: string; message: string }> = [];

  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);
  if (!viewportMatch) {
    score -= 25;
    issues.push({ severity: 'critical', message: 'Mangler viewport meta-tag' });
  } else {
    const viewport = viewportMatch[1].toLowerCase();

    if (!viewport.includes('width=device-width')) {
      score -= 10;
      issues.push({ severity: 'warning', message: 'Viewport mangler width=device-width' });
    } else {
      details.push({ type: 'success', message: 'Viewport er korrekt konfigurert' });
    }

    if (viewport.includes('maximum-scale=1') || viewport.includes('user-scalable=no')) {
      score -= 5;
      issues.push({ severity: 'warning', message: 'Viewport blokkerer zoom (dårlig for tilgjengelighet)' });
    }
  }

  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const responsiveImages = imgTags.filter(img => /srcset=/i.test(img)).length;

  if (imgTags.length > 5 && responsiveImages === 0) {
    score -= 8;
    issues.push({ severity: 'warning', message: 'Ingen responsive bilder (srcset/picture)' });
  }

  const mediaQueries = html.match(/@media[^{]*\{/gi) || [];
  const mobileQueries = mediaQueries.filter(mq => /max-width|min-width|screen/i.test(mq)).length;

  if (mobileQueries === 0) {
    score -= 10;
    issues.push({ severity: 'warning', message: 'Ingen CSS media queries for responsivt design' });
  } else if (mobileQueries >= 3) {
    details.push({ type: 'success', message: `${mobileQueries} responsive media queries` });
  }

  const hasManifest = /<link[^>]*rel=["']manifest["']/i.test(html);
  if (!hasManifest) {
    score -= 5;
    issues.push({ severity: 'info', message: 'Mangler Web App Manifest (PWA-støtte)' });
  } else {
    details.push({ type: 'success', message: 'Web App Manifest er implementert' });
  }

  const appleTouchIcon = /<link[^>]*rel=["']apple-touch-icon["']/i.test(html);
  if (!appleTouchIcon) {
    score -= 3;
    issues.push({ severity: 'info', message: 'Mangler Apple Touch Icon' });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details: [...details, ...issues]
  };
}

function analyzeAccessibility(html: string): AnalysisResult {
  let score = 100;
  const details: Array<{ severity?: string; type?: string; message: string }> = [];
  const issues: Array<{ severity: string; message: string }> = [];

  const htmlLang = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  if (!htmlLang) {
    score -= 8;
    issues.push({ severity: 'warning', message: 'Mangler lang-attributt på html-elementet' });
  } else {
    details.push({ type: 'success', message: `Språk er definert: ${htmlLang[1]}` });
  }

  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = imgTags.filter(img => !/alt=/i.test(img));

  if (imagesWithoutAlt.length > 0) {
    const penalty = Math.min(15, imagesWithoutAlt.length * 3);
    score -= penalty;
    issues.push({ severity: 'warning', message: `${imagesWithoutAlt.length} bilder mangler alt-attributt` });
  } else if (imgTags.length > 0) {
    details.push({ type: 'success', message: 'Alle bilder har alt-attributt' });
  }

  const hasMain = /<main[^>]*>|role=["']main["']/i.test(html);
  const hasNav = /<nav[^>]*>|role=["']navigation["']/i.test(html);
  const hasHeader = /<header[^>]*>|role=["']banner["']/i.test(html);
  const hasFooter = /<footer[^>]*>|role=["']contentinfo["']/i.test(html);

  const landmarks = [hasMain, hasNav, hasHeader, hasFooter].filter(Boolean).length;
  if (landmarks < 2) {
    score -= 6;
    issues.push({ severity: 'warning', message: 'Få ARIA landmarks (main, nav, header, footer)' });
  } else if (landmarks === 4) {
    details.push({ type: 'success', message: 'God bruk av semantiske landmarks' });
  }

  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  if (h1Matches.length === 0) {
    score -= 5;
    issues.push({ severity: 'warning', message: 'Mangler H1-overskrift' });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details: [...details, ...issues]
  };
}

function getStatus(score: number): string {
  if (score >= 90) return 'green';
  if (score >= 70) return 'yellow';
  if (score >= 50) return 'orange';
  return 'red';
}
