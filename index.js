(() => {
  "use strict";

  const supabaseConfig = window.GOLDEN_BOY_SUPABASE_CONFIG;
  const STORAGE_BUCKET = "player-private";
  const LANGUAGE_KEY = "goldenBoyLanguage";
  const THEME_KEY = "goldenBoyTheme";
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_DOCUMENT_SIZE = 8 * 1024 * 1024;
  const supabaseClient = supabaseConfig?.url && supabaseConfig?.anonKey && window.supabase
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

  const navigation = [
    { ar: "الرئيسية", en: "Home", id: "home" },
    { ar: "الفروع والمواعيد", en: "Branches & schedule", id: "schedule" },
    { ar: "عن الأونر", en: "About the owner", id: "owner" },
    { ar: "الإنجازات", en: "Achievements", id: "achievements" },
    { ar: "سجّل كمدير", en: "Admin login", href: "admin.html", admin: true },
    { ar: "تسجيل لاعب", en: "Register", id: "register" },
    { ar: "متابعة اللاعب", en: "Athlete portal", id: "player" },
    { ar: "تواصل معنا", en: "Contact", id: "contact" },
  ];

  const sports = {
    kungfu: { ar: "كونغ فو", en: "Kung Fu" },
    kickboxing: { ar: "كيك بوكسينج", en: "Kickboxing" },
    muaythai: { ar: "مواي تاي", en: "Muay Thai" },
    mma: { ar: "MMA", en: "MMA" },
    boxing: { ar: "ملاكمة", en: "Boxing" },
    gymnastics: { ar: "جمباز", en: "Gymnastics" },
    taekwondo: { ar: "تايكوندو", en: "Taekwondo" },
    karate: { ar: "كاراتيه", en: "Karate" },
    fitness: { ar: "لياقة بدنية", en: "Fitness" },
  };
  const branches = {
    popular1: { ar: "الشعبية 1", en: "El Shaabeya 1" },
    popular2: { ar: "الشعبية 2", en: "El Shaabeya 2" },
    popular3: { ar: "الشعبية 3", en: "El Shaabeya 3" },
    mashma1: { ar: "المشحمة 1", en: "El Mashma 1" },
    mashma2: { ar: "المشحمة 2", en: "El Mashma 2" },
    sevenGirls: { ar: "السبع بنات", en: "El Sabaa Banat" },
    club23: { ar: "نادي 23 يوليو", en: "23 July Club" },
  };

  const days = {
    mwf: { ar: "السبت، الاثنين، الأربعاء", en: "Sat, Mon, Wed" },
    tts: { ar: "الأحد، الثلاثاء، الخميس", en: "Sun, Tue, Thu" },
  };
  const sessions = [];
  function addSessions(sport, branch, dayKey, times) {
    times.forEach((time) => sessions.push({ sport, branch, dayKey, time }));
  }
  const combatSports = ["kungfu", "kickboxing"];
  combatSports.forEach((sport) => {
    addSessions(sport, "popular1", "mwf", ["4:30", "6:00"]);
    addSessions(sport, "popular1", "tts", ["4:30", "6:00", "7:30", "9:00"]);
    addSessions(sport, "mashma1", "mwf", ["4:30", "6:00", "7:30"]);
    addSessions(sport, "mashma1", "tts", ["4:30", "6:00", "7:30", "9:00"]);
    addSessions(sport, "mashma2", "mwf", ["4:30", "6:00", "7:30"]);
    addSessions(sport, "popular3", "tts", ["4:00", "5:30", "7:00", "8:30"]);
    addSessions(sport, "sevenGirls", "mwf", ["4:30", "6:00", "7:30", "9:00"]);
    addSessions(sport, "popular2", "mwf", ["6:00", "7:30", "9:00"]);
    addSessions(sport, "popular2", "tts", ["9:30"]);
  });
  addSessions("gymnastics", "popular3", "mwf", ["3:30", "5:00", "6:30", "8:00"]);
  addSessions("gymnastics", "popular3", "tts", ["3:00"]);
  addSessions("gymnastics", "mashma2", "tts", ["3:30", "5:00", "6:30", "8:00"]);
  addSessions("gymnastics", "club23", "tts", ["3:00"]);
  addSessions("taekwondo", "popular2", "mwf", ["4:00–5:30", "5:30–7:00"]);
  addSessions("taekwondo", "mashma2", "tts", ["3:00"]);

  const pageTitles = {
    home: { ar: "أكاديمية جولدن بوي | الرئيسية", en: "Golden Boy Academy | Home" },
    schedule: { ar: "الفروع والمواعيد | أكاديمية جولدن بوي", en: "Branches & schedules | Golden Boy Academy" },
    owner: { ar: "عن الأونر | جولدن بوي", en: "About the owner | Golden Boy Academy" },
    achievements: { ar: "إنجازات اللاعبين | أكاديمية جولدن بوي", en: "Athlete achievements | Golden Boy Academy" },
    register: { ar: "تسجيل لاعب | أكاديمية جولدن بوي", en: "Athlete registration | Golden Boy Academy" },
    player: { ar: "متابعة اللاعب | أكاديمية جولدن بوي", en: "Athlete portal | Golden Boy Academy" },
    contact: { ar: "تواصل معنا | أكاديمية جولدن بوي", en: "Contact | Golden Boy Academy" },
  };
  const labels = {
    ar: {
      pending: "قيد المراجعة", approved: "تمت الموافقة", rejected: "مرفوض",
      approve: "موافقة", reject: "رفض", child: "اللاعب", guardian: "ولي الأمر",
      phone: "الموبايل", nationalId: "الرقم القومي", age: "السن", birthDate: "تاريخ الميلاد",
      sport: "اللعبة", branch: "الفرع", group: "المجموعة", experience: "خبرة سابقة",
      payment: "طريقة الدفع", paymentReference: "مرجع الدفع", submitted: "تاريخ التسجيل",
      athletePhoto: "صورة اللاعب", certificate: "شهادة الميلاد", receipt: "إيصال الدفع",
      empty: "لا توجد طلبات تسجيل.", connection: "أدخل إعدادات Supabase في index.js لتفعيل التسجيل ولوحة الإدارة.",
      adminOnly: "الحساب غير مخول كمدير. على مالك المشروع منحه صلاحية الإدارة في Supabase.",
      approvedMessage: "تم قبول طلب التسجيل في أكاديمية جولدن بوي. سنتواصل معكم قريبًا لتأكيد المجموعة.",
      noSessions: "لا توجد مواعيد مؤكدة لهذه اللعبة والفرع حاليًا. اقترح موعدًا بديلًا للإدارة.",
      loadError: "تعذر تحميل الطلبات من Supabase.",
    },
    en: {
      pending: "Pending review", approved: "Approved", rejected: "Rejected",
      approve: "Approve", reject: "Reject", child: "Athlete", guardian: "Parent / guardian",
      phone: "Mobile", nationalId: "National ID", age: "Age", birthDate: "Date of birth",
      sport: "Sport", branch: "Branch", group: "Group", experience: "Prior experience",
      payment: "Payment method", paymentReference: "Payment reference", submitted: "Submitted",
      athletePhoto: "Athlete photo", certificate: "Birth certificate", receipt: "Payment receipt",
      empty: "There are no applications yet.", connection: "Add the Supabase settings in index.js to enable applications and admin access.",
      adminOnly: "This account is not an administrator. The project owner must grant admin access in Supabase.",
      approvedMessage: "Your application to Golden Boy Academy has been approved. We will contact you shortly to confirm your group.",
      noSessions: "No confirmed sessions are available for this sport and branch. Suggest an alternative time.",
      loadError: "Could not load applications from Supabase.",
    },
  };

  let language = localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
  let activeView = getCurrentView();
  let isAdmin = false;
  let applications = [];
  let monthlyReviews = [];
  const applicationFilters = { status: "", sport: "", search: "" };

  function getCurrentView() {
    const requestedView = window.location.hash.slice(1);
    return pageTitles[requestedView] ? requestedView : "home";
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }
  function localize(map, key) {
    return map[key] ? map[key][language] : key;
  }
  function showMessage(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("error", Boolean(isError));
    element.hidden = false;
  }
  function renderSharedLayout() {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    if (header) {
      header.innerHTML = `<header class="site-header"><div class="container header-inner">
        <a class="brand" href="#home" aria-label="Golden Boy Academy home"><span class="brand-mark"><img src="assets/golden-boy-logo.jpeg" alt=""></span><span class="brand-copy"><strong>GOLDEN BOY</strong><span>ACADEMY • EL MAHALLA</span></span></a>
        <nav class="main-nav" id="main-navigation" aria-label="Main navigation">${navigation.map((item) => `<a${item.admin ? ' class="admin-nav-link"' : ""} href="${item.href || `#${item.id}`}"${item.id ? ` data-view-link="${item.id}"` : ""}${item.admin ? ` aria-label="${item.ar}"` : ` data-ar="${item.ar}" data-en="${item.en}"`}>${item.admin ? `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="15" r="1" fill="currentColor"/></svg><span data-ar="${item.ar}" data-en="${item.en}">${item.ar}</span>` : item.ar}</a>`).join("")}</nav>
        <div class="header-actions"><button class="theme-toggle" id="theme-toggle" type="button" aria-label="تبديل المظهر">☀</button><button class="language-toggle" id="language-toggle" type="button" aria-label="Switch language">EN / ع</button><button class="menu-toggle" id="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button></div>
      </div></header>`;
    }
    if (footer) footer.innerHTML = `<footer class="site-footer"><div class="container footer-inner">
      <a class="brand" href="#home"><span class="brand-mark"><img src="assets/golden-boy-logo.jpeg" alt=""></span><span class="brand-copy"><strong>GOLDEN BOY</strong><span>ACADEMY</span></span></a>
      <span class="footer-copy">أكاديمية جولدن بوي للألعاب القتالية واللياقة • المحلة الكبرى</span>
      <div class="footer-links"><a href="#schedule">الفروع والمواعيد</a><a href="#owner">عن الأونر</a><a href="#achievements">الإنجازات</a><a href="#contact">تواصل معنا</a></div>
    </div></footer>`;
  }
  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("english-layout", language === "en");
    document.querySelectorAll("[data-ar][data-en]").forEach((element) => {
      const ownerTerm = element.dataset[language];
      element.innerHTML = language === "ar" ? ownerTerm.replace(/مالك/g, "الأونر") : ownerTerm;
    });
    document.querySelectorAll("[data-placeholder-ar][data-placeholder-en]").forEach((element) => {
      element.placeholder = element.dataset[`placeholder${language === "ar" ? "Ar" : "En"}`];
    });
    document.title = pageTitles[activeView][language];
    renderApplications();
  }
  function showView(viewId, updateHistory) {
    activeView = pageTitles[viewId] ? viewId : "home";
    document.querySelectorAll(".view[data-view]").forEach((view) => {
      const active = view.dataset.view === activeView;
      view.classList.toggle("is-active", active);
      view.setAttribute("aria-hidden", String(!active));
    });
    document.querySelectorAll("#main-navigation a[data-view-link]").forEach((link) => {
      const active = link.dataset.viewLink === activeView;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (updateHistory && window.location.hash !== `#${activeView}`) window.history.pushState(null, "", `#${activeView}`);
    document.title = pageTitles[activeView][language];
    const nav = document.getElementById("main-navigation");
    nav?.classList.remove("is-open");
    document.getElementById("menu-toggle")?.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function formatTime(time) {
    if (language === "en") return `${time} PM`;
    return `${time} م`;
  }
  function getSessions(sport, branch) {
    return sessions.filter((session) => session.sport === sport && session.branch === branch);
  }
  function refreshRegistrationGroups() {
    const form = document.getElementById("registration-form");
    if (!form) return;
    const sport = form.elements.sport.value;
    const branch = form.elements.branch.value;
    const group = form.elements.group;
    const previous = group.value;
    const matching = getSessions(sport, branch);
    const prompt = language === "ar" ? "اختار الفرع واللعبة أولًا" : "Choose sport and branch first";
    const opts = matching.map((entry) => {
      const value = `${entry.dayKey}|${entry.time}`;
      return `<option value="${escapeHtml(value)}">${escapeHtml(days[entry.dayKey][language])} • ${escapeHtml(formatTime(entry.time))}</option>`;
    }).join("");
    group.innerHTML = `<option value="">${sport && branch ? (language === "ar" ? "اختار الموعد" : "Choose a session") : prompt}</option>${opts}${sport && branch ? `<option value="other">${language === "ar" ? "ميعاد آخر (اقترح موعدًا)" : "Another time (suggest a session)"}</option>` : ""}`;
    if ([...group.options].some((option) => option.value === previous)) group.value = previous;
    group.disabled = !(sport && branch);
    group.required = Boolean(sport && branch);
    const custom = form.querySelector(".custom-session-field");
    const customInput = form.elements.customGroup;
    const showCustom = group.value === "other";
    custom.hidden = !showCustom;
    customInput.required = showCustom;
  }
  async function uploadPrivateFile(file, applicationId, fileType, maxSize) {
    if (!file) return null;
    if (file.size > maxSize) throw new Error(language === "ar" ? "حجم الملف أكبر من الحد المسموح." : "File exceeds the allowed size.");
    const allowed = fileType === "athlete-photo"
      ? ["image/jpeg", "image/png", "image/webp"]
      : ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) throw new Error(language === "ar" ? "نوع الملف غير مدعوم." : "Unsupported file type.");
    const extension = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${applicationId}/${fileType}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabaseClient.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return path;
  }
  async function submitApplication(form) {
    if (!supabaseClient) throw new Error(labels[language].connection);
    const data = new FormData(form);
    const id = crypto.randomUUID();
    const photoPath = await uploadPrivateFile(form.elements.athletePhoto.files[0], id, "athlete-photo", MAX_IMAGE_SIZE);
    let certificatePath;
    let receiptPath;
    try {
      certificatePath = await uploadPrivateFile(form.elements.certificate.files[0], id, "birth-certificate", MAX_DOCUMENT_SIZE);
      receiptPath = await uploadPrivateFile(form.elements.paymentReceipt.files[0], id, "payment-receipt", MAX_DOCUMENT_SIZE);
      const sessionValue = String(data.get("group") || "");
      const session = sessionValue === "other" ? null : sessions.find((item) => `${item.dayKey}|${item.time}` === sessionValue && item.sport === data.get("sport") && item.branch === data.get("branch"));
      const record = {
        id,
        parent_name: String(data.get("parentName")).trim(),
        child_name: String(data.get("childName")).trim(),
        phone: String(data.get("phone")).trim(),
        national_id: String(data.get("nationalId")).trim(),
        age: Number(data.get("age")),
        birth_date: data.get("birthDate"),
        previous_experience: data.get("previousExperience") === "yes",
        sport: data.get("sport"),
        branch: data.get("branch"),
        training_group: session ? `${days[session.dayKey].ar} • ${session.time}` : null,
        proposed_session: sessionValue === "other" ? String(data.get("customGroup")).trim() : null,
        athlete_photo_path: photoPath,
        certificate_path: certificatePath,
        payment_method: data.get("paymentMethod") || null,
        payment_reference: String(data.get("paymentReference") || "").trim() || null,
        payment_receipt_path: receiptPath,
        status: "pending",
      };
      const { error } = await supabaseClient.from("applications").insert(record);
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }
  function setupRegistration() {
    const form = document.getElementById("registration-form");
    if (!form) return;
    form.elements.sport.addEventListener("change", refreshRegistrationGroups);
    form.elements.branch.addEventListener("change", refreshRegistrationGroups);
    form.elements.group.addEventListener("change", refreshRegistrationGroups);
    form.elements.birthDate.addEventListener("change", () => {
      const birthDate = new Date(`${form.elements.birthDate.value}T00:00:00`);
      if (Number.isNaN(birthDate.getTime())) return;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
      if (age >= 1 && age <= 99) form.elements.age.value = String(age);
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.getElementById("registration-message");
      if (!form.reportValidity()) return;
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      try {
        await submitApplication(form);
        form.reset();
        refreshRegistrationGroups();
        showMessage(message, language === "ar" ? "تم استلام طلب التسجيل بنجاح." : "Your application was submitted.", false);
      } catch (error) {
        console.error("Application submission failed", error);
        showMessage(message, error.message || (language === "ar" ? "تعذر إرسال الطلب. حاول مرة أخرى." : "Could not submit the application."), true);
      } finally {
        button.disabled = false;
      }
    });
    refreshRegistrationGroups();
  }
  function statusLabel(status) {
    return labels[language][status] || status;
  }
  async function signedFileUrl(path) {
    if (!path) return "";
    const { data, error } = await supabaseClient.storage.from(STORAGE_BUCKET).createSignedUrl(path, 300);
    if (error) throw error;
    return data.signedUrl;
  }
  function egyptianWhatsappNumber(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.startsWith("0")) return `20${digits.slice(1)}`;
    return digits.startsWith("20") ? digits : `20${digits}`;
  }
  async function loadApplications() {
    if (!supabaseClient || !isAdmin) return;
    const { data, error } = await supabaseClient.from("applications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    applications = data || [];
    const { data: reviews, error: reviewError } = await supabaseClient.from("monthly_reviews").select("application_id,review_month,rating,note").order("review_month", { ascending: false });
    if (reviewError) throw reviewError;
    monthlyReviews = reviews || [];
    await renderApplications();
  }
  async function renderApplications() {
    const list = document.getElementById("applications-list");
    if (!list || !isAdmin) return;
    const results = applications.filter((app) =>
      (!applicationFilters.status || app.status === applicationFilters.status)
      && (!applicationFilters.sport || app.sport === applicationFilters.sport)
      && (!applicationFilters.search || `${app.child_name} ${app.parent_name} ${app.phone}`.toLowerCase().includes(applicationFilters.search.toLowerCase())));
    const count = document.getElementById("application-count");
    if (count) count.textContent = `${results.length} ${language === "ar" ? "طلب" : "applications"}`;
    if (!results.length) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(labels[language].empty)}</div>`;
      return;
    }
    try {
      const cards = await Promise.all(results.map(async (app) => {
      const [photo, certificate, receipt] = await Promise.all([
        signedFileUrl(app.athlete_photo_path),
        signedFileUrl(app.certificate_path),
        signedFileUrl(app.payment_receipt_path),
      ]);
      const created = new Date(app.created_at);
      const submitted = Number.isNaN(created.getTime()) ? app.created_at : new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(created);
      const links = [[photo, labels[language].athletePhoto], [certificate, labels[language].certificate], [receipt, labels[language].receipt]]
        .filter(([url]) => url).map(([url, label]) => `<a class="file-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`).join("");
      const whatsapp = `https://wa.me/${egyptianWhatsappNumber(app.phone)}?text=${encodeURIComponent(labels[language].approvedMessage)}`;
      const review = monthlyReviews.find((item) => item.application_id === app.id);
      return `<article class="application-card" data-application-id="${escapeHtml(app.id)}">
        <div class="application-top"><div><h3>${escapeHtml(app.child_name)}</h3><div class="subline">${escapeHtml(app.parent_name)} • ${escapeHtml(localize(sports, app.sport))} • ${escapeHtml(localize(branches, app.branch))}</div><div class="timestamp">${escapeHtml(labels[language].submitted)}: ${escapeHtml(submitted)}</div></div><span class="status ${escapeHtml(app.status)}">${escapeHtml(statusLabel(app.status))}</span></div>
        <div class="application-details"><span>${escapeHtml(labels[language].phone)}: ${escapeHtml(app.phone)}</span><span>${escapeHtml(labels[language].nationalId)}: ${escapeHtml(app.national_id)}</span><span>${escapeHtml(labels[language].age)}: ${escapeHtml(app.age)}</span><span>${escapeHtml(labels[language].birthDate)}: ${escapeHtml(app.birth_date || "—")}</span><span>${escapeHtml(labels[language].group)}: ${escapeHtml(app.training_group || app.proposed_session || "—")}</span><span>${escapeHtml(labels[language].experience)}: ${app.previous_experience ? "Yes / نعم" : "No / لا"}</span><span>${escapeHtml(labels[language].payment)}: ${escapeHtml(app.payment_method || "—")}</span><span>${escapeHtml(labels[language].paymentReference)}: ${escapeHtml(app.payment_reference || "—")}</span></div>
        <div class="application-files">${links}</div>
        ${app.status === "pending" ? `<div class="application-actions"><button class="status-action" type="button" data-status="approved" data-id="${escapeHtml(app.id)}">${escapeHtml(labels[language].approve)}</button><button class="status-action reject" type="button" data-status="rejected" data-id="${escapeHtml(app.id)}">${escapeHtml(labels[language].reject)}</button></div>` : ""}
        ${app.status === "approved" ? `<a class="button button-ghost button-small whatsapp-link" href="${escapeHtml(whatsapp)}" target="_blank" rel="noreferrer">${language === "ar" ? "فتح رسالة واتساب جاهزة" : "Open prepared WhatsApp message"}</a>` : ""}
        ${review ? `<div class="monthly-review-note">${language === "ar" ? "آخر تقييم شهري" : "Latest monthly review"} • ${escapeHtml(review.review_month)} • ${escapeHtml(review.rating)}/5${review.note ? ` • ${escapeHtml(review.note)}` : ""}</div>` : ""}
        <form class="review-form" data-review-id="${escapeHtml(app.id)}"><strong>${language === "ar" ? "التقييم الشهري (من 5)" : "Monthly review (out of 5)"}</strong><input name="rating" type="number" min="1" max="5" value="${review ? escapeHtml(review.rating) : ""}" required aria-label="Rating"><input name="note" maxlength="500" value="${review ? escapeHtml(review.note) : ""}" placeholder="${language === "ar" ? "ملاحظة التقييم" : "Review note"}"><button class="status-action" type="submit">${language === "ar" ? "حفظ التقييم" : "Save review"}</button></form>
      </article>`;
      }));
      list.innerHTML = cards.join("");
    } catch (error) {
      console.error("Could not render private application files", error);
      list.innerHTML = `<div class="empty-state">${escapeHtml(labels[language].loadError)}</div>`;
    }
  }
  async function refreshAdmin() {
    const panel = document.getElementById("admin-auth-panel");
    const dashboard = document.getElementById("admin-dashboard");
    if (!panel || !dashboard) return;
    if (!supabaseClient) {
      panel.hidden = false;
      dashboard.hidden = true;
      showMessage(document.getElementById("admin-auth-message"), labels[language].connection, true);
      return;
    }
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) {
      showMessage(document.getElementById("admin-auth-message"), sessionError.message, true);
      return;
    }
    if (!session) {
      isAdmin = false;
      panel.hidden = false;
      dashboard.hidden = true;
      document.getElementById("admin-signout-auth").hidden = true;
      return;
    }
    const { data, error } = await supabaseClient.rpc("is_academy_admin");
    if (error) {
      showMessage(document.getElementById("admin-auth-message"), error.message, true);
      return;
    }
    isAdmin = data === true;
    panel.hidden = isAdmin;
    dashboard.hidden = !isAdmin;
    if (!isAdmin) {
      document.getElementById("admin-signout-auth").hidden = false;
      showMessage(document.getElementById("admin-auth-message"), labels[language].adminOnly, true);
      return;
    }
    document.getElementById("admin-signout-auth").hidden = true;
    document.getElementById("admin-auth-message").hidden = true;
    try {
      await loadApplications();
    } catch (loadError) {
      console.error("Could not load applications", loadError);
      showMessage(document.getElementById("admin-auth-message"), labels[language].loadError, true);
    }
  }
  function setupAdmin() {
    const form = document.getElementById("admin-auth-form");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!supabaseClient) {
        showMessage(document.getElementById("admin-auth-message"), labels[language].connection, true);
        return;
      }
      const email = String(new FormData(form).get("email")).trim();
      const password = String(new FormData(form).get("password"));
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        showMessage(document.getElementById("admin-auth-message"), error.message, true);
        return;
      }
      await refreshAdmin();
    });
    document.getElementById("admin-register")?.addEventListener("click", async () => {
      if (!supabaseClient) return showMessage(document.getElementById("admin-auth-message"), labels[language].connection, true);
      const data = new FormData(form);
      const email = String(data.get("email")).trim();
      const password = String(data.get("password"));
      if (!email || password.length < 8) return showMessage(document.getElementById("admin-auth-message"), language === "ar" ? "أدخل بريدًا صحيحًا وكلمة مرور من 8 أحرف على الأقل." : "Enter a valid email and a password of at least 8 characters.", true);
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) return showMessage(document.getElementById("admin-auth-message"), error.message, true);
      showMessage(document.getElementById("admin-auth-message"), language === "ar"
        ? "تم إنشاء حساب المصادقة. فعّل البريد عند الحاجة، ثم امنح الحساب صلاحية المدير من SQL Editor قبل الدخول."
        : "Auth account created. Confirm email if required, then grant admin access in SQL Editor before signing in.", false);
    });
    document.getElementById("admin-signout")?.addEventListener("click", async () => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) showMessage(document.getElementById("admin-auth-message"), error.message, true);
      isAdmin = false;
      applications = [];
      await refreshAdmin();
    });
    document.getElementById("admin-signout-auth")?.addEventListener("click", async () => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) return showMessage(document.getElementById("admin-auth-message"), error.message, true);
      isAdmin = false;
      applications = [];
      monthlyReviews = [];
      await refreshAdmin();
    });
    document.getElementById("applications-list")?.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-status][data-id]");
      if (!button || !isAdmin) return;
      const { error } = await supabaseClient.from("applications").update({ status: button.dataset.status }).eq("id", button.dataset.id);
      if (error) {
        showMessage(document.getElementById("admin-auth-message"), error.message, true);
        return;
      }
      await loadApplications();
    });
    document.getElementById("applications-list")?.addEventListener("submit", async (event) => {
      const formTarget = event.target.closest(".review-form");
      if (!formTarget || !isAdmin) return;
      event.preventDefault();
      const formData = new FormData(formTarget);
      const { error } = await supabaseClient.from("monthly_reviews").upsert({
        application_id: formTarget.dataset.reviewId,
        review_month: `${new Date().toISOString().slice(0, 7)}-01`,
        rating: Number(formData.get("rating")),
        note: String(formData.get("note") || "").trim(),
      }, { onConflict: "application_id,review_month" });
      if (error) showMessage(document.getElementById("admin-auth-message"), error.message, true);
      else {
        showMessage(document.getElementById("admin-auth-message"), language === "ar" ? "تم حفظ التقييم الشهري." : "Monthly review saved.", false);
        await loadApplications();
      }
    });
    document.getElementById("application-status-filter")?.addEventListener("change", (event) => {
      applicationFilters.status = event.target.value;
      renderApplications();
    });
    document.getElementById("application-sport-filter")?.addEventListener("change", (event) => {
      applicationFilters.sport = event.target.value;
      renderApplications();
    });
    document.getElementById("application-search")?.addEventListener("input", (event) => {
      applicationFilters.search = event.target.value.trim();
      renderApplications();
    });
    supabaseClient?.auth.onAuthStateChange(() => {
      if (activeView === "applications") window.setTimeout(refreshAdmin, 0);
    });
  }
  function setupLanguageThemeAndNavigation() {
    document.getElementById("language-toggle")?.addEventListener("click", () => {
      language = language === "ar" ? "en" : "ar";
      localStorage.setItem(LANGUAGE_KEY, language);
      applyLanguage();
    });
    const themeButton = document.getElementById("theme-toggle");
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      if (themeButton) themeButton.textContent = theme === "dark" ? "☀" : "☾";
    };
    applyTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
    themeButton?.addEventListener("click", () => {
      const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, theme);
      applyTheme(theme);
    });
    document.getElementById("menu-toggle")?.addEventListener("click", (event) => {
      const nav = document.getElementById("main-navigation");
      const opened = nav.classList.toggle("is-open");
      event.currentTarget.setAttribute("aria-expanded", String(opened));
    });
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || !pageTitles[link.getAttribute("href").slice(1)]) return;
      event.preventDefault();
      showView(link.getAttribute("href").slice(1), true);
    });
    window.addEventListener("hashchange", () => showView(getCurrentView(), false));
  }
  function setupFeedback() {
    const form = document.getElementById("feedback-form");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = `رسالة إلى أكاديمية جولدن بوي - ${data.get("type")}`;
      const body = `${data.get("name")}\n\n${data.get("message")}`;
      window.location.href = `mailto:saifahmed313131@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
  function setupAchievementDialog() {
    const dialog = document.getElementById("achievement-dialog");
    const gallery = document.getElementById("achievement-dialog-gallery");
    if (!dialog || !gallery) return;
    document.querySelectorAll("[data-achievement-image]").forEach((card) => card.addEventListener("click", () => {
      const suffix = language === "ar" ? "Ar" : "En";
      const paths = card.dataset.achievementGallery ? card.dataset.achievementGallery.split("|") : [card.dataset.achievementImage];
      gallery.replaceChildren();
      gallery.classList.toggle("is-single", paths.length === 1);
      paths.forEach((path) => {
        const image = document.createElement("img");
        image.src = path;
        image.alt = card.dataset[`achievementAlt${suffix}`] || "";
        gallery.append(image);
      });
      document.getElementById("achievement-dialog-title").textContent = card.dataset[`achievementTitle${suffix}`] || "";
      document.getElementById("achievement-dialog-meta").textContent = card.dataset[`achievementMeta${suffix}`] || "";
      dialog.showModal();
    }));
  }
  function setupMediaPlaceholders() {
    const ownerProfile = document.querySelector("#owner .owner-profile");
    if (ownerProfile) ownerProfile.insertAdjacentHTML("afterend", `<section class="media-placeholder"><div><p class="eyebrow" data-ar="فيديو الأونر" data-en="OWNER VIDEO">فيديو الأونر</p><h2 data-ar="قصة الأونر من قلب الأكاديمية" data-en="The owner's story from the academy">قصة الأونر من قلب الأكاديمية</h2></div><video class="academy-video" controls playsinline preload="metadata" poster="assets/academy-owner.jpeg"><source src="assets/owner-story.mp4" type="video/mp4">متصفحك لا يدعم تشغيل الفيديو.</video></section><section class="testimonial-placeholder"><p class="eyebrow" data-ar="كلمات من المجتمع" data-en="COMMUNITY TESTIMONIALS">كلمات من المجتمع</p><h2 data-ar="شهادات اللاعبين وأولياء الأمور" data-en="Athlete and parent testimonials">شهادات اللاعبين وأولياء الأمور</h2><p data-ar="أرسل شهادات اللاعبين وأولياء الأمور بعد أخذ موافقتهم لإضافتها هنا." data-en="Send athlete and parent testimonials after obtaining their consent to add them here.">أرسل شهادات اللاعبين وأولياء الأمور بعد أخذ موافقتهم لإضافتها هنا.</p></section>`);
    const achievementGrid = document.querySelector("#achievements .achievement-grid");
    if (achievementGrid) {
      achievementGrid.insertAdjacentHTML("beforebegin", `<section class="achievement-video-panel"><p class="eyebrow" data-ar="فيديو الإنجاز • العرض الأول" data-en="ACHIEVEMENT VIDEO • PREMIERE">فيديو الإنجاز • العرض الأول</p><h2 data-ar="لحظات من رحلة الأبطال" data-en="Highlights from our champions' journey">لحظات من رحلة الأبطال</h2><video class="academy-video" controls playsinline preload="metadata" poster="assets/world-podium-team.jpeg"><source src="assets/achievement-opening.mp4" type="video/mp4">متصفحك لا يدعم تشغيل الفيديو.</video></section>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/egypt-national-team-trials-olympic-age.jpeg" data-achievement-alt-ar="أبطال جولدن بوي بعد تصفيات منتخب مصر للسن الأوليمبي" data-achievement-alt-en="Golden Boy champions after the Egypt national team trials in the Olympic age category" data-achievement-title-ar="أبطال تصفيات منتخب مصر للسن الأوليمبي" data-achievement-title-en="Egypt national team trials champions • Olympic age category" data-achievement-meta-ar="أبطال أكاديمية جولدن بوي • فئة السن الأوليمبي" data-achievement-meta-en="Golden Boy Academy champions • Olympic age category"><img src="assets/egypt-national-team-trials-olympic-age.jpeg" alt="أبطال جولدن بوي في تصفيات منتخب مصر للسن الأوليمبي"><span data-ar="تصفيات منتخب مصر • السن الأوليمبي" data-en="EGYPT NATIONAL TEAM TRIALS • OLYMPIC AGE">تصفيات منتخب مصر • السن الأوليمبي</span><strong data-ar="أبطال تصفيات منتخب مصر للسن الأوليمبي" data-en="Egypt national team trials champions">أبطال تصفيات منتخب مصر للسن الأوليمبي</strong><small data-ar="أبطال أكاديمية جولدن بوي" data-en="Golden Boy Academy champions">أبطال أكاديمية جولدن بوي</small><span class="achievement-open-hint" data-ar="اضغط لعرض تفاصيل الإنجاز ↗" data-en="Click to view achievement ↗">اضغط لعرض تفاصيل الإنجاز ↗</span></button>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/muay-thai-juniors-republic-medalists.png" data-achievement-gallery="assets/muay-thai-juniors-republic-medalists.png|assets/muay-thai-juniors-republic-team.png|assets/muay-thai-juniors-republic-match.png|assets/muay-thai-juniors-republic-coaching.png" data-achievement-alt-ar="أبطال جولدن بوي للبراعم في بطولة الجمهورية للمواي تاي" data-achievement-alt-en="Golden Boy junior champions at the Republic Muay Thai Championship" data-achievement-title-ar="أبطال بطولة الجمهورية للمواي تاي للبراعم" data-achievement-title-en="Republic Muay Thai Championship • Junior Champions" data-achievement-meta-ar="أبطال أكاديمية جولدن بوي • فئة البراعم" data-achievement-meta-en="Golden Boy Academy champions • Junior category"><img src="assets/muay-thai-juniors-republic-medalists.png" alt="أبطال جولدن بوي للبراعم في بطولة الجمهورية للمواي تاي"><span data-ar="بطولة الجمهورية • مواي تاي" data-en="REPUBLIC CHAMPIONSHIP • MUAY THAI">بطولة الجمهورية • مواي تاي</span><strong data-ar="أبطال بطولة الجمهورية للمواي تاي للبراعم" data-en="Republic Muay Thai Championship • Junior Champions">أبطال بطولة الجمهورية للمواي تاي للبراعم</strong><small data-ar="أبطال أكاديمية جولدن بوي • البراعم" data-en="Golden Boy Academy champions • Juniors">أبطال أكاديمية جولدن بوي • البراعم</small><span class="achievement-open-hint" data-ar="اضغط لعرض الصور والتفاصيل ↗" data-en="Click to view photos and details ↗">اضغط لعرض الصور والتفاصيل ↗</span></button>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/african-league-third-place.png" data-achievement-alt-ar="أبطال جولدن بوي في بطولة الدوري الأفريقي للووشو كونغ فو" data-achievement-alt-en="Golden Boy champions at the African Wushu Kung Fu League Championship" data-achievement-title-ar="بطولة الدوري الأفريقي" data-achievement-title-en="African League Championship" data-achievement-meta-ar="أبطال أكاديمية جولدن بوي • ووشو كونغ فو" data-achievement-meta-en="Golden Boy Academy champions • Wushu Kung Fu"><img src="assets/african-league-third-place.png" alt="أبطال جولدن بوي في بطولة الدوري الأفريقي"><span data-ar="بطولة الدوري الأفريقي • ووشو كونغ فو" data-en="AFRICAN LEAGUE • WUSHU KUNG FU">بطولة الدوري الأفريقي • ووشو كونغ فو</span><strong data-ar="بطولة الدوري الأفريقي" data-en="African League Championship">بطولة الدوري الأفريقي</strong><small data-ar="ووشو كونغ فو • أبطال أكاديمية جولدن بوي" data-en="Wushu Kung Fu • Golden Boy Academy champions">ووشو كونغ فو • أبطال أكاديمية جولدن بوي</small><span class="achievement-open-hint" data-ar="اضغط لعرض تفاصيل الإنجاز ↗" data-en="Click to view achievement ↗">اضغط لعرض تفاصيل الإنجاز ↗</span></button>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/republic-championship-overall-u12.png" data-achievement-alt-ar="تكريم أكاديمية جولدن بوي بالمركز الأول في الترتيب العام ببطولة الجمهورية تحت 12 سنة للووشو كونغ فو" data-achievement-alt-en="Golden Boy Academy receiving first place in the overall standings at the under-12 Republic Wushu Kung Fu Championship" data-achievement-title-ar="المركز الأول في الترتيب العام • بطولة الجمهورية تحت 12 سنة" data-achievement-title-en="First place overall • Under-12 Republic Championship" data-achievement-meta-ar="الاتحاد المصري للووشو كونغ فو • فئة تحت 12 سنة" data-achievement-meta-en="Egyptian Wushu Kung Fu Federation • Under-12 category"><img src="assets/republic-championship-overall-u12.png" alt="تكريم جولدن بوي بالمركز الأول في الترتيب العام لبطولة الجمهورية تحت 12 سنة"><span data-ar="بطولة الجمهورية • تحت 12 سنة" data-en="REPUBLIC CHAMPIONSHIP • UNDER 12">بطولة الجمهورية • تحت 12 سنة</span><strong data-ar="المركز الأول في الترتيب العام" data-en="First place in the overall standings">المركز الأول في الترتيب العام</strong><small data-ar="بطولة الجمهورية للووشو كونغ فو • تحت 12 سنة" data-en="Republic Wushu Kung Fu Championship • Under 12">بطولة الجمهورية للووشو كونغ فو • تحت 12 سنة</small><span class="achievement-open-hint" data-ar="اضغط لعرض تفاصيل الإنجاز ↗" data-en="Click to view achievement ↗">اضغط لعرض تفاصيل الإنجاز ↗</span></button>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/african-league-wushu-kung-fu.jpeg" data-achievement-alt-ar="أبطال جولدن بوي في بطولة الدوري الأفريقي للووشو كونغ فو" data-achievement-alt-en="Golden Boy champions at the African Wushu Kung Fu League Championship" data-achievement-title-ar="أبطال بطولة الدوري الأفريقي • ووشو كونغ فو" data-achievement-title-en="African League Champions • Wushu Kung Fu" data-achievement-meta-ar="أبطال أكاديمية جولدن بوي • الاتحاد الأفريقي للووشو كونغ فو" data-achievement-meta-en="Golden Boy Academy champions • African Wushu Kung Fu Federation"><img src="assets/african-league-wushu-kung-fu.jpeg" alt="أبطال أكاديمية جولدن بوي في بطولة الدوري الأفريقي للووشو كونغ فو"><span data-ar="بطولة الدوري الأفريقي • ووشو كونغ فو" data-en="AFRICAN LEAGUE • WUSHU KUNG FU">بطولة الدوري الأفريقي • ووشو كونغ فو</span><strong data-ar="أبطال بطولة الدوري الأفريقي" data-en="African League Champions">أبطال بطولة الدوري الأفريقي</strong><small data-ar="ووشو كونغ فو • أبطال أكاديمية جولدن بوي" data-en="Wushu Kung Fu • Golden Boy Academy champions">ووشو كونغ فو • أبطال أكاديمية جولدن بوي</small><span class="achievement-open-hint" data-ar="اضغط لعرض تفاصيل الإنجاز ↗" data-en="Click to view achievement ↗">اضغط لعرض تفاصيل الإنجاز ↗</span></button>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/central-south-egypt-shu-kung-fu-championship.jpeg" data-achievement-alt-ar="أبطال أكاديمية جولدن بوي في بطولة الجمهورية لوسط وجنوب مصر لشو كونغ فو" data-achievement-alt-en="Golden Boy Academy champions at the Central and South Egypt Shu Kung Fu Republic Championship" data-achievement-title-ar="أبطال بطولة الجمهورية لوسط وجنوب مصر • شو كونغ فو" data-achievement-title-en="Central and South Egypt Republic Championship • Shu Kung Fu Champions" data-achievement-meta-ar="أبطال أكاديمية جولدن بوي • شو كونغ فو" data-achievement-meta-en="Golden Boy Academy champions • Shu Kung Fu"><img src="assets/central-south-egypt-shu-kung-fu-championship.jpeg" alt="أبطال جولدن بوي في بطولة الجمهورية لوسط وجنوب مصر لشو كونغ فو"><span data-ar="بطولة الجمهورية • شو كونغ فو" data-en="REPUBLIC CHAMPIONSHIP • SHU KUNG FU">بطولة الجمهورية • شو كونغ فو</span><strong data-ar="أبطال بطولة الجمهورية لوسط وجنوب مصر • شو كونغ فو" data-en="Central and South Egypt Republic Championship • Shu Kung Fu Champions">أبطال بطولة الجمهورية لوسط وجنوب مصر • شو كونغ فو</strong><small data-ar="أبطال أكاديمية جولدن بوي" data-en="Golden Boy Academy champions">أبطال أكاديمية جولدن بوي</small><span class="achievement-open-hint" data-ar="اضغط لعرض تفاصيل الإنجاز ↗" data-en="Click to view achievement ↗">اضغط لعرض تفاصيل الإنجاز ↗</span></button>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/arab-kickboxing-championship-medalists.jpeg" data-achievement-gallery="assets/arab-kickboxing-championship-medalists.jpeg|assets/arab-kickboxing-championship-champion-flag.jpeg|assets/arab-kickboxing-championship-team-banner.jpeg" data-achievement-alt-ar="أبطال جولدن بوي بميدالياتهم في البطولة العربية للكيك بوكسينج" data-achievement-alt-en="Golden Boy champions with their medals at the Arab Kickboxing Championship" data-achievement-title-ar="أبطال بطولة العرب للكيك بوكسينج" data-achievement-title-en="Arab Kickboxing Championship Champions" data-achievement-meta-ar="أبطال أكاديمية جولدن بوي • البطولة العربية للكيك بوكسينج" data-achievement-meta-en="Golden Boy Academy champions • Arab Kickboxing Championship"><img src="assets/arab-kickboxing-championship-medalists.jpeg" alt="أبطال أكاديمية جولدن بوي في بطولة العرب للكيك بوكسينج"><span data-ar="بطولة العرب • كيك بوكسينج" data-en="ARAB CHAMPIONSHIP • KICKBOXING">بطولة العرب • كيك بوكسينج</span><strong data-ar="أبطال بطولة العرب للكيك بوكسينج" data-en="Arab Kickboxing Championship Champions">أبطال بطولة العرب للكيك بوكسينج</strong><small data-ar="أبطال أكاديمية جولدن بوي" data-en="Golden Boy Academy champions">أبطال أكاديمية جولدن بوي</small><span class="achievement-open-hint" data-ar="اضغط لعرض الصور والتفاصيل ↗" data-en="Click to view photos and details ↗">اضغط لعرض الصور والتفاصيل ↗</span></button>`);
      achievementGrid.insertAdjacentHTML("afterbegin", `<button class="achievement-photo-card" type="button" data-achievement-image="assets/arab-kickboxing-championship-team.jpeg" data-achievement-gallery="assets/arab-kickboxing-championship-team.jpeg|assets/arab-kickboxing-championship-team-flags.jpeg|assets/arab-kickboxing-championship-medalist.jpeg" data-achievement-alt-ar="أبطال جولدن بوي في بطولة أفريقيا للكيك بوكسينج" data-achievement-alt-en="Golden Boy champions at the African Kickboxing Championship" data-achievement-title-ar="أبطال بطولة أفريقيا للكيك بوكسينج" data-achievement-title-en="African Kickboxing Championship Champions" data-achievement-meta-ar="أبطال أكاديمية جولدن بوي • بطولة أفريقيا للكيك بوكسينج" data-achievement-meta-en="Golden Boy Academy champions • African Kickboxing Championship"><img src="assets/arab-kickboxing-championship-team.jpeg" alt="أبطال أكاديمية جولدن بوي في بطولة أفريقيا للكيك بوكسينج"><span data-ar="بطولة أفريقيا • كيك بوكسينج" data-en="AFRICAN CHAMPIONSHIP • KICKBOXING">بطولة أفريقيا • كيك بوكسينج</span><strong data-ar="أبطال بطولة أفريقيا للكيك بوكسينج" data-en="African Kickboxing Championship Champions">أبطال بطولة أفريقيا للكيك بوكسينج</strong><small data-ar="أبطال أكاديمية جولدن بوي" data-en="Golden Boy Academy champions">أبطال أكاديمية جولدن بوي</small><span class="achievement-open-hint" data-ar="اضغط لعرض الصور والتفاصيل ↗" data-en="Click to view photos and details ↗">اضغط لعرض الصور والتفاصيل ↗</span></button>`);
    }
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play().catch((error) => console.warn("Could not autoplay academy video:", error));
          } else {
            entry.target.pause();
          }
        });
      }, { threshold: 0.25 });
      document.querySelectorAll(".academy-video").forEach((video) => {
        video.muted = true;
        videoObserver.observe(video);
      });
    }
    applyLanguage();
  }

  renderSharedLayout();
  setupLanguageThemeAndNavigation();
  setupRegistration();
  setupFeedback();
  setupMediaPlaceholders();
  setupAchievementDialog();
  applyLanguage();
  showView(activeView, false);
})();
