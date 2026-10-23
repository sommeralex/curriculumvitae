/**
 * DI Alexander Sommer — Interactive Portfolio & CV Application Logic
 * Implements Bilingual i18n (DE / EN), Executive Header, Discretion filter,
 * Confidential Password Gate, Timeline filters, Document modals, and Form actions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. I18N / BILINGUAL LANGUAGE ENGINE (DE / EN)
  // -------------------------------------------------------------------------
  let currentLang = localStorage.getItem('as_lang') || 'de';
  const htmlRoot = document.documentElement;
  const langButtons = document.querySelectorAll('.lang-btn');

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    htmlRoot.setAttribute('lang', lang);
    localStorage.setItem('as_lang', lang);

    // Update active class on language toggle buttons
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    const dict = translations[lang];

    // Translate plain text nodes (or HTML if markup detected)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (typeof dict[key] === 'string' && dict[key].includes('<') && dict[key].includes('>')) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Translate HTML nodes (e.g. with <strong>, <em>, etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // Translate input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Translate meta description / title
    if (dict['meta.title']) {
      document.title = dict['meta.title'];
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict['meta.desc']) {
      metaDesc.setAttribute('content', dict['meta.desc']);
    }

    // Refresh company names according to current discretion mode & language
    updateDiscretionDisplay();

    // Refresh confidential button label
    if (confidentialStatusText) {
      const isUnlocked = sessionStorage.getItem('as_confidential_unlocked') === 'true';
      confidentialStatusText.textContent = isUnlocked 
        ? dict['header.confidential_unlocked'] 
        : dict['header.confidential'];
    }
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      setLanguage(selectedLang);
    });
  });

  // -------------------------------------------------------------------------
  // 2. THEME SWITCHER (Light / Dark Mode)
  // -------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('as_theme');
  if (savedTheme) {
    htmlRoot.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    htmlRoot.setAttribute('data-theme', 'dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', nextTheme);
      localStorage.setItem('as_theme', nextTheme);
    });
  }

  // -------------------------------------------------------------------------
  // 3. DISCRETION FILTER (Firmennamen anonymisieren / Klartext)
  // -------------------------------------------------------------------------
  const discretionBtn = document.getElementById('discretion-btn');
  const discretionLabel = document.getElementById('discretion-label');
  let isDiscretionActive = false;
  const companyElements = document.querySelectorAll('[data-company]');

  function updateDiscretionDisplay() {
    if (discretionBtn) {
      discretionBtn.classList.toggle('active', isDiscretionActive);
    }
    if (discretionLabel) {
      const dict = translations[currentLang] || translations.de;
      discretionLabel.textContent = isDiscretionActive 
        ? dict['header.discretion_active'] 
        : dict['header.discretion'];
    }

    const map = companyNamesI18n[currentLang] || companyNamesI18n.de;
    companyElements.forEach(el => {
      const compKey = el.getAttribute('data-company');
      if (map[compKey]) {
        el.textContent = isDiscretionActive ? map[compKey].discrete : map[compKey].full;
      }
    });
  }

  if (discretionBtn) {
    discretionBtn.addEventListener('click', () => {
      isDiscretionActive = !isDiscretionActive;
      updateDiscretionDisplay();
    });
  }

  // -------------------------------------------------------------------------
  // 4. CONFIDENTIAL AREA & PASSWORD GATE
  // -------------------------------------------------------------------------
  const confidentialModalBtn = document.getElementById('confidential-modal-btn');
  const portalLockedContent = document.getElementById('portal-locked-content');
  const portalUnlockedContent = document.getElementById('portal-unlocked-content');
  const portalPasswordInput = document.getElementById('portal-password-input');
  const unlockSubmitBtn = document.getElementById('btn-unlock-submit');
  const quickDemoUnlockBtn = document.getElementById('btn-quick-demo-unlock');
  const lockAgainBtn = document.getElementById('btn-lock-again');
  const unlockErrorMsg = document.getElementById('unlock-error-msg');
  const confidentialStatusText = document.getElementById('confidential-status-text');
  const lockIndicatorIcon = document.getElementById('lock-indicator-icon');

  // Valid passwords (case-insensitive)
  const validPasswords = ['sommer2026', 'recruiter', 'oenb', 'oenb2026', 'vertraulich', 'preview', 'apg', 'sommer', 'confidential'];

  function unlockConfidentialArea() {
    if (portalLockedContent) portalLockedContent.style.display = 'none';
    if (portalUnlockedContent) portalUnlockedContent.style.display = 'block';
    if (unlockErrorMsg) unlockErrorMsg.style.display = 'none';
    
    if (confidentialModalBtn) {
      confidentialModalBtn.classList.add('unlocked');
    }
    if (lockIndicatorIcon) {
      lockIndicatorIcon.textContent = '🔓';
    }
    const dict = translations[currentLang] || translations.de;
    if (confidentialStatusText) {
      confidentialStatusText.textContent = dict['header.confidential_unlocked'];
    }
    sessionStorage.setItem('as_confidential_unlocked', 'true');
  }

  function lockConfidentialArea() {
    if (portalLockedContent) portalLockedContent.style.display = 'block';
    if (portalUnlockedContent) portalUnlockedContent.style.display = 'none';
    if (portalPasswordInput) portalPasswordInput.value = '';
    if (unlockErrorMsg) unlockErrorMsg.style.display = 'none';

    if (confidentialModalBtn) {
      confidentialModalBtn.classList.remove('unlocked');
    }
    if (lockIndicatorIcon) {
      lockIndicatorIcon.textContent = '🔒';
    }
    const dict = translations[currentLang] || translations.de;
    if (confidentialStatusText) {
      confidentialStatusText.textContent = dict['header.confidential'];
    }
    sessionStorage.removeItem('as_confidential_unlocked');
  }

  // Check saved session unlock
  if (sessionStorage.getItem('as_confidential_unlocked') === 'true') {
    unlockConfidentialArea();
  }

  if (unlockSubmitBtn) {
    unlockSubmitBtn.addEventListener('click', () => {
      const inputVal = (portalPasswordInput ? portalPasswordInput.value : '').trim().toLowerCase();
      if (validPasswords.includes(inputVal)) {
        unlockConfidentialArea();
      } else {
        if (unlockErrorMsg) unlockErrorMsg.style.display = 'block';
      }
    });
  }

  if (portalPasswordInput) {
    portalPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (unlockSubmitBtn) unlockSubmitBtn.click();
      }
    });
  }

  if (quickDemoUnlockBtn) {
    quickDemoUnlockBtn.addEventListener('click', () => {
      unlockConfidentialArea();
    });
  }

  if (lockAgainBtn) {
    lockAgainBtn.addEventListener('click', () => {
      lockConfidentialArea();
    });
  }

  if (confidentialModalBtn) {
    confidentialModalBtn.addEventListener('click', () => {
      const targetSec = document.getElementById('vertraulich');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. UNLOCKED DETAIL TABS
  // -------------------------------------------------------------------------
  const tabButtons = document.querySelectorAll('.unlocked-tab-btn');
  const tabPanes = document.querySelectorAll('.unlocked-tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = 'tab-' + btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
      });

      btn.classList.add('active');
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.style.display = 'block';
        targetPane.classList.add('active');
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6. TIMELINE FILTER BUTTONS
  // -------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('#timeline-filters .filter-btn');
  const timelineCards = document.querySelectorAll('#timeline-list .timeline-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      timelineCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // 7. MODAL PREVIEW HANDLERS (WSJ, Patent, Genius, PEP)
  // -------------------------------------------------------------------------
  const modalOverlay = document.getElementById('preview-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalSecondaryBtn = document.getElementById('modal-secondary-btn');

  function openModal(title, contentHtml) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = contentHtml;
    if (modalSecondaryBtn) modalSecondaryBtn.textContent = (currentLang === 'en') ? 'Close' : 'Schließen';
    if (modalOverlay) modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.style.display = 'none';
    if (modalBody) modalBody.innerHTML = '';
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalSecondaryBtn) modalSecondaryBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.style.display === 'flex') {
      closeModal();
    }
  });

  // Wall Street Journal Trigger
  const btnViewWsj = document.getElementById('btn-view-wsj');
  const wsjImgPreview = document.getElementById('wsj-img-preview');
  function showWsjModal() {
    const isEn = currentLang === 'en';
    openModal(
      'The Wall Street Journal — August 10, 2015',
      `<div>
        <img src="assets/wsj_thumb.png" alt="Wall Street Journal Original" class="modal-image-preview">
        <div style="margin-top: 16px; font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6;">
          <p><strong>${isEn ? 'Money & Investing Front Page Story:' : 'Ausschnitt Titelseite Geld & Märkte:'}</strong> <em>„Traders Feel at Home With Algorithms: Every weekday morning before work, Alexander Sommer wakes up in Vienna to an email summarizing his coming trades for the day. [...] Mr. Sommer watched his custom-built trading platform execute the algorithms he and his three partners developed.“</em></p>
          <p style="margin-top: 8px;"><a href="assets/Wallstreet_Artikel_2015.pdf" target="_blank" class="btn btn-sm btn-primary">${isEn ? 'Open Complete Article (PDF)' : 'Gesamten Originalartikel als PDF öffnen'}</a></p>
        </div>
      </div>`
    );
  }
  if (btnViewWsj) btnViewWsj.addEventListener('click', showWsjModal);
  if (wsjImgPreview) wsjImgPreview.addEventListener('click', showWsjModal);

  // Patent Trigger
  const btnViewPatent = document.getElementById('btn-view-patent');
  const patentThumbImg = document.getElementById('patent-thumb-img');
  function showPatentModal() {
    const isEn = currentLang === 'en';
    openModal(
      isEn ? 'Austrian Patent AT 519762 A4 — Official Publication' : 'Österreichisches Patent AT 519762 A4 — Veröffentlichungsschrift',
      `<div>
        <img src="assets/patent_thumb.png" alt="Patentschrift AT 519762" class="modal-image-preview">
        <div style="margin-top: 16px; font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6;">
          <p><strong>${isEn ? 'Invention:' : 'Erfindung:'}</strong> <em>${isEn ? 'Surveillance device with two separate, disconnectable data links.' : 'Überwachungsvorrichtung mit zwei separaten, trennbaren Datenverbindungen.'}</em></p>
          <p>${isEn 
            ? 'A hardware security architecture physically routing unidirectional alarm alerts separately from switchable sensor video feeds to ensure hardware-guaranteed privacy. Co-funded by the Austrian Research Promotion Agency (FFG).' 
            : 'Gegenstand der Erfindung ist eine Hardware-Vorrichtung, bei der Alarmmeldungen und visuelle Sensordaten physisch über getrennte Kanäle geführt werden, sodass Videodatenströme sichtbar unterbrochen werden können – zur Gewährleistung kompromissloser Privatsphäre. Gefördert durch die FFG (Österreichische Forschungsförderungsgesellschaft).'}</p>
        </div>
      </div>`
    );
  }
  if (btnViewPatent) btnViewPatent.addEventListener('click', showPatentModal);
  if (patentThumbImg) patentThumbImg.addEventListener('click', showPatentModal);

  // Genius Award Trigger
  const btnViewGenius = document.getElementById('btn-view-genius');
  const geniusThumbImg = document.getElementById('genius-thumb-img');
  function showGeniusModal() {
    const isEn = currentLang === 'en';
    openModal(
      isEn ? 'Genius Innovation Award Certificate' : 'Urkunde Ideenwettbewerb Genius — Anerkennungspreis',
      `<div>
        <img src="assets/urkunde_genius.jpg" alt="Genius Urkunde" class="modal-image-preview">
        <div style="margin-top: 16px; font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6;">
          <p><strong>${isEn ? 'Project:' : 'Projekt:'}</strong> <em>Learn Clip</em> · <strong>${isEn ? 'Submitter:' : 'Einreicher:'}</strong> Alexander Sommer</p>
          <p>${isEn 
            ? 'Awarded by State Minister of Economy Ernest Gabmann and Helga Kräftner (Government of Lower Austria) within the innovation initiative for business concepts (i2b / ERDF).' 
            : 'Verliehen durch Wirtschaftslandesrat Ernest Gabmann und Helga Kräftner (Amt der NÖ Landesregierung) im Rahmen der Initiative für innovative Geschäftsideen (i2b / EFRE).'}</p>
        </div>
      </div>`
    );
  }
  if (btnViewGenius) btnViewGenius.addEventListener('click', showGeniusModal);
  if (geniusThumbImg) geniusThumbImg.addEventListener('click', showGeniusModal);

  // TU Wien Ideenwettbewerb 1. Preis Trigger
  const btnViewTuUrkunde = document.getElementById('btn-view-tu-urkunde');
  const tuThumbImg = document.getElementById('tu-thumb-img');
  function showTuUrkundeModal() {
    const isEn = currentLang === 'en';
    openModal(
      isEn ? 'TU Vienna Innovation Contest 2009 — 1st Prize Certificate' : 'TU Wien Ideenwettbewerb 2009 — 1. Preis Urkunde',
      `<div class="modal-doc-layout">
        <img src="assets/tu_ideenwettbewerb_urkunde.png" alt="TU Wien Urkunde 1. Preis Ideenwettbewerb" class="modal-image-preview">
        <div class="modal-doc-details">
          <span class="modal-meta-badge">${isEn ? '1st Prize · Innovation Award' : '1. Preis · Auszeichnung'}</span>
          <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">
            ${isEn ? 'Redesign of the University Student Information Homepage' : 'Neugestaltung der Studieninformations-Homepage'}
          </h4>
          <p style="color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 14px;">
            <strong>${isEn ? 'Awardee:' : 'Preisträger:'}</strong> Alexander Sommer &nbsp;·&nbsp; 
            <strong>${isEn ? 'Institution:' : 'Institution:'}</strong> Technische Universität Wien (2009)
          </p>
          <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px; font-size: 0.875rem;">
            <p><strong>${isEn ? 'Awarded by:' : 'Verliehen durch:'}</strong> o.Univ.Prof. Dipl.-Ing. Dr.techn. Adalbert Prechtl (${isEn ? 'Vice Rector for Academic Affairs' : 'Vizerektor für Lehre'})</p>
            <p style="margin-top: 6px;"><strong>${isEn ? 'Date & Location:' : 'Datum & Ort:'}</strong> Wien, 30. Juni 2009</p>
            <p style="margin-top: 6px; font-weight: 600; color: var(--primary-accent);">„Technik für Menschen“ — Technische Universität Wien</p>
          </div>
          <p style="font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6;">
            ${isEn 
              ? 'Alexander Sommer won the 1st prize in the TU Vienna university-wide competition for redesigning the student information platform. The official certificate bears the university motto <em>“Technik für Menschen”</em> (Technology for People), which remains the foundational guiding principle of his career and commitment to Digital Humanism.' 
              : 'Alexander Sommer gewann den 1. Preis beim universitätsweiten Ideenwettbewerb der Technischen Universität Wien zur Neugestaltung der zentralen Studieninformations-Plattform. Die offizielle Urkunde trägt das TU-Motto <em>„Technik für Menschen“</em> — ein Leitsatz, der Alexander Sommers beruflichen Werdegang und sein Engagement für den Digitalen Humanismus bis heute maßgeblich prägt.'}
          </p>
        </div>
      </div>`
    );
  }
  if (btnViewTuUrkunde) btnViewTuUrkunde.addEventListener('click', showTuUrkundeModal);
  if (tuThumbImg) tuThumbImg.addEventListener('click', showTuUrkundeModal);

  // Forschungsmemorandum (Bakkalaureatsarbeit) Trigger
  const btnViewMemorandum = document.getElementById('btn-view-memorandum');
  const memorandumThumbImg = document.getElementById('memorandum-thumb-img');
  function showMemorandumModal() {
    const isEn = currentLang === 'en';
    openModal(
      isEn ? 'TU Vienna Research Memoranda 4/2008 — The Public Sector' : 'TU Wien Forschungsmemoranden 4/2008 — Der Öffentliche Sektor',
      `<div class="modal-doc-layout">
        <img src="assets/forschungsmemorandum_full.jpg" alt="Forschungsmemoranden TU Wien 4/2008" class="modal-image-preview">
        <div class="modal-doc-details">
          <span class="modal-meta-badge">${isEn ? 'Official Academic Publication' : 'Offizielle Instituts-Publikation'}</span>
          <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">
            „Langzeitarbeitslose in Österreich“
          </h4>
          <p style="color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 14px;">
            <strong>${isEn ? 'Author:' : 'Autor:'}</strong> Alexander Sommer &nbsp;·&nbsp; 
            <strong>${isEn ? 'Assessment:' : 'Bewertung:'}</strong> <span style="color: var(--primary-accent); font-weight: 700;">${isEn ? 'Grade 1 / Highest Distinction' : 'Sehr gut (Note: 1)'}</span>
          </p>
          <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px; font-size: 0.875rem;">
            <p><strong>${isEn ? 'Publication Series:' : 'Schriftenreihe:'}</strong> <em>Der Öffentliche Sektor — Forschungsmemoranden (Ausgabe 4/2008)</em></p>
            <p style="margin-top: 6px;"><strong>${isEn ? 'Academic Department:' : 'Herausgebendes Institut:'}</strong> ${isEn ? 'Department of Public Finance and Infrastructure Policy (ifip), Vienna University of Technology' : 'Institut für Finanzwissenschaft und Infrastrukturpolitik (ifip), Technische Universität Wien'}</p>
          </div>
          <p style="font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6;">
            ${isEn 
              ? 'Alexander Sommer’s Bachelor’s thesis was graded with highest honors (Grade 1 / “Sehr gut”). Due to its exceptional analytical rigor, macroeconomic relevance, and policy impact, it was selected and published in TU Vienna’s official academic research series alongside analyses on the European financial crisis.' 
              : 'Die Bakkalaureatsarbeit von Alexander Sommer wurde mit der Bestnote („Sehr gut“) bewertet. Aufgrund der herausragenden empirischen Qualität und volkswirtschaftlichen Relevanz wurde die Arbeit ausgewählt und in der offiziellen Schriftenreihe „Der Öffentliche Sektor – Forschungsmemoranden“ (Ausgabe 4/2008) des Instituts für Finanzwissenschaft und Infrastrukturpolitik der TU Wien abgedruckt.'}
          </p>
        </div>
      </div>`
    );
  }
  if (btnViewMemorandum) btnViewMemorandum.addEventListener('click', showMemorandumModal);
  if (memorandumThumbImg) memorandumThumbImg.addEventListener('click', showMemorandumModal);

  // PEP Trigger
  const viewPepModalBtn = document.getElementById('view-pep-modal-btn');
  const pepThumbImg = document.getElementById('pep-thumb-img');
  function showPepModal() {
    const isEn = currentLang === 'en';
    openModal(
      isEn ? 'Executive Leadership Assessment — IMDE Audit & Benchmark' : 'Unabhängiges Leadership-Assessment — IMDE Audit & Benchmark',
      `<div>
        <img src="assets/pep_thumb.png" alt="IMDE Leadership Assessment" class="modal-image-preview">
        <div style="margin-top: 16px; font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6;">
          <p><strong>${isEn ? 'Official Excerpt from Leadership Assessment Report (IMDE / Andrea Schörghofer-Tomassich):' : 'Offizieller Auszug des Leadership-Assessments (IMDE / Andrea Schörghofer-Tomassich):'}</strong></p>
          <ul style="padding-left: 20px; margin-top: 8px;">
            <li><strong>${isEn ? 'Leadership Profile:' : 'Führungsprofil:'}</strong> ${isEn ? 'Outstanding ratings matching the top 10% of the benchmark group of comparable team leaders.' : 'Sehr hohe Ausprägungen wie die oberen 10% der Benchmarkgruppe vergleichbarer Führungskräfte.'}</li>
            <li><strong>${isEn ? 'Methodical Management:' : 'Methodisches Management:'}</strong> ${isEn ? 'Highly structured problem solver; prepares decisions rigorously and executes them decisively.' : 'Ausgeprägt strukturierter Ideenbringer; bereitet Entscheidungen fundiert vor und setzt sie zügig um.'}</li>
            <li><strong>${isEn ? 'Leadership & People:' : 'Leadership & People:'}</strong> ${isEn ? 'Outperforms the benchmark as a supporter and developer; grants team autonomy to think bigger.' : 'Übertrifft die Benchmark als Förderer und Entwickler; schafft Freiräume für Teams, um größer zu denken.'}</li>
            <li><strong>${isEn ? 'Self-Reflection:' : 'Reflexion:'}</strong> ${isEn ? 'Employs upfront expectation dialogues at project inception to constructively focus high innovative drive.' : 'Frühe Erwartungsgespräche bei Kooperationen zur gezielten Kanalisierung hoher Innovationsenergie.'}</li>
          </ul>
        </div>
      </div>`
    );
  }
  if (viewPepModalBtn) viewPepModalBtn.addEventListener('click', showPepModal);
  if (pepThumbImg) pepThumbImg.addEventListener('click', showPepModal);

  // MIT Professional Education Trigger
  const btnViewMit = document.getElementById('btn-view-mit');
  const mitThumbImg = document.getElementById('mit-thumb-img');
  function showMitModal() {
    const isEn = currentLang === 'en';
    openModal(
      isEn ? 'MIT Professional Education — Certificate of Completion' : 'MIT Professional Education — Abschlusszertifikat',
      `<div class="modal-doc-layout">
        <img src="assets/mit_cert_full.png" alt="MIT Certificate" class="modal-image-preview">
        <div class="modal-doc-details">
          <span class="modal-meta-badge" style="background: rgba(179,27,27,0.12); color: #b31b1b;">
            ${isEn ? 'Massachusetts Institute of Technology' : 'M.I.T. Professional Education'}
          </span>
          <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">
            Applied Agentic AI for Organizational Transformation
          </h4>
          <p style="color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 14px;">
            <strong>${isEn ? 'Effort:' : 'Umfang:'}</strong> 70 Hours of Effort (Sept – Nov 2025) &nbsp;·&nbsp;
            <strong>${isEn ? 'Participant:' : 'Teilnehmer:'}</strong> Alexander Sommer
          </p>
          <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px; font-size: 0.875rem;">
            <p><strong>${isEn ? 'Faculty Directors:' : 'Programmdirektoren:'}</strong> Prof. John R. Williams &amp; Dr. Abel Sanchez (Geospatial Data Center, MIT)</p>
            <p style="margin-top: 6px;"><strong>${isEn ? 'Executive Director:' : 'Exekutivdirektion:'}</strong> Bhaskar Pant (MIT Professional Education)</p>
          </div>
          <p style="font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">
            ${isEn 
              ? 'Rigorous executive curriculum exploring autonomous agentic workflows, multi-agent frameworks, enterprise LLM orchestration, determinism in agent execution, and organizational scaling within enterprise environments.' 
              : 'Fundiertes Intensivprogramm für Führungskräfte zur Konzeption und Steuerung autonomer KI-Agenten, Multi-Agenten-Systeme, Enterprise-LLM-Orchestrierung und verlässlicher, deterministischer Steuerung von Transformationsprozessen in Organisationen.'}
          </p>
          <div>
            <a href="assets/MIT_Applied_Agentic_AI_2025.pdf" target="_blank" class="btn btn-sm btn-primary">
              ${isEn ? 'Open Official PDF Certificate' : 'Offizielles PDF-Zertifikat öffnen'}
            </a>
          </div>
        </div>
      </div>`
    );
  }
  if (btnViewMit) btnViewMit.addEventListener('click', showMitModal);
  if (mitThumbImg) mitThumbImg.addEventListener('click', showMitModal);

  // Coursera Elite Bundle Trigger
  const btnViewCoursera = document.getElementById('btn-view-coursera');
  const courseraThumbImg = document.getElementById('coursera-thumb-img');
  function showCourseraModal() {
    const isEn = currentLang === 'en';
    openModal(
      isEn ? 'Coursera Elite Specializations Dossier' : 'Coursera Spezialisierungen & Zertifikate-Dossier',
      `<div class="modal-doc-layout">
        <img src="assets/coursera_cert_full.png" alt="Coursera ML Certificate" class="modal-image-preview">
        <div class="modal-doc-details">
          <span class="modal-meta-badge" style="background: rgba(0,86,210,0.12); color: #0056d2;">
            ${isEn ? 'Tier-1 University Consortium' : 'Elite-Universitätskonsortium'}
          </span>
          <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">
            ${isEn ? 'Machine Learning, Blockchain & Critical Management' : 'Machine Learning, Blockchain & Strategisches Management'}
          </h4>
          <p style="color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 14px;">
            <strong>${isEn ? 'Scope:' : 'Umfang:'}</strong> 9 ${isEn ? 'Official Verified Certificates & Specializations' : 'verifizierte Abschlusszertifikate & Spezialisierungen'}
          </p>
          <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px; font-size: 0.84375rem; line-height: 1.5;">
            <ul style="padding-left: 18px; margin: 0;">
              <li><strong>Machine Learning Specialization:</strong> Univ. of Washington (Prof. Carlos Guestrin &amp; Emily Fox)</li>
              <li><strong>Blockchain Specialization:</strong> University at Buffalo &amp; The State University of New York (SUNY)</li>
              <li><strong>DeepLearning.ai:</strong> Introduction to TensorFlow for AI &amp; Deep Learning</li>
              <li><strong>Columbia University / Barnard College:</strong> Economics of Money and Banking (Prof. Perry Mehrling)</li>
              <li><strong>Duke University:</strong> Visual Perception and the Brain</li>
              <li><strong>IE Business School:</strong> Critical Perspectives on Management</li>
              <li><strong>University of Virginia:</strong> Project Planning &amp; Management</li>
            </ul>
          </div>
          <div>
            <a href="assets/Coursera_Zertifikate.pdf" target="_blank" class="btn btn-sm btn-primary">
              ${isEn ? 'Open Complete 9-Page Dossier (PDF)' : 'Gesamtes 9-seitiges Zertifikatsdossier (PDF) öffnen'}
            </a>
          </div>
        </div>
      </div>`
    );
  }
  if (btnViewCoursera) btnViewCoursera.addEventListener('click', showCourseraModal);
  if (courseraThumbImg) courseraThumbImg.addEventListener('click', showCourseraModal);

  // -------------------------------------------------------------------------
  // 8. MOBILE NAVIGATION TOGGLE
  // -------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-active');
    });

    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('mobile-active');
      });
    });
  }

  // -------------------------------------------------------------------------
  // 9. QUICK CONTACT FORM (Mailto Generator)
  // -------------------------------------------------------------------------
  const quickForm = document.getElementById('quick-contact-form');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('sender-name') || {}).value || '';
      const org = (document.getElementById('sender-org') || {}).value || '';
      const subject = (document.getElementById('sender-subject') || {}).value || 'Inquiry';
      const msg = (document.getElementById('sender-message') || {}).value || '';

      const fullSubject = encodeURIComponent(`[Website Contact] ${subject} - ${name} (${org})`);
      const fullBody = encodeURIComponent(`Dear Mr. Sommer,\n\n${msg}\n\nBest regards,\n${name}\n${org}`);

      window.location.href = `mailto:alexander.sommer@gmail.com?subject=${fullSubject}&body=${fullBody}`;
    });
  }

  // -------------------------------------------------------------------------
  // 10. SCROLLSPY FOR NAVIGATION
  // -------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('.main-nav .nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinksList.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // -------------------------------------------------------------------------
  // 11. APPLE-GRADE SCROLL ENGINE (Progress Bar, Header Blur, Reveal & Counters)
  // -------------------------------------------------------------------------
  const siteHeader = document.getElementById('header');
  const scrollProgressBar = document.getElementById('scroll-progress');

  // A. Scroll Progress Bar & Dynamic Header Elevation
  function updateScrollState() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }

    if (siteHeader) {
      siteHeader.classList.toggle('header-scrolled', scrollTop > 25);
    }
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateScrollState);
  }, { passive: true });
  updateScrollState();

  // B. Staggered Scroll-Reveal Engine via IntersectionObserver
  const revealElements = document.querySelectorAll(
    '.section-header, .stat-card, .profile-card, .pep-metric-card, .career-card, ' +
    '.venture-card, .academic-card, .tech-project-card, .education-package-card, ' +
    '.gartner-explainer-card, .hero-quote-card, .portrait-credentials'
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal-init');
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const childIdx = siblings.indexOf(el);
      if (childIdx > 0 && childIdx < 6) {
        el.style.transitionDelay = `${childIdx * 0.08}s`;
      }
    }
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // C. Apple-Style Metric Counter-Up Animation
  const counterElements = document.querySelectorAll('[data-count-target]');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counterElements.forEach(el => {
      const target = parseFloat(el.getAttribute('data-count-target'));
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const isCurrency = el.getAttribute('data-format') === 'currency';
      const duration = 1600;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentVal = Math.round(target * ease);

        let formattedVal = currentVal;
        if (isCurrency) {
          formattedVal = currentVal.toLocaleString('de-AT');
        }

        el.textContent = `${prefix}${formattedVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = `${prefix}${isCurrency ? target.toLocaleString('de-AT') : target}${suffix}`;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const heroStatsGrid = document.querySelector('.hero-stats-grid');
  if (heroStatsGrid) {
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        counterObserver.disconnect();
      }
    }, { threshold: 0.2 });
    counterObserver.observe(heroStatsGrid);
  }

  // D. Apple-Style Cursor Spotlight Reflection on Cards
  const spotlightCards = document.querySelectorAll(
    '.spotlight-card, .profile-card, .venture-card, .tech-project-card, .academic-card'
  );

  spotlightCards.forEach(card => {
    card.classList.add('spotlight-card');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Initialize Language on Page Load
  setLanguage(currentLang);
});
