# 📚 Lesson Learned: Prompt Engineering & Project Development

## 🎯 Ringkasan Sesi

**Periode:** September 19, 2025  
**Durasi:** Multiple sessions  
**Scope:** Migrasi TypeORM ke Prisma, Docker configuration, dan dokumentasi  

---

## 📊 Overview Perjalanan Prompt

### 🛠️ **Tahapan Utama yang Dilalui:**

1. **Backend Migration** - TypeORM → Prisma
2. **Docker Configuration Fix** - Prisma compatibility
3. **Reference Feature Implementation** - Test case traceability
4. **Documentation Creation** - README.md comprehensive
5. **AI Settings Documentation** - Model configuration guide

---

## ✅ **Apa yang Berhasil (Best Practices)**

### 🎯 **1. Prompt yang Spesifik dan Kontekstual**
**Contoh Baik:**
> *"fix this docker compose, because we now using prisma, not type orm"*

**Mengapa Berhasil:**
- Jelas menyebutkan teknologi lama vs baru
- Memberikan konteks perubahan yang sudah terjadi
- Spesifik pada masalah yang dihadapi

### 🔍 **2. Iterative Problem Solving**
**Pola yang Efektif:**
- Start with general problem → Get specific error → Fix step by step
- Contoh: Docker SSL issue → Alpine → Debian → Binary targets → Success

### 📝 **3. Requirement yang Jelas untuk Dokumentasi**
**Contoh Baik:**
> *"isi README.md dengan penjelasan yang mudah dipahami oleh orang awam. jadi orang awam ngerti ini aplikasi apa. buat se menarik mungkin, jangan gunakan istilah yang terlalu kompleks"*

**Mengapa Efektif:**
- Target audience jelas (orang awam)
- Tone yang diinginkan spesifik (menarik, tidak kompleks)
- Bahasa yang diminta eksplisit (Indonesia)

---

## ❌ **Kesalahan & Area Improvement**

### 🚨 **1. Assumption tanpa Verifikasi**

**Kesalahan:**
- Kadang prompt tidak mencantumkan versi atau kondisi environment
- Asumsi bahwa setup default akan bekerja

**Contoh Kasus:**
- Docker Prisma SSL issue membutuhkan beberapa iterasi karena tidak langsung menyebutkan base image yang digunakan

**Lesson Learned:**
```
❌ "Fix Docker"
✅ "Fix Docker for Prisma on current setup (check base image, dependencies)"
```

### 🔄 **2. Context Switching tanpa Summary**

**Kesalahan:**
- Melompat dari satu topik ke topik lain tanpa ringkasan
- Tidak memberikan status "where we are now"

**Improvement:**
```
❌ Langsung: "Now fix the documentation"
✅ Better: "Docker issue resolved, all services running. Now update docs to reflect Prisma migration"
```

### 📖 **3. Dokumentasi Requirement yang Terlalu General**

**Kesalahan Awal:**
- Request dokumentasi tanpa spesifikasi format/struktur

**Evolution yang Baik:**
- Kemudian menjadi spesifik: "jangan menuliskan apa yang belum ada" 
- "tampilannya menarik, menggunakan bahasa indonesia"
- "di atas kasih keterangan setting AI nya"

---

## 🎯 **Pattern Recognition: Prompt yang Efektif**

### 📋 **Template Sukses untuk Technical Issues:**

```markdown
[CONTEXT] - What technology/setup we're using
[PROBLEM] - Specific error or issue
[CONSTRAINT] - What should/shouldn't be changed
[EXPECTED] - What good result looks like
```

**Contoh Aplikasi:**
```
CONTEXT: "we now using prisma, not typeorm"
PROBLEM: "docker compose doesn't work"  
CONSTRAINT: "keep current architecture"
EXPECTED: "services start successfully"
```

### 📝 **Template Sukses untuk Documentation:**

```markdown
[AUDIENCE] - Who will read this (developer/awam/PM)
[TONE] - How it should sound (technical/friendly/professional)
[LANGUAGE] - Indonesia/English/Mixed
[SCOPE] - What to include/exclude
[FORMAT] - Structure preferences
```

---

## 🚀 **Rekomendasi untuk Prompt Kedepan**

### 🎯 **1. Pre-Context Setting**

**Sebelum memulai sesi baru, selalu berikan:**
```markdown
## Current State:
- Tech stack: [list current technologies]
- What's working: [current functional features]  
- What's broken: [known issues]
- Recent changes: [what was just modified]

## Goal:
- What I want to achieve
- Success criteria
- Constraints
```

### 🔍 **2. Error Reporting Best Practice**

**Struktur yang Direkomendasikan:**
```markdown
## Error Report:
- **What I did:** [exact command/action]
- **Expected:** [what should happen]
- **Actual:** [what actually happened]
- **Error message:** [copy exact error]
- **Environment:** [OS, Docker version, etc.]
```

### 📚 **3. Documentation Request Template**

```markdown
## Documentation Request:
- **Target audience:** [developer/end-user/stakeholder]
- **Language:** [Indonesia/English]
- **Tone:** [technical/friendly/marketing]
- **Scope:** [what to include/exclude]
- **Format preference:** [README/wiki/API docs]
- **Existing content:** [what's already there]
```

### 🔄 **4. Iterative Development Pattern**

**Recommended Flow:**
```
1. Define scope clearly
2. Break into small steps  
3. Verify each step works
4. Provide status update
5. Move to next step
```

**Contoh:**
```
✅ "First, migrate the schema"
✅ "Test the migration works"  
✅ "Update service layer"
✅ "Test API endpoints"
✅ "Update documentation"
```

---

## 🧠 **Advanced Prompting Strategies**

### 🎯 **1. Constraint-Based Prompting**

**Instead of:** "Make it better"
**Use:** "Improve X without changing Y, considering constraint Z"

**Contoh:**
```
❌ "Fix the Docker setup"
✅ "Fix Docker for Prisma while keeping MySQL and current network config"
```

### 🔍 **2. Example-Driven Prompting**

**Pattern:** Berikan contoh konkret dari hasil yang diinginkan

**Contoh Efektif:**
```
"Update README like popular GitHub projects:
- Badges at top
- Clear getting started
- Examples that work
- Target: non-technical users"
```

### 📊 **3. Validation-Focused Prompting**

**Always include success criteria:**
```
"Fix X, then verify by:
1. Command Y should return Z
2. Service should respond to endpoint
3. No errors in logs"
```

---

## 📈 **Metrics & Success Indicators**

### ✅ **Signs of Good Prompting:**

1. **One-shot success rate** - Issues resolved in single iteration
2. **Context retention** - AI remembers previous steps
3. **Proactive suggestions** - AI anticipates next steps
4. **Accurate assumptions** - AI makes correct technical decisions

### ⚠️ **Red Flags to Avoid:**

1. **Endless iterations** - Same issue discussed multiple times
2. **Context loss** - Having to re-explain the same setup
3. **Scope creep** - Tasks expanding beyond original scope
4. **Assumption conflicts** - AI making wrong technical choices

---

## 🎯 **Specific Recommendations untuk Project Ini**

### 🛠️ **Technical Development:**

1. **Always mention current tech stack** in prompts
   ```
   ✅ "Using NestJS + Prisma + Docker, need to..."
   ```

2. **Include test commands** for verification
   ```
   ✅ "Fix X, then test with: curl localhost:3000/health"
   ```

3. **Specify environment constraints**
   ```
   ✅ "For Docker production, not local development"
   ```

### 📚 **Documentation Prompts:**

1. **Define audience first**
   ```
   ✅ "For Indonesian developers who are new to this project"
   ```

2. **Specify what NOT to include**
   ```
   ✅ "Don't mention features we haven't implemented yet"
   ```

3. **Request examples and code snippets**
   ```
   ✅ "Include working curl examples"
   ```

---

## 🔮 **Future-Proofing Strategies**

### 📋 **Maintenance Prompts:**

```markdown
## Regular Maintenance Template:
- "Review current documentation for accuracy"
- "Check all code examples still work"  
- "Update any outdated dependencies mentioned"
- "Verify all endpoints in examples are functional"
```

### 🚀 **Feature Addition Template:**

```markdown
## New Feature Request:
- **Current state:** [working features]
- **Proposed addition:** [specific new feature]
- **Integration points:** [how it connects to existing]
- **Testing plan:** [how to verify it works]
- **Documentation impact:** [what docs need updating]
```

---

## 💡 **Key Takeaways**

### 🎯 **Top 5 Lessons:**

1. **Specificity beats verbosity** - Clear, specific prompts work better than long explanations
2. **Context is king** - Always provide current state and environment details
3. **Iterative is better** - Break complex tasks into verifiable steps
4. **Test-driven prompting** - Include verification steps in requests
5. **Documentation needs audience definition** - Always specify who will read it

### 🚨 **Top 3 Pitfalls to Avoid:**

1. **Assumption without verification** - Don't assume current state
2. **Scope expansion mid-task** - Stay focused on original goal
3. **Missing success criteria** - Always define what "done" looks like

---

## 📊 **Scoring System untuk Future Prompts**

### ⭐ **Rate Your Prompt (1-5 stars):**

- **Context provided:** Current state clearly explained?
- **Goal specificity:** Exact outcome defined?
- **Constraints mentioned:** Limitations clearly stated?
- **Success criteria:** How to verify completion?
- **Scope boundary:** Clear what's in/out of scope?

**Target:** Average 4+ stars per prompt for optimal results.

---

<div align="center">

## 🎯 **Final Recommendation**

**Treat prompts like code:** Be precise, provide context, include tests, and iterate based on results.

*The best prompts are specific, contextual, and verifiable.*

</div>
