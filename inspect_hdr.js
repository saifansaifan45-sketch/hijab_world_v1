
const hdr = document.querySelector('.app-header');
const left = document.querySelector('.header-left');
const right = document.querySelector('.header-right');
const brand = document.querySelector('.brand-wrapper');
console.log('HEADER INFO:', JSON.stringify({
    windowWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hdrWidth: hdr ? hdr.getBoundingClientRect().width : null,
    leftRect: left ? left.getBoundingClientRect() : null,
    brandRect: brand ? brand.getBoundingClientRect() : null,
    rightRect: right ? right.getBoundingClientRect() : null,
    rightChildren: right ? Array.from(right.children).map(c => ({ tag: c.tagName, cls: c.className, rect: c.getBoundingClientRect() })) : []
}));
