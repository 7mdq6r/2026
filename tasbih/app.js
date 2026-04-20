(() => {
  'use strict';

  const DHIKR_LIST = [
    { text: 'سبحان الله', target: 33 },
    { text: 'الحمد لله', target: 33 },
    { text: 'الله أكبر', target: 34 },
    { text: 'لا إله إلا الله', target: 100 },
    { text: 'أستغفر الله', target: 100 },
    { text: 'سبحان الله وبحمده', target: 100 },
    { text: 'لا حول ولا قوة إلا بالله', target: 100 },
    { text: 'اللهم صلِّ على محمد', target: 100 }
  ];

  const STORAGE_KEY = 'tasbih.state.v1';
  const CIRCUMFERENCE = 2 * Math.PI * 130;

  const $ = (id) => document.getElementById(id);
  const els = {
    dhikr: $('dhikr'),
    cycles: $('cycles'),
    counterBtn: $('counterBtn'),
    countValue: $('countValue'),
    targetValue: $('targetValue'),
    totalValue: $('totalValue'),
    progressBar: $('progressBar'),
    ripple: $('ripple'),
    resetBtn: $('resetBtn'),
    dhikrBtn: $('dhikrBtn'),
    soundBtn: $('soundBtn'),
    soundLabel: $('soundLabel'),
    dhikrMenu: $('dhikrMenu'),
    menuBackdrop: $('menuBackdrop'),
    dhikrList: $('dhikrList')
  };

  const state = loadState();

  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function playClick(isMilestone = false) {
    if (!state.soundOn) return;
    const ctx = getAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isMilestone ? 880 : 660, now);
    if (isMilestone) osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isMilestone ? 0.35 : 0.12));

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (isMilestone ? 0.4 : 0.15));
  }

  function vibrate(pattern) {
    if (!state.vibrationOn) return;
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function loadState() {
    const defaults = {
      count: 0,
      cycles: 0,
      total: 0,
      dhikrIndex: 0,
      soundOn: true,
      vibrationOn: true
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return defaults;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* quota or disabled */ }
  }

  function currentDhikr() {
    return DHIKR_LIST[state.dhikrIndex] || DHIKR_LIST[0];
  }

  function render() {
    const dhikr = currentDhikr();
    els.dhikr.textContent = dhikr.text;
    els.targetValue.textContent = dhikr.target;
    els.countValue.textContent = state.count;
    els.cycles.textContent = state.cycles;
    els.totalValue.textContent = state.total;

    const pct = Math.min(state.count / dhikr.target, 1);
    els.progressBar.setAttribute('stroke-dashoffset', CIRCUMFERENCE * (1 - pct));

    els.soundBtn.classList.toggle('muted', !state.soundOn);
    els.soundLabel.textContent = state.soundOn ? 'الصوت' : 'صامت';
  }

  function increment() {
    const dhikr = currentDhikr();
    state.count += 1;
    state.total += 1;

    const reachedTarget = state.count >= dhikr.target;
    if (reachedTarget) {
      state.cycles += 1;
      state.count = 0;
      celebrate();
      vibrate([80, 40, 80, 40, 140]);
      playClick(true);
    } else {
      vibrate(30);
      playClick(false);
    }

    pressFeedback();
    saveState();
    render();
  }

  function pressFeedback() {
    els.counterBtn.classList.add('pressed');
    els.ripple.classList.remove('active');
    // force reflow to restart animation
    void els.ripple.offsetWidth;
    els.ripple.classList.add('active');
    setTimeout(() => els.counterBtn.classList.remove('pressed'), 140);
  }

  function celebrate() {
    els.counterBtn.classList.add('celebrate');
    setTimeout(() => els.counterBtn.classList.remove('celebrate'), 650);
  }

  function resetCounter() {
    if (state.count === 0 && state.cycles === 0) return;
    if (!confirm('إعادة تصفير العداد والدورات الحالية؟')) return;
    state.count = 0;
    state.cycles = 0;
    saveState();
    render();
  }

  function openDhikrMenu() {
    els.dhikrList.innerHTML = '';
    DHIKR_LIST.forEach((d, i) => {
      const li = document.createElement('li');
      li.textContent = d.text;
      if (i === state.dhikrIndex) li.classList.add('active');
      li.addEventListener('click', () => selectDhikr(i));
      els.dhikrList.appendChild(li);
    });
    els.dhikrMenu.classList.add('open');
  }

  function closeDhikrMenu() {
    els.dhikrMenu.classList.remove('open');
  }

  function selectDhikr(i) {
    if (state.dhikrIndex !== i) {
      state.dhikrIndex = i;
      state.count = 0;
      state.cycles = 0;
      saveState();
      render();
    }
    closeDhikrMenu();
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    state.vibrationOn = state.soundOn;
    saveState();
    render();
  }

  // events
  els.counterBtn.addEventListener('click', increment);
  els.counterBtn.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      increment();
    }
  });
  els.resetBtn.addEventListener('click', resetCounter);
  els.dhikrBtn.addEventListener('click', openDhikrMenu);
  els.dhikr.addEventListener('click', openDhikrMenu);
  els.menuBackdrop.addEventListener('click', closeDhikrMenu);
  els.soundBtn.addEventListener('click', toggleSound);

  // unlock audio context on first user gesture (iOS)
  document.addEventListener('touchstart', () => getAudio(), { once: true, passive: true });

  render();
})();
