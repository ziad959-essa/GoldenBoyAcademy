(() => {
  "use strict";

  const config = window.GOLDEN_BOY_SUPABASE_CONFIG;
  const client = config?.url && config?.anonKey && window.supabase
    ? window.supabase.createClient(config.url, config.anonKey)
    : null;
  const bucket = "player-private";
  const adminEmail = "saifahmed313131@gmail.com";
  const translations = {
    ar: {
      connection: "أضف رابط Supabase والمفتاح العام في supabase-config.js أولًا.",
      pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض",
      approve: "موافقة", reject: "رفض", empty: "لا توجد طلبات بهذه التصفية.",
      notAdmin: "هذا الحساب غير مخول كمدير. لوحة الطلبات خاصة بالمدير المعتمد فقط.",
      loadError: "تعذر تحميل بيانات لوحة الإدارة.", signOut: "تسجيل الخروج",
      athletePhoto: "صورة اللاعب", certificate: "شهادة الميلاد", receipt: "إيصال الدفع",
      phone: "الهاتف", nationalId: "الرقم القومي", age: "السن", birthDate: "الميلاد",
      group: "الموعد", experience: "خبرة سابقة", payment: "الدفع", reference: "مرجع الدفع",
      submitted: "تاريخ التقديم", review: "التقييم الشهري (من 5)",
      note: "ملاحظة التقييم", saveReview: "حفظ التقييم", lastReview: "آخر تقييم",
      reviewSaved: "تم حفظ التقييم الشهري.", reviewFailed: "تعذر حفظ التقييم.",
      approvedMessage: "تم قبول طلب التسجيل في أكاديمية جولدن بوي. سنتواصل معكم قريبًا لتأكيد المجموعة.",
      whatsapp: "إرسال رسالة واتساب جاهزة", yes: "نعم", no: "لا",
      noConfig: "لم يتم ضبط الاتصال بـ Supabase.",
    },
    en: {
      connection: "Set the Supabase URL and public key in supabase-config.js first.",
      pending: "Pending review", approved: "Approved", rejected: "Rejected",
      approve: "Approve", reject: "Reject", empty: "No applications match these filters.",
      notAdmin: "This account is not an authorized admin. Applications are private to approved admins.",
      loadError: "Could not load the admin dashboard.", signOut: "Sign out",
      athletePhoto: "Athlete photo", certificate: "Birth certificate", receipt: "Payment receipt",
      phone: "Phone", nationalId: "National ID", age: "Age", birthDate: "Birth date",
      group: "Session", experience: "Prior experience", payment: "Payment", reference: "Payment reference",
      submitted: "Submitted", review: "Monthly review (out of 5)",
      note: "Review note", saveReview: "Save review", lastReview: "Latest review",
      reviewSaved: "Monthly review saved.", reviewFailed: "Could not save the review.",
      approvedMessage: "Your application to Golden Boy Academy has been approved. We will contact you shortly to confirm your group.",
      whatsapp: "Send prepared WhatsApp message", yes: "Yes", no: "No",
      noConfig: "Supabase is not configured.",
    },
  };
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
    popular1: "الشعبية 1", popular2: "الشعبية 2", popular3: "الشعبية 3",
    mashma1: "المشحمة 1", mashma2: "المشحمة 2", sevenGirls: "السبع بنات",
    club23: "نادي 23 يوليو",
  };
  let language = localStorage.getItem("goldenBoyLanguage") === "en" ? "en" : "ar";
  let isAdmin = false;
  let applications = [];
  let reviews = [];
  const filters = { status: "", sport: "", search: "" };

  function text(key) {
    return translations[language][key];
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }
  function message(value, error) {
    const node = document.getElementById("admin-auth-message");
    node.textContent = value;
    node.classList.toggle("error", Boolean(error));
    node.hidden = false;
  }
  function localize() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("english-layout", language === "en");
    document.querySelectorAll("[data-ar][data-en]").forEach((element) => {
      element.innerHTML = element.dataset[language];
    });
    document.getElementById("language-toggle").textContent = language === "ar" ? "EN / ع" : "ع / EN";
    document.title = language === "ar" ? "الإدارة | أكاديمية جولدن بوي" : "Admin | Golden Boy Academy";
    renderApplications();
  }
  function setupTheme() {
    const button = document.getElementById("theme-toggle");
    const update = (theme) => {
      document.documentElement.dataset.theme = theme;
      button.textContent = theme === "dark" ? "☀" : "☾";
    };
    update(localStorage.getItem("goldenBoyTheme") === "light" ? "light" : "dark");
    button.addEventListener("click", () => {
      const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("goldenBoyTheme", theme);
      update(theme);
    });
    document.getElementById("language-toggle").addEventListener("click", () => {
      language = language === "ar" ? "en" : "ar";
      localStorage.setItem("goldenBoyLanguage", language);
      localize();
    });
  }
  function populateSportFilter() {
    const select = document.getElementById("application-sport-filter");
    Object.entries(sports).forEach(([id, name]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name[language];
      select.append(option);
    });
  }
  async function checkAdmin() {
    const panel = document.getElementById("admin-auth-panel");
    const dashboard = document.getElementById("admin-dashboard");
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      isAdmin = false;
      panel.hidden = false;
      dashboard.hidden = true;
      document.getElementById("admin-signout-auth").hidden = true;
      return;
    }
    const { data, error } = await client.rpc("is_academy_admin");
    if (error) throw error;
    isAdmin = data === true;
    panel.hidden = isAdmin;
    dashboard.hidden = !isAdmin;
    document.getElementById("admin-signout-auth").hidden = isAdmin;
    if (!isAdmin) {
      message(text("notAdmin"), true);
      return;
    }
    document.getElementById("admin-auth-message").hidden = true;
    await loadApplications();
  }
  async function loadApplications() {
    if (!isAdmin) return;
    const [{ data: applicationRows, error: applicationError }, { data: reviewRows, error: reviewError }] = await Promise.all([
      client.from("applications").select("*").order("created_at", { ascending: false }),
      client.from("monthly_reviews").select("application_id,review_month,rating,note").order("review_month", { ascending: false }),
    ]);
    if (applicationError) throw applicationError;
    if (reviewError) throw reviewError;
    applications = applicationRows || [];
    reviews = reviewRows || [];
    await renderApplications();
  }
  async function fileUrl(path) {
    if (!path) return "";
    const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 300);
    if (error) throw error;
    return data.signedUrl;
  }
  function whatsappNumber(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.startsWith("0")) return `20${digits.slice(1)}`;
    return digits.startsWith("20") ? digits : `20${digits}`;
  }
  async function renderApplications() {
    const list = document.getElementById("applications-list");
    if (!list || !isAdmin) return;
    const rows = applications.filter((app) =>
      (!filters.status || filters.status === app.status)
      && (!filters.sport || filters.sport === app.sport)
      && (!filters.search || `${app.child_name} ${app.parent_name} ${app.phone}`.toLowerCase().includes(filters.search.toLowerCase())));
    document.getElementById("application-count").textContent = `${rows.length} ${language === "ar" ? "طلب" : "applications"}`;
    if (!rows.length) {
      list.innerHTML = `<div class="empty-state">${escapeHtml(text("empty"))}</div>`;
      return;
    }
    try {
      const cards = await Promise.all(rows.map(async (app) => {
        const [photo, certificate, receipt] = await Promise.all([
          fileUrl(app.athlete_photo_path), fileUrl(app.certificate_path), fileUrl(app.payment_receipt_path),
        ]);
        const files = [[photo, text("athletePhoto")], [certificate, text("certificate")], [receipt, text("receipt")]]
          .filter(([url]) => url)
          .map(([url, label]) => `<a class="file-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
          .join("");
        const review = reviews.find((row) => row.application_id === app.id);
        const sportName = sports[app.sport]?.[language] || app.sport;
        const created = new Date(app.created_at);
        const date = Number.isNaN(created.getTime()) ? app.created_at : new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(created);
        const whatsapp = `https://wa.me/${whatsappNumber(app.phone)}?text=${encodeURIComponent(text("approvedMessage"))}`;
        return `<article class="application-card">
          <div class="application-top"><div><h3>${escapeHtml(app.child_name)}</h3><div class="subline">${escapeHtml(app.parent_name)} • ${escapeHtml(sportName)} • ${escapeHtml(branches[app.branch] || app.branch)}</div><div class="timestamp">${escapeHtml(text("submitted"))}: ${escapeHtml(date)}</div></div><span class="status ${escapeHtml(app.status)}">${escapeHtml(text(app.status))}</span></div>
          <div class="application-details">
            <span>${escapeHtml(text("phone"))}: ${escapeHtml(app.phone)}</span><span>${escapeHtml(text("nationalId"))}: ${escapeHtml(app.national_id)}</span><span>${escapeHtml(text("age"))}: ${escapeHtml(app.age)}</span><span>${escapeHtml(text("birthDate"))}: ${escapeHtml(app.birth_date || "—")}</span><span>${escapeHtml(text("group"))}: ${escapeHtml(app.training_group || app.proposed_session || "—")}</span><span>${escapeHtml(text("experience"))}: ${app.previous_experience ? text("yes") : text("no")}</span><span>${escapeHtml(text("payment"))}: ${escapeHtml(app.payment_method || "—")}</span><span>${escapeHtml(text("reference"))}: ${escapeHtml(app.payment_reference || "—")}</span>
          </div><div class="application-files">${files}</div>
          ${app.status === "pending" ? `<div class="application-actions"><button class="status-action" type="button" data-status="approved" data-id="${escapeHtml(app.id)}">${escapeHtml(text("approve"))}</button><button class="status-action reject" type="button" data-status="rejected" data-id="${escapeHtml(app.id)}">${escapeHtml(text("reject"))}</button></div>` : ""}
          ${app.status === "approved" ? `<a class="button button-ghost button-small whatsapp-link" href="${escapeHtml(whatsapp)}" target="_blank" rel="noreferrer">${escapeHtml(text("whatsapp"))}</a>` : ""}
          ${review ? `<p class="monthly-review-note">${escapeHtml(text("lastReview"))}: ${escapeHtml(review.review_month)} • ${escapeHtml(review.rating)}/5 • ${escapeHtml(review.note)}</p>` : ""}
          <form class="review-form" data-review-id="${escapeHtml(app.id)}"><strong>${escapeHtml(text("review"))}</strong><input name="rating" type="number" min="1" max="5" value="${review ? escapeHtml(review.rating) : ""}" required aria-label="${escapeHtml(text("review"))}"><input name="note" maxlength="500" value="${escapeHtml(review?.note || "")}" placeholder="${escapeHtml(text("note"))}"><button class="status-action" type="submit">${escapeHtml(text("saveReview"))}</button></form>
        </article>`;
      }));
      list.innerHTML = cards.join("");
    } catch (error) {
      console.error("Could not display private application files", error);
      list.innerHTML = `<div class="empty-state">${escapeHtml(text("loadError"))}</div>`;
    }
  }
  function setupAuthentication() {
    const form = document.getElementById("admin-auth-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const email = String(data.get("email")).trim().toLowerCase();
      if (email !== adminEmail) {
        message(language === "ar" ? "هذا البريد غير مخول للدخول إلى لوحة الأونر." : "This email is not authorized to access the owner portal.", true);
        return;
      }
      const { error } = await client.auth.signInWithPassword({
        email,
        password: String(data.get("password")),
      });
      if (error) {
        message(error.message, true);
        return;
      }
      try {
        await checkAdmin();
      } catch (error) {
        console.error("Admin access check failed", error);
        message(error.message || text("loadError"), true);
      }
    });
    document.getElementById("admin-register").addEventListener("click", async () => {
      const data = new FormData(form);
      const email = String(data.get("email")).trim().toLowerCase();
      const password = String(data.get("password"));
      if (email !== adminEmail) {
        message(language === "ar" ? "إنشاء حساب لوحة الإدارة مسموح للبريد المعتمد فقط." : "Only the authorized owner email can register for this admin portal.", true);
        return;
      }
      if (!email || password.length < 8) {
        message(language === "ar" ? "أدخل بريدًا صحيحًا وكلمة مرور من 8 أحرف على الأقل." : "Enter an email and a password of at least 8 characters.", true);
        return;
      }
      const { error } = await client.auth.signUp({ email, password });
      if (error) {
        message(error.message, true);
        return;
      }
      message(language === "ar"
        ? "تم إنشاء حساب المصادقة. فعّل البريد عند الحاجة، ثم امنح البريد المعتمد صلاحية المدير عبر SQL قبل الدخول."
        : "Auth account created. Confirm the email if needed, then explicitly grant admin access in SQL before signing in.", false);
    });
    for (const id of ["admin-signout", "admin-signout-auth"]) {
      document.getElementById(id).addEventListener("click", async () => {
        const { error } = await client.auth.signOut();
        if (error) {
          message(error.message, true);
          return;
        }
        isAdmin = false;
        applications = [];
        reviews = [];
        await checkAdmin();
      });
    }
    client.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        isAdmin = false;
        document.getElementById("admin-auth-panel").hidden = false;
        document.getElementById("admin-dashboard").hidden = true;
      }
    });
  }
  function setupDashboard() {
    const list = document.getElementById("applications-list");
    list.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-status][data-id]");
      if (!button || !isAdmin) return;
      const { error } = await client.from("applications")
        .update({ status: button.dataset.status }).eq("id", button.dataset.id);
      if (error) {
        message(error.message, true);
        return;
      }
      try {
        await loadApplications();
      } catch (loadError) {
        console.error("Failed to refresh applications", loadError);
        message(text("loadError"), true);
      }
    });
    list.addEventListener("submit", async (event) => {
      const form = event.target.closest(".review-form");
      if (!form || !isAdmin) return;
      event.preventDefault();
      const data = new FormData(form);
      const month = `${new Date().toISOString().slice(0, 7)}-01`;
      const { error } = await client.from("monthly_reviews").upsert({
        application_id: form.dataset.reviewId,
        review_month: month,
        rating: Number(data.get("rating")),
        note: String(data.get("note") || "").trim(),
      }, { onConflict: "application_id,review_month" });
      if (error) {
        message(`${text("reviewFailed")} ${error.message}`, true);
        return;
      }
      message(text("reviewSaved"), false);
      await loadApplications();
    });
    document.getElementById("application-status-filter").addEventListener("change", (event) => {
      filters.status = event.target.value;
      renderApplications();
    });
    document.getElementById("application-sport-filter").addEventListener("change", (event) => {
      filters.sport = event.target.value;
      renderApplications();
    });
    document.getElementById("application-search").addEventListener("input", (event) => {
      filters.search = event.target.value.trim();
      renderApplications();
    });
  }

  setupTheme();
  populateSportFilter();
  localize();
  if (!client) {
    document.getElementById("admin-dashboard").hidden = true;
    document.getElementById("admin-auth-panel").hidden = false;
    message(text("connection"), true);
  } else {
    setupAuthentication();
    setupDashboard();
    checkAdmin().catch((error) => {
      console.error("Unable to initialize the admin portal", error);
      message(error.message || text("loadError"), true);
    });
  }
})();
