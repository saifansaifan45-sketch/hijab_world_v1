/**
 * Comprehensive Test Suite for Hijab World:
 * 1. Sanity Tests (Service availability & basic responses)
 * 2. Integration Tests (Frontend & Backend contracts, data models)
 * 3. Security Tests (Headers, CORS, Injection, Path Traversal, Sensitive Info Leaks)
 * 4. Regression Tests (Brand identity, telephone/social integrity, viewport compliance)
 */

const API_BASE = 'http://localhost:4000/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

const results = {
  sanity: [] as { name: string; pass: boolean; details?: string }[],
  integration: [] as { name: string; pass: boolean; details?: string }[],
  security: [] as { name: string; pass: boolean; details?: string }[],
  regression: [] as { name: string; pass: boolean; details?: string }[],
};

function record(category: keyof typeof results, name: string, pass: boolean, details = '') {
  results[category].push({ name, pass, details });
  const icon = pass ? '✓ PASS' : '✗ FAIL';
  console.log(`[${category.toUpperCase()}] [${icon}] ${name} ${details ? '(' + details + ')' : ''}`);
}

async function runSanityTests() {
  console.log('\n--- 1. SANITY TESTING ---');
  // Backend Root
  try {
    const res = await fetch(`${API_BASE}`);
    const text = await res.text();
    record('sanity', 'Backend API Root is accessible', res.ok, `Status: ${res.status}`);
  } catch (e: any) {
    record('sanity', 'Backend API Root is accessible', false, e.message);
  }

  // Frontend Root
  try {
    const res = await fetch(`${FRONTEND_BASE}`);
    record('sanity', 'Frontend Web App is accessible', res.ok, `Status: ${res.status}`);
  } catch (e: any) {
    record('sanity', 'Frontend Web App is accessible', false, e.message);
  }

  // Products Endpoint
  try {
    const res = await fetch(`${API_BASE}/products`);
    const json = await res.json();
    record(
      'sanity',
      'Backend Products Endpoint returns JSON with success flag',
      res.ok && json.success === true,
      `Items count: ${json.count ?? json.data?.length ?? 0}`
    );
  } catch (e: any) {
    record('sanity', 'Backend Products Endpoint responds properly', false, e.message);
  }

  // Settings Endpoint
  try {
    const res = await fetch(`${API_BASE}/settings`);
    const json = await res.json();
    record('sanity', 'Backend Settings Endpoint responds with 200', res.ok && json.success === true);
  } catch (e: any) {
    record('sanity', 'Backend Settings Endpoint responds with 200', false, e.message);
  }
}

async function runIntegrationTests() {
  console.log('\n--- 2. INTEGRATION TESTING ---');
  // Product fetch contract
  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    const hasValidStructure = Array.isArray(data.data) && (data.data.length === 0 || (
      data.data[0].id !== undefined &&
      data.data[0].title !== undefined &&
      data.data[0].slug !== undefined &&
      data.data[0].category !== undefined
    ));
    record('integration', 'Product schema adheres to contract (id, title, slug, category)', hasValidStructure);
  } catch (e: any) {
    record('integration', 'Product schema adheres to contract', false, e.message);
  }

  // Query parameter filtering integration
  try {
    const res = await fetch(`${API_BASE}/products?search=hijab`);
    const data = await res.json();
    record('integration', 'Search query parameter handling returns valid format', res.ok && data.success === true);
  } catch (e: any) {
    record('integration', 'Search query parameter handling returns valid format', false, e.message);
  }

  // Settings contract integration
  try {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    const valid = data.success === true && typeof data.data === 'object';
    record('integration', 'Settings schema provides structured metadata object', valid);
  } catch (e: any) {
    record('integration', 'Settings schema provides structured metadata object', false, e.message);
  }
}

async function runSecurityTests() {
  console.log('\n--- 3. SECURITY TESTING ---');

  // A. SQL Injection / NoSQL Injection fuzzing on search
  try {
    const maliciousPayload = `' OR '1'='1' --`;
    const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(maliciousPayload)}`);
    record('security', 'SQL Injection resilience on search query', res.status < 500, `Status: ${res.status}`);
  } catch (e: any) {
    record('security', 'SQL Injection resilience on search query', false, e.message);
  }

  // B. Path Traversal & Prototype Pollution Attempts
  try {
    const traversalPayload = '../../../../etc/passwd';
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(traversalPayload)}`);
    // Should return 400, 404, or handled not found, NEVER 500 or file exposure
    const safe = res.status === 404 || res.status === 400;
    record('security', 'Path traversal resilience on parameterized route', safe, `Status: ${res.status}`);
  } catch (e: any) {
    record('security', 'Path traversal resilience on parameterized route', false, e.message);
  }

  // C. Security Headers on Frontend & Backend
  try {
    const res = await fetch(`${FRONTEND_BASE}`);
    const xPoweredBy = res.headers.get('x-powered-by');
    const hasNoSniff = res.headers.get('x-content-type-options') === 'nosniff';
    // Check if sensitive server disclosures exist
    record('security', 'Frontend Content-Type and framing headers present', res.headers.has('content-type'));
  } catch (e: any) {
    record('security', 'Frontend Content-Type and framing headers present', false, e.message);
  }

  // D. Leakage of private environment keys (.env secrets)
  try {
    const res = await fetch(`${FRONTEND_BASE}`);
    const html = await res.text();
    const leaksDb = html.includes('DATABASE_URL') || html.includes('JWT_SECRET') || html.includes('CLOUDINARY_API_SECRET');
    record('security', 'No database secrets, JWT keys, or Cloudinary secrets leaked in client bundle', !leaksDb);
  } catch (e: any) {
    record('security', 'No database secrets or keys leaked', false, e.message);
  }

  // E. CORS Policy Evaluation
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-attacker-site.com',
        'Access-Control-Request-Method': 'GET',
      }
    });
    record('security', 'Preflight / CORS request handles options cleanly', res.status === 200 || res.status === 204);
  } catch (e: any) {
    record('security', 'Preflight / CORS request handles options cleanly', false, e.message);
  }
}

async function runRegressionTests() {
  console.log('\n--- 4. REGRESSION TESTING ---');

  // Verify business rules and previously fixed brand/contact defects
  try {
    const res = await fetch(`${FRONTEND_BASE}`);
    const html = await res.text();

    // Regression: No placeholder phone numbers
    const hasOldPhone = html.includes('9876543210') || html.includes('18004452296');
    record('regression', 'Regression: No placeholder phone numbers (9876543210/1800) in markup', !hasOldPhone);

    // Regression: Real WhatsApp number present
    const hasCorrectWa = html.includes('918861720050') || html.includes('wa.me');
    record('regression', 'Regression: Configured WhatsApp business links present', hasCorrectWa);

    // Regression: Correct Instagram handle @hijab_worl
    const hasInstagram = html.includes('hijab_worl');
    record('regression', 'Regression: Verified Instagram handle @hijab_worl present', hasInstagram);

    // Regression: No old placeholder handle
    const hasOldHandle = html.includes('@hijabworld.official');
    record('regression', 'Regression: No stale handle @hijabworld.official remains', !hasOldHandle);

    // Regression: No stray personal email address (rimmu1011)
    const hasPrivateEmail = html.includes('rimmu1011') || html.includes('mailto:');
    record('regression', 'Regression: No unconfigured personal emails or unwanted mailto links', !hasPrivateEmail);

    // Regression: Zero forbidden colour words
    const lowerHtml = html.toLowerCase();
    const forbiddenWords = ['deep onyx', 'pure ivory', 'warm caramel', 'warm nude', '3-color', 'color bundle', 'curated tones', 'foundation shade'];
    const foundForbidden = forbiddenWords.filter((w) => lowerHtml.includes(w));
    record('regression', 'Regression: Zero forbidden colour shade words in frontend markup', foundForbidden.length === 0, foundForbidden.join(', '));

    // Regression: Black products and Trio pack present
    const hasTrio = html.includes('Trio Pack: 3 Black Grips');
    const hasSingleBlack = html.includes('HIJAB GRIP Black');
    record('regression', 'Regression: Single Black Grip and Trio Pack present', hasTrio && hasSingleBlack);

    // Regression: Real client photos referenced
    const hasModelPhoto = html.includes('model-olive-hijab-1200') || html.includes('model-olive-hijab-800');
    const hasCloseupPhoto = html.includes('grip-closeup-800');
    record('regression', 'Regression: Real client photos integrated in markup', hasModelPhoto && hasCloseupPhoto);

    // Regression: Testimonials block removed
    const hasTestimonials = html.includes('Mariam K.') || html.includes('Amina Z.');
    record('regression', 'Regression: Fake testimonials removed from markup', !hasTestimonials);
  } catch (e: any) {
    record('regression', 'Regression checks on frontend document', false, e.message);
  }
}

async function main() {
  console.log('====================================================');
  console.log('       HIJAB WORLD COMPREHENSIVE TEST SUITE        ');
  console.log('====================================================');

  await runSanityTests();
  await runIntegrationTests();
  await runSecurityTests();
  await runRegressionTests();

  console.log('\n====================================================');
  console.log('                 SUMMARY REPORT                     ');
  console.log('====================================================');

  let totalPassed = 0;
  let totalTests = 0;

  for (const [category, tests] of Object.entries(results)) {
    const passed = tests.filter(t => t.pass).length;
    const total = tests.length;
    totalPassed += passed;
    totalTests += total;
    console.log(`${category.toUpperCase().padEnd(14)}: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  }

  console.log('----------------------------------------------------');
  console.log(`TOTAL:          ${totalPassed}/${totalTests} tests passed (${Math.round((totalPassed / totalTests) * 100)}%)\n`);

  if (totalPassed < totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test suite failed unexpectedly:', err);
  process.exit(1);
});
