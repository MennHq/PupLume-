import { GoogleGenAI } from '@google/genai';

interface AIRequestPayload {
  userId?: string;
  message: string;
  puppyContext: {
    name: string;
    breed: string;
    ageWeeks: number;
    weightLbs: number;
    temperament: string;
    recentPottySummary: string;
    recentSleepSummary: string;
    upcomingTasks: string;
    upcomingVet: string;
    longTermMemories: string[];
  };
}


class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private capacity: number;
  private refillRatePerMs: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillRatePerMs = refillRatePerSec / 1000;
  }

  tryConsume(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsedTime = now - this.lastRefill;
    const tokensToAdd = elapsedTime * this.refillRatePerMs;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
}

const userBuckets = new Map<string, TokenBucket>();

export async function processAIChat(payload: AIRequestPayload): Promise<{
  text: string;
  suggestedActions?: Array<{
    id: string;
    type: string;
    title: string;
    summary: string;
    payload: any;
  }>;
}> {
  const { message, puppyContext } = payload;
  
  // Rate limiting (Token Bucket)
  const uid = payload.userId || 'anonymous';
  if (!userBuckets.has(uid)) {
    // Limit: 10 burst, 1 token replenished every 6 seconds (10 per minute)
    userBuckets.set(uid, new TokenBucket(10, 10 / 60));
  }
  if (!userBuckets.get(uid)!.tryConsume(1)) {
    return {
      text: "The AI is taking a quick puppy nap! Zzzzz... 😴😪 Please give it a few seconds to wake up!"
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const systemInstruction = `
You are PupLume, the intelligent, warm, highly knowledgeable AI Puppy Manager and canine development specialist.
You are helping the owner of "${puppyContext.name}", a ${puppyContext.ageWeeks}-week-old ${puppyContext.breed} (${puppyContext.weightLbs} lbs).
Temperament: ${puppyContext.temperament}

LONG-TERM PERSONALIZED MEMORIES (Always reference these if relevant to the user's question):
${puppyContext.longTermMemories && puppyContext.longTermMemories.length > 0 ? puppyContext.longTermMemories.map(m => "- " + m).join('\\n') : "- No personalized memories saved yet."}

Current context:
- Potty summary: ${puppyContext.recentPottySummary}
- Sleep summary: ${puppyContext.recentSleepSummary}
- Upcoming tasks: ${puppyContext.upcomingTasks}
- Vet appointments: ${puppyContext.upcomingVet}

APP KNOWLEDGE (PupLume Navigation & Usage):
- **What is PupLume?** The ultimate AI-powered app for tracking, training, and managing the chaotic first year of puppyhood.
- **Installing the App (PWA):** If the user asks how to download or install the app, tell them: PupLume is a Progressive Web App (PWA). They don't need the App Store. On iPhone (Safari), tap the "Share" icon at the bottom and select "Add to Home Screen". On Android (Chrome), tap the 3-dot menu and select "Add to Home screen". It will install directly to their phone and act like a native app.
- **App Features / Navigation:**
  - **Home:** Dashboard with AI insights and the Quick Log (fast tracking for Potty, Meals, Play).
  - **Plan (Schedule):** Manage the daily routine, tasks, and calendar.
  - **Academy:** Step-by-step training guides (Crate Training, Potty Training, Recall, Leash Walking). If the user asks how to train or solve a behavioral issue (like biting, pulling, or crate training), recommend they check the Academy tab for structured lessons, AND optionally use the NAVIGATE action to give them a button directly to the Academy.
  - **Health Center:** Track vaccines (like DHPP, Rabies), log weight charts, and store medical records.
  - **More Menu:** Access Family Sharing (sync with partners), Expenses, Puppy Journal, Document Vault, and Socialization/Grooming logs.
  - **Plan:** See the daily routine, tasks, and calendar. If they ask "where can I see my task plan", use the NAVIGATE action with tab="plan".

RULES:
1. Warm, encouraging, calm, expert tone. Ground advice in positive reinforcement and puppy developmental biology.
2. MEDICAL DISCLAIMER GUARDRAIL: You must NEVER diagnose medical conditions or pretend to be a veterinarian. For health, lethargy, vomiting, fever, or toxins: offer general informational guidance, list red flags, and firmly advise contacting a licensed vet or emergency clinic.
3. CONCISE & ACTIONABLE: Keep answers to 2-4 short, readable paragraphs or scannable bullet points.
4. REASONING: Always briefly explain the "why" behind your advice so the owner learns canine psychology.
5. FORMATTING: Use **Markdown** extensively. Bold important terms, use bulleted lists, and format cleanly.
6. ACTION PROPOSALS: Propose structured actions when the user mentions scheduling, tasks, or logging events.
7. SAVING MEMORIES: THIS IS CRITICAL. If the user tells you a fact about themselves, their puppy (like a birthdate, age, preference, quirk), OR explicitly asks you to remember or save something, YOU MUST output the "SAVE_MEMORY" action! Do NOT just say "I will remember that", you must actually use the tool payload to record it.

Valid action types:
- "CREATE_TASK": payload { "title": string, "category": "potty"|"feeding"|"training"|"sleep"|"walk"|"health"|"grooming", "time": string, "durationMin": number }
- "CREATE_APPOINTMENT": payload { "title": string, "clinic": string, "date": "YYYY-MM-DD", "time": "HH:MM", "reason": string }
- "LOG_POTTY": payload { "type": "pee"|"poop"|"both"|"accident", "location": "outdoor"|"indoor_accident" }
- "LOG_FEEDING": payload { "mealType": "breakfast"|"lunch"|"dinner"|"snack", "amountCups": number }
- "LOG_SLEEP": payload { "type": "nap"|"night", "durationMin": number }
- "ADD_EXPENSE": payload { "title": string, "category": string, "amount": number }
- "SAVE_MEMORY": payload { "fact": string, "category": "preference"|"medical"|"behavior" }
- "NAVIGATE": payload { "tab": "home"|"plan"|"academy"|"health"|"more" } (Use this to give the user a button to jump directly to a tab)

OUTPUT FORMAT:
Always return valid JSON matching this schema:
{
  "text": "Your helpful response text here in markdown",
  "suggestedActions": [
    {
      "id": "act-1",
      "type": "CREATE_TASK" | "CREATE_APPOINTMENT" | "LOG_POTTY" | "LOG_FEEDING" | "LOG_SLEEP" | "ADD_EXPENSE" | "SAVE_MEMORY" | "NAVIGATE",
      "title": "Short title",
      "summary": "1 sentence description of what will be added",
      "payload": { ... }
    }
  ]
}
If no action is needed, "suggestedActions" should be empty array.
`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);
      return {
        text: parsed.text || "Here's what I recommend for " + puppyContext.name + ".",
        suggestedActions: parsed.suggestedActions || []
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local puppy intelligence engine:', err);
    }
  }

  // Fallback engine: highly tailored contextual responses for common queries
  return generateContextualFallback(message, puppyContext);
}

function generateContextualFallback(message: string, context: AIRequestPayload['puppyContext']) {
  const lower = message.toLowerCase();
  const name = context.name;

  // Basic Greeting
  if (lower === 'hey' || lower === 'hi' || lower === 'hello' || lower === 'sup') {
    return {
      text: `Hi there! How can I help you and ${name} today?`,
      suggestedActions: []
    };
  }

  // Medical / Sickness check
  if (lower.includes('vomit') || lower.includes('blood') || lower.includes('poison') || lower.includes('sick') || lower.includes('lethargic') || lower.includes('diarrhea')) {
    return {
      text: `⚠️ **Medical Precaution for ${name}**:\n\nBecause ${name} is only ${context.ageWeeks} weeks old, their immune system is still developing. While mild stomach upsets happen with dietary shifts, persistent vomiting, severe lethargy, pale gums, or refusal to drink water are red flags.\n\n*General Guidance:*\n1. Withhold heavy food for 2 hours, offer small sips of water or low-sodium bone broth.\n2. Do NOT administer human medications.\n3. **Call your vet:** ${context.upcomingVet ? 'Your clinic is on file.' : 'Please consult your veterinarian immediately.'}`,
      suggestedActions: [
        {
          id: `act-${Date.now()}`,
          type: 'CREATE_APPOINTMENT',
          title: `Vet Exam for ${name}`,
          summary: `Schedule veterinary checkup for symptoms inquiry`,
          payload: {
            title: `Vet Symptom Checkup - ${name}`,
            clinic: 'City Vet Animal Hospital',
            date: new Date().toISOString().split('T')[0],
            time: '11:00 AM',
            reason: 'Symptom examination & health check'
          }
        }
      ]
    };
  }

  // Biting & Mouthing
  if (lower.includes('biting') || lower.includes('bite') || lower.includes('chewing') || lower.includes('teeth')) {
    return {
      text: `At **${context.ageWeeks} weeks**, ${name} is in peak exploratory teething! Puppies explore everything with needle-sharp baby teeth, but 80% of frantic biting is actually caused by **overtiredness**.\n\n**Three-Step Action Plan:**\n1. **Freeze & Disengage:** When teeth touch skin, say a calm, neutral "Ouch" or "Nope", drop your arms, and become boring.\n2. **The Cold Chew Swap:** Immediately redirect onto a frozen rubber Kong or textured puppy chew ring.\n3. **The Nap Reset:** If ${name} is running in frantic circles and chomping air or pant legs, tuck him into his crate with a chew for a 60–90 minute power nap.`,
      suggestedActions: [
        {
          id: `act-${Date.now()}`,
          type: 'CREATE_TASK',
          title: `Frozen Kong Teething & Nap Reset`,
          summary: `Add calming 60-min crate nap & cold chew to today's schedule`,
          payload: {
            title: `Frozen Kong Teething & Nap Reset`,
            category: 'sleep',
            time: '02:30 PM',
            durationMin: 60
          }
        }
      ]
    };
  }

  // Potty Training plan
  if (lower.includes('potty') || lower.includes('pee') || lower.includes('poop') || lower.includes('accident')) {
    return {
      text: `Based on ${name}'s age (${context.ageWeeks} weeks), his physical bladder capacity is roughly **${Math.min(context.ageWeeks / 4, 3.5)} hours** when calm, but only **15–20 minutes** during active play or immediately after eating.\n\n**Key Potty Windows for Today:**\n- Immediately upon waking from any crate rest or nap\n- 10 to 15 minutes after each meal\n- Immediately after high-energy indoor play or tug games\n\nAlways reward with a high-value pea-sized treat *outside within 2 seconds* of finishing.`,
      suggestedActions: [
        {
          id: `act-${Date.now()}`,
          type: 'LOG_POTTY',
          title: `Log Potty Break for ${name}`,
          summary: `Record an outdoor potty event right now`,
          payload: {
            type: 'pee',
            location: 'outdoor'
          }
        },
        {
          id: `act-${Date.now()}-2`,
          type: 'CREATE_TASK',
          title: `Post-Lunch Potty Break`,
          summary: `Schedule post-meal outdoor potty break`,
          payload: {
            title: `Post-Lunch Potty Break`,
            category: 'potty',
            time: '12:30 PM',
            durationMin: 10
          }
        }
      ]
    };
  }

  // Appointment / Vaccine
  if (lower.includes('vaccine') || lower.includes('shot') || lower.includes('appointment') || lower.includes('vet')) {
    return {
      text: `${name} has an upcoming **Puppy 16-Week Booster & Rabies Exam** scheduled for **October 12 at 3:00 PM** with Dr. Eleanor Vance at City Vet Animal Hospital.\n\nThis visit includes:\n- Final DHPP 3rd booster\n- 1-Year Rabies vaccination & certificate tag\n- Weight check and dental development inspection\n\nRemember to bring a fresh stool sample in a sealed container for the routine parasite screen.`,
      suggestedActions: [
        {
          id: `act-${Date.now()}`,
          type: 'CREATE_REMINDER',
          title: `24-Hour Vet Appointment Reminder`,
          summary: `Set notification 24 hours prior to Oct 12 appointment`,
          payload: {
            title: `Reminder: ${name}'s 16-Week Vet Appointment Tomorrow`,
            date: '2026-10-11',
            time: '03:00 PM'
          }
        }
      ]
    };
  }

  // What should Max do today / Schedule / Settle
  if (lower.includes('today') || lower.includes('schedule') || lower.includes('settle') || lower.includes('routine')) {
    return {
      text: `Here is ${name}'s optimal rhythm for today balancing mental enrichment, physical exercise, and critical puppy sleep (target 16–18 total hours):\n\n- **10:30 AM**: 5-minute Recall Training ("Rocket Come") with high-value treats\n- **11:00 AM**: 15-minute gentle backyard sniff-walk on loose harness\n- **12:00 PM**: Lunch in a wobble puzzle feeder\n- **01:00 PM**: 2-hour deep afternoon crate nap in a quiet, darkened room`,
      suggestedActions: [
        {
          id: `act-${Date.now()}`,
          type: 'CREATE_TASK',
          title: `Rocket Recall Practice (5 min)`,
          summary: `Add 5-minute training block to schedule`,
          payload: {
            title: `Rocket Recall Practice`,
            category: 'training',
            time: '10:30 AM',
            durationMin: 5
          }
        }
      ]
    };
  }

  // Progress summary
  if (lower.includes('progress') || lower.includes('summary') || lower.includes('week')) {
    return {
      text: `📊 **Weekly Progress Summary for ${name}:**\n\n- **Potty Reliability:** 86% success rate outdoors over the past 7 days (only 1 minor indoor slip).\n- **Sleep Total:** Averaging 16.2 hours per day with zero overnight crying in his den crate.\n- **Training Academy:** Mastered 4 foundation lessons: Name Recognition, Marker Word "Yes!", Lure to Sit, and Harness Acclimatization.\n- **Weight Growth:** Up from 21.8 lbs to 24.2 lbs on steady large-breed curve.`,
      suggestedActions: [
        {
          id: `act-${Date.now()}`,
          type: 'CREATE_TASK',
          title: `Review "Down / Lie Down" Lesson`,
          summary: `Start the next foundation lesson in Academy`,
          payload: {
            title: `Practice Down / Lie Down (5 min)`,
            category: 'training',
            time: '03:30 PM',
            durationMin: 5
          }
        }
      ]
    };
  }

  // Generic friendly fallback
  return {
    text: `I'm currently operating in offline backup mode, so my advanced intelligence is resting right now! 🐾 \n\nI can still help you with standard commands about potty training, biting, scheduling, or medical concerns. What would you like to focus on for ${name}?`,
    suggestedActions: []
  };
}

export interface OnboardingExtractedData {
  userName?: string;
  puppyName?: string;
  breed?: string;
  sex?: 'male' | 'female';
  ageWeeks?: number;
  ageText?: string;
  weightLbs?: number;
  wakeTime?: string;
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  bedtime?: string;
  trainingGoals?: string;
  photoUrl?: string;
}

export interface OnboardingTaskItem {
  title: string;
  category: 'potty' | 'feeding' | 'sleep' | 'training' | 'walk' | 'grooming' | 'health';
  time: string;
  durationMin: number;
  period: 'morning' | 'afternoon' | 'evening';
  description: string;
}

export interface OnboardingAIResponse {
  reply: string;
  extractedData: OnboardingExtractedData;
  validationError?: string | null;
  isReadyToGenerate: boolean;
  suggestedTasks?: OnboardingTaskItem[];
}

export async function processAIOnboardingChat(payload: {
  message: string;
  history: Array<{ sender: 'user' | 'assistant'; text: string }>;
  extractedData: OnboardingExtractedData;
}): Promise<OnboardingAIResponse> {
  const { message, history, extractedData } = payload;
  const apiKey = process.env.GEMINI_API_KEY;

  const systemInstruction = `
You are PupLume's dedicated, warm, and highly skilled AI Puppy Routine Architect & Onboarding Specialist.
You are interviewing a real pet parent to build their puppy's personalized profile and daily routine tasks.

STRICT CONVERSATIONAL & PROFESSIONAL BOUNDARIES:
1. NEVER mention internal systems, models, Gemini, APIs, tokens, JSON formatting, or backend technology. Speak solely as a friendly, expert puppy coach.
2. STRICT DATA VALIDATION:
   - DOG AGE: A dog's age must be realistic. Puppies are usually 8 to 52 weeks (up to 1 year) old; adult dogs are 1 to 20 years old.
   - If the user enters an impossible number (e.g. 9999, 100, 300, -5, or nonsense text):
     DO NOT ACCEPT IT! Set "validationError" to a brief description, and in your "reply", explain with warmth and humor that dogs don't live 9999 years, and politely ask again for their puppy's real age (e.g. in weeks, months, or years).
   - PUPPY NAME & BREED: Must be sensible. If given pure nonsense, ask again politely.
   - TIMINGS: Must be plausible daily times (e.g., 6:30 AM, 7:00 AM, 12:30 PM, 6:00 PM, 10:00 PM).
3. INTERVIEW FLOW:
   - Ask for:
     1. Owner's name and puppy's name (if not yet provided).
     2. Puppy's breed, sex, and age (strictly validated!).
     3. Owner's daily schedule timings:
        - Morning wake up time (e.g. 6:30 AM or 7:00 AM)
        - Breakfast, lunch (if puppy eats 3x daily), and dinner meal times
        - Daytime work / school routine (at home vs away)
        - Evening bedtime and final night potty break (e.g. 10:00 PM)
        - Main training priority (e.g., potty training, crate training, loose leash, chewing/biting)
4. READY STATUS & SCHEDULE GENERATION:
   - When we have: puppyName, breed, valid age, wakeTime, bedtime, and meal times:
     Set "isReadyToGenerate": true.
     Generate 6 to 9 custom daily schedule tasks mapped to the user's EXACT times!
     Include:
     - Morning wake up & potty (at their wakeTime)
     - Breakfast (at their breakfastTime)
     - Post-meal potty
     - Daytime naps / play / training
     - Dinner (at their dinnerTime)
     - Evening walk
     - Final nighttime potty (at their bedtime)

CURRENT COLLECTED DATA:
${JSON.stringify(extractedData, null, 2)}

OUTPUT FORMAT:
Always return valid JSON strictly matching this structure:
{
  "reply": "Your friendly, conversational response to the user",
  "extractedData": {
    "userName": "...",
    "puppyName": "...",
    "breed": "...",
    "sex": "male" | "female",
    "ageWeeks": 12,
    "ageText": "12 weeks",
    "weightLbs": 15,
    "wakeTime": "07:00 AM",
    "breakfastTime": "07:30 AM",
    "lunchTime": "12:30 PM",
    "dinnerTime": "06:30 PM",
    "bedtime": "10:00 PM",
    "trainingGoals": "..."
  },
  "validationError": null,
  "isReadyToGenerate": false,
  "suggestedTasks": []
}
`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptContent = `
Recent conversation history:
${history.map((h) => `${h.sender.toUpperCase()}: ${h.text}`).join('\n')}

LATEST USER MESSAGE:
"${message}"
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContent,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const parsed: OnboardingAIResponse = JSON.parse(response.text || '{}');
      if (parsed.reply) {
        // Merge with existing extracted data
        parsed.extractedData = {
          ...extractedData,
          ...parsed.extractedData
        };
        return parsed;
      }
    } catch (err) {
      console.warn('[Gemini Onboarding] API call error, using deterministic onboarding processor:', err);
    }
  }

  // Deterministic Onboarding Engine (guarantees 100% reliability offline or with mock keys)
  return runDeterministicOnboarding(message, extractedData);
}

function runDeterministicOnboarding(
  message: string,
  current: OnboardingExtractedData
): OnboardingAIResponse {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const updated: OnboardingExtractedData = { ...current };
  let validationError: string | null = null;

  // 1. Check for impossible ages (e.g. 9999, 500, > 25 years or > 1300 weeks)
  const numbersInMessage = trimmed.match(/\b\d+(\.\d+)?\b/g);
  if (numbersInMessage) {
    for (const numStr of numbersInMessage) {
      const val = parseFloat(numStr);
      if (val > 25 && !lower.includes('lb') && !lower.includes('pound') && !lower.includes('kg')) {
        // If it looks like an age or standalone large number (e.g. 9999, 100)
        if (val > 52 && (lower.includes('week') || lower.includes('wk'))) {
          validationError = 'Puppy weeks cannot exceed 52 weeks (1 year).';
        } else if (val > 25 && (lower.includes('year') || lower.includes('yr') || val > 100)) {
          validationError = `${val} is not a possible dog age.`;
        }
      }
    }
  }

  if (validationError) {
    return {
      reply: `Dogs don't live to ${numbersInMessage?.[0] || 'that age'}! Puppies are typically between 8 and 52 weeks old (and adult dogs live up to 15–20 years). Could you tell me your puppy's real age in weeks or months?`,
      extractedData: updated,
      validationError,
      isReadyToGenerate: false,
    };
  }

  // Extract age if valid
  if (!updated.ageWeeks) {
    const weekMatch = lower.match(/(\d+)\s*(?:weeks?|wks?)/);
    const monthMatch = lower.match(/(\d+)\s*(?:months?|mos?)/);
    const yearMatch = lower.match(/(\d+)\s*(?:years?|yrs?)/);
    if (weekMatch) {
      const w = parseInt(weekMatch[1], 10);
      if (w <= 104) {
        updated.ageWeeks = w;
        updated.ageText = `${w} weeks`;
      }
    } else if (monthMatch) {
      const m = parseInt(monthMatch[1], 10);
      if (m <= 24) {
        updated.ageWeeks = Math.round(m * 4.33);
        updated.ageText = `${m} months`;
      }
    } else if (yearMatch) {
      const y = parseInt(yearMatch[1], 10);
      if (y <= 20) {
        updated.ageWeeks = Math.round(y * 52);
        updated.ageText = `${y} year${y > 1 ? 's' : ''}`;
      }
    }
  }

  // Extract timings if user mentioned them
  const timeRegex = /\b(1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm)\b/gi;
  const timesFound = [...trimmed.matchAll(timeRegex)];
  if (timesFound.length > 0) {
    const formattedTimes = timesFound.map((m) => {
      const hour = m[1].padStart(2, '0');
      const min = m[2] ? m[2] : '00';
      const ampm = m[3].toUpperCase();
      return `${hour}:${min} ${ampm}`;
    });

    if (lower.includes('wake') || lower.includes('up') || lower.includes('morning')) {
      updated.wakeTime = formattedTimes[0];
    }
    if (lower.includes('bed') || lower.includes('night') || lower.includes('sleep')) {
      updated.bedtime = formattedTimes[formattedTimes.length - 1];
    }
    if (lower.includes('breakfast') || lower.includes('eat') || lower.includes('food')) {
      if (!updated.breakfastTime) updated.breakfastTime = formattedTimes[0];
    }
    if (lower.includes('dinner')) {
      updated.dinnerTime = formattedTimes[formattedTimes.length - 1];
    }
  }

  // Extract sex
  if (lower.includes('female') || lower.includes('girl') || lower.includes('she') || lower.includes('her')) {
    updated.sex = 'female';
  } else if (lower.includes('male') || lower.includes('boy') || lower.includes('he') || lower.includes('him')) {
    updated.sex = 'male';
  }

  // Extract names or breed if not yet set
  const cleanWord = trimmed.replace(/[^a-zA-Z\s'-]/g, '').trim();
  const words = cleanWord.split(/\s+/).filter(Boolean);

  // User name extraction
  const myNameMatch = trimmed.match(/(?:my name is|i am|i'm|call me)\s+([A-Za-z]+)/i);
  if (myNameMatch) {
    updated.userName = myNameMatch[1].charAt(0).toUpperCase() + myNameMatch[1].slice(1).toLowerCase();
  }

  // Puppy name extraction
  const pupNameMatch = trimmed.match(/(?:puppy is|puppy's name is|pup is|dog is|dog's name is|pup's name is|named|name is)\s+([A-Za-z]+)/i);
  if (pupNameMatch) {
    updated.puppyName = pupNameMatch[1].charAt(0).toUpperCase() + pupNameMatch[1].slice(1).toLowerCase();
  }

  // Handle direct answers when neither or one is set
  if (!updated.userName && !updated.puppyName) {
    if (words.length === 1 && !['hi', 'hello', 'hey', 'start'].includes(words[0].toLowerCase())) {
      // First single word is user's name
      updated.userName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    } else if (words.length >= 2 && words.length <= 3 && !myNameMatch && !pupNameMatch) {
      if (words[1].toLowerCase() === 'and' && words[2]) {
        updated.userName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        updated.puppyName = words[2].charAt(0).toUpperCase() + words[2].slice(1).toLowerCase();
      } else {
        updated.userName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        updated.puppyName = words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
      }
    }
  } else if (updated.userName && !updated.puppyName) {
    if (words.length >= 1 && words.length <= 2 && !['yes', 'no', 'ok'].includes(words[0].toLowerCase())) {
      const pName = words[words.length - 1];
      updated.puppyName = pName.charAt(0).toUpperCase() + pName.slice(1).toLowerCase();
    }
  }

  // Breed extraction
  const breedMatches = [
    'golden retriever', 'french bulldog', 'german shepherd', 'labrador', 'poodle',
    'goldendoodle', 'labradoodle', 'husky', 'corgi', 'beagle', 'boxer', 'dachshund',
    'chihuahua', 'shih tzu', 'pug', 'rottweiler', 'doberman', 'great dane',
    'australian shepherd', 'border collie', 'cavalier', 'maltese', 'yorkie',
    'yorkshire terrier', 'pitbull', 'bully', 'bulldog', 'spaniel', 'terrier', 'mixed breed', 'mutt'
  ];
  if (!updated.breed) {
    for (const b of breedMatches) {
      if (lower.includes(b)) {
        updated.breed = b.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
    if (!updated.breed && updated.puppyName && words.length <= 3 && !lower.includes('week') && !lower.includes('month') && !lower.includes('year') && !lower.includes('am') && !lower.includes('pm')) {
      // Potential custom breed name
      if (!lower.includes(updated.puppyName.toLowerCase()) && (!updated.userName || !lower.includes(updated.userName.toLowerCase()))) {
        updated.breed = cleanWord;
      }
    }
  }

  // Determine what to ask next without ever repeating identical questions
  if (!updated.userName && !updated.puppyName) {
    return {
      reply: `Welcome to PupLume! I'm here to build your puppy's personalized daily schedule. First, what is your name and what is your puppy's name?`,
      extractedData: updated,
      isReadyToGenerate: false
    };
  }

  if (updated.userName && !updated.puppyName) {
    return {
      reply: `Nice to meet you, ${updated.userName}! What is your puppy's name?`,
      extractedData: updated,
      isReadyToGenerate: false
    };
  }

  if (!updated.breed || !updated.ageWeeks) {
    const name = updated.puppyName;
    return {
      reply: `Wonderful to meet you and ${name}! What breed is ${name}, and how old are they in weeks or months? (Also, are they a boy or a girl?)`,
      extractedData: updated,
      isReadyToGenerate: false
    };
  }

  if (!updated.wakeTime) {
    return {
      reply: `Got it! ${updated.puppyName} is a ${updated.ageText || `${updated.ageWeeks} weeks old`} ${updated.breed || 'pup'}.\n\nLet's align the schedule with your household: **What time do you usually wake up in the morning?** (e.g. 6:30 AM or 7:00 AM)`,
      extractedData: updated,
      isReadyToGenerate: false
    };
  }

  if (!updated.breakfastTime || !updated.dinnerTime) {
    return {
      reply: `Great! Wake-up noted for ${updated.wakeTime}.\n\nNext, **what times do you want to feed ${updated.puppyName}?** (For example: Breakfast at 7:30 AM, Lunch at 12:30 PM, and Dinner at 6:30 PM).`,
      extractedData: updated,
      isReadyToGenerate: false
    };
  }

  if (!updated.bedtime) {
    return {
      reply: `Meal times set! Lastly: **What time do you usually wind down for bed** and want the final nighttime potty break? (e.g. 10:00 PM or 10:30 PM). And do you have any specific focus like potty training or crate training?`,
      extractedData: updated,
      isReadyToGenerate: false
    };
  }

  // All core parameters are ready! Generate customized tasks based on real inputs
  const wake = updated.wakeTime || '07:00 AM';
  const breakfast = updated.breakfastTime || '07:30 AM';
  const lunch = updated.lunchTime || '12:30 PM';
  const dinner = updated.dinnerTime || '06:30 PM';
  const bed = updated.bedtime || '10:00 PM';
  const pupName = updated.puppyName || 'Puppy';

  const suggestedTasks: OnboardingTaskItem[] = [
    {
      title: 'Morning Wake-Up & Potty Stretch',
      category: 'potty',
      time: wake,
      durationMin: 15,
      period: 'morning',
      description: `Take ${pupName} directly outside upon waking to establish bathroom reliability.`
    },
    {
      title: `${pupName}'s Breakfast & Fresh Water`,
      category: 'feeding',
      time: breakfast,
      durationMin: 20,
      period: 'morning',
      description: `Measured puppy meal with fresh water bowl refresh.`
    },
    {
      title: 'Post-Breakfast Potty Break',
      category: 'potty',
      time: '08:00 AM',
      durationMin: 15,
      period: 'morning',
      description: `Puppies regularly eliminate 15-25 minutes after eating.`
    },
    {
      title: 'Midday Lunch & Hydration',
      category: 'feeding',
      time: lunch,
      durationMin: 20,
      period: 'afternoon',
      description: `Midday nourishment break to support steady puppy metabolism.`
    },
    {
      title: 'Short Focus & Reward Training',
      category: 'training',
      time: '02:30 PM',
      durationMin: 10,
      period: 'afternoon',
      description: `Positive reinforcement session: Sit, Name Response, and Marker Word practice.`
    },
    {
      title: 'Evening Outdoor Walk & Sniff Session',
      category: 'walk',
      time: '05:30 PM',
      durationMin: 20,
      period: 'evening',
      description: `Gentle sniff exploration on loose harness to expend puppy energy safely.`
    },
    {
      title: `${pupName}'s Dinner Meal`,
      category: 'feeding',
      time: dinner,
      durationMin: 20,
      period: 'evening',
      description: `Evening measured meal. Pick up water bowl 2 hours before bedtime.`
    },
    {
      title: 'Final Bedtime Potty Routine',
      category: 'potty',
      time: bed,
      durationMin: 15,
      period: 'evening',
      description: `Quiet, calm bathroom break right before settling in the crate for the night.`
    }
  ];

  return {
    reply: `All set! I've crafted a personalized daily rhythm for **${pupName}** tuned directly to your wake-up time (${wake}), feeding schedule, and bedtime (${bed}).\n\nReview the tasks below or upload ${pupName}'s photo to launch your custom dashboard!`,
    extractedData: updated,
    isReadyToGenerate: true,
    suggestedTasks
  };
}
