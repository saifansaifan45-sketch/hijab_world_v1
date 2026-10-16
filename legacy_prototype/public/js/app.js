/**
 * HIJAB GRIP™ - Application Controller Logic
 * Full implementation for Overview, Interactive Anatomy with 4 Hotspots, and Tonal Packs with WhatsApp checkout
 */

const App = {
  state: {
    currentView: 'overview',
    activeZone: 1,
    selectedSingleTone: 'Onyx Black',
    selectedTier: 'trio',
    settings: {},
    analytics: {},
    isAdminLoggedIn: sessionStorage.getItem('hg_admin_auth') === 'true',
    zonesData: [
      {
        num: 1,
        badge: "ZONE 1 / 4",
        title: "Ergonomic Forehead Arc",
        desc: "Follows the natural frontal hairline curvature without creating painful pressure points across the sinuses or temples."
      },
      {
        num: 2,
        badge: "ZONE 2 / 4",
        title: "Honeycomb Air Matrix",
        desc: "Open cellular mesh structure allows 96% continuous airflow for scalp cooling, perspiration release, and zero heat entrapment."
      },
      {
        num: 3,
        badge: "ZONE 3 / 4",
        title: "Bio-Grip Dual Surface",
        desc: "Inner micro-texture hugs baby hair gently without pulling follicle roots; outer matte friction stops slippery silk & chiffon scarves instantly."
      },
      {
        num: 4,
        badge: "ZONE 4 / 4",
        title: "Tension-Memory Elastic Silicone",
        desc: "Stretches up to 2.5× its original shape and immediately snaps back. Retains pristine elastic tension over 1,000+ daily wears without sagging."
      }
    ]
  },

  async init() {
    await this.fetchSettings();
    await this.fetchAnalytics();

    const hash = window.location.hash.replace('#', '');
    if (['overview', 'anatomy', 'packs', 'order', 'admin'].includes(hash)) {
      this.navigate(hash);
    } else {
      this.navigate('overview');
    }

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (['overview', 'anatomy', 'packs', 'order', 'admin'].includes(h)) {
        this.navigate(h);
      }
    });
  },

  navigate(viewName) {
    this.state.currentView = viewName;
    window.location.hash = viewName === 'overview' ? '' : viewName;

    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
    const navBtn = document.getElementById(`nav${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
    if (navBtn) navBtn.classList.add('active');

    if (viewName === 'admin') {
      this.renderAdminView();
    }
  },

  async fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        this.state.settings = data.data;
      }
    } catch (e) {
      console.error(e);
    }
  },

  async fetchAnalytics() {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        this.state.analytics = data.data;
        this.renderAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  },

  async trackEvent(type, detail) {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, detail })
      });
      this.fetchAnalytics();
    } catch (e) {
      console.error(e);
    }
  },

  // Anatomy Interactive Inspection
  showZone(zoneNumber) {
    this.state.activeZone = zoneNumber;
    const zone = this.state.zonesData[zoneNumber - 1];
    if (!zone) return;

    // Update inspection card
    document.getElementById('zoneBadgeText').textContent = zone.badge;
    document.getElementById('zoneTitleText').textContent = zone.title;
    document.getElementById('zoneDescText').textContent = zone.desc;

    // Update active hotspot dot
    document.querySelectorAll('.hotspot-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', (idx + 1) === zoneNumber);
    });

    this.trackEvent('inquiry', `Inspected ${zone.title}`);
  },

  toggleAnatomyTab(tabType, element) {
    document.querySelectorAll('.anatomy-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');

    if (tabType === 'silicone') {
      this.showToast('100% Medical-Grade Pure Silicone • Hypoallergenic');
    } else {
      this.showToast('Tap dots 1, 2, 3 or 4 to inspect each ergonomic zone');
    }
  },

  selectPricingTier(tier, element) {
    this.state.selectedTier = tier;
    document.querySelectorAll('.btn-pricing-choice').forEach(b => b.classList.remove('active'));
    if (element) element.classList.add('active');
  },

  orderSelectedTierWhatsApp() {
    const isTrio = this.state.selectedTier === 'trio';
    const text = isTrio 
      ? 'Hello Hijab Grip Desk! I would like to order the *3-Color Atelier Pack ($28 - Save 22%)*. Please confirm immediate dispatch.' 
      : 'Hello Hijab Grip Desk! I would like to order a *Single Band ($12)*. Please share color options.';
    this.openWhatsApp(text, isTrio ? '3-Color Pack Order' : 'Single Band Order');
  },

  // Packs & Tones Radio Selection
  selectSingleRadio(toneName, element) {
    this.state.selectedSingleTone = toneName;
    document.querySelectorAll('.radio-tone-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    const btn = document.getElementById('btnSingleWhatsAppAction');
    if (btn) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        Ask on WhatsApp for Single Band (${toneName})
      `;
    }

    this.trackEvent('inquiry', `Selected Radio Tone: ${toneName}`);
  },

  orderSingleToneWhatsApp() {
    const tone = this.state.selectedSingleTone || 'Onyx Black';
    const msg = `Hello HIJAB GRIP™ Desk! I would like to order a *Single Band* in tone: *${tone}* ($12). Please confirm stock availability.`;
    this.openWhatsApp(msg, `Single Tone: ${tone}`);
  },

  orderTrioBundleWhatsApp() {
    const msg = `Hello HIJAB GRIP™ Desk! I would like to order *The Everyday Essentials Trio (3-Pack)* containing Onyx Black, Sand Nude, and Pure Ivory with the 25% bundle savings.`;
    this.openWhatsApp(msg, 'Trio Bundle 3-Pack Order');
  },

  orderSelectedColorWhatsApp() {
    const msg = `Hello HIJAB GRIP™ Desk! I would like to order the *Hijab Grip Band* with zero slipping and hairline pressure relief. Please coordinate direct dispatch.`;
    this.openWhatsApp(msg, 'Direct Hero WhatsApp Order');
  },

  openWhatsApp(message, trackingDetail) {
    const rawNumber = this.state.settings.whatsappNumber || '+18004452296';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message || 'Hello, I would like to order the Hijab Grip band.');
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    
    this.trackEvent('whatsapp', trackingDetail || 'Direct WhatsApp Trigger');
    this.showToast('Connecting directly with Hijab Grip Order Desk...');
    window.open(url, '_blank');
  },

  openInstagram() {
    this.trackEvent('instagram', 'Profile Visit');
    window.open('https://instagram.com/hijabgrip.official', '_blank');
  },

  sendEmail() {
    this.trackEvent('email', 'Bulk Studio Order');
    window.location.href = `mailto:concierge@hijabworld.com?subject=${encodeURIComponent('HIJAB GRIP Studio/Bulk Inquiry')}`;
  },

  showInfoToast() {
    this.showToast('HIJAB GRIP™ by Hijab World • Patented Silicone Grip Architecture');
  },

  // Admin Desk
  checkAdminPin() {
    const input = document.getElementById('adminPinInput');
    const pin = input ? input.value : '';
    if (pin === (this.state.settings.adminPin || '1234')) {
      this.state.isAdminLoggedIn = true;
      sessionStorage.setItem('hg_admin_auth', 'true');
      this.renderAdminView();
      this.showToast('Staff Desk Unlocked');
    } else {
      this.showToast('Incorrect PIN. Try 1234');
    }
  },

  adminLogout() {
    this.state.isAdminLoggedIn = false;
    sessionStorage.removeItem('hg_admin_auth');
    this.renderAdminView();
  },

  renderAdminView() {
    const gate = document.getElementById('adminLoginGate');
    const dash = document.getElementById('adminDashboardContent');
    if (this.state.isAdminLoggedIn) {
      if (gate) gate.style.display = 'none';
      if (dash) dash.style.display = 'block';
      this.renderAnalytics();
    } else {
      if (gate) gate.style.display = 'block';
      if (dash) dash.style.display = 'none';
    }
  },

  renderAnalytics() {
    const a = this.state.analytics;
    if (!a) return;

    const wa = document.getElementById('metricWhatsApp');
    if (wa) wa.textContent = a.whatsappClicks || 0;

    const inq = document.getElementById('metricInquiries');
    if (inq) inq.textContent = a.inquiries || 0;

    const list = document.getElementById('adminActivityList');
    if (list && a.recentActivity) {
      list.innerHTML = a.recentActivity.map(act => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #F5EFEB; font-size:0.75rem;">
          <div>
            <span>${act.type === 'whatsapp' ? '💬' : '✨'}</span>
            <span style="font-weight:600; color:#2D2521; margin-left:6px;">${act.product}</span>
          </div>
          <span style="color:#8C827A; font-size:0.68rem;">${act.time}</span>
        </div>
      `).join('');
    }
  },

  showToast(msg) {
    const toast = document.getElementById('toastMsg');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
