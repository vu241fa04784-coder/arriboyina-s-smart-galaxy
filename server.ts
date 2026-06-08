import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { fallbackNewsData } from "./src/data/newsFallback.js";
import dotenv from "dotenv";
import fs from "fs";
import Parser from "rss-parser";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize RSS Parser
const rssParser = new Parser();

// DB File Path
const DB_PATH = path.join(process.cwd(), "src", "data", "newsDb.json");
const BANNER_PATH = path.join(process.cwd(), "src", "data", "adminBanner.json");
const DELETED_PATH = path.join(process.cwd(), "src", "data", "deletedStories.json");
const SPECIALS_PATH = path.join(process.cwd(), "src", "data", "specialEvents.json");

function readSpecials(): any[] {
  try {
    if (!fs.existsSync(SPECIALS_PATH)) {
      const defaults = [
        { "day": "May 31", "title": "World No Tobacco Day (Anti-Tobacco Day)", "color": "from-red-50 to-orange-50 text-red-800 border-red-200", "icon": "🚭" },
        { "day": "June 1", "title": "Global Day of Parents & World Milk Day", "color": "from-blue-50 to-indigo-50 text-blue-900 border-blue-200", "icon": "🥛" },
        { "day": "June 2", "title": "Telangana Formation Day Special", "color": "from-emerald-50 to-teal-50 text-emerald-800 border-emerald-200", "icon": "🌅" },
        { "day": "June 3", "title": "World Bicycle Day", "color": "from-violet-50 to-indigo-50 text-indigo-800 border-violet-200", "icon": "🚲" },
        { "day": "June 4", "title": "Intl. Day of Innocent Children Victims of Aggression", "color": "from-slate-50 to-slate-100 text-slate-800 border-slate-300", "icon": "🕊️" },
        { "day": "June 5", "title": "World Environment Day", "color": "from-green-50 to-emerald-50 text-emerald-800 border-green-200", "icon": "🌿" },
        { "day": "June 7", "title": "World Food Safety Day", "color": "from-amber-50 to-yellow-50 text-yellow-850 border-amber-200", "icon": "🍎" },
        { "day": "June 8", "title": "World Oceans Day & Brain Tumor Day", "color": "from-cyan-50 to-blue-100 text-cyan-950 border-cyan-200", "icon": "🌊" },
        { "day": "May 30", "title": "National Smile Day & World MS Day", "color": "from-yellow-50 to-amber-50 text-amber-900 border-amber-200", "icon": "😊" },
        { "day": "May 29", "title": "International Everest Day", "color": "from-rose-50 to-indigo-50 text-indigo-805 border-rose-200", "icon": "🏔️" },
        { "day": "May 28", "title": "World Menstrual Hygiene Day", "color": "from-pink-50 to-rose-50 text-rose-800 border-pink-200", "icon": "🩸" },
        { "day": "May 27", "title": "National Memorial Day & Children's Day", "color": "from-purple-50 to-indigo-50 text-indigo-800 border-purple-200", "icon": "🎈" },
        { "day": "May 25", "title": "World Thyroid Day & Africa Day", "color": "from-orange-50 to-amber-50 text-orange-900 border-orange-200", "icon": "🌍" },
        { "day": "May 24", "title": "Commonwealth Day", "color": "from-blue-50 to-sky-50 text-blue-900 border-blue-200", "icon": "🏆" },
        { "day": "May 22", "title": "International Day for Biological Diversity", "color": "from-green-50 to-teal-50 text-green-900 border-green-220", "icon": "🧬" },
        { "day": "May 20", "title": "World Bee Day", "color": "from-yellow-50 to-amber-50 text-amber-900 border-yellow-200", "icon": "🐝" }
      ];
      fs.mkdirSync(path.dirname(SPECIALS_PATH), { recursive: true });
      fs.writeFileSync(SPECIALS_PATH, JSON.stringify(defaults, null, 2), "utf-8");
      return defaults;
    }
    const data = fs.readFileSync(SPECIALS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeSpecials(list: any[]) {
  try {
    fs.mkdirSync(path.dirname(SPECIALS_PATH), { recursive: true });
    fs.writeFileSync(SPECIALS_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing specials database:", error);
  }
}

function readDeletedStories(): { ids: string[]; titles: string[] } {
  try {
    if (!fs.existsSync(DELETED_PATH)) {
      fs.mkdirSync(path.dirname(DELETED_PATH), { recursive: true });
      fs.writeFileSync(DELETED_PATH, JSON.stringify({ ids: [], titles: [] }), "utf-8");
      return { ids: [], titles: [] };
    }
    const data = fs.readFileSync(DELETED_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { ids: [], titles: [] };
  }
}

function writeDeletedStory(id: string, title?: string) {
  try {
    const list = readDeletedStories();
    if (!list.ids.includes(id)) {
      list.ids.push(id);
    }
    if (title) {
      const cleanTitle = title.trim().toLowerCase();
      if (!list.titles.includes(cleanTitle)) {
        list.titles.push(cleanTitle);
      }
    }
    fs.mkdirSync(path.dirname(DELETED_PATH), { recursive: true });
    fs.writeFileSync(DELETED_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing deleted stories file:", error);
  }
}

function readBanner() {
  try {
    if (!fs.existsSync(BANNER_PATH)) {
      fs.mkdirSync(path.dirname(BANNER_PATH), { recursive: true });
      fs.writeFileSync(BANNER_PATH, JSON.stringify({ message: "Sovereign News Ticker: Set your custom message from the Admin tab." }), "utf-8");
      return { message: "Sovereign News Ticker: Set your custom message from the Admin tab." };
    }
    const data = fs.readFileSync(BANNER_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { message: "Sovereign News Ticker: Set your custom message from the Admin tab." };
  }
}

function writeBanner(data: any) {
  try {
    fs.mkdirSync(path.dirname(BANNER_PATH), { recursive: true });
    fs.writeFileSync(BANNER_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing admin banner file:", error);
  }
}

// Helper to read database
function readDb() {
  try {
    let rawDb;
    if (!fs.existsSync(DB_PATH)) {
      // Ensure directory exists
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      // Save initial fallback
      fs.writeFileSync(DB_PATH, JSON.stringify(fallbackNewsData, null, 2), "utf-8");
      rawDb = fallbackNewsData;
    } else {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      rawDb = JSON.parse(data);
    }

    // Filter out deleted stories so they never show up
    const deletedList = readDeletedStories();
    const deletedIds = new Set(deletedList.ids);
    const deletedTitles = new Set(deletedList.titles.map((t: string) => t.toLowerCase()));

    let updated = false;
    for (const category of Object.keys(rawDb)) {
      if (Array.isArray(rawDb[category])) {
        const originalLength = rawDb[category].length;
        rawDb[category] = rawDb[category].filter((item: any) => {
          const titleLower = (item.title || "").toLowerCase();
          return !deletedIds.has(item.id) && !deletedTitles.has(titleLower);
        });
        if (rawDb[category].length < originalLength) {
          updated = true;
        }
      }
    }

    if (updated) {
      writeDb(rawDb);
    }

    return rawDb;
  } catch (error) {
    console.error("Error reading database file, returning fallback state:", error);
    return fallbackNewsData;
  }
}

// Helper to write database
function writeDb(data: any) {
  try {
    const dir = path.dirname(DB_PATH);
    fs.mkdirSync(dir, { recursive: true });
    const tempPath = DB_PATH + ".tmp";
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, DB_PATH);
  } catch (error) {
    console.error("Error writing database file safely:", error);
  }
}

// Helper to get simulated date relative to the actual current date based on real current date
function getSimulatedDate(pubDateStr?: string | null): string {
  const simulatedToday = new Date(); // Dynamic simulated today matching real-world system date (e.g. June 4, 2026)
  
  if (!pubDateStr) {
    return simulatedToday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  
  const parsedDate = new Date(pubDateStr);
  if (isNaN(parsedDate.getTime())) {
    return simulatedToday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  
  const realToday = new Date();
  
  // Calculate relative day difference
  const diffMs = realToday.getTime() - parsedDate.getTime();
  let diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    diffDays = 0;
  }
  
  // Shift simulated timeline by the same relative day difference
  const simDate = new Date(simulatedToday.getTime() - diffDays * 24 * 60 * 60 * 1000);
  
  return simDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Initialize Gemini API client safely
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Sovereign Gemini AI Core Engine successfully initialized.");
  } catch (error) {
    console.error("Gemini AI Core Engine initialization error:", error);
  }
} else {
  console.log("GEMINI_API_KEY environment variable not found. Running in resilient mock-integrated fallback mode.");
}

// Fast In-Memory cache overlays for smooth performance under heavy concurrent usage
const translationCache = new Map<string, string>();
const summaryCache = new Map<string, string>();
const expansionCache = new Map<string, string>();
const quizCache = new Map<string, any>();

// Smart Quota Backoff Policy for Free Tier rate limit defense
let geminiQuotaExhaustedUntil = 0;

function checkGeminiAvailable(): boolean {
  return ai !== null && Date.now() > geminiQuotaExhaustedUntil;
}

// Resilient wrapper to retry on transient 503 errors and spike demands automatically
async function callGeminiWithRetry(params: any, retries: number = 3, initialDelay: number = 600): Promise<any> {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      if (!ai) {
        throw new Error("Gemini AI Core is not initialized.");
      }
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || JSON.stringify(err) || "";
      const isTransient = 
        errMsg.includes("503") || 
        errMsg.includes("temporary") || 
        errMsg.includes("UNAVAILABLE") || 
        errMsg.includes("high demand") || 
        errMsg.includes("demand") ||
        (err?.status && err.status === 503);
      
      const isQuota = 
        errMsg.includes("quota") || 
        errMsg.includes("429") || 
        errMsg.includes("RESOURCE_EXHAUSTED") || 
        errMsg.includes("limit");

      if (isQuota) {
        handleGeminiError(err, "Gemini Retry Check");
        throw err;
      }

      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini Retry] Received transient error 503 or overload during execution. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

function handleGeminiError(err: any, context: string) {
  const errMsg = err?.message || err?.toString() || "";
  const isQuotaErr = errMsg.includes("quota") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("limit");
  
  if (isQuotaErr) {
    const cooldownPeriod = 60 * 1000; // 60 seconds backoff
    geminiQuotaExhaustedUntil = Date.now() + cooldownPeriod;
    console.warn(`[Sovereign Gemini Core] Rate-limiting or Quota limit reached during "${context}". Enacting a 60-second backoff defense to prioritize stable local fallback engines.`);
  } else {
    console.warn(`[Sovereign Gemini Core] Transient warning during "${context}":`, errMsg);
  }
}

// Curated Unsplash Image links per category with dynamic keyword headline matching
function getRandomImageForCategory(category: string, title?: string): string {
  const t = (title || "").toLowerCase();
  
  // Custom simple string hash
  const getStringHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  // Keyword groups for beautiful highly relevant topic-specific images (UPSC study style)
  const keywordMappings = [
    {
      keywords: ["rcb", "bengaluru", "royal challengers"],
      images: [
        "https://images.unsplash.com/photo-1540747737956-37872404a8de?w=800", // RCB / Crimson high stakes floodlights stadium
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800", // Beautiful green pitch with batsman stance
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800"  // Dynamic live game action with red stadium
      ]
    },
    {
      keywords: ["csk", "chennai", "super kings", "dhoni"],
      images: [
        "https://images.unsplash.com/photo-1578269174936-2709b5a5e06c?w=800", // Yellow golden team trophy victory match
        "https://images.unsplash.com/photo-1540747737956-37872404a8de?w=800"  // Chennai floodlit stadium
      ]
    },
    {
      keywords: ["mi", "mumbai indians", "wankhede", "rohit"],
      images: [
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800", // Blue teams sports crowd arena
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"  // Cricket pitch
      ]
    },
    {
      keywords: ["crackdown", "terror", "isi", "ogw", "kashmir", "spy agency", "police", "security forces", "intelligence"],
      images: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800", // Security operations / tactical protection
        "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800", // Ashoka chakra Indian emblem / borders
        "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=800"  // Administrative security officers workspace
      ]
    },
    {
      keywords: ["nba", "spurs", "knicks", "basketball", "wembanyama", "finals"],
      images: [
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800", // Basketball swishing into nets
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800", // NBA basketball arena glossy courts
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=800"  // Hoop against dynamic stadium lights
      ]
    },
    {
      keywords: ["fta", "trade agreement", "imports", "exports", "bilateral", "tariffs", "trade alliance"],
      images: [
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800", // Cargo shipment containers & global commerce
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", // Intricate global trade hub pipelines
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"  // Signing major historical agreements
      ]
    },
    {
      keywords: ["space", "nasa", "isro", "satellite", "moon", "mars", "rocket", "astronaut", "nebula", "gaganyaan", "astronomy", "orbiter"],
      images: [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", // Space Earth Orbit
        "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800", // Rocket Launch
        "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800", // Stars Nebula
        "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800", // Earth curvature
        "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800"  // Cosmos / galaxy
      ]
    },
    {
      keywords: ["cricket", "dhoni", "kohli", "bcci", "stadium", "match", "t20", "ipl", "trophy", "world cup", "football", "olympics", "athletics", "game", "player", "sports"],
      images: [
        "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800", // Cricket stadium turf
        "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800", // Leather ball
        "https://images.unsplash.com/photo-1540747737956-37872404a8de?w=800", // Stadium floodlights
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800", // Sports arena crowd
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"  // Running track
      ]
    },
    {
      keywords: ["election", "vote", "voter", "modi", "parliament", "bjp", "democracy", "minister", "cabinet", "government", "policy", "bill", "act", "lok sabha", "rajya sabha", "assembly"],
      images: [
        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800", // Ballot / vote box
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800", // Government pillars building
        "https://images.unsplash.com/photo-1425421598808-4a22ce59cc97?w=800", // Desk gavel politics
        "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800"   // India elements flag
      ]
    },
    {
      keywords: ["court", "judge", "supreme court", "verdict", "lawyer", "justice", "cji", "legal", "constitution", "sc", "hc", "high court", "judgment", "tribunal"],
      images: [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800", // Scales of justice & gavel
        "https://images.unsplash.com/photo-1505664194779-8bebcb95c02e?w=800", // Library leather Law books
        "https://images.unsplash.com/photo-1453728260081-79a17d620fe0?w=800"   // Legal document signature
      ]
    },
    {
      keywords: ["china", "chinese", "beijing", "xi jinping", "taiwan", "pla", "tokyo", "japan", "seoul"],
      images: [
        "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800", // Great wall
        "https://images.unsplash.com/photo-1547989453-11e67ffb3885?w=800", // Shanghai skyline
        "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=800"   // Chinese pagoda
      ]
    },
    {
      keywords: ["defense", "army", "border", "military", "navy", "airforce", "missile", "warship", "submarine", "fighter jet", "rafale", "drdo", "weapon", "national security", "radar"],
      images: [
        "https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=800", // Jet fighter
        "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=800", // Navy fleet aircraft carrier
        "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=800"   // Command center radar
      ]
    },
    {
      keywords: ["gdp", "rbi", "budget", "finance", "bank", "inflation", "rupee", "stock", "tax", "gst", "economic", "market", "currency", "trade", "export", "import", "gold", "investment", "bse", "nse", "sensex"],
      images: [
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800", // Stock index chart
        "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800", // Gold coins / reserve bars
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800", // Rupee banknotes count
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800", // Trade indicators
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800"   // Analytical candlestick graphs
      ]
    },
    {
      keywords: ["ai", "chatgpt", "gemini", "tech", "silicon", "google", "semiconductor", "chip", "nvidia", "quantum", "software", "robot", "cyber", "internet", "coding", "computer", "developer", "technological"],
      images: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", // Blue semiconductor microchip
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800", // Modern android robot fingers
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800", // Security binary matrix code
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800"   // Premium clean server room tech
      ]
    },
    {
      keywords: ["climate", "monsoon", "rain", "heat", "cyclone", "flood", "emission", "green", "carbon", "environment", "nature", "forest", "wildlife", "tiger", "solar", "wind", "renewable", "pollution", "glacier", "ecological"],
      images: [
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800", // Green valley mist
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", // Forest peak green mountains
        "https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=800", // Earth sphere climate
        "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800"   // Sunrise rays through massive trees
      ]
    },
    {
      keywords: ["diplomacy", "summit", "visit", "biden", "putin", "treaty", "united nations", "un", "g20", "g7", "foreign", "embassy", "bilateral", "hegemony", "sanction"],
      images: [
        "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800", // Diplomatic seal concept / Ashoka chakra
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800", // Assembly halls summit
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"   // Global communication fiber network
      ]
    }
  ];

  // Try to find a precise keyword match in the title/headline
  if (t) {
    for (const mapping of keywordMappings) {
      for (const kw of mapping.keywords) {
        if (t.includes(kw)) {
          const pool = mapping.images;
          const randomIdx = getStringHash(title || "") % pool.length;
          return pool[randomIdx] || pool[0];
        }
      }
    }
  }

  // Large curated expanded library for fallback by category (much larger visual variety)
  const categoryImages: Record<string, string[]> = {
    india: [
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800", // Taj Mahal
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", // India Gate New Delhi
      "https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=800", // Benaras ghats river Ganges
      "https://images.unsplash.com/photo-1532375811409-905115e3b55d?w=800", // Spices and grains colorful
      "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800", // Hawa Mahal monument
      "https://images.unsplash.com/photo-1596422846543-75c6fc1f70ea?w=800", // Lotus Temple
      "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800"  // camels
    ],
    international: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", // Satellite
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800", // Global skyline
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", // World connections chart
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", // Blue globe
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800", // Glass commercial skyscrapers
      "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800", // European style parliament
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800"  // Globe starry
    ],
    sports: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800", // Stadium grass pitch
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800", // Athlete running tracks
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800", // Athlete weights fields
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800", // Cricket stadium turf morning
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800", // Basketball court
      "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=800"  // Sports sports sports
    ],
    economy: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800", // Stock index candlesticks
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800", // Stack of solid reserve gold or reserve bars
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800", // Cash currencies piles
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800", // Visual finance analysis reports
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800", // Professional checking stats
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800"  // Candlestick graphs
    ],
    technology: [
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800", // Humanoid robot interaction touch
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800", // Circuit motherboard close up
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800", // Secure digital mainframe matrices
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800", // Clean high performance server towers
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800", // Developer typing code
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800"  // Code algorithms green
    ],
    admin: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800", // Office desk stationery
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800", // Team strategic meeting table
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800"  // Hard study guide books
    ],
    exam: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800", // Professional pen and exam book sheet
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800", // Aesthetic antique library books setup
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", // Dynamic notebook layout
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800"  // writing down concepts
    ]
  };

  const pool = categoryImages[category] || categoryImages["international"];
  const randomIdx = (getStringHash(title || category) ^ 543) % pool.length;
  return pool[randomIdx] || pool[0];
}

// ----------------------------------------------------
// DYNAMIC FALLBACK SYSTEM (for Gemini Quota / rate-limit resilience)
// ----------------------------------------------------
function getDynamicFallbackExpansion(item: any): string {
  const cat = (item.category || "international").toLowerCase().trim();
  const summaryText = item.summary || "";
  const titleText = item.title || "";
  
  const sentences = (summaryText || "").split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 6);
  const sentence1 = sentences[0] || summaryText;
  const sentence2 = sentences[1] || `Stakeholders and public authorities are closely evaluating the administrative steps needed to streamline this operation.`;
  const sentence3 = sentences[2] || `The overall initiative aims to remove structural bottlenecks and establish long-term sector excellence.`;
  
  const cleanTitle = titleText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 4);
  const keywordA = titleWords[0] || "development";
  const keywordB = titleWords[1] || "framework";
  const keywordC = titleWords[2] || "strategy";

  // Build 3 rich, academic paragraphs that read very professionally
  const p1 = `The core operational updates regarding "${titleText}" have triggered significant policy dialogues across public administration and sector forums. Academic authorities and sector specialists highlight that this move represents a calculated shift designed to modernize existing conventions. Recognizing the systemic challenges, departments are deploying dedicated resources to study the direct integration parameters of ${keywordA.toLowerCase()} and evaluate high-performance standards.`;

  const p2 = `Specifically, ${sentence1} Experts contend that while traditional methods often struggle with administrative execution, the current roadmap outlines explicit steps to mitigate delays. Strategic workgroups are focusing on ${sentence2} These initiatives aim to foster greater security, improve compliance, and align with global best practices in the ${cat} sector.`;

  const p3 = `Looking ahead, the long-term success of this policy depends on sustained funding, inter-departmental synergy, and transparency. As civil service and corporate strategy boards revise their syllabus and regulatory guidebooks, they are encouraged to take structured notes on "${titleText}". ${sentence3} Analyzing this scenario provides invaluable lessons on public policy implementation, institutional roles, and systemic modernization.`;

  return `${p1}\n\n${p2}\n\n${p3}`;
}

function getDynamicFallbackSummary(title: string, summary: string, category: string): string[] {
  const cat = (category || "international").toLowerCase().trim();
  const text = `${title} ${summary}`;
  
  // Clean punctuation
  const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const words = cleanText.split(/\s+/);
  
  const spotsSet = new Set<string>();
  const entitiesSet = new Set<string>();
  
  const locationsList = [
    "India", "USA", "UK", "China", "Russia", "Japan", "Europe", "Delhi", "Bengaluru", 
    "Mumbai", "Washington", "Tokyo", "London", "Beijing", "Hyderabad", "Andhra", 
    "Telangana", "Global", "Asia", "Germany", "France", "Canada", "Australia", "Pacific"
  ];
  
  locationsList.forEach(loc => {
    const rx = new RegExp(`\\b${loc}\\b`, "i");
    if (rx.test(text)) {
      spotsSet.add(loc);
    }
  });
  
  words.forEach(w => {
    if (w.length > 2 && /^[A-Z][a-z]+$/.test(w)) {
      const lower = w.toLowerCase();
      const commonStr = ["the", "and", "for", "with", "from", "this", "that", "national", "international", "government", "central", "union", "assembly", "minister", "president", "director"];
      if (!commonStr.includes(lower)) {
        if (locationsList.some(loc => loc.toLowerCase() === lower)) {
          spotsSet.add(w);
        } else {
          entitiesSet.add(w);
        }
      }
    }
  });

  const rawPlaces = Array.from(spotsSet);
  const rawEntities = Array.from(entitiesSet).filter(e => !["Arriboyina", "Sreeram", "Arriboyinas", "Headline", "Summary", "News", "Reels", "Matrix"].includes(e));
  
  const placesStr = rawPlaces.length > 0 ? rawPlaces.join(", ") : "Global / India (Multiple Regions Affected)";
  const entitiesStr = rawEntities.length > 0 ? rawEntities.slice(0, 4).join(", ") : "Relevant Departments, Sector Commissioners & Public Authorities";

  const line1 = `📍 PLACE: ${placesStr}`;
  const line2 = `👤 NAMES / KEY ENTITIES: ${entitiesStr}`;
  const line3 = `⚡ WHAT HAPPENED: ${title}`;
  
  const sentences = (summary || "").split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 8);
  
  // Clean nouns for custom phrases
  const customNouns = words.filter(w => w.length > 4 && !/^[a-z]/.test(w) && !["The", "This", "That", "News", "Today"].includes(w));
  const focusNoun1 = customNouns[0] || (words[0] ? words[0] : "development");
  const focusNoun2 = customNouns[1] || (words[1] ? words[1] : "policy");
  const focusNoun3 = customNouns[2] || (words[2] ? words[2] : "initiative");

  const line4 = `📝 KEY OBSERVATION: ${sentences[0] || "No further baseline observations are available for this specific update."}`;
  const line5 = `📝 OPERATIONAL FACT: ${sentences[1] || `Active policy teams and civil service analysts are prioritizing structural parameters in ${cat}.`}`;
  const line6 = `📝 CONTEXTUAL INSIGHT: The strategic iteration surrounding ${focusNoun1.toLowerCase()} and ${focusNoun2.toLowerCase()} requires localized coordination.`;
  const line7 = `📝 CONCLUSION: Eliminating tactical friction in ${focusNoun3.toLowerCase()} acts is paramount to delivering sustainable public parameters.`;

  return [line1, line2, line3, line4, line5, line6, line7];
}

let lastSyncTime = 0;
const SYNC_COOLDOWN_MS = 30 * 1000; // 30 seconds sliding cooldown for real-time automatic updates

// ----------------------------------------------------
// GOOGLE NEWS RSS FALLBACK LOADER
// ----------------------------------------------------
async function fetchGoogleNewsRssForCategory(category: string, db: any, deletedTitles: Set<string>): Promise<boolean> {
  const googleFeeds: Record<string, string> = {
    india: "https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en",
    international: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en",
    sports: "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en",
    economy: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
    technology: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en"
  };

  const url = googleFeeds[category];
  if (!url) return false;

  try {
    console.log(`[Sync Fallback] Fetching RSS feed for category: ${category}`);
    const feed = await rssParser.parseURL(url);
    if (feed && Array.isArray(feed.items)) {
      const currentList = db[category] || [];
      const existingTitles = new Set(currentList.map((item: any) => item.title.toLowerCase()));

      const incomingItems: any[] = [];
      feed.items.forEach((item) => {
        if (!item.title) return;
        const cleanTitle = item.title.split(" - ")[0].trim();
        const titleLower = cleanTitle.toLowerCase();
        if (existingTitles.has(titleLower)) return;
        if (deletedTitles.has(titleLower)) return;
        
        // Strictly reject geoblocked / service unavailable RSS failure responses
        if (titleLower.includes("feed is not available") || titleLower.includes("google news")) {
          return;
        }

        incomingItems.push({
          id: `rss-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: cleanTitle,
          summary: item.contentSnippet || "Fresh real-time headline reported globally. Click on Read Full Story to expand on this global event instantly with Gemini AI support.",
          fullContent: "", // Blank for on-demand dynamic expansion!
          image: getRandomImageForCategory(category, cleanTitle),
          category,
          date: getSimulatedDate(item.pubDate),
          author: "Google News Wire",
          tags: [category.toUpperCase(), "LIVE FEED", "TRENDING"]
        });
      });

      if (incomingItems.length > 0) {
        db[category] = [...incomingItems, ...currentList].slice(0, 150);
        console.log(`[Sync Fallback] Ingested ${incomingItems.length} RSS stories for category: ${category}`);
        return true;
      }
    }
  } catch (feedErr) {
    console.error(`[Sync Fallback] Failed parsing RSS feed fallback for ${category}:`, feedErr);
  }
  return false;
}

// ----------------------------------------------------
// AUTOMATED NEWS SYNC PIPELINE
// ----------------------------------------------------
async function syncLatestNews(forceBypass = false) {
  const now = Date.now();
  if (!forceBypass && (now - lastSyncTime < SYNC_COOLDOWN_MS)) {
    console.log("[Sync] Skipping automated background sync: within 10-minute cooldown window to conserve NewsAPI credit quota.");
    return;
  }
  
  lastSyncTime = now;
  console.log(`Beginning automated news synchronization... (forceBypass: ${forceBypass})`);
  const db = readDb();
  let updatedAny = false;

  const deletedList = readDeletedStories();
  const deletedIds = new Set(deletedList.ids);
  const deletedTitles = new Set(deletedList.titles.map((t: string) => t.toLowerCase()));

  const NEWS_API_KEY = process.env.NEWS_API_KEY;

  if (NEWS_API_KEY) {
    try {
      console.log("[Sync] NEWS_API_KEY is defined. Orchestrating direct NewsAPI fetch with sovereign headers.");
      // Map categories to NewsAPI everything endpoints sorted by publication time to guarantee a continuous stream of unlimited, real-time daily news
      const endpoints: Record<string, string> = {
        india: `https://newsapi.org/v2/everything?q=india+OR+bharat+OR+delhi+OR+mumbai&sortBy=publishedAt&pageSize=80&apiKey=${NEWS_API_KEY}`,
        international: `https://newsapi.org/v2/everything?q=world+OR+global+OR+international+OR+geopolitics&sortBy=publishedAt&pageSize=80&language=en&apiKey=${NEWS_API_KEY}`,
        sports: `https://newsapi.org/v2/everything?q=sports+OR+cricket+OR+football+OR+olympics+OR+tennis&sortBy=publishedAt&pageSize=80&language=en&apiKey=${NEWS_API_KEY}`,
        economy: `https://newsapi.org/v2/everything?q=economy+OR+finance+OR+market+OR+business+OR+inflation&sortBy=publishedAt&pageSize=80&language=en&apiKey=${NEWS_API_KEY}`,
        technology: `https://newsapi.org/v2/everything?q=technology+OR+tech+OR+science+OR+AI+OR+cyber&sortBy=publishedAt&pageSize=80&language=en&apiKey=${NEWS_API_KEY}`
      };

      for (const [category, url] of Object.entries(endpoints)) {
        let success = false;
        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent": "SovereignStudyGrid/1.0",
              "Accept": "application/json"
            }
          });
          
          if (!response.ok) {
            console.log(`[Sync Notice] NewsAPI category ${category} status ${response.status}. Resolving feed via regional Google RSS instead.`);
          } else {
            const data = (await response.json()) as any;
            if (data && data.status === "ok" && Array.isArray(data.articles)) {
              const currentList = db[category] || [];
              const existingTitles = new Set(currentList.map((item: any) => item.title.toLowerCase()));

              const incomingItems: any[] = [];
              data.articles.forEach((article: any) => {
                if (!article.title) return;
                const cleanTitle = article.title.split(" - ")[0].trim();
                const titleLower = cleanTitle.toLowerCase();
                if (existingTitles.has(titleLower)) return;
                if (deletedTitles.has(titleLower)) return;

                // Synthesize a valid unique item
                const cleanSummary = article.description || `Fresh coverage regarding "${article.title}" is developing now. Read full details to analyze core objectives.`;
                const cleanContent = article.content || "";
                
                incomingItems.push({
                  id: `newsapi-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: cleanTitle,
                  summary: cleanSummary,
                  fullContent: cleanContent,
                  image: article.urlToImage || getRandomImageForCategory(category, cleanTitle),
                  category,
                  date: getSimulatedDate(article.publishedAt),
                  author: article.author || article.source?.name || "Global Desktop",
                  tags: [category.toUpperCase(), "GLOBAL WIRE", "TRENDING"]
                });
              });

              if (incomingItems.length > 0) {
                // Prepend to current list and support large scroll limits (up to 150 articles)
                db[category] = [...incomingItems, ...currentList].slice(0, 150);
                updatedAny = true;
                console.log(`[Sync] Ingested ${incomingItems.length} new stories for category: ${category}`);
              }
              success = true;
            } else {
              console.log(`[Sync Notice] NewsAPI category ${category} payload structured differently. Resolving feed via regional Google RSS.`);
            }
          }
        } catch (catErr) {
          console.log(`[Sync Notice] NewsAPI category ${category} connection dropped. Resolving feed via regional Google RSS.`);
        }

        if (!success) {
          const fallbackSuccess = await fetchGoogleNewsRssForCategory(category, db, deletedTitles);
          if (fallbackSuccess) {
            updatedAny = true;
          }
        }
      }
    } catch (err) {
      console.error("General NewsAPI sync error:", err);
    }
  } else {
    // If no NEWS_API_KEY, fallback to Google News RSS (always free!)
    console.log("[Sync] NEWS_API_KEY empty. Orchestrating Google News RSS aggregator.");
    const googleFeeds: Record<string, string> = {
      india: "https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en",
      international: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en",
      sports: "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en",
      economy: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
      technology: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en"
    };

    for (const [category, url] of Object.entries(googleFeeds)) {
      try {
        const feed = await rssParser.parseURL(url);
        if (feed && Array.isArray(feed.items)) {
          const currentList = db[category] || [];
          const existingTitles = new Set(currentList.map((item: any) => item.title.toLowerCase()));

          const incomingItems: any[] = [];
          feed.items.forEach((item) => {
            if (!item.title) return;
            const cleanTitle = item.title.split(" - ")[0].trim();
            const titleLower = cleanTitle.toLowerCase();
            if (existingTitles.has(titleLower)) return;
            if (deletedTitles.has(titleLower)) return;
            
            // Strictly reject geoblocked / service unavailable RSS failure responses
            if (titleLower.includes("feed is not available") || titleLower.includes("google news")) {
              return;
            }

            incomingItems.push({
              id: `rss-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              title: cleanTitle,
              summary: item.contentSnippet || "Fresh real-time headline reported globally. Click on Read Full Story to expand on this global event instantly with Gemini AI support.",
              fullContent: "", // Blank for on-demand dynamic expansion!
              image: getRandomImageForCategory(category, cleanTitle),
              category,
              date: getSimulatedDate(item.pubDate),
              author: "Google News Wire",
              tags: [category.toUpperCase(), "LIVE FEED", "TRENDING"]
            });
          });

          if (incomingItems.length > 0) {
            db[category] = [...incomingItems, ...currentList].slice(0, 150);
            updatedAny = true;
            console.log(`[Sync] Ingested ${incomingItems.length} RSS stories for category: ${category}`);
          }
        }
      } catch (feedErr) {
        console.error(`Failed parsing RSS feed for ${category}:`, feedErr);
      }
    }
  }

  if (updatedAny) {
    writeDb(db);
    console.log("[Sync] newsDb.json successfully updated with live world news.");
  } else {
    console.log("[Sync] News database is already fully up-to-date. No new entries found.");
  }
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// GET/POST admin news tickers
app.get("/api/banner", (req, res) => {
  res.json(readBanner());
});

app.post("/api/banner", (req, res) => {
  const { message } = req.body;
  const data = { message: message || "" };
  writeBanner(data);
  res.json({ success: true, message: data.message });
});

// GET list of special events
app.get("/api/specials", (req, res) => {
  res.json(readSpecials());
});

// POST update or insert a special event
app.post("/api/specials", (req, res) => {
  try {
    const { day, title, color, icon } = req.body;
    if (!day || !title) {
      return res.status(400).json({ error: "Day and event description are required." });
    }
    
    const specials = readSpecials();
    const normalizedDay = day.trim().toLowerCase();
    
    const index = specials.findIndex(item => (item.day || "").trim().toLowerCase() === normalizedDay);
    const updatedItem = {
      day: day.trim(),
      title: title.trim(),
      color: color || "from-slate-50 to-slate-100 text-slate-800 border-slate-300",
      icon: icon || "📆"
    };

    if (index !== -1) {
      specials[index] = updatedItem;
    } else {
      specials.push(updatedItem);
    }
    
    writeSpecials(specials);
    res.json({ success: true, updated: updatedItem, specials });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// 1. Fetch entire news db (and sync on background)
app.get("/api/news", async (req, res) => {
  const db = readDb();
  res.json(db);
  
  // Asynchronously trigger news update in the background when requested
  // syncLatestNews handles self-cooldown rate limiting to protect keys
  syncLatestNews().catch(err => console.error("Background auto sync failed:", err));
});

// 1b. Real-time news search engine (integrating `/v2/everything` query of NewsAPI and offline database search fallback)
app.get("/api/news/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim() === "") {
      return res.status(400).json({ error: "Query parameter 'q' is strictly required." });
    }

    const query = q.trim();
    console.log(`[Search] Triggering custom keyword search for: "${query}"`);

    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (NEWS_API_KEY) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=60&apiKey=${NEWS_API_KEY}`;
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "SovereignStudyGrid/1.0",
            "Accept": "application/json"
          }
        });
        if (response.ok) {
          const data = (await response.json()) as any;
          if (data && data.status === "ok" && Array.isArray(data.articles)) {
            const results = data.articles.map((article: any, idx: number) => ({
              id: `search-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              title: article.title.split(" - ")[0],
              summary: article.description || `Recent search result regarding "${article.title}". Read details to evaluate academic insights.`,
              fullContent: article.content || "",
              image: article.urlToImage || getRandomImageForCategory("technology", article.title),
              category: "search",
              date: getSimulatedDate(article.publishedAt),
              author: article.author || article.source?.name || "Global Search Desk",
              tags: ["SEARCH", query.toUpperCase().substring(0, 10), "RECENT"]
            }));
            return res.json({ success: true, results });
          }
        } else {
          console.log(`[Search Notice] NewsAPI search reported service status: ${response.status}. Resolving with semantic database keyword search.`);
        }
      } catch (err) {
        console.log(`[Search Notice] NewsAPI search connection was redirected. Resolving with semantic database keyword search.`);
      }
    }

    // Fallback: full text search in the offline database
    const db = readDb();
    const allItems: any[] = [];
    Object.values(db).forEach((list: any) => {
      if (Array.isArray(list)) {
        allItems.push(...list);
      }
    });

    const words = query.toLowerCase().split(/\s+/);
    const filtered = allItems.filter((item: any) => {
      const titleLower = (item.title || "").toLowerCase();
      const summaryLower = (item.summary || "").toLowerCase();
      return words.every(word => titleLower.includes(word) || summaryLower.includes(word));
    });

    // De-duplicate results by title
    const uniqueMap = new Map();
    filtered.forEach(item => uniqueMap.set(item.title.toLowerCase(), item));
    const finalResults = Array.from(uniqueMap.values());

    res.json({ success: true, results: finalResults });
  } catch (error: any) {
    console.error("Search endpoint error:", error);
    res.status(500).json({ error: "Autonomous search pipeline dropped", details: error.message });
  }
});

// 2. Explicitly trigger news update
app.post("/api/news/sync", async (req, res) => {
  try {
    await syncLatestNews(true); // force bypass!
    const db = readDb();
    res.json({ success: true, db });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to manually synchronize news", details: err.message });
  }
});

// 3. Add custom news article post
app.post("/api/news/add", (req, res) => {
  try {
    const { title, summary, fullContent, category, author, tags, image } = req.body;
    if (!title || !summary || !category) {
      return res.status(400).json({ error: "Missing essential news parameters: title, summary, and category are mandatory." });
    }

    const catNormalized = (category as string).toLowerCase().trim();
    const db = readDb();
    
    const tagsArray = Array.isArray(tags) 
      ? tags 
      : typeof tags === "string" 
        ? tags.split(",").map(t => t.trim()).filter(Boolean) 
        : [catNormalized.toUpperCase(), "CUSTOM POST"];

    const newPost = {
      id: `admin-${catNormalized}-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      fullContent: (fullContent || "").trim(),
      image: image || getRandomImageForCategory(catNormalized, title),
      category: catNormalized,
      date: getSimulatedDate(),
      author: author || "Administrator",
      tags: tagsArray
    };

    if (!db[catNormalized]) {
      db[catNormalized] = [];
    }

    // Prepend new article so it appears first!
    db[catNormalized].unshift(newPost);
    writeDb(db);

    res.json({ success: true, post: newPost, db });
  } catch (error: any) {
    res.status(500).json({ error: "Could not publish custom news post", details: error.message });
  }
});

// Update an existing news post's content (e.g. image, title, summary, fullContent)
app.post("/api/news/update", (req, res) => {
  try {
    const { id, image, title, summary, fullContent } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing news ID" });
    }

    const db = readDb();
    let updatedCount = 0;

    for (const catKey of Object.keys(db)) {
      if (Array.isArray(db[catKey])) {
        db[catKey] = db[catKey].map((item: any) => {
          if (String(item.id) === String(id)) {
            updatedCount++;
            return {
              ...item,
              image: image !== undefined ? image.trim() : item.image,
              title: title !== undefined ? title.trim() : item.title,
              summary: summary !== undefined ? summary.trim() : item.summary,
              fullContent: fullContent !== undefined ? fullContent.trim() : item.fullContent,
            };
          }
          return item;
        });
      }
    }

    if (updatedCount > 0) {
      writeDb(db);
    }

    const updatedDb = readDb();
    return res.json({
      success: true,
      message: `Successfully updated ${updatedCount} instance(s) of story ${id}`,
      db: updatedDb
    });
  } catch (error: any) {
    res.status(500).json({ error: "Could not update news post", details: error.message });
  }
});

// 4. Delete a news post
app.post("/api/news/delete", (req, res) => {
  try {
    const { id, category, title } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing news ID" });
    }

    const db = readDb();
    let deletedCount = 0;
    let deletedTitle: string | undefined = title;

    // Defensively search all category arrays for the target story ID
    for (const catKey of Object.keys(db)) {
      if (Array.isArray(db[catKey])) {
        const target = db[catKey].find((item: any) => String(item.id) === String(id));
        if (target) {
          deletedTitle = target.title;
          db[catKey] = db[catKey].filter((item: any) => String(item.id) !== String(id));
          deletedCount++;
        }
      }
    }

    // Record in blacklisted deleted stories index so it never resurrects
    // Even if it was a search result, blacklisting it prevents it from showing in searches or lists again.
    writeDeletedStory(id, deletedTitle);

    if (deletedCount > 0) {
      writeDb(db);
    }
    
    const filteredDb = readDb();
    return res.json({ 
      success: true, 
      message: deletedCount > 0 ? `Successfully deleted story ${id} from database` : `Successfully blacklisted ephemeral/search story ${id}`, 
      db: filteredDb 
    });
  } catch (error: any) {
    res.status(500).json({ error: "Could not delete news post", details: error.message });
  }
});

// 5. Expand news full content on demand using Gemini
app.post("/api/news/expand", async (req, res) => {
  try {
    const { id, category } = req.body;
    if (!id || !category) {
      return res.status(400).json({ error: "Missing news ID or Category" });
    }

    const db = readDb();
    const categoryList = db[category] || [];
    const itemIndex = categoryList.findIndex((i: any) => i.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "News item not found" });
    }

    const item = categoryList[itemIndex];

    // Already has full body text (make sure it's not just a duplicate of the summary)
    const isTruncated = item.fullContent && (
      item.fullContent.includes("[+") || 
      /\[\+\d+\s+char/i.test(item.fullContent) || 
      item.fullContent.endsWith("...")
    );

    if (item.fullContent && item.fullContent.trim().length > 120 && item.fullContent.trim() !== item.summary.trim() && !isTruncated) {
      return res.json({ fullContent: item.fullContent });
    }

    let generatedContent = "";
    if (checkGeminiAvailable()) {
      try {
        console.log(`[Gemini] Lazy-expanding news story: "${item.title}"`);
        const prompt = `You are an elite, highly professional global news agency editor. Write a comprehensive, detailed, and completely unbiased news article based on this current affairs headline and snippet.
Headline: "${item.title}"
Fact Snippet: "${item.summary}"

Write a detailed news report of exactly 180 to 260 words. Structure it with clear, highly readable paragraphs. Do not add conversational remarks, author signatures, HTML tags, or markdown headers. Return only the raw text of the written article itself. Ensure it contains robust, high-value professional content.`;

        const response = await callGeminiWithRetry({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_CIVIC_INTEGRITY" as any, threshold: "BLOCK_NONE" as any }
            ]
          }
        });

        generatedContent = response.text || "";
      } catch (gemIniErr: any) {
        handleGeminiError(gemIniErr, "Lazy news expansion");
      }
    }

    if (!generatedContent || generatedContent.trim().length === 0) {
      // High-yield contextual fallback body expansion tailored by category Focus
      generatedContent = getDynamicFallbackExpansion(item);
    }

    // Cache the full content in DB
    item.fullContent = generatedContent.trim();
    writeDb(db);

    res.json({ fullContent: item.fullContent });
  } catch (error: any) {
    console.error("Error expanding news content:", error);
    res.status(500).json({ error: "Expansion failed", details: error.message });
  }
});

// Helpers for language translation labels
function getLanguageLabel(langCode: string): string {
  switch (langCode) {
    case "te": return "Telugu (తెలుగు)";
    case "hi": return "Hindi (हिन्दी)";
    case "ta": return "Tamil (தமிழ்)";
    case "kn": return "Kannada (ಕನ್ನಡ)";
    case "ml": return "Malayalam (മലയാളം)";
    default: return "English";
  }
}

// 6. 6-7 Line AI Summary generator with translation
app.post("/api/news/summary", async (req, res) => {
  try {
    const { title, summary, fullContent, lang = "en", category = "international", id } = req.body;
    const bodyContent = fullContent || summary || "";
    const targetLanguage = getLanguageLabel(lang);

    const cacheKey = `${id || title}_${lang}`;
    if (summaryCache.has(cacheKey)) {
      return res.json({ summary: summaryCache.get(cacheKey) });
    }

    if (checkGeminiAvailable()) {
      try {
        console.log(`Generating a 6-7 lines summary for: "${title}" in language: ${targetLanguage}`);
        const prompt = `You are an elite, high-caliber global news reporter and current affairs analyst.
Analyze the current affairs article titled: "${title}" with the following content:
"${bodyContent}"

Your task is to generate a comprehensive, highly clear, and factual news-focused report in EXACTLY 6 to 7 lines of bullet points.

The bullet points MUST follow this exact structure:
1. Exactly 1-2 lines detailing the PLACE involved, always starting with 📍.
2. Exactly 1-2 lines detailing the NAMES of key companies, entities, organizations, or individuals involved, always starting with 👤.
3. Exactly 1-2 lines detailing WHAT HAPPENED (the event, developments, sequence, and key facts), always starting with ⚡.
4. Remaining 2-3 lines detailing the WHOLE SUMMARY of the news (vital insights, causes, implications, or overall context), always starting with 📝.

CRITICAL RULES:
- Do NOT include any labels, bullet points, or entries for "SITUATION", "TIMELINE & STATS", "RESPONSE MEASURES", "Syllabus mapping", "Syllabus Focus", or "GS Papers".
- Do NOT include any academic study coaching tips or civil services prep advice.
- Focus strictly on the core factual content and direct background of the news.
- The language of the response must be entirely in: ${targetLanguage}.
- Do not include any intro/outro conversational fluff. Output exactly 6 to 7 clean bullet-pointed lines.`;

        const response = await callGeminiWithRetry({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_CIVIC_INTEGRITY" as any, threshold: "BLOCK_NONE" as any }
            ]
          }
        });

        const generatedSummary = response.text;
        if (generatedSummary && generatedSummary.trim().length > 0) {
          const finalResult = generatedSummary.trim();
          summaryCache.set(cacheKey, finalResult);
          return res.json({ summary: finalResult });
        }
      } catch (gemIniErr: any) {
        handleGeminiError(gemIniErr, "AI summary generation");
      }
    }

    // Fallback analytical matrix details
    console.log("Serving high-yield pre-compiled fallback structural analysis.");
    const lines = getDynamicFallbackSummary(title, summary, category);

    if (lang !== "en") {
      try {
        const joinedLines = lines.join("\n");
        const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(joinedLines)}`;
        const translateRes = await fetch(translateUrl);
        const translateData = await translateRes.json();
        const translatedText = translateData[0].map((t: any) => t[0]).join("");
        const finalResult = translatedText || lines.join("\n");
        summaryCache.set(cacheKey, finalResult);
        return res.json({ summary: finalResult });
      } catch (err) {
        console.error("Fallback translate error, returning English version of fallback lines:", err);
      }
    }

    const finalResult = lines.join("\n");
    summaryCache.set(cacheKey, finalResult);
    return res.json({ summary: finalResult });
  } catch (error: any) {
    console.error("AI Summary generation failed:", error);
    res.status(500).json({ error: "Sovereign analysis engine timeout", details: error.message });
  }
});

// 7. Core translations using Gemini
app.post("/api/news/translate", async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text || !lang || lang === "en") {
      return res.json({ translatedText: text });
    }

    const cacheKey = `${lang}_${text}`;
    if (translationCache.has(cacheKey)) {
      return res.json({ translatedText: translationCache.get(cacheKey) });
    }

    const targetLanguage = getLanguageLabel(lang);

    if (checkGeminiAvailable()) {
      try {
        console.log(`Using Gemini to translate text to: ${targetLanguage}`);
        const prompt = `Translate the following text precisely into the native script of ${targetLanguage}.
Keep all key names, values, numbers, and proper nouns contextual and accurate. 
Do not add any explanations, extra notes, or polite introduction fluff. Only return the direct translation:
"${text}"`;

        const response = await callGeminiWithRetry({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_CIVIC_INTEGRITY" as any, threshold: "BLOCK_NONE" as any }
            ]
          }
        });

        const translated = response.text;
        if (translated && translated.trim().length > 0) {
          const finalResult = translated.trim();
          translationCache.set(cacheKey, finalResult);
          return res.json({ translatedText: finalResult });
        }
      } catch (gemIniErr: any) {
        handleGeminiError(gemIniErr, "Gemini translation");
      }
    }

    // Google Translate Free Web API Fallback
    console.log(`Triggering direct free Google Translate connector to target locale: "${lang}"`);
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    const translatedText = data[0].map((t: any) => t[0]).join("");
    const finalResult = translatedText || text;
    translationCache.set(cacheKey, finalResult);
    res.json({ translatedText: finalResult });
  } catch (err: any) {
    console.error("Translation micro-pipeline failure:", err);
    res.status(500).json({ error: "Translation dropped", details: err.message });
  }
});

// MCQ Comprehension Quiz Generation Endpoint
app.post("/api/news/quiz", async (req, res) => {
  try {
    const { id, category, lang = "en" } = req.body;
    if (!id || !category) {
      return res.status(400).json({ error: "Missing news ID or Category" });
    }

    const cacheKey = `${id}_${lang}`;
    if (quizCache.has(cacheKey)) {
      return res.json({ quiz: quizCache.get(cacheKey) });
    }

    const db = readDb();
    const categoryList = db[category] || [];
    const item = categoryList.find((i: any) => i.id === id);
    if (!item) {
      return res.status(404).json({ error: "News item not found" });
    }

    const title = item.title;
    const contentText = item.fullContent || item.summary;

    let quizData: any[] = [];

    if (checkGeminiAvailable()) {
      try {
        console.log(`[Gemini] Generating text MCQ quiz for: "${title}"`);
        const targetLanguage = getLanguageLabel(lang);
        const prompt = `You are an elite academic educator. Generate a 3-question multiple choice questionnaire (MCQ) based strictly on the current affairs article titled: "${title}" with the following content:
"${contentText}"

Design the questions to verify comprehension of the major takeaways, events, names, or economic structures highlighted.
Ensure each question has exactly 4 options, a correctIndex (0-based, between 0 and 3), and a short educational explanation.
Since the user selected language is "${targetLanguage}", please generate the entire quiz (questions, options, explanations) in ${targetLanguage}. Keep everything high-yield, premium and professional.`;

         const response = await callGeminiWithRetry({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The text of the multiple choice question."
                  },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING
                    },
                    description: "Exactly 4 options for the multiple choice question."
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: "The 0-based index of the single correct option in the options array. Must be between 0 and 3."
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A short context/explanation explaining why this option is correct based on the news story."
                  }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any },
              { category: "HARM_CATEGORY_CIVIC_INTEGRITY" as any, threshold: "BLOCK_NONE" as any }
            ]
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          quizData = JSON.parse(textOutput.trim());
        }
      } catch (gemIniErr: any) {
        handleGeminiError(gemIniErr, "Gemini MCQ Generation");
      }
    }

    if (!quizData || quizData.length === 0) {
      // Fallback Dynamic Quiz based on title and category
      quizData = [
        {
          question: `Based on the latest report regarding "${title}", what is the primary area of focus?`,
          options: [
            `Strategic macro indicators and category developments in ${category.toUpperCase()}`,
            `Routine administrative record-keeping with zero public impact`,
            `Geographical boundary surveying only`,
            `Fictional or cultural storytelling`
          ],
          correctIndex: 0,
          explanation: `The article directly addresses key, high-yield developments and structures categorized under ${category.toUpperCase()}.`
        },
        {
          question: `Why is the current update regarding "${title}" considered significant?`,
          options: [
            "It holds no relevance to competitive examinations or current affairs",
            "It represents high-value current events impacting regional or global policy grids",
            "It is purely commercial marketing noise",
            "It only reports events from over a century ago"
          ],
          correctIndex: 1,
          explanation: "In current affairs digests and competitive exams (such as UPSC), such news reports highlight live trends of regional or global importance."
        },
        {
          question: `Which of the following best describes the overall tone of this article?`,
          options: [
            "Sarcastic and humorous commentary",
            "Objective, highly analytical, and fact-focused reporting",
            "Entirely biased propaganda",
            "Scientific fiction story format"
          ],
          correctIndex: 1,
          explanation: "Sovereign Study Grid digests are compiled analytically to maintain an objective and educational framework for deep comprehension."
        }
      ];

      // Translate the fallback quiz if the language is not English!
      if (lang !== "en") {
        try {
          const serialText = JSON.stringify(quizData);
          const targetLanguage = getLanguageLabel(lang);
          const trPrompt = `Translate the following JSON quiz into ${targetLanguage}. Keep the JSON fields ("question", "options", "correctIndex", "explanation") intact. Only translate the textual content. Return only the valid translated JSON block:\n${serialText}`;
          
          if (checkGeminiAvailable()) {
            const trRes = await callGeminiWithRetry({
              model: "gemini-3.5-flash",
              contents: trPrompt,
              config: {
                responseMimeType: "application/json"
              }
            });
            if (trRes.text) {
              quizData = JSON.parse(trRes.text.trim());
            }
          } else {
            const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(serialText)}`;
            const translateRes = await fetch(translateUrl);
            const translateData = await translateRes.json();
            const translatedText = translateData[0].map((t: any) => t[0]).join("");
            try {
              quizData = JSON.parse(translatedText);
            } catch (err) {
              console.log("Failed parsing translated JSON fallback, keeping English fallback quiz.");
            }
          }
        } catch (trErr) {
          console.error("Quota or network limit on quiz translation fallback:", trErr);
        }
      }
    }

    quizCache.set(cacheKey, quizData);
    res.json({ quiz: quizData });
  } catch (err: any) {
    console.error("Error generating quiz:", err);
    res.status(500).json({ error: "Quiz generation failed", details: err.message });
  }
});

// Custom direct redirects to ensure users never hit 404 URL Not Found pages
app.get("/admin", (req, res) => {
  res.redirect("/?admin=true");
});

app.get("/sree", (req, res) => {
  res.redirect("/?sree=true");
});

app.get("/login", (req, res) => {
  res.redirect("/?admin=true");
});

app.get("/user", (req, res) => {
  res.redirect("/");
});

// ----------------------------------------------------
// VITE AND STATIC ASSETS HANDLER
// ----------------------------------------------------
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Arriboyina's Backend] Server listening at http://localhost:${PORT}`);
  });
}

initializeServer().catch(err => {
  console.error("Critical system bootstrapper failure:", err);
});
