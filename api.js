/* ==========================================================================
   GramaGlow — REST API Client with Automatic LocalStorage Fallback
   Connects to Express Backend (/api/*) when server is running;
   gracefully persists to localStorage if opened directly offline.
   ========================================================================== */

(function (global) {
  const STORAGE_KEY = "gramaglow_offline_db_v2";
  const TOKEN_KEY = "gramaglow_admin_token_v2";
  const SYNC_QUEUE_KEY = "gramaglow_sync_queue_v3";

  const OFFLINE_SEED = {
    tokenCounter: 1048,
    noticeCounter: 104,
    agendaCounter: 3,
    profile: {
      nameEn: "Pipri Gram Panchayat",
      nameHi: "पिपरी ग्राम पंचायत",
      districtEn: "Block Sadar • District Wardha",
      districtHi: "विकासखंड सदर • जिला वर्धा",
      population: 3420,
      totalWards: 8,
      sarpanchNameEn: "Smt. Savitri Devi",
      sarpanchNameHi: "श्रीमती सावित्री देवी",
      sarpanchPhone: "+91 98230 45120",
      secretaryNameEn: "Shri Rajeshwar Kulkarni",
      secretaryNameHi: "श्री राजेश्वर कुलकर्णी",
      secretaryPhone: "+91 94221 78310",
    },
    wards: [
      { ward: 1, nameEn: "Shri Prakashrao Deshmukh", nameHi: "श्री प्रकाशराव देशमुख", areaEn: "Panchayat Chowk & Main Bazaar", areaHi: "पंचायत चौक और मुख्य बाज़ार", phone: "+91 98231 10001" },
      { ward: 2, nameEn: "Smt. Sunita Tai Patil", nameHi: "श्रीमती सुनीता ताई पाटिल", areaEn: "Hanuman Mandir Colony", areaHi: "हनुमान मंदिर कॉलोनी", phone: "+91 98231 10002" },
      { ward: 3, nameEn: "Shri Rameshwar Jadhav", nameHi: "श्री रामेश्वर जाधव", areaEn: "North School Road", areaHi: "उत्तरी विद्यालय मार्ग", phone: "+91 98231 10003" },
      { ward: 4, nameEn: "Smt. Meena Devi Pawar", nameHi: "श्रीमती मीना देवी पवार", areaEn: "Krishi Upaj Lane", areaHi: "कृषि उपज गली", phone: "+91 98231 10004" },
      { ward: 5, nameEn: "Shri Kailash Wankhede", nameHi: "श्री कैलाश वानखेड़े", areaEn: "Ambedkar Nagar", areaHi: "अंबेडकर नगर", phone: "+91 98231 10005" },
      { ward: 6, nameEn: "Smt. Kavita Meshram", nameHi: "श्रीमती कविता मेश्राम", areaEn: "East Borewell Mohalla", areaHi: "पूर्वी बोरवेल मोहल्ला", phone: "+91 98231 10006" },
      { ward: 7, nameEn: "Shri Deepak Gajbhiye", nameHi: "श्री दीपक गजभिये", areaEn: "Bunkar Colony", areaHi: "बुनकर कॉलोनी", phone: "+91 98231 10007" },
      { ward: 8, nameEn: "Smt. Vandana Gaikwad", nameHi: "श्रीमती वंदना गायकवाड़", areaEn: "Riverbank Farm Cluster", areaHi: "नदी तट कृषि क्षेत्र", phone: "+91 98231 10008" },
    ],
    notices: [
      {
        id: "N-101",
        category: "Gram Sabha",
        dateEn: "Next Tuesday • 10:00 AM",
        dateHi: "अगला मंगलवार • सुबह 10:00 बजे",
        titleEn: "Special Gram Sabha Meeting — Infrastructure & Water Audit",
        titleHi: "विशेष ग्राम सभा बैठक — विकास कार्य एवं पेयजल समीक्षा",
        bodyEn: "All adult residents of Wards 1 to 8 are invited to Panchayat Bhavan Courtyard to approve new solar lamps and review drinking water tank cleaning schedules.",
        bodyHi: "वार्ड 1 से 8 के सभी ग्रामवासियों को पंचायत भवन प्रांगण में आमंत्रित किया जाता है। बैठक में नई सोलर लाइट और पेयजल टंकी सफाई पर निर्णय लिया जाएगा।",
        authorityEn: "Sarpanch & Gram Sevak",
        authorityHi: "सरपंच एवं ग्राम सेवक",
        scriptHi: "नमस्कार ग्रामवासियों। अगले मंगलवार सुबह 10 बजे पिपरी पंचायत भवन में विशेष ग्राम सभा रखी गई है। सभी नागरिक समय पर उपस्थित होकर अपने सुझाव दें।",
      },
      {
        id: "N-102",
        category: "Agriculture",
        dateEn: "2 Days Ago",
        dateHi: "2 दिन पहले",
        titleEn: "PM-Kisan e-KYC & Rabi Drip Irrigation Subsidy Camp",
        titleHi: "पीएम-किसान ई-केवाईसी एवं रबी सिंचाई सब्सिडी शिविर",
        bodyEn: "Agriculture Extension Officer will be available at Ward 1 Seva Kendra this Friday from 11 AM to 4 PM with Aadhaar and 7/12 land extract verification.",
        bodyHi: "कृषि विस्तार अधिकारी इस शुक्रवार सुबह 11 से शाम 4 बजे तक वार्ड 1 सेवा केंद्र में आधार और खसरा-खतौनी सत्यापन हेतु उपलब्ध रहेंगे।",
        authorityEn: "Block Agriculture Office",
        authorityHi: "विकासखंड कृषि कार्यालय",
        scriptHi: "किसान भाइयों के लिए सूचना: इस शुक्रवार सुबह 11 बजे से पंचायत सेवा केंद्र में पीएम-किसान ई-केवाईसी और सिंचाई सब्सिडी शिविर आयोजित किया गया है।",
      },
      {
        id: "N-103",
        category: "Health",
        dateEn: "4 Days Ago",
        dateHi: "4 दिन पहले",
        titleEn: "Maternal & Child Immunization Drive at Primary Health Sub-Center",
        titleHi: "प्राथमिक स्वास्थ्य उपकेंद्र में मातृ एवं शिशु टीकाकरण अभियान",
        bodyEn: "Free routine vaccinations, iron supplements, and blood pressure screening for senior citizens every Wednesday from 9:30 AM.",
        bodyHi: "प्रत्येक बुधवार सुबह 9:30 बजे से बच्चों का निःशुल्क टीकाकरण, आयरन की गोलियां और वरिष्ठ नागरिकों की रक्तचाप जांच की जाएगी।",
        authorityEn: "ANM & ASHA Health Team",
        authorityHi: "स्वास्थ्य विभाग एवं आशा कार्यकर्ता",
        scriptHi: "स्वास्थ्य सूचना: हर बुधवार सुबह 9:30 बजे पिपरी स्वास्थ्य उपकेंद्र में बच्चों का टीकाकरण और बुजुर्गों की निःशुल्क जांच की जाती है।",
      },
    ],
    projects: [
      { id: "P-01", titleEn: "Concrete Paved Road Construction (Main Chowk to School)", titleHi: "सीमेंट कंक्रीट पक्की सड़क निर्माण (मुख्य चौक से विद्यालय तक)", wardEn: "Ward 1 & Ward 3", wardHi: "वार्ड 1 और वार्ड 3", sanctioned: 400000, spent: 320000, workPct: 80 },
      { id: "P-02", titleEn: "Solar Streetlight Installation (24 LED Poles)", titleHi: "सोलर स्ट्रीट लाइट स्थापना (24 एलईडी पोल)", wardEn: "Ward 3 & Ward 7", wardHi: "वार्ड 3 और वार्ड 7", sanctioned: 250000, spent: 235000, workPct: 70 },
      { id: "P-03", titleEn: "School Sanitation & Girls Hygiene Block", titleHi: "विद्यालय स्वच्छता एवं बालिका शौचालय निर्माण", wardEn: "Ward 2", wardHi: "वार्ड 2", sanctioned: 350000, spent: 315000, workPct: 92 },
      { id: "P-04", titleEn: "Community Borewell & Overhead Pipeline Extension", titleHi: "सामुदायिक बोरवेल एवं पेयजल पाइपलाइन विस्तार", wardEn: "Ward 5 & Ward 6", wardHi: "वार्ड 5 और वार्ड 6", sanctioned: 450000, spent: 270000, workPct: 62 },
      { id: "P-05", titleEn: "Covered Storm-Water Drainage Channel", titleHi: "ढकी हुई वर्षा जल निकासी नाली निर्माण", wardEn: "Ward 4 & Ward 8", wardHi: "वार्ड 4 और वार्ड 8", sanctioned: 400000, spent: 180000, workPct: 48 },
    ],
    grievances: [
      { token: "GP-1042", category: "Streetlights", ward: 3, status: "In Progress", slaHoursLeft: 0, citizenName: "Mahesh Kale", landmark: "North School Gate, Pole #14", titleEn: "Broken Solar Streetlamp near North School Gate", titleHi: "उत्तरी विद्यालय गेट के पास खराब सोलर स्ट्रीट लाइट", descEn: "Pole #14 battery box is loose and lamp has not turned on for 4 nights.", descHi: "पोल नंबर 14 का बैटरी बॉक्स ढीला है और 4 रातों से लाइट बंद है।", resolutionNotes: "Electrician inspected pole #14; replacement charge controller ordered.", photoDataUrl: null, photoCaptionEn: "Field photo captured at Ward 3 School Gate showing unlit solar pole #14.", photoCaptionHi: "वार्ड 3 विद्यालय गेट पर बंद सोलर पोल नंबर 14 का स्थल फोटो।" },
      { token: "GP-1045", category: "Drinking Water", ward: 6, status: "Assigned", slaHoursLeft: 9, citizenName: "Rekha Meshram", landmark: "East Borewell Valve Chamber", titleEn: "Low Water Pressure & Valve Leak at East Borewell", titleHi: "पूर्वी बोरवेल पर कम पानी का दबाव और वाल्व रिसाव", descEn: "Main distribution gate valve is leaking every morning between 6 AM and 8 AM.", descHi: "सुबह 6 से 8 बजे के बीच मुख्य वितरण वाल्व से पानी व्यर्थ बह रहा है।", resolutionNotes: "Assigned to Ward 6 Member Smt. Kavita Meshram.", photoDataUrl: null, photoCaptionEn: "Water pooling around East Borewell valve chamber in Ward 6.", photoCaptionHi: "वार्ड 6 पूर्वी बोरवेल वाल्व चैंबर के पास पानी रिसाव का दृश्य।" },
      { token: "GP-1048", category: "Sanitation", ward: 5, status: "Submitted", slaHoursLeft: 26, citizenName: "Suresh Wankhede", landmark: "Ambedkar Nagar Chowk", titleEn: "Blocked Drain Culvert near Ambedkar Nagar Chowk", titleHi: "अंबेडकर नगर चौक के पास जाम नाली पुलिया", descEn: "Silt accumulation blocking greywater flow after recent showers.", descHi: "मिट्टी और कचरा जमा होने से नाली का पानी रुका हुआ है।", resolutionNotes: "", photoDataUrl: null, photoCaptionEn: "Drainage grate obstruction reported near Ward 5 community hall.", photoCaptionHi: "वार्ड 5 सामुदायिक भवन के पास जाम नाली जाली का फोटो।" },
      { token: "GP-1031", category: "Drinking Water", ward: 2, status: "Resolved", slaHoursLeft: 0, citizenName: "Anita Patil", landmark: "Near Hanuman Mandir", titleEn: "Handpump Washer Replacement near Hanuman Mandir", titleHi: "हनुमान मंदिर के पास हैंडपंप वॉशर सुधार कार्य", descEn: "Cylinder piston and handle bearing replaced by Panchayat plumber team.", descHi: "पंचायत प्लंबर टीम द्वारा हैंडपंप पिस्टन और बेयरिंग बदल दिया गया है।", resolutionNotes: "Completed and verified with Ward 2 residents.", photoDataUrl: null, photoCaptionEn: "Repaired handpump delivering clean water in Ward 2.", photoCaptionHi: "वार्ड 2 में मरम्मत के बाद चालू हैंडपंप का प्रमाण फोटो।" },
    ],
    agendaItems: [
      { id: "AG-1", titleEn: "Install 6 additional solar lamps along Bunkar Colony & Riverbank path", titleHi: "बुनकर कॉलोनी और नदी मार्ग पर 6 अतिरिक्त सोलर लैंप लगाना", proposedBy: "Deepak Gajbhiye", ward: 7, votes: 34 },
      { id: "AG-2", titleEn: "Monthly chlorination & cleaning report board at Community Water Tank", titleHi: "सामुदायिक जल टंकी पर मासिक क्लोरीनेशन एवं सफाई रिपोर्ट बोर्ड", proposedBy: "Sunita Patil", ward: 2, votes: 28 },
    ],
    assets: [
      { id: "A-1", type: "HealthCenter", x: 230, y: 140, color: "#dc2626", nameEn: "Pipri Primary Health Sub-Center", nameHi: "पिपरी प्राथमिक स्वास्थ्य उपकेंद्र", metaEn: "Ward 1 • ANM Nurse on duty 9 AM – 4 PM", metaHi: "वार्ड 1 • एएनएम नर्स उपलब्ध (सुबह 9 – शाम 4)" },
      { id: "A-2", type: "School", x: 520, y: 135, color: "#0066cc", nameEn: "Zilla Parishad Upper Primary School", nameHi: "जिला परिषद उच्च प्राथमिक विद्यालय", metaEn: "Ward 3 • Classes 1–8 • 284 Students", metaHi: "वार्ड 3 • कक्षा 1–8 • 284 विद्यार्थी" },
      { id: "A-3", type: "Anganwadi", x: 210, y: 285, color: "#d97706", nameEn: "Anganwadi Center No. 1", nameHi: "आंगनवाड़ी केंद्र क्रमांक 1", metaEn: "Ward 5 • Early Childhood Care & Nutrition", metaHi: "वार्ड 5 • बाल विकास एवं पोषण आहार केंद्र" },
      { id: "A-4", type: "WaterPoint", x: 590, y: 275, color: "#059669", nameEn: "Community Solar Borewell & Tank", nameHi: "सामुदायिक सोलर बोरवेल एवं जल टंकी", metaEn: "Ward 6 • 50,000 Litre Capacity", metaHi: "वार्ड 6 • 50,000 लीटर क्षमता" },
    ],
  };

  let onlineMode = true;

  function loadOfflineDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn("[GramaGlow] LocalStorage read failed, re-seeding:", err.message);
    }
    const copy = JSON.parse(JSON.stringify(OFFLINE_SEED));
    saveOfflineDB(copy);
    return copy;
  }

  function saveOfflineDB(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (err) {
      console.warn("[GramaGlow] LocalStorage write failed:", err.message);
    }
  }

  function getAdminToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || "";
    } catch (err) {
      console.warn("[GramaGlow] SessionStorage read unavailable:", err.message);
      return "";
    }
  }

  function setAdminToken(token) {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.warn("[GramaGlow] SessionStorage write unavailable:", err.message);
    }
  }

  function enqueueOfflineGrievance(payload) {
    try {
      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      queue.push({ payload, queuedAt: new Date().toISOString() });
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.warn("[GramaGlow] Failed to enqueue offline grievance:", err.message);
    }
  }

  async function apiFetch(url, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(url, { ...options, headers });
    const data = await resp.json().catch((parseErr) => {
      console.warn("[GramaGlow] Non-JSON API response:", parseErr.message);
      return {};
    });
    if (!resp.ok) {
      const err = new Error(data.error || `Request failed (${resp.status})`);
      err.status = resp.status;
      throw err;
    }
    return data;
  }

  const GramaGlowAPI = {
    isOnline() {
      return onlineMode;
    },
    getAdminToken,
    setAdminToken,

    async bootstrap() {
      if (window.location.protocol === "file:") {
        onlineMode = false;
        return loadOfflineDB();
      }
      try {
        const data = await apiFetch("/api/bootstrap");
        onlineMode = true;
        return data;
      } catch (err) {
        console.warn("[GramaGlow] Backend unreachable, switching to Offline Mode:", err.message);
        onlineMode = false;
        return loadOfflineDB();
      }
    },

    async loginAdmin(username, password) {
      if (!onlineMode) {
        if (username.trim().toLowerCase() === "sarpanch" && password === "sarpanch2026") {
          setAdminToken("offline-sarpanch-session");
          return { token: "offline-sarpanch-session", user: { username: "sarpanch" } };
        }
        throw new Error("Invalid Sarpanch credentials.");
      }
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setAdminToken(data.token);
      return data;
    },

    async submitGrievance(payload) {
      if (!onlineMode) {
        const db = loadOfflineDB();
        db.tokenCounter = (db.tokenCounter || 1048) + 1;
        const record = {
          token: `GP-${db.tokenCounter}`,
          category: payload.category,
          ward: Number(payload.ward),
          status: "Submitted",
          slaHoursLeft: 48,
          citizenName: payload.citizenName,
          citizenPhone: payload.citizenPhone || "",
          landmark: payload.landmark,
          titleEn: payload.title,
          titleHi: payload.title,
          descEn: `${payload.description} (Location: ${payload.landmark})`,
          descHi: `${payload.description} (स्थान: ${payload.landmark})`,
          resolutionNotes: "",
          photoDataUrl: payload.photoDataUrl || null,
          photoCaptionEn: `Submitted by ${payload.citizenName} near ${payload.landmark}.`,
          photoCaptionHi: `${payload.citizenName} द्वारा ${payload.landmark} के पास से अपलोड किया गया फोटो।`,
          updatedAt: new Date().toISOString(),
        };
        db.grievances.unshift(record);
        saveOfflineDB(db);
        enqueueOfflineGrievance(payload);
        return { grievance: record, queuedForSync: true };
      }
      return apiFetch("/api/grievances", { method: "POST", body: JSON.stringify(payload) });
    },

    async updateGrievance(token, updates) {
      if (!onlineMode) {
        const db = loadOfflineDB();
        const item = db.grievances.find((g) => g.token === token);
        if (!item) throw new Error("Grievance token not found.");
        if (updates.status) {
          item.status = updates.status;
          if (updates.status === "Resolved") item.slaHoursLeft = 0;
        }
        if (updates.assignedWard) item.ward = Number(updates.assignedWard);
        if (updates.resolutionNotes !== undefined) item.resolutionNotes = updates.resolutionNotes;
        item.updatedAt = new Date().toISOString();
        saveOfflineDB(db);
        return { grievance: item };
      }
      return apiFetch(`/api/grievances/${encodeURIComponent(token)}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },

    async updateProject(projectId, updates) {
      if (!onlineMode) {
        const db = loadOfflineDB();
        const proj = db.projects.find((p) => p.id === projectId);
        if (!proj) throw new Error("Project not found.");
        if (updates.workPct !== undefined) proj.workPct = Number(updates.workPct);
        if (updates.spent !== undefined) proj.spent = Number(updates.spent);
        saveOfflineDB(db);
        return { project: proj };
      }
      return apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },

    async publishNotice(payload) {
      if (!onlineMode) {
        const db = loadOfflineDB();
        db.noticeCounter = (db.noticeCounter || 104) + 1;
        const notice = {
          id: `N-${db.noticeCounter}`,
          category: payload.category,
          dateEn: "Just Now",
          dateHi: "अभी जारी",
          titleEn: payload.titleEn,
          titleHi: payload.titleHi || payload.titleEn,
          bodyEn: payload.bodyEn,
          bodyHi: payload.bodyHi || payload.bodyEn,
          authorityEn: "Sarpanch Office (Pipri)",
          authorityHi: "सरपंच कार्यालय (पिपरी)",
          scriptHi: payload.scriptHi || payload.bodyHi || payload.bodyEn,
        };
        db.notices.unshift(notice);
        saveOfflineDB(db);
        return { notice };
      }
      return apiFetch("/api/notices", { method: "POST", body: JSON.stringify(payload) });
    },

    async addAgendaItem(payload) {
      if (!onlineMode) {
        const db = loadOfflineDB();
        db.agendaCounter = (db.agendaCounter || 3) + 1;
        const item = {
          id: `AG-${db.agendaCounter}`,
          titleEn: payload.title,
          titleHi: payload.title,
          proposedBy: payload.proposedBy,
          ward: Number(payload.ward),
          votes: 1,
        };
        db.agendaItems.push(item);
        saveOfflineDB(db);
        return { agendaItem: item };
      }
      return apiFetch("/api/agenda", { method: "POST", body: JSON.stringify(payload) });
    },

    async flushSyncQueue() {
      if (window.location.protocol === "file:") return 0;
      let queue = [];
      try {
        queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      } catch (err) {
        console.warn("[GramaGlow] Could not read sync queue:", err.message);
        return 0;
      }
      if (!queue.length) return 0;
      let synced = 0;
      const remaining = [];
      for (const entry of queue) {
        try {
          await apiFetch("/api/grievances", { method: "POST", body: JSON.stringify(entry.payload) });
          synced += 1;
        } catch (err) {
          console.warn("[GramaGlow] Deferred sync retry for queued grievance:", err.message);
          remaining.push(entry);
        }
      }
      try {
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
      } catch (err) {
        console.warn("[GramaGlow] Could not update sync queue:", err.message);
      }
      if (synced > 0) onlineMode = true;
      return synced;
    },

    async getAuditLogs() {
      if (!onlineMode) return { logs: [] };
      return apiFetch("/api/audit-logs");
    },

    async upvoteAgenda(agendaId) {
      if (!onlineMode) {
        const db = loadOfflineDB();
        const item = db.agendaItems.find((a) => a.id === agendaId);
        if (!item) throw new Error("Agenda item not found.");
        item.votes += 1;
        saveOfflineDB(db);
        return { agendaItem: item };
      }
      return apiFetch(`/api/agenda/${encodeURIComponent(agendaId)}/vote`, { method: "POST" });
    },
  };

  global.GramaGlowAPI = GramaGlowAPI;
})(window);
