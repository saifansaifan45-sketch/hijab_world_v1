import re

with open('page_raw.html', 'r', encoding='utf-8') as f:
    h = f.read()

# 1. Announcement bar inner container
h = re.sub(
    r'<div class="announcement-bar"[^>]*>([\s\S]*?)</div>',
    r'<div class="announcement-bar" id="announcementBar"><div class="announcement-bar-inner">\1</div></div>',
    h,
    count=1
)

# 2. Header alignment and layout
new_header_html = '''<header class="app-header">
      <div class="app-header-inner">
        <div class="header-left">
          <button class="header-btn" id="btnMenu" aria-label="Menu" onclick="App.showInfoToast">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div class="brand-wrapper" onclick="App.navigate('overview')">
            <div class="brand-title">HIJAB GRIP™</div>
            <div class="brand-subtitle">BY HIJAB WORLD</div>
          </div>
        </div>

        <nav class="desktop-main-nav">
          <button onclick="App.navigate('overview')" class="nav-link active">Home</button>
          <button onclick="App.navigate('anatomy')" class="nav-link">Anatomy</button>
          <button onclick="App.navigate('packs')" class="nav-link">Collection</button>
          <button onclick="App.navigate('order')" class="nav-link">Customer Support</button>
          <button onclick="App.navigate('admin')" class="nav-link">Staff</button>
        </nav>

        <div class="header-right">
          <div class="header-social-pills">
            <a href="https://instagram.com/hijabworld.official" target="_blank" rel="noopener noreferrer" class="social-hdr-btn ig" title="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/></svg>
            </a>
            <a href="https://facebook.com/hijabworld.official" target="_blank" rel="noopener noreferrer" class="social-hdr-btn fb" title="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
          <button class="header-btn" id="btnHeaderChat" aria-label="Direct Chat" onclick="App.openWhatsApp('Hello, I am inquiring about the Hijab Grip band.')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </button>
          <button class="user-avatar-btn" id="btnAdminAccess" aria-label="Admin Access" onclick="App.navigate('admin')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </button>
        </div>
      </div>
    </header>'''

h = re.sub(r'<header class="app-header">[\s\S]*?</header>', new_header_html, h, count=1)

# 3. Hero layout: wrap in grip-hero-container with left content and right media
new_hero_html = '''<section class="grip-hero-section">
        <div class="grip-hero-container">
          <div class="grip-hero-left">
            <div class="grip-badge-pill">
              <span style="display:inline-block; width:5px; height:5px; background:var(--accent-terracotta); border-radius:50%;"></span>
              FLAGSHIP RELEASE 2025
            </div>

            <h1 class="grip-hero-title">
              Secure Hold,<br>
              <span>All-Day Comfort.</span>
            </h1>

            <p class="grip-hero-desc">
              High elasticity helps keep your hijab firmly in place while providing a breathable, weightless fit without headache or heavy hairline pressure.
            </p>

            <div class="hero-cta-group">
              <button class="btn-primary-forest" onclick="App.orderSelectedColorWhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                INQUIRE ON WHATSAPP (INSTANT CHECKOUT)
              </button>
              <div class="hero-cta-concierge">
                ⏱️ Concierge direct response within 5 mins • Worldwide express
              </div>
            </div>

            <button class="btn-pill-alt" style="width:100%; max-width:320px;" onclick="App.navigate('packs')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
              View 3-Pack Color Bundle
            </button>
          </div>

          <!-- Main Product Media Frame (Right column on desktop) -->
          <div class="grip-hero-media-wrap">
            <img src="/assets/images/grip_model_wearing.jpg" alt="Hijab Grip Model Wearing">
            <div class="grip-floating-tag">
              <span style="display:inline-block; width:6px; height:6px; background:#2F4D36; border-radius:50%;"></span>
              PATENTED LATTICE MATRIX
            </div>
          </div>
        </div>

        <!-- 3 Feature Highlight Cards aligned with container width -->
        <div class="site-container">
          <div class="feature-cards-row">
            
            <div class="feature-pill-card">
              <div class="feature-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              </div>
              <div class="feature-text-box">
                <div class="feature-title">High Elasticity</div>
                <div class="feature-desc">Adaptive contoured silicone matrix naturally fits all head circumferences with zero pinch.</div>
              </div>
            </div>

            <div class="feature-pill-card">
              <div class="feature-icon-box" style="background:#EBF3ED; color:#2F4D36;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <div class="feature-text-box">
                <div class="feature-title">Zero Slipping</div>
                <div class="feature-desc">Micro-textured suction lock holds chiffon, georgette, and modal scarves firmly from dawn to dusk.</div>
              </div>
            </div>

            <div class="feature-pill-card">
              <div class="feature-icon-box" style="background:#FAF5EE; color:#A47C3B;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              </div>
              <div class="feature-text-box">
                <div class="feature-title">Weightless Airflow</div>
                <div class="feature-desc">Open hexagonal cellular structure dissipates scalp heat rapidly and eliminates undercap sweat.</div>
              </div>
            </div>

          </div>
        </div>
      </section>'''

# Replace hero section
h = re.sub(r'<section class="grip-hero-section">[\s\S]*?</section>', new_hero_html, h, count=1)

# 4. Wrap other sections in site-container for clean edge alignments
# Wrap support hub card
h = h.replace('<div class="support-hub-card">', '<div class="site-container"><div class="support-hub-card">')
h = h.replace('Facebook Care</a></div></div>', 'Facebook Care</a></div></div></div>')

with open('page_raw.html', 'w', encoding='utf-8') as f:
    f.write(h)

# Now inject page_raw.html back into frontend/src/app/page.tsx
import json
with open('frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    page_code = f.read()

prefix = 'dangerouslySetInnerHTML={{ __html: '
idx = page_code.find(prefix)
end_idx = page_code.find(' }} />', idx)

new_json_str = json.dumps(h)
new_page_code = page_code[:idx + len(prefix)] + new_json_str + page_code[end_idx:]

with open('frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_page_code)

print('Updated page_raw.html and page.tsx successfully!')
