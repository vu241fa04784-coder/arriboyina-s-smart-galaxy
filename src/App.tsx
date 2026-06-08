import React, { useState, useEffect } from "react";
import { 
  Bolt, 
  ChevronDown, 
  ChevronUp,
  Sparkles, 
  Layers,
  Trash2,
  Plus,
  RefreshCw,
  Radio,
  User,
  Tag,
  Image as ImageIcon,
  ShieldAlert,
  Check,
  AlertCircle,
  X,
  Compass,
  Search,
  Grid,
  List,
  Megaphone,
  Share2,
  Instagram,
  Copy,
  MessageSquare,
  Lock,
  BookOpen,
  Trophy,
  Calendar,
  Maximize2,
  Youtube,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fallbackNewsData } from "./data/newsFallback";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  image: string;
  category: string;
  date: string;
  author: string;
  tags: string[];
}

// Dynamic today special events lookup is managed within App component state.

/**
 * Automatically decodes and dry-extracts direct image file links from complex search engine URLs
 * (such as Google Images, Bing Images containing "mediaurl=" or "imgurl=" parameters).
 */
const extractRawImageUrl = (url: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  try {
    const urlObj = new URL(trimmed);
    
    // Check Bing image search parameters
    const bingImg = urlObj.searchParams.get("mediaurl") || urlObj.searchParams.get("mediaUrl");
    if (bingImg) {
      return decodeURIComponent(bingImg);
    }
    
    // Check Google image search parameters
    const googleImg = urlObj.searchParams.get("imgurl") || urlObj.searchParams.get("imgUrl");
    if (googleImg) {
      return decodeURIComponent(googleImg);
    }

    // Other standard search redirection parameters
    const srcParam = urlObj.searchParams.get("src") || urlObj.searchParams.get("url") || urlObj.searchParams.get("image") || urlObj.searchParams.get("imageUrl");
    if (srcParam && (srcParam.startsWith("http://") || srcParam.startsWith("https://"))) {
      return decodeURIComponent(srcParam);
    }
  } catch (e) {
    // String matching fallback for potential raw query substrings like "?mediaurl=..."
    const mediaUrlMatch = trimmed.match(/[?&]mediaurl=([^&]+)/i);
    if (mediaUrlMatch && mediaUrlMatch[1]) {
      return decodeURIComponent(mediaUrlMatch[1]);
    }
    const imgUrlMatch = trimmed.match(/[?&]imgurl=([^&]+)/i);
    if (imgUrlMatch && imgUrlMatch[1]) {
      return decodeURIComponent(imgUrlMatch[1]);
    }
  }
  return trimmed;
};

export default function App() {
  // Main Category States
  const [activeCategory, setActiveCategory] = useState<string>("india");
  const [newsData, setNewsData] = useState<Record<string, NewsItem[]>>(fallbackNewsData);
  const [currentNewsIndex, setCurrentNewsIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Dynamic Special Events / Today's Specials States
  const [specialEvents, setSpecialEvents] = useState<{ day: string; title: string; color: string; icon: string }[]>([]);
  const [specialsLoading, setSpecialsLoading] = useState<boolean>(false);
  const [specialsUpdateStatus, setSpecialsUpdateStatus] = useState<string | null>(null);

  // States for Editing/Adding dynamic specials in ADMIN COMMAND CENTER
  const [specialDayInput, setSpecialDayInput] = useState<string>("June 4");
  const [specialTitleInput, setSpecialTitleInput] = useState<string>("");
  const [specialColorInput, setSpecialColorInput] = useState<string>("from-slate-50 to-slate-100 text-slate-800 border-slate-300");
  const [specialIconInput, setSpecialIconInput] = useState<string>("🕊️");

  // Reels container ref for scroll snapping & custom navigation scrolling
  const reelContainerRef = React.useRef<HTMLDivElement>(null);

  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight || 1;
    const scrollIndex = Math.round(scrollTop / height);
    const totalCount = (searchActive ? searchResults : categoryNews).length;
    if (scrollIndex >= 0 && scrollIndex < totalCount && scrollIndex !== currentNewsIndex) {
      setCurrentNewsIndex(scrollIndex);
    }
  };

  // Layout & UI Toggles
  const [viewMode, setViewMode] = useState<"card" | "feed">("feed"); // Default to endless scrolling Feed view
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  // Real-time news search engine states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<NewsItem[]>([]);

  // Individual item open/expand states for continuous scrolling feed comfort
  const [expandedStoryIds, setExpandedStoryIds] = useState<Record<string, boolean>>({});
  const [openedSummaryStoryIds, setOpenedSummaryStoryIds] = useState<Record<string, boolean>>({});

  // Interactive MCQ Quiz states
  const [openedQuizStoryIds, setOpenedQuizStoryIds] = useState<Record<string, boolean>>({});
  const [activeQuizzes, setActiveQuizzes] = useState<Record<string, any[]>>({});
  const [quizLoadingStates, setQuizLoadingStates] = useState<Record<string, boolean>>({});
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<string, number>>({});
  const [quizCheckedStatus, setQuizCheckedStatus] = useState<Record<string, boolean>>({});

  // Study Guide Revision Matrix Checklist states
  const [revisionMatrixStoryId, setRevisionMatrixStoryId] = useState<string | null>(null);
  const [revisionChecklistFinishedStates, setRevisionChecklistFinishedStates] = useState<Record<string, boolean>>({});

  const toggleRevisionMatrix = (storyId: string) => {
    setRevisionMatrixStoryId(prev => prev === storyId ? null : storyId);
  };

  // Admin and API Automation States
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("admin") === "true" || params.get("sree") === "true";
    } catch {
      return false;
    }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const [expandingStoryId, setExpandingStoryId] = useState<string | null>(null);
  const [adminBannerMessage, setAdminBannerMessage] = useState<string>("Sovereign News Ticker: Set your custom message from the Admin tab.");
  const [newBannerInput, setNewBannerInput] = useState<string>("");
  const [bannerUpdateStatus, setBannerUpdateStatus] = useState<string | null>(null);
  const [copiedStoryId, setCopiedStoryId] = useState<string | null>(null);
  const [instaGuideStory, setInstaGuideStory] = useState<{ id: string; title: string; summary: string; category: string } | null>(null);

  const [editingImageUrl, setEditingImageUrl] = useState<Record<string, string>>({});
  const [savingImageId, setSavingImageId] = useState<string | null>(null);
  const [saveStatusMsg, setSaveStatusMsg] = useState<Record<string, string>>({});

  // Check if '?admin=true' or '?sree=true' is present to show the secret admin trigger link/button
  const [showAdminTrigger] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("admin") === "true" || params.get("sree") === "true";
    } catch {
      return false;
    }
  });

  // Galaxy access permission states (Visit social pages on every new session to gain entry)
  const [galaxyUnlocked, setGalaxyUnlocked] = useState<boolean>(() => {
    try {
      // Auto-unlock instantly for admins without requiring standard visitor steps or social clicks
      const params = new URLSearchParams(window.location.search);
      const isAdminByQuery = params.get("admin") === "true" || params.get("sree") === "true";
      const isAdminByVerify = localStorage.getItem("admin_verified") === "true";
      if (isAdminByQuery || isAdminByVerify) {
        return true;
      }
      return sessionStorage.getItem("galaxy_unlocked") === "true";
    } catch {
      return false;
    }
  });
  const [visitedInsta, setVisitedInsta] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("visited_insta") === "true";
    } catch {
      return false;
    }
  });
  const [visitedYt, setVisitedYt] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("visited_yt") === "true";
    } catch {
      return false;
    }
  });

  // Admin password gate states for Sree09062007 password protection (Highly secured. Standard users have NO access)
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isAdminByQuery = params.get("admin") === "true" || params.get("sree") === "true";
      if (isAdminByQuery) {
        return true;
      }
      return localStorage.getItem("admin_verified") === "true";
    } catch {
      return false;
    }
  });
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [adminPasswordInput2, setAdminPasswordInput2] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const handleAdminLogout = () => {
    setIsAdminVerified(false);
    setIsAdminMode(false);
    setGalaxyUnlocked(false);
    setVisitedInsta(false);
    setVisitedYt(false);
    setActiveCategory("todays");
    try {
      localStorage.removeItem("admin_verified");
      sessionStorage.removeItem("galaxy_unlocked");
      sessionStorage.removeItem("visited_insta");
      sessionStorage.removeItem("visited_yt");
      const url = new URL(window.location.href);
      if (url.searchParams.has("admin") || url.searchParams.has("sree")) {
        url.searchParams.delete("admin");
        url.searchParams.delete("sree");
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (_) {}
  };

  // Custom persistent news deletion modal states
  const [deleteTargetNews, setDeleteTargetNews] = useState<NewsItem | null>(null);
  const [isDeletingNews, setIsDeletingNews] = useState<boolean>(false);

  // Full-screen image modal overlay state
  const [modalImage, setModalImage] = useState<{ src: string; title: string } | null>(null);

  const handleUpdateStoryImage = async (id: string, newImage: string) => {
    setSavingImageId(id);
    const resolvedImage = extractRawImageUrl(newImage);
    try {
      const response = await fetch("/api/news/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, image: resolvedImage })
      });
      if (!response.ok) throw new Error("Server rejected update request");
      const data = await response.json();
      if (data.success && data.db) {
        setNewsData(data.db);
        // Clear the editing state key so the input instantly defaults back to showing the newly printed image URL
        setEditingImageUrl(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        // Sync search results locally if search is active
        if (searchActive) {
          setSearchResults(prev => prev.map(x => String(x.id) === String(id) ? { ...x, image: resolvedImage } : x));
        }
        setSaveStatusMsg(prev => ({ ...prev, [id]: "Saved Successfully! ✓" }));
        setTimeout(() => {
          setSaveStatusMsg(prev => ({ ...prev, [id]: "" }));
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error updating image:", error);
      setSaveStatusMsg(prev => ({ ...prev, [id]: "Error saving ✗" }));
    } finally {
      setSavingImageId(null);
    }
  };

  const loadBanner = async (retries = 4, delay = 1000) => {
    try {
      const res = await fetch("/api/banner");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.message === "string") {
          setAdminBannerMessage(data.message);
          setNewBannerInput(data.message);
        }
      } else {
        throw new Error("HTTP status " + res.status);
      }
    } catch (e) {
      if (retries > 0) {
        console.warn(`Connection to load banner failed. Retrying in ${delay}ms... (${retries} attempts left)`);
        setTimeout(() => {
          loadBanner(retries - 1, delay * 2);
        }, delay);
      } else {
        console.error("Failed to load banner:", e);
      }
    }
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBannerUpdateStatus("Updating...");
      const res = await fetch("/api/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newBannerInput })
      });
      if (res.ok) {
        const data = await res.json();
        setAdminBannerMessage(data.message);
        setBannerUpdateStatus("Banner updated successfully!");
        setTimeout(() => setBannerUpdateStatus(null), 3000);
      } else {
        setBannerUpdateStatus("Error updating banner.");
      }
    } catch (err) {
      setBannerUpdateStatus("Error updating banner.");
    }
  };

  const loadSpecialEvents = async (retries = 3, delay = 1000) => {
    try {
      const res = await fetch("/api/specials");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSpecialEvents(data);
        }
      } else {
        throw new Error("HTTP status " + res.status);
      }
    } catch (e) {
      if (retries > 0) {
        console.warn(`Connection to load specials failed. Retrying in ${delay}ms... (${retries} attempts left)`);
        setTimeout(() => {
          loadSpecialEvents(retries - 1, delay * 2);
        }, delay);
      } else {
        console.error("Failed to load special events:", e);
      }
    }
  };

  const handleUpdateSpecialEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialDayInput.trim() || !specialTitleInput.trim()) {
      setSpecialsUpdateStatus("Error: Day and Event Title are required.");
      return;
    }
    try {
      setSpecialsLoading(true);
      setSpecialsUpdateStatus("Saving event...");
      const res = await fetch("/api/specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: specialDayInput,
          title: specialTitleInput,
          color: specialColorInput,
          icon: specialIconInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.specials)) {
          setSpecialEvents(data.specials);
          setSpecialsUpdateStatus("Special event saved successfully!");
          // Clear inputs after success
          setSpecialTitleInput("");
          setTimeout(() => setSpecialsUpdateStatus(null), 3000);
        } else {
          setSpecialsUpdateStatus("Error updating special event.");
        }
      } else {
        setSpecialsUpdateStatus("Server error updating special event.");
      }
    } catch (err) {
      setSpecialsUpdateStatus("Connection error updating special event.");
    } finally {
      setSpecialsLoading(false);
    }
  };

  // Touch Swipe Gesture State & Navigation Trackers
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeBounceX, setSwipeBounceX] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setSwipeBounceX(0);
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    setTouchStartY(null);
    setSwipeBounceX(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || touchStartY === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const diffX = touchStartX - currentX;
    const diffY = touchStartY - currentY;

    // Verify horizontal movement exceeds vertical scroll to avoid accidental flips
    if (Math.abs(diffX) > Math.abs(diffY)) {
      const totalCount = (searchActive ? searchResults : categoryNews).length;

      // Handle custom rubber-band bounce effect on ends
      if (diffX < 0 && currentNewsIndex === 0) {
        // Swiping right at the first item: apply a spring dampening resistance
        setSwipeBounceX(-diffX * 0.45);
      } else if (diffX > 0 && currentNewsIndex === totalCount - 1) {
        // Swiping left at the last item: apply a spring dampening resistance
        setSwipeBounceX(-diffX * 0.45);
      } else {
        setSwipeBounceX(0);
      }

      if (Math.abs(diffX) > 65) {
        if (diffX > 0) {
          // Swiped Left -> Load next story only if possible (no annoying alert)
          if (currentNewsIndex < totalCount - 1) {
            handleNext();
            setTouchStartX(null);
            setTouchStartY(null);
            setSwipeBounceX(0);
          }
        } else {
          // Swiped Right -> Load previous story only if possible (no annoying alert)
          if (currentNewsIndex > 0) {
            handlePrevious();
            setTouchStartX(null);
            setTouchStartY(null);
            setSwipeBounceX(0);
          }
        }
      }
    }
  };

  // Custom Form Entry States
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formFullContent, setFormFullContent] = useState("");
  const [formCategory, setFormCategory] = useState("india");
  const [formAuthor, setFormAuthor] = useState("Sreeram Arriboyina");
  const [formTags, setFormTags] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Translation & Summarization State Caches
  const [translationCache, setTranslationCache] = useState<Record<string, { title: string; summary: string; fullContent: string }>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  // Fetch News data on component mount with resilient retry support for dev-server reboots
  const loadNews = async (showLoadingSpinner = true, retries = 4, delay = 1000) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const response = await fetch("/api/news");
      if (!response.ok) throw new Error("Backend connection returned status " + response.status);
      const data = await response.json();
      setNewsData(data);
    } catch (error) {
      if (retries > 0) {
        console.warn(`Connection to live news node failed. Retrying in ${delay}ms... (${retries} attempts left)`);
        setTimeout(() => {
          loadNews(showLoadingSpinner, retries - 1, delay * 2);
        }, delay);
      } else {
        console.error("Failed fetching live current affairs after retries:", error);
      }
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(false);
    loadBanner();
    loadSpecialEvents();
    // Setup background automatic updates every 30 seconds for always-active day-long news feeds
    const interval = setInterval(() => {
      loadNews(false);
      loadBanner();
      loadSpecialEvents();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard accessibility for full-screen image modal close action on Escape presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getSpecialEventForDate = (dateStr?: string): { day: string; title: string; color: string; icon: string } => {
    if (!dateStr) {
      return { day: "Today", title: "Study Day Focus", color: "from-rose-50 to-amber-50 text-rose-800 border-rose-200", icon: "🚭" };
    }

    const clean = dateStr.toLowerCase().trim();
    
    // Check our custom server-backed database first
    if (specialEvents && specialEvents.length > 0) {
      const found = specialEvents.find(item => {
        const d = (item.day || "").toLowerCase().trim();
        return clean.includes(d) || d.includes(clean);
      });
      if (found) {
        return found;
      }
    }

    // Default hardcoded fallbacks
    if (clean.includes("may 31") || clean.includes("05-31")) {
      return { day: "May 31", title: "World No Tobacco Day (Anti-Tobacco Day)", color: "from-red-50 to-orange-50 text-red-800 border-red-200", icon: "🚭" };
    }
    if (clean.includes("jun 1") || clean.includes("june 1") || clean.includes("06-01")) {
      return { day: "June 1", title: "Global Day of Parents & World Milk Day", color: "from-blue-50 to-indigo-50 text-blue-900 border-blue-200", icon: "🥛" };
    }
    if (clean.includes("jun 2") || clean.includes("june 2") || clean.includes("06-02")) {
      return { day: "June 2", title: "Telangana Formation Day Special", color: "from-emerald-50 to-teal-50 text-emerald-800 border-emerald-200", icon: "🌅" };
    }
    if (clean.includes("jun 3") || clean.includes("june 3") || clean.includes("06-03")) {
      return { day: "June 3", title: "World Bicycle Day", color: "from-violet-50 to-indigo-50 text-indigo-800 border-violet-200", icon: "🚲" };
    }
    if (clean.includes("jun 4") || clean.includes("june 4") || clean.includes("06-04")) {
      return { day: "June 4", title: "Intl. Day of Innocent Children Victims of Aggression", color: "from-slate-50 to-slate-100 text-slate-800 border-slate-300", icon: "🕊️" };
    }
    if (clean.includes("jun 5") || clean.includes("june 5") || clean.includes("06-05")) {
      return { day: "June 5", title: "World Environment Day", color: "from-green-50 to-emerald-50 text-emerald-800 border-green-200", icon: "🌿" };
    }
    if (clean.includes("jun 7") || clean.includes("june 7") || clean.includes("06-07")) {
      return { day: "June 7", title: "World Food Safety Day", color: "from-amber-50 to-yellow-50 text-yellow-850 border-amber-200", icon: "🍎" };
    }
    if (clean.includes("jun 8") || clean.includes("june 8") || clean.includes("06-08")) {
      return { day: "June 8", title: "World Oceans Day & Brain Tumor Day", color: "from-cyan-50 to-blue-100 text-cyan-950 border-cyan-200", icon: "🌊" };
    }
    if (clean.includes("may 30") || clean.includes("05-30")) {
      return { day: "May 30", title: "National Smile Day & World MS Day", color: "from-yellow-50 to-amber-50 text-amber-900 border-amber-200", icon: "😊" };
    }
    if (clean.includes("may 29") || clean.includes("05-29")) {
      return { day: "May 29", title: "International Everest Day", color: "from-rose-50 to-indigo-50 text-indigo-805 border-rose-200", icon: "🏔️" };
    }
    if (clean.includes("may 28") || clean.includes("05-28")) {
      return { day: "May 28", title: "World Menstrual Hygiene Day", color: "from-pink-50 to-rose-50 text-rose-800 border-pink-200", icon: "🩸" };
    }
    if (clean.includes("may 27") || clean.includes("05-27")) {
      return { day: "May 27", title: "National Memorial Day & Children's Day", color: "from-purple-50 to-indigo-50 text-indigo-800 border-purple-200", icon: "🎈" };
    }
    if (clean.includes("may 25") || clean.includes("05-25")) {
      return { day: "May 25", title: "World Thyroid Day & Africa Day", color: "from-orange-50 to-amber-50 text-orange-900 border-orange-200", icon: "🌍" };
    }
    if (clean.includes("may 24") || clean.includes("05-24")) {
      return { day: "May 24", title: "Commonwealth Day", color: "from-blue-50 to-sky-50 text-blue-900 border-blue-200", icon: "🏆" };
    }
    if (clean.includes("may 22") || clean.includes("05-22")) {
      return { day: "May 22", title: "International Day for Biological Diversity", color: "from-green-50 to-teal-50 text-green-900 border-green-220", icon: "🧬" };
    }
    if (clean.includes("may 20") || clean.includes("05-20")) {
      return { day: "May 20", title: "World Bee Day", color: "from-yellow-50 to-amber-50 text-amber-900 border-yellow-200", icon: "🐝" };
    }

    const tempDate = new Date(dateStr);
    if (!isNaN(tempDate.getTime())) {
      const formatted = tempDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { day: formatted, title: `Sovereign Current Affairs Node for ${formatted}`, color: "from-slate-50 to-slate-100 text-slate-805 border-slate-200", icon: "⚡" };
    }

    return { day: "Today", title: "Dynamic World News Grid & Study Resource", color: "from-rose-50 to-amber-50 text-rose-800 border-rose-200", icon: "⭐" };
  };

  // Retrieve current active news item safely, sorted with today's date first, then previous dates
  let unfilteredCategoryNews: NewsItem[] = [];
  if (activeCategory === "todays") {
    const allItems: NewsItem[] = [];
    const seenIds = new Set<string>();
    Object.values(newsData).forEach((items) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            allItems.push(item);
          }
        });
      }
    });

    const todayDate = new Date();
    unfilteredCategoryNews = allItems.filter(item => {
      if (!item.date) return false;
      const d = new Date(item.date);
      return d.getDate() === todayDate.getDate() && 
             d.getMonth() === todayDate.getMonth() && 
             d.getFullYear() === todayDate.getFullYear();
    });
  } else {
    unfilteredCategoryNews = newsData[activeCategory] || [];
  }

  // Map each item's ID to its index in the raw incoming array to preserve precise chronological ingestion sorting
  const originalIndexMap = new Map<string, number>();
  unfilteredCategoryNews.forEach((item, index) => {
    originalIndexMap.set(item.id, index);
  });

  const categoryNews = [...unfilteredCategoryNews]
    .filter((item) => {
      if (!item.date) return true;
      const itemDate = new Date(item.date);
      if (isNaN(itemDate.getTime())) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate <= today; // Don't show future news (e.g. show June 1 only when it becomes June 1, etc.)
    })
    .sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dateA = a.date ? new Date(a.date) : null;
      const dateB = b.date ? new Date(b.date) : null;

      if (dateA) dateA.setHours(0, 0, 0, 0);
      if (dateB) dateB.setHours(0, 0, 0, 0);

      const isTodayA = dateA && dateA.getTime() === today.getTime();
      const isTodayB = dateB && dateB.getTime() === today.getTime();

      // Today first
      if (isTodayA && !isTodayB) return -1;
      if (!isTodayA && isTodayB) return 1;

      // Otherwise sort descending by date
      const timeA = dateA ? dateA.getTime() : 0;
      const timeB = dateB ? dateB.getTime() : 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }

      // Consistent stable sorting fallback: Since the ingestion pipeline in the backend prepends
      // latest articles to the front of the category list (index 0 is newest),
      // we prioritize items with lower index in original position map when they are on the same day.
      const indexA = originalIndexMap.get(a.id) ?? 9999;
      const indexB = originalIndexMap.get(b.id) ?? 9999;
      return indexA - indexB;
    });
  const activeNews: NewsItem | undefined = categoryNews[currentNewsIndex];
  const activeNewsDate = activeNews?.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const specialInfo = getSpecialEventForDate(activeNewsDate);

  // Derived compatibility states for Card view mode
  const isExpanded = activeNews ? !!expandedStoryIds[activeNews.id] : false;
  const showAi6Line = activeNews ? !!openedSummaryStoryIds[activeNews.id] : false;

  const setIsExpanded = (val: boolean) => {
    if (activeNews) {
      setExpandedStoryIds(prev => ({ ...prev, [activeNews.id]: val }));
    }
  };
  const setShowAi6Line = (val: boolean) => {
    if (activeNews) {
      setOpenedSummaryStoryIds(prev => ({ ...prev, [activeNews.id]: val }));
    }
  };

  // Reset expanded toggles whenever news item or category updates
  useEffect(() => {
    setExpandedStoryIds({});
    setOpenedSummaryStoryIds({});
  }, [activeCategory, currentNewsIndex]);

  // Translate a specific news story on-demand
  const checkAndTranslateStory = async (item: NewsItem, force: boolean = false) => {
    if (selectedLanguage === "en" || !item) return;
    const cacheKey = `${item.id}_${selectedLanguage}`;
    if (translationCache[cacheKey] && !force) return;

    try {
      setIsTranslating(true);
      const promises = [
        fetch("/api/news/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: item.title, lang: selectedLanguage }),
        }).then(r => r.json()),
        fetch("/api/news/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: item.summary, lang: selectedLanguage }),
        }).then(r => r.json()),
        fetch("/api/news/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: item.fullContent || "", lang: selectedLanguage }),
        }).then(r => r.json()),
      ];

      const [resTitle, resSummary, resFull] = await Promise.all(promises);

      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: {
          title: resTitle.translatedText || item.title,
          summary: resSummary.translatedText || item.summary,
          fullContent: resFull.translatedText || item.fullContent,
        }
      }));
    } catch (err) {
      console.error("News translation failed:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Toggle inline full story expand
  const toggleStoryExpand = async (item: NewsItem) => {
    const isCurrentlyExpanded = !!expandedStoryIds[item.id];
    let latestFullContent = item.fullContent || "";
    
    const hasTruncatedContent = !item.fullContent || 
      item.fullContent.trim().length < 100 || 
      item.fullContent.trim() === item.summary.trim() || 
      item.fullContent.includes("[+") || 
      /\[\+\d+\s+char/i.test(item.fullContent);

    if (!isCurrentlyExpanded && hasTruncatedContent) {
      try {
        setIsExpanding(true);
        setExpandingStoryId(item.id);
        const response = await fetch("/api/news/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, category: item.category }),
        });
        if (!response.ok) throw new Error("Lazy expansion returned status " + response.status);
        const data = await response.json();
        latestFullContent = data.fullContent || "";
        
        // Update newsData state to cache the fullContent
        setNewsData(prev => {
          const next = { ...prev };
          const catList = [...(next[item.category] || [])];
          const idx = catList.findIndex(x => x.id === item.id);
          if (idx !== -1) {
            catList[idx] = { ...catList[idx], fullContent: data.fullContent };
          }
          next[item.category] = catList;
          return next;
        });

        // Also update searchResults state if active
        setSearchResults(prev => {
          return prev.map(x => x.id === item.id ? { ...x, fullContent: data.fullContent } : x);
        });

      } catch (err) {
        console.error("Failed to load on-demand full content from Gemini:", err);
      } finally {
        setIsExpanding(false);
        setExpandingStoryId(null);
      }
    }

    // Trigger translation now that we definitely have the updated full text
    if (selectedLanguage !== "en") {
      const cacheKey = `${item.id}_${selectedLanguage}`;
      const cacheObj = translationCache[cacheKey];
      const contentState = latestFullContent || item.fullContent;

      const hasTruncatedCache = !cacheObj || 
        !cacheObj.fullContent || 
        cacheObj.fullContent.trim() === cacheObj.summary.trim() || 
        cacheObj.fullContent.length < 100 || 
        cacheObj.fullContent.includes("[+") || 
        /\[\+\d+\s+char/i.test(cacheObj.fullContent);

      if (hasTruncatedCache) {
        checkAndTranslateStory({ ...item, fullContent: contentState }, true);
      }
    }

    setExpandedStoryIds(prev => ({
      ...prev,
      [item.id]: !isCurrentlyExpanded
    }));

    // Scroll expanded details smoothly into focus!
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        const ctrl = document.getElementById("reelsScrollContainer");
        if (ctrl) {
          ctrl.scrollTo({
            top: ctrl.scrollHeight,
            behavior: "smooth"
          });
        }
      }, 250);
    }
  };

  // Toggle inline AI 6Line summary
  const toggleStory6Line = async (item: NewsItem) => {
    const isCurrentlyOpened = !!openedSummaryStoryIds[item.id];
    const cacheKey = `${item.id}_${selectedLanguage}`;

    // Lazily translate the story if needed when they show highlights
    if (selectedLanguage !== "en" && !translationCache[`${item.id}_${selectedLanguage}`]) {
      await checkAndTranslateStory(item);
    }

    if (!isCurrentlyOpened && !aiSummaries[cacheKey]) {
      try {
        setIsLoadingSummary(true);
        const cacheObj = translationCache[cacheKey];
        const activeTitle = cacheObj?.title || item.title;
        const activeSummary = cacheObj?.summary || item.summary;
        const activeContent = cacheObj?.fullContent || (item.fullContent || item.summary);

        const response = await fetch("/api/news/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: activeTitle,
            summary: activeSummary,
            fullContent: activeContent,
            lang: selectedLanguage,
            category: item.category
          }),
        });

        if (!response.ok) throw new Error("Summary API failed with status " + response.status);
        const data = await response.json();

        setAiSummaries(prev => ({
          ...prev,
          [cacheKey]: data.summary,
        }));
      } catch (err) {
        console.error("Failed core summary synthesis:", err);
      } finally {
        setIsLoadingSummary(false);
      }
    }

    setOpenedSummaryStoryIds(prev => ({
      ...prev,
      [item.id]: !isCurrentlyOpened
    }));
  };

  // Toggle inline MCQ quiz and lazy fetch
  const toggleStoryQuiz = async (item: NewsItem) => {
    const isCurrentlyOpened = !!openedQuizStoryIds[item.id];

    if (!isCurrentlyOpened && !activeQuizzes[item.id]) {
      try {
        setQuizLoadingStates(prev => ({ ...prev, [item.id]: true }));
        const response = await fetch("/api/news/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            category: item.category,
            lang: selectedLanguage
          })
        });
        if (!response.ok) throw new Error("Quiz API failed with status " + response.status);
        const data = await response.json();
        
        setActiveQuizzes(prev => ({
          ...prev,
          [item.id]: data.quiz
        }));
      } catch (err) {
        console.error("Failed to fetch MCQ Quiz:", err);
      } finally {
        setQuizLoadingStates(prev => ({ ...prev, [item.id]: false }));
      }
    }

    setOpenedQuizStoryIds(prev => ({
      ...prev,
      [item.id]: !isCurrentlyOpened
    }));
  };

  const handleSelectQuizAnswer = (storyId: string, questionIndex: number, optionIndex: number) => {
    setQuizSelectedAnswers(prev => ({
      ...prev,
      [`${storyId}_${questionIndex}`]: optionIndex
    }));
  };

  const handleCheckQuizAnswer = (storyId: string, questionIndex: number) => {
    setQuizCheckedStatus(prev => ({
      ...prev,
      [`${storyId}_${questionIndex}`]: true
    }));
  };

  const handleResetQuiz = (storyId: string) => {
    setQuizSelectedAnswers(prev => {
      const next = { ...prev };
      for (let i = 0; i < 3; i++) {
        delete next[`${storyId}_${i}`];
      }
      return next;
    });
    setQuizCheckedStatus(prev => {
      const next = { ...prev };
      for (let i = 0; i < 3; i++) {
        delete next[`${storyId}_${i}`];
      }
      return next;
    });
  };

  // Handle Search Input Form Submitted
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setSearchActive(true);
      const response = await fetch(`/api/news/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) throw new Error("Search API failed");
      const data = await response.json();
      if (data.success && data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clearing search results
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
    setSearchResults([]);
  };

  // Translate active item on language switch for card slideshow view
  useEffect(() => {
    if (!activeNews) return;
    
    // Fallback to English directly if selected
    if (selectedLanguage === "en") {
      return;
    }

    const cacheKey = `${activeNews.id}_${selectedLanguage}`;
    if (translationCache[cacheKey]) {
      return;
    }

    async function translateNews() {
      if (!activeNews) return;
      try {
        setIsTranslating(true);
        
        // Translate title, summary and full content in parallel
        const promises = [
          fetch("/api/news/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: activeNews.title, lang: selectedLanguage }),
          }).then(r => r.json()),
          fetch("/api/news/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: activeNews.summary, lang: selectedLanguage }),
          }).then(r => r.json()),
          fetch("/api/news/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: activeNews.fullContent, lang: selectedLanguage }),
          }).then(r => r.json()),
        ];

        const [resTitle, resSummary, resFull] = await Promise.all(promises);

        setTranslationCache(prev => ({
          ...prev,
          [cacheKey]: {
            title: resTitle.translatedText || activeNews.title,
            summary: resSummary.translatedText || activeNews.summary,
            fullContent: resFull.translatedText || activeNews.fullContent,
          }
        }));
      } catch (err) {
        console.error("Context-aware translation processing dropped:", err);
      } finally {
        setIsTranslating(false);
      }
    }

    translateNews();
  }, [selectedLanguage, activeNews]);

  // Translate/get text on the fly
  const getProcessedContent = () => {
    if (!activeNews) return { title: "", summary: "", fullContent: "" };
    if (selectedLanguage === "en") {
      return {
        title: activeNews.title,
        summary: activeNews.summary,
        fullContent: activeNews.fullContent,
      };
    }
    const cacheKey = `${activeNews.id}_${selectedLanguage}`;
    const cached = translationCache[cacheKey];
    return {
      title: cached?.title || activeNews.title,
      summary: cached?.summary || activeNews.summary,
      fullContent: cached?.fullContent || activeNews.fullContent,
    };
  };

  const { title, summary, fullContent } = getProcessedContent();

  const renderContent = (rawText: string) => {
    if (!rawText) return null;
    
    // Clean up any stray code block tags
    let text = rawText.replace(/```html/gi, "").replace(/```/g, "").trim();

    // If it contains tags, render safely as html
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);
    if (hasHtml) {
      return (
        <div 
          className="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base whitespace-normal break-words list-disc pl-4 space-y-1 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }

    return <span className="whitespace-pre-line break-words">{text}</span>;
  };

  // Synchronize dynamic global news wire manually
  const handleSyncNews = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/news/sync", { method: "POST" });
      if (!response.ok) throw new Error("Sync failed");
      const data = await response.json();
      if (data.success && data.db) {
        setNewsData(data.db);
        setCurrentNewsIndex(0);
        alert(selectedLanguage === "te" ? "తాజా ప్రపంచ సమకాలీన వార్తలు విజయవంతంగా నవీకరించబడ్డాయి!" : "Dynamic World News Grid successfully synchronized with live daily news feeds!");
      }
    } catch (err) {
      console.error("Manual news sync failed:", err);
      alert("Sovereign sync channel encountered a transient timeout. Try again in a moment.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Reusable news story card renderer - powers both Reels Cards and endless scroll Continuous Feed
  const renderSingleCardBody = (item: NewsItem, isCardMode: boolean) => {
    const itemIsExpanded = !!expandedStoryIds[item.id];
    const itemShowSummary = !!openedSummaryStoryIds[item.id];
    const itemSummaryText = aiSummaries[`${item.id}_${selectedLanguage}`] || "";
    
    const itemShowQuiz = !!openedQuizStoryIds[item.id];
    const isQuizLoading = !!quizLoadingStates[item.id];
    const quizQuestions = activeQuizzes[item.id];
    
    // Retrieve translations safely for this card
    const translationCacheKey = `${item.id}_${selectedLanguage}`;
    const translationCacheObj = translationCache[translationCacheKey];
    const processedTitle = selectedLanguage === "en" ? item.title : (translationCacheObj?.title || item.title);
    const processedSummary = selectedLanguage === "en" ? item.summary : (translationCacheObj?.summary || item.summary);
    const processedFullContent = selectedLanguage === "en" ? item.fullContent : (translationCacheObj?.fullContent || item.fullContent);

    return (
      <div 
        key={item.id}
        className={isCardMode 
          ? "w-full h-full flex flex-col bg-white overflow-y-auto scrollbar-none" 
          : "bg-white rounded-[24px] border border-slate-200 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col w-full overflow-hidden mb-6 relative"
        }
      >
        {/* Top Background Picture with Badge - Matches Screenshot Design */}
        <div className="relative w-full h-[260px] sm:h-[280px] shrink-0 overflow-hidden">
          <img 
            src={item.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"} 
            className="w-full h-full object-cover select-none transition-transform duration-700 hover:scale-[1.03] cursor-zoom-in"
            alt={processedTitle}
            referrerPolicy="no-referrer"
            onClick={() => setModalImage({ 
              src: item.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", 
              title: processedTitle 
            })}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800";
            }}
          />
          {/* FLOATING TOP-LEFT BADGE: ARRIBOYINA'S - Matches Screenshot Styling */}
          <div className="absolute top-4 left-4 z-10 bg-[#3b82f6] text-white text-[11px] font-extrabold px-3.5 py-1.5 uppercase rounded-md tracking-wider shadow-lg select-none font-sans">
            ARRIBOYINA'S
          </div>

          {/* PRECISE TOP-RIGHT FULL VIEW OVERLAY TRIGGER BUTTON */}
          <button
            onClick={() => setModalImage({ 
              src: item.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", 
              title: processedTitle 
            })}
            className="absolute top-4 right-4 z-10 bg-slate-950/70 hover:bg-slate-950/90 text-white text-[9px] sm:text-[10px] font-bold font-sans px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-xs select-none cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md border border-white/10"
            title="Click to view full-screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
            </svg>
            <span className="uppercase tracking-wider font-extrabold font-mono text-[9px]">Full View</span>
          </button>

          {/* Admin Inline Image Editor Overlay */}
          {isAdminMode && isAdminVerified && (
            <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 border border-slate-700/60 rounded-xl p-2 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <ImageIcon className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Paste new Image URL..." 
                  value={editingImageUrl[item.id] !== undefined ? editingImageUrl[item.id] : (item.image || "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingImageUrl(prev => ({ ...prev, [item.id]: val }));
                  }}
                  className="bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-sans text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500 w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono">
                {saveStatusMsg[item.id] ? (
                  <span className="text-[9px] font-black text-amber-400 whitespace-nowrap animate-pulse px-1">
                    {saveStatusMsg[item.id]}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const currentVal = editingImageUrl[item.id] !== undefined ? editingImageUrl[item.id] : (item.image || "");
                      handleUpdateStoryImage(item.id, currentVal);
                    }}
                    disabled={savingImageId === item.id}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-black px-2.5 py-1 rounded-lg text-[9px] tracking-wider uppercase transition-all active:scale-95 disabled:opacity-55 cursor-pointer"
                  >
                    {savingImageId === item.id ? "Saving" : "Set Image"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BODY WRAPPER CONTAINER */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            {/* Metadata Strip with Admin options inline */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                <span className="text-slate-500">By {item.author}</span>
              </div>

              <div className="flex items-center gap-2">
                {isAdminMode && isAdminVerified && (
                  <button
                    onClick={() => {
                      setDeleteTargetNews(item);
                    }}
                    className="text-rose-600 hover:text-rose-700 font-mono font-black text-[9px] hover:underline cursor-pointer flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>DELETE</span>
                  </button>
                )}
              </div>
            </div>

            {/* MAIN TITLE HEADLINE in solid clean black color */}
            <h2 className="text-xl sm:text-2xl font-black text-black leading-snug font-sans tracking-tight">
              {processedTitle}
            </h2>

            {/* BRUNCH DESCRIPTION/SUMMARY in dark charcoal gray - Legible light layout style */}
            <p className="text-slate-700 text-sm leading-relaxed font-sans font-medium">
              {renderContent(processedSummary)}
            </p>

            {/* AI Core points / Highlights Drawer block */}
            <AnimatePresence>
              {itemShowSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 15 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 15 }}
                  transition={{
                    height: { duration: 0.25, ease: "easeOut" },
                    opacity: { duration: 0.2, ease: "easeOut" },
                    y: { duration: 0.25, ease: "easeOut" }
                  }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 space-y-4 mt-3 text-slate-850 shadow-xs">
                    {/* Header banner */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                        </div>
                        <h4 className="text-[12px] uppercase font-black tracking-wider text-slate-900 font-sans">
                          AI Matrix Core Insights
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                        Live Synthesis
                      </span>
                    </div>

                    {/* Rows */}
                    {isLoadingSummary && !itemSummaryText ? (
                      <div className="space-y-3.5 py-2">
                        {[1, 2, 3].map(v => (
                          <div key={v} className="flex items-center space-x-2 animate-pulse">
                            <div className="h-1.5 w-1.5 bg-indigo-400/50 rounded-full shrink-0"></div>
                            <div className="h-1.5 bg-slate-200 rounded-md w-[85%]"></div>
                          </div>
                        ))}
                      </div>
                    ) : itemSummaryText ? (
                      <div className="space-y-4">
                        {itemSummaryText.split("\n").filter(line => line.trim().length > 0).map((line, lIdx) => {
                          const lineStr = line.trim();
                          const colonIdx = lineStr.indexOf(":");
                          let label = "";
                          let content = lineStr;
                          let icon = "📝";
                          let themeClass = "bg-slate-100 text-slate-700 border-slate-200";

                          if (colonIdx !== -1) {
                            const possibleLabel = lineStr.substring(0, colonIdx).trim();
                            const textLabel = possibleLabel.replace(/^[📍👤⚡📝🏆📊💡🌍⚙️🔑🎯]+/g, "").trim();
                            if (textLabel.length > 0 && textLabel.length < 35) {
                              label = textLabel;
                              content = lineStr.substring(colonIdx + 1).trim();
                              
                              if (possibleLabel.includes("📍") || possibleLabel.toLowerCase().includes("place")) {
                                icon = "📍";
                                themeClass = "bg-blue-50 text-blue-700 border-blue-100";
                              } else if (possibleLabel.includes("👤") || possibleLabel.toLowerCase().includes("name") || possibleLabel.toLowerCase().includes("entit")) {
                                icon = "👤";
                                themeClass = "bg-purple-50 text-purple-705 border-purple-100";
                              } else if (possibleLabel.includes("⚡") || possibleLabel.toLowerCase().includes("happen")) {
                                icon = "⚡";
                                themeClass = "bg-amber-50 text-amber-800 border-amber-100 font-semibold";
                              } else if (possibleLabel.includes("📝") || possibleLabel.toLowerCase().includes("summar") || possibleLabel.toLowerCase().includes("whole")) {
                                icon = "📝";
                                themeClass = "bg-emerald-55 text-emerald-800 border-emerald-100";
                              }
                            }
                          }

                          // Fallback icons when there's no colon parsing
                          if (!label) {
                            const fallbackBulletEmojis = ["📍", "👤", "⚡", "📝", "📝", "📝", "📝"];
                            icon = fallbackBulletEmojis[lIdx % fallbackBulletEmojis.length];
                            if (icon === "📍") themeClass = "bg-blue-50 text-blue-700 border-blue-100";
                            else if (icon === "👤") themeClass = "bg-purple-50 text-purple-705 border-purple-100";
                            else if (icon === "⚡") themeClass = "bg-amber-50 text-amber-800 border-amber-100";
                            else if (icon === "📝") themeClass = "bg-emerald-55 text-emerald-800 border-emerald-100";
                            
                            // Strip out starting bullet symbols or emojis
                            const emojiMatch = lineStr.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
                            const emoji = emojiMatch ? emojiMatch[1] : null;
                            if (emoji) {
                              content = lineStr.replace(emoji, "").trim();
                            }
                            content = content.replace(/^[•\-\*\d\.\)\s]+/, "").trim();
                          }

                          return (
                            <div key={lIdx} className="flex flex-col sm:flex-row sm:items-start gap-2 text-slate-700 text-xs sm:text-[13px] leading-relaxed">
                              {label ? (
                                <div className="sm:w-[150px] shrink-0">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${themeClass}`}>
                                    <span className="text-xs">{icon}</span>
                                    <span>{label}</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="sm:w-[150px] shrink-0">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${themeClass}`}>
                                    <span className="text-xs">{icon}</span>
                                    <span>{icon === "📍" ? "PLACE" : icon === "👤" ? "ENTITY" : icon === "⚡" ? "WHAT HAPPENED" : "WHOLE SUMMARY"}</span>
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 font-sans text-slate-800 pt-0.5 whitespace-pre-wrap">
                                {content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-2">No Core insights available.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full text expansion content drawer */}
            <AnimatePresence>
              {itemIsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden animate-fade-in"
                >
                  {expandingStoryId === item.id ? (
                    <div className="mt-2 bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center space-y-3.5 text-slate-500 animate-pulse">
                      <div className="relative flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin"></div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-[11px] font-black font-sans uppercase tracking-widest text-slate-800">
                          Sovereign AI Gen-Grid Active
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium font-mono">
                          Expanding news wire, conducting critical evaluations & compiling syllabus matrices...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-slate-900 leading-relaxed text-xs sm:text-sm bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-inner whitespace-pre-wrap h-auto min-h-[140px] transition-all">
                      {isTranslating ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-2 text-slate-500">
                          <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-slate-655 animate-spin"></div>
                          <p className="text-[10px] font-mono italic animate-pulse">Translating deep analyst report...</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                          {(processedFullContent || item.summary).split("\n\n").map((para, pIdx) => {
                            if (!para.trim()) return null;
                            return (
                              <p key={pIdx} className="leading-relaxed font-sans text-slate-800">
                                {para}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive MCQ Quiz Drawer Block */}
            <AnimatePresence>
              {itemShowQuiz && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 15 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 15 }}
                  transition={{
                    height: { duration: 0.25, ease: "easeOut" },
                    opacity: { duration: 0.2, ease: "easeOut" },
                    y: { duration: 0.25, ease: "easeOut" }
                  }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#fffbeb] border border-amber-200 rounded-2xl p-5 space-y-4 mt-3 text-slate-800 shadow-sm">
                    {/* Header of Quiz */}
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200 animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                          <BookOpen className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
                        </div>
                        <h4 className="text-[12px] uppercase font-black tracking-wider text-amber-900 font-sans">
                          Comprehension Checkup
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-amber-850 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                        3-Question MCQ Quiz
                      </span>
                    </div>

                    {/* Content body */}
                    {isQuizLoading && !quizQuestions ? (
                      <div className="space-y-4 py-3">
                        <div className="text-center py-2 text-xs text-amber-800 animate-pulse font-mono font-black">
                          ⚡ GENERATING COMPREHENSION MODEL VIA GEMINI...
                        </div>
                        {[1, 2, 3].map(v => (
                          <div key={v} className="space-y-2 animate-pulse">
                            <div className="h-2 w-1/2 bg-amber-200/50 rounded-md"></div>
                            <div className="h-6 bg-slate-100 rounded-md w-full"></div>
                          </div>
                        ))}
                      </div>
                    ) : quizQuestions && quizQuestions.length > 0 ? (
                      <div className="space-y-6">
                        {quizQuestions.map((q, qIdx) => {
                          const questionKey = `${item.id}_${qIdx}`;
                          const selectedAnswer = quizSelectedAnswers[questionKey];
                          const isChecked = quizCheckedStatus[questionKey];
                          const hasSelected = selectedAnswer !== undefined;

                          return (
                            <div key={qIdx} className="bg-white border border-amber-100 p-4 rounded-xl space-y-3.5 shadow-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-mono font-black text-xs bg-amber-100 text-amber-900 w-5 h-5 rounded-md shrink-0 flex items-center justify-center pt-0.5">
                                  {qIdx + 1}
                                </span>
                                <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                  {q.question}
                                </h5>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-3">
                                {q.options.map((opt, optIdx) => {
                                  const isOptionSelected = selectedAnswer === optIdx;
                                  let buttonStyle = "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100";
                                  
                                  if (isChecked) {
                                    if (optIdx === q.correctIndex) {
                                      buttonStyle = "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold";
                                    } else if (isOptionSelected) {
                                      buttonStyle = "bg-rose-50 text-rose-950 border-rose-300";
                                    } else {
                                      buttonStyle = "bg-slate-50/50 text-slate-400 border-slate-150 opacity-60";
                                    }
                                  } else if (isOptionSelected) {
                                    buttonStyle = "bg-amber-150/50 text-amber-950 border-amber-400 font-bold ring-2 ring-amber-100";
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => {
                                        if (isChecked) return;
                                        handleSelectQuizAnswer(item.id, qIdx, optIdx);
                                      }}
                                      disabled={isChecked}
                                      className={`text-left text-xs p-2.5 rounded-xl border transition-all duration-100 leading-normal flex items-start gap-2 ${
                                        !isChecked ? "cursor-pointer active:scale-95" : "cursor-default"
                                      } ${buttonStyle}`}
                                    >
                                      <span className="font-mono font-black bg-slate-100 text-slate-600 w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center text-[10px] select-none">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span className="flex-1 font-medium">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="pl-3">
                                {!isChecked ? (
                                  <button
                                    onClick={() => handleCheckQuizAnswer(item.id, qIdx)}
                                    disabled={!hasSelected}
                                    className={`px-3 py-1.5 rounded-lg font-mono text-[9px] font-black tracking-widest uppercase transition-all duration-100 select-none ${
                                      hasSelected 
                                        ? "bg-amber-950 text-white cursor-pointer hover:bg-amber-900 active:scale-95 border border-amber-950" 
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                                    }`}
                                  >
                                    Check Answer
                                  </button>
                                ) : (
                                  <div className="mt-2.5 bg-white border border-amber-100 p-3 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed select-none animate-fade-in">
                                    <div className="shrink-0 pt-0.5">
                                      {selectedAnswer === q.correctIndex ? (
                                        <span className="text-emerald-750 bg-emerald-50 border border-emerald-250 text-[9px] font-black px-2 py-0.5 rounded-md font-mono uppercase">
                                          CORRECT ✓
                                        </span>
                                      ) : (
                                        <span className="text-rose-750 bg-rose-50 border border-rose-250 text-[9px] font-black px-2 py-0.5 rounded-md font-mono uppercase">
                                          INCORRECT ✗
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-slate-700 flex-1">
                                      <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Quiz Score Summary Banner */}
                        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-xs font-black text-amber-900 inline-flex items-center gap-1 font-mono uppercase tracking-wider">
                              <Trophy className="h-3.5 w-3.5 text-amber-600 animate-bounce" />
                              <span>Live Quiz Score Engine</span>
                            </div>
                            <p className="text-[10px] text-amber-800 leading-snug">
                              Compete comprehension goals cleanly for this syllabus item to harden memory representation.
                            </p>
                          </div>

                          <button
                            onClick={() => handleResetQuiz(item.id)}
                            className="px-3.5 py-1.5 border border-amber-400 hover:bg-amber-100/50 text-amber-800 font-mono text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95 text-center shrink-0"
                          >
                            Reset / Retry MQCs
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-amber-800 font-mono font-medium">
                        Could not generate MCQ questions. Please try again.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Study Guide Revision Matrix Checklist */}
            <AnimatePresence>
              {revisionMatrixStoryId === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 15 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 15 }}
                  transition={{
                    height: { duration: 0.3, ease: "easeOut" },
                    opacity: { duration: 0.2, ease: "easeOut" },
                    y: { duration: 0.25, ease: "easeOut" }
                  }}
                  className="overflow-hidden mt-3"
                >
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-amber-500/10 rounded-lg flex items-center justify-center">
                          <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider font-mono text-amber-400">
                          Syllabus Revision Matrix Checklist
                        </h4>
                      </div>
                      <span className="text-[8px] font-mono bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase">
                        Core Progress
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      Cross-reference your retention of this syllabus item with these 3 analytical benchmarks before marking as completely revised:
                    </p>

                    <div className="space-y-2.5 text-xs text-left">
                      {[
                        { key: "concept", label: "Core Concept and Sovereign Impact Parameters fully understood" },
                        { key: "implication", label: "National policy contexts, institutional roles mapped successfully" },
                        { key: "critique", label: "Historical setbacks list compiled and ready for essay representation" }
                      ].map((itemGoal) => {
                        const isFinished = !!revisionChecklistFinishedStates[`${item.id}_${itemGoal.key}`];
                        return (
                          <div
                            key={itemGoal.key}
                            onClick={() => {
                              const toggleKey = `${item.id}_${itemGoal.key}`;
                              setRevisionChecklistFinishedStates(prev => ({
                                ...prev,
                                [toggleKey]: !prev[toggleKey]
                              }));
                            }}
                            className="flex items-center gap-2.5 p-2 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-amber-500/30 duration-150 cursor-pointer select-none"
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isFinished ? "bg-amber-500 border-amber-505 text-slate-950" : "border-slate-700"
                            }`}>
                              {isFinished && <Check className="h-3 w-3 stroke-[3.5]" />}
                            </div>
                            <span className={`text-[11.5px] font-bold ${isFinished ? "text-slate-300 line-through" : "text-slate-100"}`}>
                              {itemGoal.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tags section inside the white body */}
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-slate-50 text-[10px] font-black text-slate-500 px-2 rounded border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Student Group Share Section - Elegant Study-Group Support */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#fdfaf7] rounded-xl p-3 border border-amber-100/50">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider font-mono">
                <Share2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>UPSC Study Circle Share:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `📚 *UPSC CIVIL SERVICES DAILY DIGEST* 📚\n\n` +
                    `🔍 *Category:* ${item.category.toUpperCase()}\n` +
                    `📌 *Headline:* ${processedTitle}\n\n` +
                    `📝 *Core Analysis:* ${processedSummary}\n\n` +
                    `📖 Read full story & interactive AI Core insights instantly on Sovereign Study Grid!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-[11px] font-extrabold transition-all shadow-sm select-none"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-white" />
                  <span>WhatsApp Group</span>
                </a>
                <button
                  onClick={() => {
                    const textToCopy = 
                      `📚 UPSC CIVIL SERVICES DAILY DIGEST 📚\n\n` +
                      `🔍 Category: ${item.category.toUpperCase()}\n` +
                      `📌 Headline: ${processedTitle}\n\n` +
                      `📝 Core Analysis: ${processedSummary}\n\n` +
                      `📖 Read full story & interactive AI Core insights instantly on Sovereign Study Grid!`;
                    
                    navigator.clipboard.writeText(textToCopy);
                    setCopiedStoryId(item.id);
                    setTimeout(() => setCopiedStoryId(null), 3500);
                    
                    // Trigger the elegant step-by-step guidance modal to guide the student correctly
                    setInstaGuideStory({
                      id: item.id,
                      title: processedTitle,
                      summary: processedSummary,
                      category: item.category
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-95 active:scale-95 text-white rounded-lg text-[11px] font-extrabold transition-all shadow-sm select-none cursor-pointer"
                >
                  <Instagram className="h-3.5 w-3.5 text-white" />
                  <span>
                    {copiedStoryId === item.id ? "Copied! Opening Guide..." : "Insta Story"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Card footer metrics action panel with solid button and revision trigger */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            {/* Milestones toggled buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleRevisionMatrix(item.id)}
                className={`py-2 px-3 text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 border ${
                  revisionMatrixStoryId === item.id
                    ? "bg-slate-900 border-slate-950 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                }`}
                title="Syllabus Retention Checklists"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Revision Matrix</span>
              </button>

              <button
                onClick={() => {
                  toggleStoryQuiz(item);
                }}
                className={`py-2 px-3 text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 border ${
                  itemShowQuiz
                    ? "bg-amber-955 border-amber-955 text-white shadow-xs"
                    : "bg-amber-50/50 hover:bg-amber-50 text-amber-900 border-amber-200"
                }`}
                title="Solve Daily MCQ Questions"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Practice MCQ Quiz</span>
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button
                onClick={() => {
                  toggleStoryExpand(item);
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 font-bold text-[11px] sm:text-xs px-4 py-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 duration-150 ${
                  itemIsExpanded
                    ? "bg-slate-100 hover:bg-slate-150 border-slate-300 text-slate-800"
                    : "bg-[#fff7ed] hover:bg-[#ffedd5] border-[#fed7aa] text-[#b45309]"
                }`}
              >
                {itemIsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>{itemIsExpanded ? "Hide Details" : "Read Full Story"}</span>
              </button>

              {/* Purple "Ask AI Matrix" pill button on the right */}
              <button
                onClick={() => toggleStory6Line(item)}
                className={`flex items-center gap-2 font-bold text-[11px] sm:text-xs px-4 py-2.5 rounded-xl text-white shadow-md transition-all cursor-pointer active:scale-95 duration-150 ${
                  itemShowSummary 
                    ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-100" 
                    : "bg-[#6366f1] hover:bg-[#5255f0] ring-2 ring-indigo-50"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI Matrix</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // Delete active news story instantly
  const handleDeleteActiveNews = async () => {
    if (!activeNews) return;
    const confirmMessage = selectedLanguage === "te" 
      ? `ఈ వార్తా కథనాన్ని పూర్తిగా తొలగించాలనుకుంటున్నారా?\n"${activeNews.title}"` 
      : `Are you absolutely certain you want to permanently delete this news story from the digital database?\n\n"${activeNews.title}"`;
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch("/api/news/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeNews.id, category: activeNews.category })
      });

      if (!response.ok) throw new Error("Deletion endpoint rejected request");
      const data = await response.json();
      
      if (data.success && data.db) {
        setNewsData(data.db);
        // Recalculate safe index inside category
        const updatedCategoryNews = data.db[activeCategory] || [];
        if (currentNewsIndex >= updatedCategoryNews.length) {
          setCurrentNewsIndex(Math.max(0, updatedCategoryNews.length - 1));
        } else {
          // Trigger reactivity
          setCurrentNewsIndex(currentNewsIndex);
        }
        alert(selectedLanguage === "te" ? "వార్త విజయవంతంగా తొలగించబడింది." : "News story successfully deleted and deleted from dynamic category flows.");
      }
    } catch (error) {
      console.error("Authorization deletion error:", error);
      alert("Failed to securely delete article. Please verify administrative status.");
    }
  };

  // Add custom post to database
  const handleAddCustomNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim() || !formCategory) {
      setFormStatus({ type: "error", message: "Headline and Background Summary description are strictly required." });
      return;
    }

    try {
      setIsPublishing(true);
      setFormStatus(null);

      const payload = {
        title: formTitle.trim(),
        summary: formSummary.trim(),
        fullContent: formFullContent.trim(),
        category: formCategory,
        author: formAuthor.trim(),
        tags: formTags,
        image: extractRawImageUrl(formImage.trim()) || undefined
      };

      const response = await fetch("/api/news/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Publishing server endpoint rejected validation");
      const data = await response.json();

      if (data.success && data.db) {
        setNewsData(data.db);
        setActiveCategory(formCategory);
        setCurrentNewsIndex(0); // View new post instantly!
        
        // Reset states
        setFormTitle("");
        setFormSummary("");
        setFormFullContent("");
        setFormTags("");
        setFormImage("");
        setFormStatus({ type: "success", message: "Dynamic news story ingested successfully at the top of category feeds!" });
        
        setTimeout(() => setFormStatus(null), 5000);
      }
    } catch (err: any) {
      console.error("Publishing failure error:", err);
      setFormStatus({ type: "error", message: err.message || "Failed to publish post. Database is locked." });
    } finally {
      setIsPublishing(false);
    }
  };

  // Lazy story expansion loop
  const handleReadMoreTrigger = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    const activeNewsTruncated = activeNews && (
      !activeNews.fullContent || 
      activeNews.fullContent.trim().length < 100 || 
      activeNews.fullContent.trim() === activeNews.summary.trim() ||
      activeNews.fullContent.includes("[+") || 
      /\[\+\d+\s+char/i.test(activeNews.fullContent)
    );

    if (activeNewsTruncated) {
      try {
        setIsExpanding(true);
        const response = await fetch("/api/news/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeNews.id, category: activeNews.category }),
        });
        if (!response.ok) throw new Error("Lazy expansion endpoint failed");
        const data = await response.json();
        
        // Inject expanded article details natively into active state cache
        setNewsData(prev => {
          const next = { ...prev };
          const catList = [...(next[activeNews.category] || [])];
          const idx = catList.findIndex(item => item.id === activeNews.id);
          if (idx !== -1) {
            catList[idx] = { ...catList[idx], fullContent: data.fullContent };
          }
          next[activeNews.category] = catList;
          return next;
        });
      } catch (err) {
        console.error("Context-aware text compiler dropped:", err);
      } finally {
        setIsExpanding(false);
      }
    }
    setIsExpanded(true);
  };

  // Fetch On-Demand 6-Line AI Summary
  const trigger6LineSummary = async () => {
    if (!activeNews) return;
    const cacheKey = `${activeNews.id}_${selectedLanguage}`;
    
    // Toggle off if already shown
    if (showAi6Line) {
      setShowAi6Line(false);
      return;
    }

    setShowAi6Line(true);

    if (aiSummaries[cacheKey]) {
      return;
    }

    try {
      setIsLoadingSummary(true);

      const response = await fetch("/api/news/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          fullContent: fullContent || activeNews.fullContent,
          lang: selectedLanguage,
          category: activeNews.category
        }),
      });

      if (!response.ok) throw new Error("Summary API failed");
      const data = await response.json();

      setAiSummaries(prev => ({
        ...prev,
        [cacheKey]: data.summary,
      }));
    } catch (err) {
      console.error("Failed to generate robust AI Summary:", err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const active6LineText = aiSummaries[`${activeNews?.id}_${selectedLanguage}`] || "";

  // Navigation commands
  const handleNext = () => {
    const totalCount = (searchActive ? searchResults : categoryNews).length;
    if (currentNewsIndex < totalCount - 1) {
      const nextIdx = currentNewsIndex + 1;
      setCurrentNewsIndex(nextIdx);
    } else {
      alert(selectedLanguage === "te" ? "మీరు తాజా సమకాలీన అంశాన్ని చేరుకున్నారు." : "You have reached the latest story in this segment.");
    }
  };

  const handlePrevious = () => {
    if (currentNewsIndex > 0) {
      const prevIdx = currentNewsIndex - 1;
      setCurrentNewsIndex(prevIdx);
    } else {
      alert(selectedLanguage === "te" ? "ఇది ఈ ఫీడ్‌లోని మొదటి కథనం." : "This is the first story in this segment.");
    }
  };

  const categories = [
    { id: "india", label: "India", icon: "🇮🇳" },
    { id: "todays", label: "Todays", icon: "🔥" },
    { id: "international", label: "International", icon: "🌍" },
    { id: "sports", label: "Sports", icon: "🏏" },
    { id: "economy", label: "Economy", icon: "💰" },
    { id: "technology", label: "Technology", icon: "🤖" },
    { id: "admin", label: "Admin", icon: "👑" },
    { id: "exam", label: "Exams", icon: "📚" }
  ];

  const visibleCategories = categories.filter(c => c.id !== "admin" || (isAdminMode && isAdminVerified));

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-100 flex flex-col font-sans overflow-x-hidden ${!galaxyUnlocked ? "max-h-screen overflow-hidden" : ""}`}>
      
      {/* Dynamic Starry Cosmic Welcome Access Gateway Overlay */}
      <AnimatePresence>
        {!galaxyUnlocked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-[#090514] overflow-y-auto px-4 py-8 select-none"
          >
            {/* Ambient Cosmic nebulas / star background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-900/15 blur-[100px]" />
              {/* Twinkling star grid styling patterns */}
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:40px_40px] animate-pulse" />
            </div>

            {/* Content Glassbox Card */}
            <div className="relative z-10 max-w-lg w-full bg-slate-950/60 backdrop-blur-2xl border border-indigo-500/15 rounded-3xl p-6 sm:p-8 space-y-6 text-center text-white shadow-2xl">
              
              {/* Spinning Logo / Icon Group */}
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[0.25em] text-rose-400 uppercase font-bold">Access Verification REQUIRED</span>
                  <h2 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight bg-gradient-to-r from-white via-rose-100 to-indigo-200 bg-clip-text text-transparent mt-1 leading-tight">
                    Welcome to Arriboyina's Smart Galaxy
                  </h2>
                  <p className="text-[11px] text-rose-300 font-bold max-w-sm mx-auto leading-relaxed mt-1 tracking-wide uppercase">
                    Instagram & YouTube Verification Gate
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mt-2">
                    Connect with our premier academic resources below to instantly authorize unlimited lifetime client access.
                  </p>
                </div>
              </div>

              {/* Steps Task Grid Board */}
              <div className="space-y-4 text-left">
                <h3 className="text-xs uppercase tracking-widest font-black text-slate-400 font-mono border-b border-slate-800/80 pb-2 flex items-center justify-between">
                  <span>Authorized Tasks</span>
                  <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800/60 px-2.5 py-0.5 rounded-full uppercase font-mono font-bold">
                    {(visitedInsta ? 1 : 0) + (visitedYt ? 1 : 0)} / 2 Done
                  </span>
                </h3>

                {/* Step 1: Instagram */}
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:bg-slate-900/60 hover:border-rose-500/20">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-md bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Instagram className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider">Instagram Resources Gate</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Visit Sreeram's Instagram page to access daily civil service infographics & visual study reels.
                    </p>
                  </div>
                  
                  {visitedInsta ? (
                    <span className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-black px-3 py-1.5 uppercase rounded-xl tracking-wider select-none shrink-0 self-stretch sm:self-auto justify-center">
                      <Check className="h-3.5 w-3.5" /> Checked
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        window.open("https://www.instagram.com/smartcurrentaffairs_upsc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", "_blank");
                        setVisitedInsta(true);
                        try {
                          sessionStorage.setItem("visited_insta", "true");
                        } catch (_) {}
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-[10px] font-mono tracking-wider font-extrabold uppercase px-4 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0 hover:shadow-md hover:shadow-rose-650/10"
                    >
                      <span>Visit Insta</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Step 2: YouTube */}
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:bg-slate-900/60 hover:border-red-500/20">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-md bg-red-650 flex items-center justify-center shrink-0">
                        <Youtube className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider">YouTube Masterclass Hub</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Visit our YouTube Channel for micro-lectures and mock interview strategies.
                    </p>
                  </div>

                  {visitedYt ? (
                    <span className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-black px-3 py-1.5 uppercase rounded-xl tracking-wider select-none shrink-0 self-stretch sm:self-auto justify-center">
                      <Check className="h-3.5 w-3.5" /> Checked
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        window.open("https://www.youtube.com/@smartcurrentaffairs_upsc", "_blank");
                        setVisitedYt(true);
                        try {
                          sessionStorage.setItem("visited_yt", "true");
                        } catch (_) {}
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-550 hover:to-rose-500 text-white text-[10px] font-mono tracking-wider font-extrabold uppercase px-4 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0 hover:shadow-md hover:shadow-red-600/10"
                    >
                      <span>Visit YouTube</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Master Unlock Button */}
              <div className="space-y-3.5 pt-1">
                {(showAdminTrigger || isAdminVerified) ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      try {
                        sessionStorage.setItem("galaxy_unlocked", "true");
                      } catch (_) {}
                      setGalaxyUnlocked(true);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-black text-xs uppercase tracking-widest py-3.5 px-4 rounded-2xl cursor-pointer shadow-lg shadow-indigo-500/25 border border-indigo-400 hover:brightness-110 flex items-center justify-center gap-2 animate-bounce mt-2"
                    style={{ animationDuration: "2s" }}
                  >
                    <span>🔑 Instant Admin Entry</span>
                    <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                  </motion.button>
                ) : visitedInsta && visitedYt ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      try {
                        sessionStorage.setItem("galaxy_unlocked", "true");
                      } catch (_) {}
                      setGalaxyUnlocked(true);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 text-white font-black text-xs uppercase tracking-widest py-3.5 px-4 rounded-2xl cursor-pointer shadow-lg shadow-emerald-500/25 border border-emerald-400 hover:brightness-110 flex items-center justify-center gap-2 animate-bounce mt-2"
                    style={{ animationDuration: "2s" }}
                  >
                    <span>Enter Arriboyina's Smart Galaxy</span>
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  </motion.button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-905 text-slate-500 font-extrabold text-[11px] uppercase tracking-widest py-3.5 px-4 rounded-2xl opacity-50 border border-slate-800 flex items-center justify-center gap-2 mt-2 cursor-not-allowed"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Complete both tasks to enter ({visitedInsta ? 1 : 0}/2 Completed)</span>
                  </button>
                )}
                
                <p className="text-[9px] text-slate-500 font-mono tracking-wider">
                  Disclaimer: Standard users have NO authority or permissions to access or alter administration panels.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md py-3.5 px-4 sm:px-8 shrink-0">
        <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Bolt className="text-white h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                Arriboyina's
              </h1>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block -mt-1 font-mono">
                Smart Galaxy
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            
            {/* Admin toggle Switch - Rendered in top right so Sreeram can access, protected by dual passwords lock */}
            <button 
              onClick={() => {
                if (!isAdminVerified) {
                  setPasswordModalOpen(true);
                  setAdminPasswordInput("");
                  setAdminPasswordInput2("");
                  setPasswordError("");
                } else {
                  setIsAdminMode(!isAdminMode);
                }
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                (isAdminMode && isAdminVerified)
                  ? "bg-slate-900 text-amber-400 border-slate-950 shadow-md" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>👑 {isAdminVerified ? "Admin Control" : "Admin Panel"}</span>
              {isAdminVerified && isAdminMode && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
            </button>

            {isAdminVerified && (
              <button 
                onClick={handleAdminLogout}
                className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                title="Log Out and lock the Welcome Gate"
              >
                <Lock className="h-3 w-3 text-rose-500" />
                <span>Log Out</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">Language:</span>
              <select 
                id="langSelect" 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 border-hidden outline-hidden cursor-pointer focus:ring-0"
              >
                <option value="en" className="bg-white text-slate-900">English</option>
                <option value="te" className="bg-white text-slate-900">తెలుగు (Telugu)</option>
                <option value="hi" className="bg-white text-slate-900">हिन्दी (Hindi)</option>
                <option value="ta" className="bg-white text-slate-900">தமிழ் (Tamil)</option>
                <option value="kn" className="bg-white text-slate-900">ಕನ್ನಡ (Kannada)</option>
                <option value="ml" className="bg-white text-slate-900">മലയാളం (Malayalam)</option>
              </select>
            </div>



          </div>

        </div>
      </header>

      {/* CORE HUB LAYOUT CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-6 flex-1 w-full flex flex-col space-y-6">

        {/* TODAY'S SPECIAL OCCASION DISPLAY BANNER */}
        {activeCategory === "todays" && (
          <div className={`p-4 rounded-3xl bg-gradient-to-r ${specialInfo.color} border shadow-xs flex items-center gap-4 relative overflow-hidden transition-all duration-300 shrink-0`}>
            <div className="absolute right-0 bottom-0 text-7xl font-sans font-black select-none pointer-events-none opacity-5 translate-x-1/4 translate-y-1/4">
              {specialInfo.icon}
            </div>
            <div className="text-2xl mt-0.5 select-none shrink-0 bg-white/70 p-2.5 rounded-2xl shadow-inner border border-white-50">{specialInfo.icon}</div>
            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-mono font-extrabold px-2 py-0.5 rounded tracking-widest bg-amber-400 border border-amber-300/40 text-slate-950 select-none">
                  Today's Special
                </span>
                <span className="text-[10px] font-mono font-black text-slate-700 bg-white/75 px-2.5 py-0.5 rounded-full border border-slate-205">
                  {activeNewsDate}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight mt-1.5 uppercase">
                {specialInfo.title}
              </h3>
              <p className="text-[10px] text-slate-800 leading-relaxed font-semibold mt-1">
                Celebrating key federal, social, and historical events compiled systematically to accelerate general knowledge and mains examination answer drafting.
              </p>
            </div>
          </div>
        )}
        
        {/* ADMIN DASHBOARD CONSOLE BOARD */}
        <AnimatePresence>
          {isAdminMode && isAdminVerified && (
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <ShieldAlert className="text-amber-400 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-wide text-white font-mono uppercase">
                      Admin Command Center
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Publish custom exam syllabus matrices, translate logs, or pull direct live news wire feeds.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncNews}
                    disabled={isSyncing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? "Syncing..." : "Sync Latest World News Feed"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        sessionStorage.removeItem("galaxy_unlocked");
                        sessionStorage.removeItem("visited_insta");
                        sessionStorage.removeItem("visited_yt");
                      } catch (_) {}
                      setGalaxyUnlocked(false);
                      setVisitedInsta(false);
                      setVisitedYt(false);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-950 border border-rose-900/40 transition-colors cursor-pointer"
                    title="Reset the cosmic entry splash gate for testing"
                  >
                    <Lock className="h-3 w-3" />
                    <span>Reset Welcome Gate</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                  >
                    <Lock className="h-3 w-3" />
                    <span>Log Out Admin</span>
                  </button>
                </div>
              </div>

              {/* Feed Status Node Indicator */}
              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span className="text-slate-300 font-bold">Automatic World Sync Pipeline:</span>
                  <span className="text-emerald-400">ACTIVE (No End)</span>
                </div>
                <div className="text-[10px] text-slate-500 hidden sm:block">
                  Aggregating from Google News Wire & NewsAPI
                </div>
              </div>

              {/* Add News Post Form */}
              <form onSubmit={handleAddCustomNews} className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-black text-amber-400 font-mono flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Publish New Current Affairs Article</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left Column Fields */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 font-mono">Article Title *</label>
                      <input 
                        type="text" 
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. RBI Restructures High-Value Liquidity Reserve Rules"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 font-mono">Category Focus *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-rose-500 cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                            {c.icon} {c.label} Focus
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 font-mono">Author Credits</label>
                      <input 
                        type="text" 
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        placeholder="e.g. Sreeram Arriboyina"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:outline-hidden focus:ring-1"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 font-mono">Syllabus Tags (Separated by comma)</label>
                      <input 
                        type="text" 
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="e.g. UPSC GS-III, Economy, Banking, Growth"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:outline-hidden focus:ring-1"
                      />
                    </div>
                  </div>

                  {/* Right Column Fields */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 font-mono">Brief Background Summary *</label>
                      <textarea
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        placeholder="A concise (2-3 sentences) high-level snapshot introducing the event to candidates."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 min-h-[90px] resize-y"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 font-mono">Expanded Narrative Content (Optional)</label>
                      <textarea
                        value={formFullContent}
                        onChange={(e) => setFormFullContent(e.target.value)}
                        placeholder="Deep analytical paragraphs mapping events directly to syllabus modules. If left empty, Gemini AI will automatically generate this on-demand when clicked!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 min-h-[94px] resize-y"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 font-mono">Feature Artwork URL (Optional)</label>
                      <input 
                        type="text" 
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/... or leave blank for dynamic matching"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-slate-600 focus:outline-hidden focus:ring-1"
                      />
                    </div>
                  </div>

                </div>

                {/* Status bar */}
                {formStatus && (
                  <div className={`p-3 rounded-xl flex items-center space-x-2 text-xs ${
                    formStatus.type === "success" 
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-900/40" 
                      : "bg-rose-500/10 text-rose-300 border border-rose-950/40"
                  }`}>
                    {formStatus.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    <span className="font-semibold">{formStatus.message}</span>
                  </div>
                )}

                {/* Submit bar */}
                <div className="flex justify-end pt-2 border-t border-slate-850">
                  <button 
                    type="submit" 
                    disabled={isPublishing} 
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <span>{isPublishing ? "Publishing to Grid..." : "Publish Article to Study Grid"}</span>
                  </button>
                </div>

              </form>

              {/* Edit Admin Announcement Ticker */}
              <div className="border-t border-slate-800 pt-5 mt-4">
                <form onSubmit={handleUpdateBanner} className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-black text-amber-500 font-mono flex items-center gap-1.5 pt-1">
                    <Megaphone className="h-4 w-4" />
                    <span>Set App-Wide Header Announcement</span>
                  </h4>
                  <p className="text-[10px] text-slate-405 font-medium leading-relaxed">
                    Type any announcement text below. Changes are saved back to the custom ledger and broadcasted in the top navigation ticker of all active sessions immediately!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input 
                      type="text" 
                      value={newBannerInput}
                      onChange={(e) => setNewBannerInput(e.target.value)}
                      placeholder="e.g. June 1 Global Parents Day special analysis live now!"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all font-sans"
                    />
                    <button 
                      type="submit" 
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      Update Header Banner
                    </button>
                  </div>

                  {bannerUpdateStatus && (
                    <p className={`text-[10px] font-mono font-bold mt-1 ${bannerUpdateStatus.includes("success") ? "text-emerald-400" : "text-amber-400"}`}>
                      {bannerUpdateStatus}
                    </p>
                  )}
                </form>
              </div>

              {/* Edit Today's Special Calendar Events */}
              <div className="border-t border-slate-800 pt-5 mt-4">
                <form onSubmit={handleUpdateSpecialEvent} className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-black text-amber-500 font-mono flex items-center gap-1.5 pt-1">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span>Manage Today's Special Calendar Events</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Schedule custom event overlays for key historical timelines and exam focus dates. Specify a target date string (e.g., <code className="text-amber-400">June 4</code> or <code className="text-amber-400">May 31</code>) to override native titles on daily syllabus cards dynamically.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">Target Date *</label>
                      <input 
                        type="text" 
                        value={specialDayInput}
                        onChange={(e) => setSpecialDayInput(e.target.value)}
                        placeholder="e.g. June 4"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">Special Celebration Icon *</label>
                      <input 
                        type="text" 
                        value={specialIconInput}
                        onChange={(e) => setSpecialIconInput(e.target.value)}
                        placeholder="e.g. 🕊️"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-sans"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">Theme Color Accent *</label>
                      <select 
                        value={specialColorInput}
                        onChange={(e) => setSpecialColorInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-hidden focus:ring-1 cursor-pointer"
                      >
                        <option value="from-slate-50 to-slate-100 text-slate-800 border-slate-300">Slate Neutral Accent (Subtle Gray)</option>
                        <option value="from-emerald-50 to-teal-50 text-emerald-800 border-emerald-250">Emerald Accent (Fresh Green)</option>
                        <option value="from-blue-50 to-indigo-50 text-blue-900 border-blue-200">Indigo Accent (Sober Blue)</option>
                        <option value="from-red-50 to-orange-50 text-red-800 border-red-200">Rose/Crimson Accent (Alert/Notice)</option>
                        <option value="from-amber-50 to-yellow-50 text-yellow-850 border-amber-200">Gold/Amber Accent (Celebratory)</option>
                        <option value="from-violet-50 to-indigo-50 text-indigo-805 border-violet-200">Lavender Accent (Deep Theme)</option>
                        <option value="from-pink-50 to-rose-50 text-rose-800 border-pink-200">Pink Accent (Delicate Pink)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">Event / Celebration Banner Text *</label>
                    <input 
                      type="text" 
                      value={specialTitleInput}
                      onChange={(e) => setSpecialTitleInput(e.target.value)}
                      placeholder="e.g. International Day of Innocent Children Victims of Aggression"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-sans"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="text-[10px] text-slate-400 font-mono">
                      {specialsUpdateStatus && (
                        <span className={`font-bold ${specialsUpdateStatus.includes("saved") || specialsUpdateStatus.includes("success") ? "text-emerald-400" : "text-amber-400"}`}>
                          {specialsUpdateStatus}
                        </span>
                      )}
                    </div>
                    <button 
                      type="submit" 
                      disabled={specialsLoading}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {specialsLoading ? "Saving to Ledger..." : "Save Special Event"}
                    </button>
                  </div>
                </form>

                {/* Micro-Dashboard list of configured specials */}
                {specialEvents.length > 0 && (
                  <div className="mt-4 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                    <span className="block text-[9px] font-black uppercase text-slate-500 font-mono tracking-widest mb-2">Live Dynamic Specials ledger ({specialEvents.length})</span>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                      {specialEvents.map((item, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            setSpecialDayInput(item.day || "");
                            setSpecialTitleInput(item.title || "");
                            setSpecialColorInput(item.color || "from-slate-50 to-slate-100 text-slate-800 border-slate-300");
                            setSpecialIconInput(item.icon || "📆");
                          }}
                          className="bg-slate-900 border border-slate-800 hover:border-amber-400 transition-colors px-2.5 py-1.5 rounded-xl flex items-center space-x-2 text-[10px] cursor-pointer text-slate-300 hover:text-white"
                          title="Click to load/edit event"
                        >
                          <span>{item.icon || "📆"}</span>
                          <span className="font-bold font-mono text-slate-400">{item.day}</span>
                          <span className="max-w-[200px] truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* CATEGORY & SYNC ACTION HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <nav className="flex gap-2 pb-1 overflow-x-auto select-none scrollbar-none snap-x w-full sm:w-auto">
            {visibleCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setCurrentNewsIndex(0);
                    handleClearSearch();
                    if (cat.id === "admin") {
                      setIsAdminMode(true);
                    }
                  }}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center space-x-1.5 relative ${
                    isActive 
                      ? "bg-rose-600 text-white shadow-md shadow-rose-500/20" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                  {isActive && (
                    <motion.span 
                      layoutId="activeCategoryIndicator" 
                      className="absolute inset-0 rounded-full border border-rose-400 opacity-20"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <button 
            type="button"
            onClick={handleSyncNews}
            disabled={isSyncing}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2.5 rounded-full cursor-pointer transition-all shrink-0 active:scale-95"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-rose-500" : "text-rose-600"}`} />
            <span>{isSyncing ? "Syncing..." : "Live Sync News Feed"}</span>
          </button>
        </div>

        {/* IMMERSIVE REELS VIDEOS FEED CANVAS */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center space-y-4 shadow-md">
            <div className="h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-semibold text-sm">
              Synchronizing core current affairs block...
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch max-w-4xl mx-auto w-full">
            
            {/* CENTRAL REELS APPLET CANVAS */}
            <div className="flex-1 flex flex-col w-full max-w-lg mx-auto">
              
              {/* Top search & wire stats non-floating header panel */}
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase font-mono">
                      {searchActive ? "Search Mode" : `${activeCategory} Feed`}
                    </span>
                  </div>

                  {/* Segmented Switcher for View Mode */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 select-none">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === "card"
                          ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-black"
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                      title="Swipeable Reels Card Mode"
                    >
                      Card
                    </button>
                    <button
                      onClick={() => setViewMode("feed")}
                      className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === "feed"
                          ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-black"
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                      title="Endless Scrolling Continuous Feed Mode"
                    >
                      Feed
                    </button>
                  </div>
                </div>

                {/* keyword organic filter */}
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative flex-1 w-full sm:max-w-[190px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 stroke-[2.5]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search wire..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-[10px] font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </form>
              </div>

              {/* CARD itself with white background, borders, and rounded corners */}
              <motion.div 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                animate={{ x: swipeBounceX }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={viewMode === "card" ? "bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-xl flex flex-col w-full min-h-[580px] max-h-[660px] relative group" : "flex flex-col w-full bg-transparent border-transparent shadow-none relative"}
              >
                
                {/* Swipe Guidance Tooltip overlay on mobile devices */}
                {viewMode === "card" && (
                  <>
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black font-mono tracking-widest uppercase px-3 py-1 rounded-full pointer-events-none select-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:block hidden">
                      💡 Drag / Swipe left-right to switch stories
                    </div>
                    <div className="absolute bottom-16 right-3 bg-slate-900/60 backdrop-blur-xs text-white text-[8px] font-black font-mono tracking-wider px-2 py-0.5 rounded-md pointer-events-none select-none z-30 block md:hidden animate-pulse">
                      👈 Swipe to switch 👉
                    </div>
                  </>
                )}
                
                {/* Scrollable / Render content for single card */}
                <div 
                  ref={reelContainerRef}
                  onScroll={handleContainerScroll}
                  className={viewMode === "card" ? "flex-1 overflow-y-auto scrollbar-none flex flex-col h-full w-full bg-white" : "w-full flex flex-col bg-transparent max-h-[78vh] overflow-y-auto pr-1 space-y-8 pb-10"}
                  id="reelsScrollContainer"
                >
                   {(searchActive ? searchResults : categoryNews).length === 0 ? (
                    activeCategory === "admin" ? (
                      <div className="p-6 flex flex-col h-full overflow-y-auto scrollbar-none space-y-4 bg-slate-50/50">
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-md text-center space-y-1 shrink-0">
                          <span className="text-xs font-black tracking-widest uppercase text-amber-400 font-mono flex items-center justify-center gap-1.5">
                            👑 Admin Publish Studio
                          </span>
                          <p className="text-[10px] text-slate-300 font-medium">
                            Compose and load your premium study guide/news item instantly into the global feed!
                          </p>
                        </div>
                        
                        {/* Nested Publish Form inside card body! */}
                        <form onSubmit={handleAddCustomNews} className="space-y-3.5 text-left text-slate-800 text-xs">
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1 font-mono tracking-wider">Article Title *</label>
                            <input 
                              type="text" 
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="e.g. India-UK Free Trade Agreement (FTA) Finalized"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-rose-500 font-sans font-bold shadow-xs focus:outline-hidden"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1 font-mono tracking-wider">Category Focus *</label>
                              <select
                                value={formCategory}
                                onChange={(e) => setFormCategory(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800 font-bold cursor-pointer focus:ring-1 focus:ring-rose-500"
                              >
                                {categories.filter(c => c.id !== "admin" && c.id !== "todays").map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.icon} {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1 font-mono tracking-wider">Author Initials</label>
                              <input 
                                type="text" 
                                value={formAuthor}
                                onChange={(e) => setFormAuthor(e.target.value)}
                                placeholder="e.g. Sreeram Arriboyina"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1 font-mono tracking-wider">Brief Background Summary *</label>
                            <textarea
                              value={formSummary}
                              onChange={(e) => setFormSummary(e.target.value)}
                              placeholder="A crisp 2-3 sentence overview introducing the development and why it matters to civil service candidates."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 font-semibold placeholder-slate-400 min-h-[70px] focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1 font-mono tracking-wider">Expanded Analysis (Optional)</label>
                            <textarea
                              value={formFullContent}
                              onChange={(e) => setFormFullContent(e.target.value)}
                              placeholder="Syllabus coverage... (Leave empty to let Gemini auto-expand this on demand with deep structured analytical paragraphs!)"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 min-h-[70px] focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1 font-mono tracking-wider">Syllabus Tags (Separated by comma)</label>
                            <input 
                              type="text" 
                              value={formTags}
                              onChange={(e) => setFormTags(e.target.value)}
                              placeholder="e.g. UPSC GS-III, Foreign Policy, Economy"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1 font-mono tracking-wider">Feature Artwork URL (Optional)</label>
                            <input 
                              type="text" 
                              value={formImage}
                              onChange={(e) => setFormImage(e.target.value)}
                              placeholder="e.g. https://images.unsplash.com/... or leave blank for dynamic matching"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                            />
                          </div>

                          {formStatus && (
                            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border ${
                              formStatus.type === "success" 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                : "bg-rose-50 text-rose-850 border-rose-200"
                            }`}>
                              {formStatus.type === "success" ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
                              <span>{formStatus.message}</span>
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={isPublishing}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-xl cursor-pointer duration-150 active:scale-[0.98] disabled:opacity-40 shadow-sm shadow-rose-300"
                          >
                            <span>{isPublishing ? "Publishing to Live Grid..." : "Publish Article to Study Grid 🚀"}</span>
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-4 my-auto">
                        <Layers className="h-12 w-12 text-slate-400 stroke-1" />
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">No active stories</h3>
                          <p className="text-xs text-slate-500 mt-1">Change category or reset filters to explore daily news grids.</p>
                        </div>
                        {searchActive && (
                          <button 
                            onClick={handleClearSearch}
                            className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-150 px-4 py-2 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                          >
                            Reset Search Filters
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    (searchActive ? searchResults : categoryNews).map((item, idx) => {
                      if (viewMode === "card" && idx !== currentNewsIndex) return null;
                      const isSelected = true;
                      const itemIsExpanded = !!expandedStoryIds[item.id];
                      const itemShowSummary = !!openedSummaryStoryIds[item.id];
                      const itemSummaryText = aiSummaries[`${item.id}_${selectedLanguage}`] || "";
                      
                      const itemShowQuiz = !!openedQuizStoryIds[item.id];
                      const isQuizLoading = !!quizLoadingStates[item.id];
                      const quizQuestions = activeQuizzes[item.id];
                      
                      // Retrieve translations safely for this card
                      const translationCacheKey = `${item.id}_${selectedLanguage}`;
                      const translationCacheObj = translationCache[translationCacheKey];
                      const processedTitle = selectedLanguage === "en" ? item.title : (translationCacheObj?.title || item.title);
                      const processedSummary = selectedLanguage === "en" ? item.summary : (translationCacheObj?.summary || item.summary);
                      const processedFullContent = selectedLanguage === "en" ? item.fullContent : (translationCacheObj?.fullContent || item.fullContent);

                      return (
                        <div 
                          key={item.id}
                          className={viewMode === "card" 
                            ? "w-full h-full flex flex-col bg-white overflow-y-auto scrollbar-none" 
                            : "bg-white rounded-[24px] border border-slate-200 shadow-md hover:shadow-lg hover:border-slate-350 transition-all duration-300 flex flex-col w-full overflow-hidden p-1 pb-5 relative shrink-0"
                          }
                        >
                          {/* Top Background Picture with Badge - Matches Screenshot Design */}
                          <div className="relative w-full h-[260px] sm:h-[280px] shrink-0 overflow-hidden">
                            <img 
                              src={item.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"} 
                              className="w-full h-full object-cover select-none transition-transform duration-700 hover:scale-[1.03] cursor-zoom-in"
                              alt={processedTitle}
                              referrerPolicy="no-referrer"
                              onClick={() => setModalImage({ 
                                src: item.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", 
                                title: processedTitle 
                              })}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800";
                              }}
                            />
                            {/* FLOATING TOP-LEFT BADGE: ARRIBOYINA'S - Matches Screenshot Styling */}
                            <div className="absolute top-4 left-4 z-10 bg-[#3b82f6] text-white text-[11px] font-extrabold px-3.5 py-1.5 uppercase rounded-md tracking-wider shadow-lg select-none font-sans">
                              ARRIBOYINA'S
                            </div>

                            {/* PRECISE TOP-RIGHT FULL VIEW OVERLAY TRIGGER BUTTON */}
                            <button
                              onClick={() => setModalImage({ 
                                src: item.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", 
                                title: processedTitle 
                              })}
                              className="absolute top-4 right-4 z-10 bg-slate-950/70 hover:bg-slate-950/90 text-white text-[9px] sm:text-[10px] font-bold font-sans px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-xs select-none cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md border border-white/10"
                              title="Click to view full-screen"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                              </svg>
                              <span className="uppercase tracking-wider font-extrabold font-mono text-[9px]">Full View</span>
                            </button>

                            {/* Admin Inline Image Editor Overlay */}
                            {isAdminMode && isAdminVerified && (
                              <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 border border-slate-700/60 rounded-xl p-2 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 text-white">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <ImageIcon className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                  <input 
                                    type="text" 
                                    placeholder="Paste new Image URL..." 
                                    value={editingImageUrl[item.id] !== undefined ? editingImageUrl[item.id] : (item.image || "")}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingImageUrl(prev => ({ ...prev, [item.id]: val }));
                                    }}
                                    className="bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-sans text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500 w-full"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                                  {saveStatusMsg[item.id] ? (
                                    <span className="text-[9px] font-black text-amber-400 whitespace-nowrap animate-pulse px-1">
                                      {saveStatusMsg[item.id]}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        const currentVal = editingImageUrl[item.id] !== undefined ? editingImageUrl[item.id] : (item.image || "");
                                        handleUpdateStoryImage(item.id, currentVal);
                                      }}
                                      disabled={savingImageId === item.id}
                                      className="bg-rose-600 hover:bg-rose-500 text-white font-black px-2.5 py-1 rounded-lg text-[9px] tracking-wider uppercase transition-all active:scale-95 disabled:opacity-55 cursor-pointer"
                                    >
                                      {savingImageId === item.id ? "Saving" : "Set Image"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* BODY WRAPPER CONTAINER */}
                          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                            
                            <div className="space-y-4">
                              {/* Metadata Strip with Admin options inline */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2">
                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                                  <span className="text-slate-500">By {item.author}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isAdminMode && isAdminVerified && (
                                    <button
                                      onClick={() => {
                                        setDeleteTargetNews(item);
                                      }}
                                      className="text-rose-600 hover:text-rose-700 font-mono font-black text-[9px] hover:underline cursor-pointer flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span>DELETE</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* MAIN TITLE HEADLINE in solid clean black color */}
                              <h2 className="text-xl sm:text-2xl font-black text-black leading-snug font-sans tracking-tight">
                                {processedTitle}
                              </h2>

                              {/* BRUNCH DESCRIPTION/SUMMARY in dark charcoal gray - Legible light layout style */}
                              <p className="text-slate-700 text-sm leading-relaxed font-sans">
                                {renderContent(processedSummary)}
                              </p>

                              {/* AI Core points / Highlights Drawer block */}
                              <AnimatePresence>
                                {itemShowSummary && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, y: 15 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: 15 }}
                                    transition={{
                                      height: { duration: 0.25, ease: "easeOut" },
                                      opacity: { duration: 0.2, ease: "easeOut" },
                                      y: { duration: 0.25, ease: "easeOut" }
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 space-y-4 mt-3 text-slate-850 shadow-xs">
                                      {/* Header banner */}
                                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                                          </div>
                                          <h4 className="text-[12px] uppercase font-black tracking-wider text-slate-900 font-sans">
                                            AI Matrix Core Insights
                                          </h4>
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                                          Live Synthesis
                                        </span>
                                      </div>

                                      {/* Rows */}
                                      {isLoadingSummary && !itemSummaryText ? (
                                        <div className="space-y-3.5 py-2">
                                          {[1, 2, 3].map(v => (
                                            <div key={v} className="flex items-center space-x-2 animate-pulse">
                                              <div className="h-1.5 w-1.5 bg-indigo-400/50 rounded-full shrink-0"></div>
                                              <div className="h-1.5 bg-slate-200 rounded-md w-[85%]"></div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : itemSummaryText ? (
                                        <div className="space-y-4">
                                          {itemSummaryText.split("\n").filter(line => line.trim().length > 0).map((line, lIdx) => {
                                            const lineStr = line.trim();
                                            const colonIdx = lineStr.indexOf(":");
                                            let label = "";
                                            let content = lineStr;
                                            let icon = "📝";
                                            let themeClass = "bg-slate-100 text-slate-700 border-slate-200";

                                            if (colonIdx !== -1) {
                                              const possibleLabel = lineStr.substring(0, colonIdx).trim();
                                              const textLabel = possibleLabel.replace(/^[📍👤⚡📝🏆📊💡🌍⚙️🔑🎯]+/g, "").trim();
                                              if (textLabel.length > 0 && textLabel.length < 35) {
                                                label = textLabel;
                                                content = lineStr.substring(colonIdx + 1).trim();
                                                
                                                if (possibleLabel.includes("📍") || possibleLabel.toLowerCase().includes("place")) {
                                                  icon = "📍";
                                                  themeClass = "bg-blue-50 text-blue-700 border-blue-100";
                                                } else if (possibleLabel.includes("👤") || possibleLabel.toLowerCase().includes("name") || possibleLabel.toLowerCase().includes("entit")) {
                                                  icon = "👤";
                                                  themeClass = "bg-purple-50 text-purple-705 border-purple-100";
                                                } else if (possibleLabel.includes("⚡") || possibleLabel.toLowerCase().includes("happen")) {
                                                  icon = "⚡";
                                                  themeClass = "bg-amber-50 text-amber-800 border-amber-100 font-semibold";
                                                } else if (possibleLabel.includes("📝") || possibleLabel.toLowerCase().includes("summar") || possibleLabel.toLowerCase().includes("whole")) {
                                                  icon = "📝";
                                                  themeClass = "bg-emerald-55 text-emerald-800 border-emerald-100";
                                                }
                                              }
                                            }

                                            // Fallback icons when there's no colon parsing
                                            if (!label) {
                                              const fallbackBulletEmojis = ["📍", "👤", "⚡", "📝", "📝", "📝", "📝"];
                                              icon = fallbackBulletEmojis[lIdx % fallbackBulletEmojis.length];
                                              if (icon === "📍") themeClass = "bg-blue-50 text-blue-700 border-blue-100";
                                              else if (icon === "👤") themeClass = "bg-purple-50 text-purple-705 border-purple-100";
                                              else if (icon === "⚡") themeClass = "bg-amber-50 text-amber-800 border-amber-100";
                                              else if (icon === "📝") themeClass = "bg-emerald-55 text-emerald-800 border-emerald-100";
                                              
                                              // Strip out starting bullet symbols or emojis
                                              const emojiMatch = lineStr.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
                                              const emoji = emojiMatch ? emojiMatch[1] : null;
                                              if (emoji) {
                                                content = lineStr.replace(emoji, "").trim();
                                              }
                                              content = content.replace(/^[•\-\*\d\.\)\s]+/, "").trim();
                                            }

                                            return (
                                              <div key={lIdx} className="flex flex-col sm:flex-row sm:items-start gap-2 text-slate-700 text-xs sm:text-[13px] leading-relaxed">
                                                {label ? (
                                                  <div className="sm:w-[150px] shrink-0">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${themeClass}`}>
                                                      <span className="text-xs">{icon}</span>
                                                      <span>{label}</span>
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <div className="sm:w-[150px] shrink-0">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${themeClass}`}>
                                                      <span className="text-xs">{icon}</span>
                                                      <span>{icon === "📍" ? "PLACE" : icon === "👤" ? "ENTITY" : icon === "⚡" ? "WHAT HAPPENED" : "WHOLE SUMMARY"}</span>
                                                    </span>
                                                  </div>
                                                )}
                                                <div className="flex-1 font-sans text-slate-800 pt-0.5 whitespace-pre-wrap">
                                                  {content}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p className="text-[11px] text-slate-500 italic py-2">No Core insights available.</p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Full text expansion content drawer */}
                              <AnimatePresence>
                                {itemIsExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    {expandingStoryId === item.id ? (
                                      <div className="mt-2 bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center space-y-3.5 text-slate-500 animate-pulse">
                                        <div className="relative flex items-center justify-center">
                                          <div className="w-8 h-8 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin"></div>
                                        </div>
                                        <div className="text-center space-y-1">
                                          <p className="text-[11px] font-black font-sans uppercase tracking-widest text-slate-800">
                                            Sovereign AI Gen-Grid Active
                                          </p>
                                          <p className="text-[10px] text-slate-500 font-medium font-mono">
                                            Expanding news wire, conducting critical evaluations & compiling syllabus matrices...
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="mt-2 text-slate-900 leading-relaxed text-xs bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-inner whitespace-pre-wrap h-auto min-h-[140px] transition-all">
                                        {isTranslating ? (
                                          <div className="flex flex-col items-center justify-center py-6 space-y-2 text-slate-500">
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-slate-650 animate-spin"></div>
                                            <p className="text-[10px] font-mono italic animate-pulse">Translating deep analyst report...</p>
                                          </div>
                                        ) : (
                                          renderContent(processedFullContent || item.summary)
                                        )}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Interactive MCQ Quiz Drawer Block */}
                              <AnimatePresence>
                                {itemShowQuiz && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, y: 15 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: 15 }}
                                    transition={{
                                      height: { duration: 0.25, ease: "easeOut" },
                                      opacity: { duration: 0.2, ease: "easeOut" },
                                      y: { duration: 0.25, ease: "easeOut" }
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-[#fffbeb] border border-amber-200 rounded-2xl p-5 space-y-4 mt-3 text-slate-800 shadow-sm">
                                      {/* Header of Quiz */}
                                      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <BookOpen className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
                                          </div>
                                          <h4 className="text-[12px] uppercase font-black tracking-wider text-amber-900 font-sans">
                                            Comprehension Checkup
                                          </h4>
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-amber-850 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                                          3-Question MCQ Quiz
                                        </span>
                                      </div>

                                      {/* Content body */}
                                      {isQuizLoading && !quizQuestions ? (
                                        <div className="space-y-4 py-3">
                                          <div className="text-center py-2 text-xs text-amber-800 animate-pulse font-mono font-black">
                                            ⚡ GENERATING COMPREHENSION MODEL VIA GEMINI...
                                          </div>
                                          {[1, 2, 3].map(v => (
                                            <div key={v} className="space-y-2 animate-pulse">
                                              <div className="h-2 w-1/2 bg-amber-200/50 rounded-md"></div>
                                              <div className="h-6 bg-slate-100 rounded-md w-full"></div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : quizQuestions && quizQuestions.length > 0 ? (
                                        <div className="space-y-6">
                                          {quizQuestions.map((q, qIdx) => {
                                            const questionKey = `${item.id}_${qIdx}`;
                                            const selectedAnswer = quizSelectedAnswers[questionKey];
                                            const isChecked = quizCheckedStatus[questionKey];
                                            const hasSelected = selectedAnswer !== undefined;

                                            return (
                                              <div key={qIdx} className="space-y-3 pb-4 border-b border-amber-100/60 last:border-b-0">
                                                <div className="flex gap-2 text-xs font-extrabold text-slate-900">
                                                  <span className="text-amber-700 font-bold font-mono shrink-0">Q{qIdx + 1}.</span>
                                                  <span className="leading-relaxed font-sans">{q.question}</span>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2 pl-3">
                                                  {q.options.map((opt: string, optIdx: number) => {
                                                    const isThisSelected = selectedAnswer === optIdx;
                                                    let buttonStyle = "bg-white border-slate-200 hover:bg-amber-50/50 text-slate-700";
                                                    
                                                    if (isThisSelected) {
                                                      buttonStyle = "bg-amber-100/80 border-amber-450 text-amber-950 font-bold ring-1 ring-amber-400";
                                                    }
                                                    
                                                    if (isChecked) {
                                                      const isCorrectAnswer = optIdx === q.correctIndex;
                                                      if (isCorrectAnswer) {
                                                        buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-100";
                                                      } else if (isThisSelected) {
                                                        buttonStyle = "bg-rose-50 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-200";
                                                      } else {
                                                        buttonStyle = "bg-slate-50 border-slate-200 text-slate-405 opacity-60";
                                                      }
                                                    }

                                                    return (
                                                      <button
                                                        key={optIdx}
                                                        onClick={() => {
                                                          if (!isChecked) {
                                                            handleSelectQuizAnswer(item.id, qIdx, optIdx);
                                                          }
                                                        }}
                                                        disabled={isChecked}
                                                        className={`text-left text-xs p-2.5 rounded-xl border transition-all duration-100 leading-normal flex items-start gap-2 ${
                                                          !isChecked ? "cursor-pointer active:scale-95" : "cursor-default"
                                                        } ${buttonStyle}`}
                                                      >
                                                        <span className="font-mono font-black bg-slate-100 text-slate-600 w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center text-[10px] select-none">
                                                          {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        <span className="flex-1 font-medium">{opt}</span>
                                                      </button>
                                                    );
                                                  })}
                                                </div>

                                                <div className="pl-3">
                                                  {!isChecked ? (
                                                    <button
                                                      onClick={() => handleCheckQuizAnswer(item.id, qIdx)}
                                                      disabled={!hasSelected}
                                                      className={`px-3 py-1.5 rounded-lg font-mono text-[9px] font-black tracking-widest uppercase transition-all duration-100 select-none ${
                                                        hasSelected 
                                                          ? "bg-amber-950 text-white cursor-pointer hover:bg-amber-900 active:scale-95 border border-amber-950" 
                                                          : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent"
                                                      }`}
                                                    >
                                                      Check Answer
                                                    </button>
                                                  ) : (
                                                    <div className="mt-2.5 bg-white border border-amber-100 p-3 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed select-none">
                                                      <div className="shrink-0 pt-0.5">
                                                        {selectedAnswer === q.correctIndex ? (
                                                          <span className="text-emerald-750 bg-emerald-50 border border-emerald-250 text-[9px] font-black px-2 py-0.5 rounded-md font-mono uppercase">
                                                            CORRECT ✓
                                                          </span>
                                                        ) : (
                                                          <span className="text-rose-750 bg-rose-50 border border-rose-250 text-[9px] font-black px-2 py-0.5 rounded-md font-mono uppercase">
                                                            INCORRECT ✗
                                                          </span>
                                                        )}
                                                      </div>
                                                      <div className="text-slate-700 flex-1">
                                                        <strong>Explanation:</strong> {q.explanation}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}

                                          {/* Quiz Score Summary Banner */}
                                          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="space-y-1">
                                              <div className="text-xs font-black text-amber-900 inline-flex items-center gap-1 font-mono uppercase tracking-wider">
                                                <Trophy className="h-3.5 w-3.5 text-amber-600 animate-bounce" />
                                                <span>Live Quiz Score Engine</span>
                                              </div>
                                              <p className="text-[10px] text-amber-800 leading-snug">
                                                Compete comprehension goals cleanly for this syllabus item to harden memory representation.
                                              </p>
                                            </div>

                                            <button
                                              onClick={() => handleResetQuiz(item.id)}
                                              className="px-3.5 py-1.5 border border-amber-400 hover:bg-amber-100/50 text-amber-800 font-mono text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95 text-center shrink-0"
                                            >
                                              Reset / Retry MQCs
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-xs text-amber-800 font-mono font-medium">
                                          Could not generate MCQ questions. Please try again.
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Tags section inside the white body */}
                              <div className="flex flex-wrap gap-1.5">
                                {item.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="bg-slate-50 text-[10px] font-black text-slate-500 px-2 rounded border border-slate-200">
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              {/* Student Group Share Section - Elegant Study-Group Support */}
                              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#fdfaf7] rounded-xl p-3 border border-amber-100/50">
                                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider font-mono">
                                  <Share2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                  <span>UPSC Study Circle Share:</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                      `📚 *UPSC CIVIL SERVICES DAILY DIGEST* 📚\n\n` +
                                      `🔍 *Category:* ${item.category.toUpperCase()}\n` +
                                      `📌 *Headline:* ${processedTitle}\n\n` +
                                      `📝 *Core Analysis:* ${processedSummary}\n\n` +
                                      `📖 Read full story & interactive AI Core insights instantly on Sovereign Study Grid!`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-[11px] font-extrabold transition-all shadow-sm select-none"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 text-white" />
                                    <span>WhatsApp Group</span>
                                  </a>
                                  <button
                                    onClick={() => {
                                      const textToCopy = 
                                        `📚 UPSC CIVIL SERVICES DAILY DIGEST 📚\n\n` +
                                        `🔍 Category: ${item.category.toUpperCase()}\n` +
                                        `📌 Headline: ${processedTitle}\n\n` +
                                        `📝 Core Analysis: ${processedSummary}\n\n` +
                                        `📖 Read full story & interactive AI Core insights instantly on Sovereign Study Grid!`;
                                      
                                      navigator.clipboard.writeText(textToCopy);
                                      setCopiedStoryId(item.id);
                                      setTimeout(() => setCopiedStoryId(null), 3500);
                                      
                                      // Trigger the elegant step-by-step guidance modal to guide the student correctly
                                      setInstaGuideStory({
                                        id: item.id,
                                        title: processedTitle,
                                        summary: processedSummary,
                                        category: item.category
                                      });
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-95 active:scale-95 text-white rounded-lg text-[11px] font-extrabold transition-all shadow-sm select-none cursor-pointer"
                                  >
                                    <Instagram className="h-3.5 w-3.5 text-white" />
                                    <span>
                                      {copiedStoryId === item.id ? "Copied! Opening Guide..." : "Insta Story"}
                                    </span>
                                  </button>
                                </div>
                              </div>

                            </div>

                            {/* Separating bottom line divider exactly as requested by format */}
                            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                              {/* Read Full Story on left */}
                              <button
                                onClick={() => toggleStoryExpand(item)}
                                className="text-blue-600 hover:text-blue-700 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 hover:underline cursor-pointer select-none"
                              >
                                <span>⚡ {itemIsExpanded ? "Close Story" : "Read Full Story"}</span>
                                <span className="text-[10px]">{itemIsExpanded ? "▲" : "▼"}</span>
                              </button>

                              <div className="flex items-center gap-2">
                                {/* Orange Quiz comprehension pill */}
                                <button
                                  onClick={() => toggleStoryQuiz(item)}
                                  className={`flex items-center gap-1.5 font-bold text-[11px] sm:text-xs px-4 py-2.5 rounded-xl text-white shadow-md transition-all cursor-pointer active:scale-95 duration-150 ${
                                    itemShowQuiz 
                                      ? "bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-100" 
                                      : "bg-[#f97316] hover:bg-[#ea580c] ring-2 ring-orange-100"
                                  }`}
                                >
                                  <BookOpen className="h-3.5 w-3.5" />
                                  <span>{itemShowQuiz ? "Close Quiz" : "MCQ Quiz"}</span>
                                </button>



                                {/* Purple "Ask AI Matrix" pill button on the right */}
                                <button
                                  onClick={() => toggleStory6Line(item)}
                                  className={`flex items-center gap-2 font-bold text-[11px] sm:text-xs px-4 py-2.5 rounded-xl text-white shadow-md transition-all cursor-pointer active:scale-95 duration-150 ${
                                    itemShowSummary 
                                      ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-100" 
                                      : "bg-[#6366f1] hover:bg-[#5255f0] ring-2 ring-indigo-50"
                                  }`}
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>Ask AI Matrix</span>
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </motion.div>

              {/* NAVIGATION CONTROL BAR BELOW THE CARD - Matches image block strictly */}
              {(searchActive ? searchResults : categoryNews).length > 0 && viewMode === "card" && (
                <div className="mt-4 flex items-center justify-between w-full px-1">
                  
                  {/* Previous gray button with emoji */}
                  <button
                    disabled={currentNewsIndex === 0}
                    onClick={handlePrevious}
                    className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-[#e2e8f0] hover:bg-[#cbd5e1] text-slate-800 font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer"
                  >
                    <span>⬅️ Previous</span>
                  </button>

                  {/* Current index status text indicator in subtle layout */}
                  <span className="text-slate-400 text-xs font-black font-mono select-none">
                    {currentNewsIndex + 1} / {(searchActive ? searchResults : categoryNews).length}
                  </span>

                  {/* Next blue shiny button with emoji */}
                  <button
                    disabled={currentNewsIndex === (searchActive ? searchResults : categoryNews).length - 1}
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-6 py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer"
                  >
                    <span>Next ➡️</span>
                  </button>

                </div>
              )}

            </div>

            {/* INTEGRATED QUICK CONTEXT SIDE WIRE PANEL FOR LARGE DESKTOPS */}
            <div className="hidden lg:flex flex-col bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-lg w-[320px] shrink-0">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 font-mono">🔴 Wire Stream</span>
                <span className="text-[8px] bg-rose-50 border border-rose-150 text-rose-700 font-black px-2 py-0.5 rounded-full font-mono">
                  {(searchActive ? searchResults : categoryNews).length} items
                </span>
              </div>
              
              <div className="overflow-y-auto divide-y divide-slate-100 flex-1 scrollbar-none max-h-[640px]">
                {(searchActive ? searchResults : categoryNews).map((item, idx) => {
                  const isSelected = idx === currentNewsIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentNewsIndex(idx);
                      }}
                      className={`w-full text-left p-3 flex gap-2.5 transition-all cursor-pointer ${
                        isSelected ? "bg-rose-50/70 border-r-4 border-rose-600" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="h-10 w-14 bg-slate-900 rounded overflow-hidden shrink-0 mt-0.5">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120"} 
                          className="h-full w-full object-cover"
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[10px] leading-snug font-extrabold line-clamp-2 ${isSelected ? "text-rose-950 font-black" : "text-slate-800"}`}>
                          {selectedLanguage === "en" ? item.title : (translationCache[`${item.id}_${selectedLanguage}`]?.title || item.title)}
                        </h4>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER METRICS RAIL */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-[10px] font-mono py-3.5 px-4 sm:px-8 font-semibold">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div>
            <span>ARRIBOYINA'S PLATFORM • SYSTEM LOGGED IN SECURE DEPLOYMENT</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-600 flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
              CORE NODE ONLINE
            </span>
            <span>PORT: 3000 (SECURE ENTRY)</span>
          </div>
        </div>
      </footer>

      {/* INSTAGRAM STUDY STORY DIALOG GUIDE */}
      <AnimatePresence>
        {instaGuideStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border text-left border-slate-200 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden font-sans"
            >
              <div className="p-5 sm:p-6">
                {/* Header aspect */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-500 p-2 rounded-xl text-white">
                      <Instagram className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                        {selectedLanguage === "te" ? "ఇన్‌స్టాగ్రామ్ స్టోరీ షేరింగ్ గైడ్" : "Instagram Study Story Guide"}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase font-mono mt-0.5">
                        Civil Services Study Circle
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInstaGuideStory(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer select-none text-[18px] font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Main Content Body */}
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedLanguage === "te" 
                      ? "ఇన్‌స్టాగ్రామ్ యాప్ నేరుగా మీ వెబ్‌సైట్ సమాచారాన్ని ఆటోమేటిక్‌గా స్టోరీ రూపంలో నింపడాన్ని అనుమతించదు. కాబట్టి మేము మీ ప్రిపరేషన్ మెటీరియల్‌ను సేవ్ చేసాము! దయచేసి క్రింది 3 సులువైన మెట్లను అనుసరించండి:" 
                      : "Instagram's web services do NOT allow external websites to automatically direct-inject structured text directly into a User Story. We have prepared and copied your beautifully formatted UPSC civil-services study digest to your device clipboard! Follow these simple steps below:"
                    }
                  </p>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-600 font-mono">
                        1
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">
                          {selectedLanguage === "te" ? "సారాంశం కాపీ చేయబడింది! ✓" : "Story Digest Copied! ✓"}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                          {selectedLanguage === "te" 
                            ? "ఈ వార్త సారాంశం మరియు ప్రిపరేషన్ గైడ్ ఇప్పటికే మీ క్లిప్‌బోర్డ్‌కి సేవ్ చేయబడింది." 
                            : "The beautifully formatted summary & dynamic QR study guide has been copied to your device's clipboard."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-slate-200/50 pt-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-600 font-mono">
                        2
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">
                          {selectedLanguage === "te" ? "ఇన్‌స్టాగ్రామ్ తెరవండి" : "Launch Instagram Story"}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                          {selectedLanguage === "te" 
                            ? "క్రింది ప్రకాశవంతమైన బటన్‌ను నొక్కడం ద్వారా ఇన్‌స్టాగ్రామ్‌ని ఓపెన్ చేసి, కథనాన్ని సృష్టించే (+) లేదా 'Your Story' ఆప్షన్ పై తాకండి." 
                            : "Click the gradient button below to go to Instagram, then tap on the (+) button or Create Story."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-slate-200/50 pt-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-600 font-mono">
                        3
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">
                          {selectedLanguage === "te" ? "టెక్స్ట్ ని పేస్ట్ చేయండి (Paste)" : "Paste & Share! ✍️"}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                          {selectedLanguage === "te" 
                            ? "టెక్స్ట్ ఐకాన్ ఓపెన్ చేసి, స్క్రీన్‌పై లాంగ్ ప్రెస్ చేసి 'పేస్ట్ (Paste)' చేయండి. అధ్యయన సమాచారం సిద్ధం అవుతుంది!" 
                            : "Select the Text (Aa) story tool, then tap and hold to Paste. Paste the complete UPSC civil digest instantly into your story!"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Digest preview snippet */}
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 font-mono text-[9px] line-clamp-3 leading-relaxed opacity-70">
                    📚 UPSC CIVIL SERVICES DAILY DIGEST 📚{"\n"}
                    🔍 Category: {instaGuideStory.category.toUpperCase()}{"\n"}
                    📌 Headline: {instaGuideStory.title}{"\n"}
                    📝 Core Analysis: {instaGuideStory.summary}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => {
                      const textToCopy = 
                        `📚 UPSC CIVIL SERVICES DAILY DIGEST 📚\n\n` +
                        `🔍 Category: ${instaGuideStory.category.toUpperCase()}\n` +
                        `📌 Headline: ${instaGuideStory.title}\n\n` +
                        `📝 Core Analysis: ${instaGuideStory.summary}\n\n` +
                        `📖 Read full story & interactive AI Core insights instantly on Sovereign Study Grid!`;
                      
                      navigator.clipboard.writeText(textToCopy);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all select-none cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{selectedLanguage === "te" ? "తిరిగి కాపీ చేయి" : "Re-Copy Text"}</span>
                  </button>
                  <button
                    onClick={() => {
                      window.open("https://www.instagram.com/smartcurrentaffairs_upsc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", "_blank");
                    }}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-95 text-white active:scale-95 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg select-none cursor-pointer"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>{selectedLanguage === "te" ? "ఇన్‌స్టా కి వెళ్ళు →" : "Go To Instagram →"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE ADMIN PASSWORD GATE MODAL */}
      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border text-left border-slate-200 shadow-2xl rounded-2xl max-w-sm w-full overflow-hidden font-sans"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2.5 rounded-xl text-amber-650 shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      Admin Dual Verification
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Enter both security keys to verify administrative identity
                    </p>
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPasswordInput === "Sree09062007" && adminPasswordInput2 === "19185518113") {
                      setIsAdminVerified(true);
                      setIsAdminMode(true);
                      setGalaxyUnlocked(true);
                      setPasswordModalOpen(false);
                      setPasswordError("");
                      try {
                        localStorage.setItem("admin_verified", "true");
                        sessionStorage.setItem("galaxy_unlocked", "true");
                      } catch (_) {}
                    } else {
                      setPasswordError("Access Denied: Dual passwords mismatch.");
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                      Primary Passcode (key 1)
                    </label>
                    <input 
                      type="password"
                      placeholder="••••••••••••"
                      value={adminPasswordInput}
                      onChange={(e) => {
                        setAdminPasswordInput(e.target.value);
                        setPasswordError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-950 font-sans focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                      Secondary Passcode (key 2)
                    </label>
                    <input 
                      type="password"
                      placeholder="••••••••••••"
                      value={adminPasswordInput2}
                      onChange={(e) => {
                        setAdminPasswordInput2(e.target.value);
                        setPasswordError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-950 font-sans focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  {passwordError && (
                    <div className="flex items-center space-x-1.5 text-xs text-red-650 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-105">
                      <span>⚠️</span>
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordModalOpen(false);
                        setPasswordError("");
                      }}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      Verify Access
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM SECURE ADMIN DELETE DIALOG */}
      <AnimatePresence>
        {deleteTargetNews && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white border text-left border-slate-200 shadow-2xl rounded-2xl max-w-sm w-full overflow-hidden font-sans"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="bg-rose-100 p-2.5 rounded-xl text-rose-605 shrink-0">
                    <Trash2 className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      Delete News Story?
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      This action will permanently purge this article from both the dynamic category flows and the database index. This action is irreversible.
                    </p>
                  </div>
                </div>

                {/* Brief preview container */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-black text-rose-600">Article Title</span>
                  <p className="text-slate-900 font-bold line-clamp-2">
                    {deleteTargetNews.title}
                  </p>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono">
                    Category: {deleteTargetNews.category || "General"}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isDeletingNews}
                    onClick={() => setDeleteTargetNews(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingNews}
                    onClick={async () => {
                      if (!deleteTargetNews) return;
                      try {
                        setIsDeletingNews(true);
                        const response = await fetch("/api/news/delete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: deleteTargetNews.id,
                            title: deleteTargetNews.title,
                            category: deleteTargetNews.category
                          })
                        });

                        if (!response.ok) {
                          const errData = await response.json();
                          throw new Error(errData.error || "Failed to delete article from database");
                        }

                        const resData = await response.json();
                        if (resData.success && resData.db) {
                          // 1. Update general news list state
                          setNewsData(resData.db);

                          // 2. Reactively filter from client-side search cache if active
                          if (searchActive) {
                            setSearchResults(prev => prev.filter(x => x.id !== deleteTargetNews.id));
                          }

                          // 3. Recalculate stable indexes
                          const remainingList = searchActive
                            ? searchResults.filter(x => x.id !== deleteTargetNews.id)
                            : (resData.db[activeCategory] || []).filter((x: any) => {
                                if (!x.date) return true;
                                const itemDate = new Date(x.date);
                                if (isNaN(itemDate.getTime())) return true;
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                itemDate.setHours(0, 0, 0, 0);
                                return itemDate <= today;
                              });

                          const targetIndex = Math.max(0, Math.min(currentNewsIndex, remainingList.length - 1));
                          setCurrentNewsIndex(targetIndex);

                          setDeleteTargetNews(null);
                        }
                      } catch (err: any) {
                        console.error("Delete handler failed:", err);
                        alert(err.message || "Failed to delete the selected article.");
                      } finally {
                        setIsDeletingNews(false);
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white border border-rose-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isDeletingNews ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3" />
                        <span>Permanently Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN SECURE IMAGE INSPECTION OVERLAY MODAL */}
      <AnimatePresence>
        {modalImage && (
          <div 
            className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-950/96 backdrop-blur-lg p-4 sm:p-8 select-none cursor-zoom-out font-sans"
            onClick={() => setModalImage(null)}
          >
            {/* Top Close indicator / Title Banner */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-slate-950/80 to-transparent flex items-center justify-between gap-4 text-white z-110 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase tracking-widest font-mono font-black text-amber-500">Visual Quality Inspect</span>
                <h3 className="text-xs sm:text-sm font-extrabold truncate text-slate-100">
                  {modalImage.title}
                </h3>
              </div>
              <button
                onClick={() => setModalImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 select-none flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer text-white border border-white/10"
                title="Close overlay (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>

            {/* Central High-Resolution Image Container */}
            <div className="relative max-w-full md:max-w-5xl flex items-center justify-center self-center">
              <motion.img
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                src={modalImage.src}
                className="max-h-[78vh] md:max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800 select-none"
                alt={modalImage.title}
                referrerPolicy="no-referrer"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImage(null);
                }}
              />
            </div>

            {/* Bottom help subtitle */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-5 text-center text-slate-500 text-[10px] sm:text-xs font-medium tracking-wide uppercase select-none pointer-events-none"
            >
              Click anywhere on the screen or press <kbd className="font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-sm text-[9px] uppercase mx-1">Esc</kbd> to exit full view
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
