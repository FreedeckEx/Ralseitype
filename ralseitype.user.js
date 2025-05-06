// ==UserScript==
// @name         Ralseitype
// @namespace    https://github.com/FreedeckEx/
// @version      1.0
// @description  Monkeytype extensions
// @author       moonprod.me
// @match        *://monkeytype.com/*
// @grant        none
// @vibecode     lovely vibecoding sesh, thanks chatgpt
// ==/UserScript==

(() => {
  'use strict';

  const CONFIG_KEY = 'ralseiConfig';

  const defaultConfig = {
    enabled: true,
    logoUrl: 'https://deltarune.wiki/images/Ralsei_overworld_hatless.png',
    logoTop: 'ralsei see',
    logoBottom: 'ralseitype',
    watermarkText: 'ralseitype'
  };

  const saveConfig = config => localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  const loadConfig = () => ({ ...defaultConfig, ...JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') });

  const applyLogo = config => {
    const logo = document.getElementById('logo');
    if (!logo) return;

    const icon = logo.querySelector('.icon');
    const text = logo.querySelector('h1.text');
    if (icon && config.logoUrl.trim()) {
      icon.innerHTML = `<img src="${config.logoUrl}" style="height:100%;width:auto;max-height:40px;">`;
    }
    if (text) {
      text.innerHTML = `<div class="top">${config.logoTop}</div>${config.logoBottom}`;
    }
  };

  const applyWatermark = config => {
    const modifyWatermark = () => {
      const el = document.querySelector('.pageTest .ssWatermark');
      if (!el) return;

      const spans = el.querySelectorAll('span');
      if (spans.length >= 1) {
        const lastSpan = spans[spans.length - 1];
        if (lastSpan.textContent === 'monkeytype.com') {
          lastSpan.textContent = config.watermarkText;
        }
      }
    };

    const observer = new MutationObserver(modifyWatermark);

    const waitFor = new MutationObserver(() => {
      const target = document.querySelector('.pageTest .ssWatermark');
      if (target) {
        observer.observe(target, { childList: true, subtree: true });
        modifyWatermark();
        waitFor.disconnect();
      }
    });

    waitFor.observe(document.body, { childList: true, subtree: true });
  };

  const createSettings = () => {
    const anchor = document.querySelector('button.sectionGroupTitle');
    if (!anchor || !anchor.parentNode) return;

    const config = loadConfig();
    const container = anchor.parentNode;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'text sectionGroupTitle';
    toggleButton.setAttribute('group', 'ralsei');
    toggleButton.innerHTML = `<i class="fas fa-chevron-down"></i> ralsei`;

    const group = document.createElement('div');
    group.className = 'settingsGroup ralsei';
    group.style.maxHeight = '500px';
    group.style.overflow = 'hidden';
    group.style.transition = 'max-height 0.3s ease';

    const field = (label, key, placeholder = '') => `
      <div class="section fullWidth">
        <div class="groupTitle">${label}</div>
        <input type="text" data-ralsei="${key}" class="text" placeholder="${placeholder}" value="${config[key] || ''}" style="width:100%;padding:5px;margin-top:4px;">
      </div>
    `;

    group.innerHTML = `
      <div class="section fullWidth">
        <div class="groupTitle">Ralsei Mode</div>
        <div class="text">Fluffy enhancements for Monkeytype.</div>
        <div class="buttons">
          <button data-toggle="off" ${!config.enabled ? 'class="active"' : ''}>off</button>
          <button data-toggle="on" ${config.enabled ? 'class="active"' : ''}>on</button>
        </div>
      </div>
      ${field('Logo URL', 'logoUrl')}
      ${field('Top Text', 'logoTop')}
      ${field('Bottom Text', 'logoBottom')}
      ${field('Watermark Text', 'watermarkText')}
    `;

    container.insertBefore(group, anchor);
    container.insertBefore(toggleButton, group);

    let open = true;
    toggleButton.addEventListener('click', () => {
      open = !open;
      group.style.maxHeight = open ? '500px' : '0px';
      toggleButton.classList.toggle('open', open);
      const icon = toggleButton.querySelector('i');
      if (icon) icon.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
    });

    group.querySelectorAll('button[data-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button[data-toggle]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.enabled = btn.dataset.toggle === 'on';
        saveConfig(config);
        if (config.enabled) {
          applyLogo(config);
          applyWatermark(config);
        } else {
          location.reload();
        }
      });
    });

    group.querySelectorAll('input[data-ralsei]').forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.ralsei;
        config[key] = input.value;
        saveConfig(config);
        if (config.enabled) {
          applyLogo(config);
          applyWatermark(config);
        }
      });
    });
  };

  const init = () => {
    const config = loadConfig();
    if (config.enabled) {
      applyLogo(config);
      applyWatermark(config);
    }
  };

  const observer = new MutationObserver(() => {
    if (document.getElementById('logo') && document.querySelector('button.sectionGroupTitle')) {
      createSettings();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('load', init);
})();
