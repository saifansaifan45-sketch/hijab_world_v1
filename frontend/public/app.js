/**
 * HIJAB GRIPâ„¢ - Application Controller Logic
 * Full implementation for Overview, Interactive Anatomy with 4 Hotspots, and Tonal Packs with WhatsApp checkout
 */

const App = {
  state: {
    currentView: 'overview',
    activeZone: 1,
    selectedTier: 'trio',
    settings: {},
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
        desc: "Stretches up to 2.5Ã— its original shape and immediately snaps back. Retains pristine elastic tension over 1,000+ daily wears without sagging."
      }
    ]
  },

  async init() {
    await this.fetchSettings();

    const hash = window.location.hash.replace('#', '');
    if (['overview', 'anatomy', 'packs', 'order'].includes(hash)) {
      this.navigate(hash);
    } else {
      this.navigate('overview');
    }

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (['overview', 'anatomy', 'packs', 'order'].includes(h)) {
        this.navigate(h);
      }
    });
  },

  navigate(viewName) {
    this.closeDrawer();
    this.state.currentView = viewName;
    const targetHash = viewName === 'overview' ? '' : viewName;
    if (window.location.hash !== (targetHash ? '#' + targetHash : '')) {
      if (history.pushState) {
        history.pushState(null, '', targetHash ? '#' + targetHash : window.location.pathname);
      } else {
        window.location.hash = targetHash;
      }
    }

    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    // Always open scrolled immediately to the very top on every page change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Update Desktop Navigation Pills
    document.querySelectorAll('.desktop-main-nav .nav-link').forEach(el => {
      const match = el.getAttribute('data-view') === viewName || 
                    (viewName === 'overview' && el.textContent.trim().toLowerCase() === 'home') ||
                    (viewName === 'anatomy' && el.textContent.trim().toLowerCase() === 'anatomy') ||
                    (viewName === 'packs' && el.textContent.trim().toLowerCase() === 'collection') ||
                    (viewName === 'order' && el.textContent.trim().toLowerCase() === 'customer support');
      if (match) {
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
      } else {
        el.classList.remove('active');
        el.removeAttribute('aria-current');
      }
    });

    // Update Mobile Bottom Navigation Items
    document.querySelectorAll('.bottom-nav .nav-item').forEach(el => {
      el.classList.remove('active');
      el.removeAttribute('aria-current');
    });
    const navBtn = document.getElementById(`nav${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
    if (navBtn) {
      navBtn.classList.add('active');
      navBtn.setAttribute('aria-current', 'page');
    }
  },

  async fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        this.state.settings = data.data;
      }
    } catch (e) {
      // ignore
    }
  },

  trackEvent(type, detail) {
    // Analytics/tracking disabled in public v1
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
      ? "Hi Hijab World, I'd like the Trio Pack of 3 black grips. Could you share today's bundle offer?" 
      : "Hi Hijab World, I'd like to order the HIJAB GRIP (Black).";
    this.openWhatsApp(text, isTrio ? 'Trio Pack Order' : 'Single Grip Order');
  },

  orderSingleGripWhatsApp() {
    const msg = "Hi Hijab World, I'd like to order the HIJAB GRIP (Black).";
    this.openWhatsApp(msg, 'Single Grip Order');
  },

  orderTrioBundleWhatsApp() {
    const msg = "Hi Hijab World, I'd like the Trio Pack of 3 black grips. Could you share today's bundle offer?";
    this.openWhatsApp(msg, 'Trio Pack Order');
  },

  orderCollectionGeneralWhatsApp() {
    const msg = "Hi Hijab World, I'd like to know more about the Hijab Grip.";
    this.openWhatsApp(msg, 'Collection General Inquiry');
  },

  orderSelectedColorWhatsApp() {
    const msg = "Hi Hijab World, I'd like to know more about Hijab Grip.";
    this.openWhatsApp(msg, 'Direct Hero WhatsApp Order');
  },

  getCleanWhatsAppNumber() {
    const rawNumber = this.state.settings.whatsappNumber || '918861720050';
    let digits = rawNumber.replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (digits.length === 10) {
      digits = `91${digits}`;
    }
    return digits || '918861720050';
  },

  openWhatsApp(message, trackingDetail) {
    const cleanNumber = this.getCleanWhatsAppNumber();
    const defaultMsg = "Hi Hijab World, I'd like to know more about Hijab Grip.";
    const encoded = encodeURIComponent(message || defaultMsg);
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    
    this.trackEvent('whatsapp', trackingDetail || 'Direct WhatsApp Trigger');
    this.showToast('Connecting directly with Hijab World WhatsApp...');
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  openInstagram() {
    const igUrl = this.state.settings.instagramUrl || 'https://www.instagram.com/hijab_worl';
    this.trackEvent('instagram', 'Profile Visit');
    window.open(igUrl, '_blank', 'noopener,noreferrer');
  },

  toggleDrawer() {
    const drawer = document.getElementById('navDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer && overlay) {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        this.closeDrawer();
      } else {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('navDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  },

  showInfoToast() {
    this.showToast('HIJAB GRIP™ by Hijab World • Silicone Grip Architecture');
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

if (typeof window !== 'undefined') {
  window.App = App;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}


