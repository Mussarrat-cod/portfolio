# Building MVJ Launchpad: A College Placement Portal on MERN & Firebase

Placement season at any engineering college is organized chaos: hundreds of students, dozens of recruiters, overlapping interview slots, and a mountain of PDFs that someone has to manually cross-reference. MVJ Launchpad started as an attempt to replace that chaos with a single real-time platform — and turned into a deep lesson in building for concurrency, not just features.

This post walks through how the system is built, the decisions behind the stack, and the hard parts: real-time sync at scale, resume parsing, and scheduling interviews without double-booking anyone.

## Why MERN + Firebase

The core app — student profiles, recruiter dashboards, job postings, application tracking — runs on the classic MERN stack (MongoDB, Express, React, Node). MongoDB's flexible schema was a good fit for the messy, evolving shape of student data: different departments, varying resume formats, optional certifications, and recruiter-specific custom fields.

Firebase came in for the pieces that MERN doesn't do well out of the box:

- **Firestore + real-time listeners** for live updates — application status changes, new job postings, and interview slot availability all need to reflect instantly across every connected client without polling.
- **Firebase Auth** for fast, secure login across student and recruiter roles, backed by role-based access rules.
- **Firebase Cloud Messaging** for push notifications when a student gets shortlisted or a slot opens up.

The split isn't arbitrary: Express/MongoDB owns the system of record and business logic, while Firestore acts as the real-time layer that mirrors relevant state for instant UI updates. Keeping those boundaries clear avoided a lot of "which database is the source of truth" headaches later.

## Handling Scale: 1000+ Students, Real Time

The first version synced everything through simple REST polling. It worked for a demo with 20 users and fell over almost immediately at scale — recruiters watching a live applicant count would see it lag by seconds, and interview slots would occasionally get claimed by two students at once.

Two changes fixed most of this:

**1. Firestore listeners instead of polling.** Any view that needs to feel "live" — applicant counts, slot boards, application status — subscribes to a Firestore snapshot listener instead of hitting a REST endpoint on an interval. This cut both server load and perceived latency dramatically.

**2. Optimistic concurrency for writes.** For anything with contention risk (like claiming an interview slot), the write includes a version check or transaction rather than a blind update:

```javascript
await runTransaction(db, async (transaction) => {
  const slotRef = doc(db, "slots", slotId);
  const slotSnap = await transaction.get(slotRef);

  if (slotSnap.data().status !== "open") {
    throw new Error("Slot already taken");
  }

  transaction.update(slotRef, {
    status: "booked",
    studentId: currentUser.uid,
  });
});
```

Firestore transactions handle the retry-on-conflict logic internally, which meant we didn't have to hand-roll locking. This one change eliminated the double-booking bug entirely.

## Resume Parsing

Recruiters didn't want to open a thousand PDFs. They wanted searchable, filterable structured data — CGPA, skills, projects, certifications — pulled straight out of uploaded resumes.

The parsing pipeline works in three stages:

1. **Upload & extraction** — resumes are uploaded to cloud storage, and text is extracted server-side (handling both text-based and scanned PDFs differently, since scanned ones need OCR first).
2. **Structuring** — extracted text is run through a set of pattern-based and NLP-assisted extractors to pull out fields like skills, CGPA, and work experience into a consistent schema.
3. **Review & correction** — because automated extraction is never perfect, students get a chance to review and correct the parsed fields before their profile goes live. This turned out to be essential; trusting parsed data blindly led to a surprising number of misread CGPAs early on.

The structured output is stored in MongoDB alongside the student profile, making it filterable and searchable for recruiters without them ever touching a raw resume file unless they want to.

## Interview Scheduling Under Concurrency

This was the hardest part of the whole project. The naive version — a list of slots, students click to book — breaks the moment two people click the same slot within milliseconds of each other, which happens constantly when a popular company opens its calendar.

The scheduling system ended up needing:

- **Atomic slot claiming** via Firestore transactions (shown above), so a slot can only ever be claimed once, even under a burst of simultaneous requests.
- **Waitlist queues** for full slots, so students aren't just told "sorry, try again" — they're queued and automatically promoted if someone cancels.
- **Recruiter-side buffer windows** so back-to-back interviews automatically get a small gap, avoiding the "recruiter is 10 minutes behind by 11am" problem.
- **Conflict detection across applications** — a student can't accidentally book two interviews for the same time slot with different companies, which required checking across collections rather than just within one company's slot list.

Load-testing this with simulated concurrent bookings (a few hundred simulated students all hitting "book" on the same slot list at once) was what actually validated the transaction-based approach — it consistently resolved to exactly one winner per slot with no data corruption.

## Lessons Learned

A few things I'd tell myself before starting:

- **Decide early what's real-time and what isn't.** Making everything live is tempting but expensive; we only used Firestore listeners for views where staleness would actually be noticed by users.
- **Concurrency bugs don't show up until you have concurrent users.** The double-booking issue never appeared in single-user testing — it needed deliberate load testing to surface.
- **Let users correct automated output.** Resume parsing accuracy matters less than giving people an easy way to fix what the parser gets wrong.
- **Keep the source of truth unambiguous.** Mixing MongoDB and Firestore is powerful, but only if each piece of data has exactly one owner.

## What's Next

Planned improvements include smarter recruiter-side analytics (offer conversion rates by department, skill-gap trends), a more robust OCR pipeline for scanned resumes, and moving notification delivery to a queue-based system to handle placement-day traffic spikes more gracefully.

Building MVJ Launchpad was less about picking a trendy stack and more about learning where real-time actually earns its complexity — and where a boring, well-tested transaction beats a clever real-time trick every time.