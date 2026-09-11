/**
 * OUTBACK LANDSCAPING & EXCAVATIONS
 * Interactive Client-Side Engine
 * Parkes, Central West NSW
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initEstimator();
  initFleetTabs();
  initFaqAccordion();
  initQuoteModal();
  initQuickForm();
});

/* ==========================================================================
   1. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-close-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!menuBtn || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   2. INTERACTIVE PROJECT COST ESTIMATOR
   ========================================================================== */
function initEstimator() {
  const serviceCards = document.querySelectorAll('.selector-card');
  const sizeSlider = document.getElementById('size-slider');
  const sizeLabel = document.getElementById('size-label');
  const sizeDisplay = document.getElementById('size-display');
  const sliderMin = document.getElementById('slider-min');
  const sliderMid = document.getElementById('slider-mid');
  const sliderMax = document.getElementById('slider-max');
  const terrainInputs = document.querySelectorAll('input[name="terrain"]');

  // Outputs
  const priceDisplay = document.getElementById('price-display');
  const equipmentVal = document.getElementById('equipment-val');
  const durationVal = document.getElementById('duration-val');
  const materialVal = document.getElementById('material-val');
  const bookBtn = document.getElementById('estimator-book-btn');

  if (!sizeSlider || !priceDisplay) return;

  // Configuration for each service type
  const serviceConfigs = {
    driveway: {
      name: 'Rural Driveway Construction',
      label: 'Driveway Area (Square Metres):',
      unit: 'm²',
      min: 50,
      max: 2000,
      step: 25,
      defaultVal: 250,
      baseRateMin: 35,
      baseRateMax: 48,
      equipment: 'Cat Posi-Track, Grader Blade & 10m³ Tipper',
      material: 'DGB20 Compacted Roadbase + Geotextile Membrane',
      calcDuration: (val) => val <= 200 ? '1 - 2 Days' : val <= 600 ? '2 - 3 Days' : '4 - 6 Days'
    },
    pad: {
      name: 'House / Shed Pad Site Cuts',
      label: 'Pad Footprint Area (Square Metres):',
      unit: 'm²',
      min: 60,
      max: 1200,
      step: 20,
      defaultVal: 300,
      baseRateMin: 28,
      baseRateMax: 42,
      equipment: '14T Excavator, Laser Levelling & Compaction Roller',
      material: 'Engineered Compacted Fill & Crushed Rock Sub-base',
      calcDuration: (val) => val <= 250 ? '1 - 2 Days' : val <= 600 ? '2 - 4 Days' : '4 - 7 Days'
    },
    retaining: {
      name: 'Retaining Wall Terracing',
      label: 'Wall Length x Average Height (Face m²):',
      unit: 'm²',
      min: 15,
      max: 250,
      step: 5,
      defaultVal: 45,
      baseRateMin: 380,
      baseRateMax: 540,
      equipment: '5.5T Mini Excavator (Auger & Grab) & Bogie Tipper',
      material: 'Sandstone Blocks / Concrete Sleepers + Ag-Line & Gravel',
      calcDuration: (val) => val <= 30 ? '2 - 3 Days' : val <= 80 ? '4 - 6 Days' : '7 - 12 Days'
    },
    turf: {
      name: 'Sir Walter Turf & Landscaping',
      label: 'Lawn Area to Cultivate & Lay (Square Metres):',
      unit: 'm²',
      min: 40,
      max: 1500,
      step: 20,
      defaultVal: 200,
      baseRateMin: 28,
      baseRateMax: 38,
      equipment: 'Posi-Track Harley Rake & Rotary Hoe Cultivator',
      material: 'Sir Walter DNA Certified Buffalo + Screened Soil & Gypsum',
      calcDuration: (val) => val <= 200 ? '1 - 2 Days' : val <= 600 ? '2 - 3 Days' : '3 - 5 Days'
    },
    dam: {
      name: 'Farm Dam Cleanout & Desilting',
      label: 'Estimated Dam Silt Volume (Cubic Metres):',
      unit: 'm³',
      min: 200,
      max: 3000,
      step: 100,
      defaultVal: 600,
      baseRateMin: 12,
      baseRateMax: 18,
      equipment: '14T Cat Excavator (Mud Bucket) & 10m³ Tipper',
      material: 'Silt Extraction, Key Trench Compaction & Spillway Rock',
      calcDuration: (val) => val <= 500 ? '1 - 2 Days' : val <= 1200 ? '3 - 4 Days' : '5 - 8 Days'
    }
  };

  let currentType = 'driveway';

  function updateServiceConfig(type) {
    currentType = type;
    const config = serviceConfigs[type];

    // Update Slider bounds
    sizeSlider.min = config.min;
    sizeSlider.max = config.max;
    sizeSlider.step = config.step;
    sizeSlider.value = config.defaultVal;

    sizeLabel.innerHTML = `<span class="step-num">2</span> ${config.label}`;
    sliderMin.textContent = `${config.min} ${config.unit}`;
    sliderMid.textContent = `${Math.round((config.min + config.max) / 2)} ${config.unit}`;
    sliderMax.textContent = `${config.max} ${config.unit}`;

    calculate();
  }

  function calculate() {
    const config = serviceConfigs[currentType];
    const val = parseFloat(sizeSlider.value);
    sizeDisplay.textContent = `${val.toLocaleString()} ${config.unit}`;

    // Determine Terrain multiplier
    let terrainMult = 1.0;
    const selectedTerrain = document.querySelector('input[name="terrain"]:checked')?.value || 'normal';
    if (selectedTerrain === 'clay') terrainMult = 1.22;
    if (selectedTerrain === 'rock') terrainMult = 1.45;

    // Calculate ballpark
    const rawMin = val * config.baseRateMin * terrainMult;
    const rawMax = val * config.baseRateMax * terrainMult;

    // Round nicely to nearest 50
    const roundedMin = Math.round(rawMin / 50) * 50;
    const roundedMax = Math.round(rawMax / 50) * 50;

    priceDisplay.textContent = `$${roundedMin.toLocaleString()} - $${roundedMax.toLocaleString()}`;
    equipmentVal.textContent = config.equipment;
    durationVal.textContent = config.calcDuration(val);
    materialVal.textContent = config.material;
  }

  // Event Listeners
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      updateServiceConfig(card.getAttribute('data-type'));
    });
  });

  sizeSlider.addEventListener('input', calculate);

  terrainInputs.forEach(input => {
    input.addEventListener('change', calculate);
  });

  // Connect Estimator Output to Quote Modal
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      const config = serviceConfigs[currentType];
      const val = sizeSlider.value;
      const priceText = priceDisplay.textContent;
      const detailsMsg = `Calculated Estimate for: ${config.name} (${val} ${config.unit})\nBallpark Estimate: ${priceText}\nSite Condition: ${document.querySelector('input[name="terrain"]:checked')?.parentElement.textContent.trim()}`;
      
      openModalWithPreset(config.name, detailsMsg);
    });
  }

  // Run initial calculation
  calculate();
}

/* ==========================================================================
   3. FLEET INTERACTIVE TABS
   ========================================================================== */
function initFleetTabs() {
  const tabs = document.querySelectorAll('.fleet-tab');
  const fleetTitle = document.getElementById('fleet-title');
  const fleetType = document.getElementById('fleet-type');
  const fleetSpec = document.getElementById('fleet-spec');
  const fleetDesc = document.getElementById('fleet-desc');
  const fleetList = document.getElementById('fleet-list');
  const fleetRate = document.getElementById('fleet-rate');
  const hireFleetBtn = document.getElementById('hire-fleet-btn');

  if (!fleetTitle || tabs.length === 0) return;

  const fleetData = {
    excavator14: {
      title: 'Caterpillar 310F Heavy Excavator',
      type: 'HEAVY CIVIL EXCAVATOR',
      spec: '14,200 KG OPERATING WEIGHT',
      desc: 'Our flagship earthmover equipped with high-power hydraulics, zero tail-swing versatility, and a hydraulic tilting quick-hitch. Engineered for deep house footings, rock batter trimming, gully stabilization, and bulk site excavations.',
      rate: '$185 - $225 / hr + GST',
      features: [
        '1200mm Mud Bucket & 450mm Rock Chisel Bucket',
        'Hydraulic Silenced Rock Breaker Hammer',
        '45° Articulating Tilt Hitch for precision batters',
        'Hydraulic Log & Sandstone Boulder Grab'
      ]
    },
    miniexcavator: {
      title: 'Kubota U55-4 Zero-Tail Mini Excavator',
      type: 'TIGHT ACCESS CIVIL EXCAVATOR',
      spec: '5,400 KG OPERATING WEIGHT',
      desc: 'Ultra-compact yet muscular machine capable of accessing backyard gates and residential building envelopes without compromising on hydraulic breakout force. Ideal for pier holes, service trenching, and retaining wall footings.',
      rate: '$135 - $160 / hr + GST',
      features: [
        'Heavy Hydraulic Auger Drive (200mm, 350mm, 450mm, 600mm flights)',
        'Rubber Tracks for zero damage to asphalt & finished turf',
        'Zero-Tail Swing for safe operation against fences & structures',
        'Laser-Guided depth indicator for exact footing levels'
      ]
    },
    positrack: {
      title: 'Caterpillar 259D3 Compact Track Loader',
      type: 'HIGH-FLOW POSI-TRACK LOADER',
      spec: 'LOW GROUND PRESSURE (4.8 PSI)',
      desc: 'Equipped with rubber tracks for unbeatable flotation across soft red clay and wet terrain. Features dual-grade laser automated box blade for millimeter-accurate roadbase spreading and arena grooming.',
      rate: '$140 - $165 / hr + GST',
      features: [
        'Automated Dual-Grade Laser Box Blade System',
        'Heavy-Duty 4-in-1 Multi-Purpose Bucket with Bolt-On Edge',
        'Hydraulic Harley Power Rake for elite turf seedbed preparation',
        'High-Flow Heavy Duty Forestry Mulcher & Scrub Slasher'
      ]
    },
    tipper: {
      title: 'Freightliner 10m³ Bogie Tipper & Pig Trailer',
      type: 'BULK QUARRY CARTAGE & FLOAT',
      spec: 'UP TO 26 TONNE COMBINED PAYLOAD',
      desc: 'Heavy-duty transport for fast, reliable delivery of certified quarry materials directly to your gate. We source premium Cowra sandstone boulders, DGB20 roadbase, decomposed granite, and double-screened garden loam.',
      rate: '$130 - $150 / hr + GST (or tonnage rate)',
      features: [
        '10 Cubic Metre Hardox Steel Tipper Body',
        'Matching Pig Trailer for large volume farm deliveries',
        'Plant Trailer Float for rapid excavator mobilization',
        'Spreader gate for even gravel & roadbase distribution'
      ]
    },
    laser: {
      title: 'Leica Dual-Grade 3D Laser Levelling System',
      type: 'MILLIMETRE ACCURACY TECH',
      spec: '±1.5MM PRECISION OVER 300 METRES',
      desc: 'Mounted directly to our earthmoving attachments, this Leica dual-slope laser system automates blade height hundreds of times each minute, ensuring perfect building pad falls and drainage run-offs.',
      rate: 'Integrated with machine hire',
      features: [
        'Dual-plane cross-fall slope capability for arenas & roads',
        'Eliminates human grading error & concrete over-pour',
        'Digital elevation map generation for complex sites',
        'Ensures storm water flows away from residential foundations'
      ]
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const fleetKey = tab.getAttribute('data-fleet');
      const data = fleetData[fleetKey];
      if (!data) return;

      fleetTitle.textContent = data.title;
      fleetType.textContent = data.type;
      fleetSpec.textContent = data.spec;
      fleetDesc.textContent = data.desc;
      fleetRate.textContent = data.rate;

      // Update features
      fleetList.innerHTML = data.features.map(f => `
        <li><i class="fa-solid fa-circle-check text-accent"></i> ${f}</li>
      `).join('');
    });
  });

  if (hireFleetBtn) {
    hireFleetBtn.addEventListener('click', () => {
      const activeTab = document.querySelector('.fleet-tab.active');
      const machineName = fleetTitle.textContent;
      openModalWithPreset('Machinery Wet Hire', `Inquiry for Wet Hire: ${machineName}\nPreferred Dates / Job Description:\nLocation:`);
    });
  }
}

/* ==========================================================================
   4. FAQ ACCORDION (AEO / SEO)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const btn = otherItem.querySelector('.faq-question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   5. QUOTE MODAL & FORMS
   ========================================================================== */
function initQuoteModal() {
  const modal = document.getElementById('quote-modal');
  const closeBtn = document.getElementById('close-quote-modal');
  const form = document.getElementById('quote-form');
  const successState = document.getElementById('modal-success');
  const successDone = document.getElementById('modal-success-done');

  // Trigger buttons
  const triggerIds = [
    'open-quote-modal-nav',
    'open-quote-modal-mobile',
    'open-quote-modal-aeo',
    'final-quote-cta'
  ];

  triggerIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => openModal());
    }
  });

  // Service Card action presets
  document.querySelectorAll('.open-quote-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = btn.getAttribute('data-service');
      openModalWithPreset(service, `Inquiry regarding: ${service}\nProperty address:\nEstimated dimensions / scope:`);
    });
  });

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (form) form.style.display = 'block';
    if (successState) successState.style.display = 'none';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  window.openModalWithPreset = function(serviceVal, detailsVal) {
    openModal();
    const serviceSelect = document.getElementById('form-service');
    const detailsInput = document.getElementById('form-details');

    if (serviceSelect && serviceVal) {
      let matched = false;
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].text.toLowerCase().includes(serviceVal.toLowerCase()) || 
            serviceSelect.options[i].value.toLowerCase().includes(serviceVal.toLowerCase())) {
          serviceSelect.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) {
        serviceSelect.value = 'Other Earthmoving / Machine Hire';
      }
    }

    if (detailsInput && detailsVal) {
      detailsInput.value = detailsVal;
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (successDone) successDone.addEventListener('click', closeModal);

  // Close when clicking outside dialog
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Handle ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-quote-btn');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

      const name = document.getElementById('form-name')?.value?.trim() || '';
      const phone = document.getElementById('form-phone')?.value?.trim() || '';
      const email = document.getElementById('form-email')?.value?.trim() || '';
      const location = document.getElementById('form-location')?.value?.trim() || '';
      const service = document.getElementById('form-service')?.value || '';
      const details = document.getElementById('form-details')?.value?.trim() || '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Request...';
      }

      const payload = {
        "Company": "Outback Landscaping and Excavations (Parkes NSW)",
        "Customer Name": name,
        "Contact Phone": phone,
        "Customer Email": email || "(Not provided)",
        "Property Location": location,
        "Service Required": service,
        "Project Scope & Details": details || "(No extra scope details)",
        "Submitted At": new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" }),
        "Logo Badge": "https://raw.githubusercontent.com/ChaseForrester/outback-landscaping-parkes/main/public/images/logo.png",
        "_subject": `🚜 New Inspection Request: ${service} - ${name} (Outback Landscaping)`,
        "_replyto": email || phone,
        "_template": "table",
        "_captcha": "false"
      };

      await sendFormEmail(payload);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }

      form.style.display = 'none';
      if (successState) successState.style.display = 'block';

      showToast(`Thank you ${name}! Your request was emailed to our team.`);
      form.reset();
    });
  }
}

/* ==========================================================================
   6. QUICK CONTACT FORM (CTA SECTION)
   ========================================================================== */
function initQuickForm() {
  const quickForm = document.getElementById('quick-contact-form');
  const successMsg = document.getElementById('quick-success-msg');
  if (!quickForm) return;

  quickForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('quick-submit-btn');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    const name = document.getElementById('quick-name')?.value?.trim() || '';
    const phone = document.getElementById('quick-phone')?.value?.trim() || '';
    const location = document.getElementById('quick-location')?.value?.trim() || '';
    const service = document.getElementById('quick-service')?.value || '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    }

    const payload = {
      "Company": "Outback Landscaping and Excavations (Parkes NSW)",
      "Customer Name": name,
      "Contact Phone": phone,
      "Property Location": location,
      "Primary Service": service,
      "Inquiry Type": "Fast Inspection Request (CTA Section)",
      "Submitted At": new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" }),
      "Logo Badge": "https://raw.githubusercontent.com/ChaseForrester/outback-landscaping-parkes/main/public/images/logo.png",
      "_subject": `⚡ Fast Inspection Request: ${service} - ${name} (Outback Landscaping)`,
      "_replyto": phone,
      "_template": "table",
      "_captcha": "false"
    };

    await sendFormEmail(payload);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }

    if (successMsg) successMsg.style.display = 'flex';
    showToast(`Thanks ${name}! Inspection request sent to hello@techaidaustralia.com.au`);
    quickForm.reset();
  });
}

/* ==========================================================================
   7. FORM SUBMIT EMAIL DISPATCHER
   ========================================================================== */
const RECIPIENT_EMAIL = "hello@techaidaustralia.com.au";

async function sendFormEmail(payload) {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RECIPIENT_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('FormSubmit Response:', data);
    return data;
  } catch (err) {
    console.warn('FormSubmit Request Fallback:', err);
    return { success: false, error: err.message };
  }
}

/* ==========================================================================
   8. TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerHTML = `<i class="fa-solid fa-circle-check text-accent" style="margin-right: 8px;"></i> ${message}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

