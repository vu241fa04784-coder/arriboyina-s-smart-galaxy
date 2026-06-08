export interface NewsItem {
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

export const fallbackNewsData: Record<string, NewsItem[]> = {
  india: [
    {
      id: "ind-june2",
      title: "Telangana Formation Day: Tech-Driven Agriculture & Smart Watershed Frameworks Unveiled",
      summary: "On the historic anniversary of Telangana statehood, innovative localized irrigation coordinates and decentralised agricultural ledgers are deployed to boost rural GDP growth.",
      fullContent: "Marking Telangana Formation Day on June 2, 2026, the state administration has launched a state-wide smart watershed development programme. This initiative integrates satellite remote sensing with automated canal gates to optimize high-season river runoff. Simultaneously, the state's agriculture desk launched a direct-to-seed subsidy model utilizing decentralized public ledgers. Economists from the National Institute of Rural Development have highly praised the model. Aspirants should review Telangana's journey, cooperative water tribunals, and industrial policies as high-scoring examples for state governance models in general mains evaluations.",
      image: "https://images.unsplash.com/photo-1545137685-1f99a30b5ade?w=800",
      category: "india",
      date: "June 2, 2026",
      author: "P. R. Shashtri",
      tags: ["Telangana Formation Day", "UPSC GS-III", "State Governance"]
    },
    {
      id: "ind-june1",
      title: "Global Parents Day: India Expands Integrated Nutrition & Social Support Channels",
      summary: "In synergy with international child welfare guidelines, the Ministry of Education has launched a comprehensive smart parent-teacher advisory framework across state schools.",
      fullContent: "Celebrating Global Parents Day on June 1, 2026, over 40 high-tier public support desks have launched parent guidance networks across municipal school sectors. This initiative establishes active parent-teacher counsels, distributes bio-nutrient supplements, and launches modular online lessons designed for single parent environments. Academic researchers have lauded the program for directly improving student emotional safety scores by 18%. Observers note that integrating direct family care with academic infrastructure models provides a crucial roadmap for achieving sustainable child development targets.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55?w=800",
      category: "india",
      date: "June 1, 2026",
      author: "Dr. Ananya Roy",
      tags: ["Parents Day", "Social Welfare", "Education Policy"]
    },
    {
      id: "ind-01",
      title: "India Unveils Next-Gen AI Compute Grid for Civil Services & Local Governance",
      summary: "The Ministry of Electronics and IT (MeitY) has launched a strategic sovereign AI compute framework. This platform is designed to streamline public administration and build native high-performance computing clusters.",
      fullContent: "In a monumental shift toward technical self-reliance, the government has officially inaugurated its next-generation native AI compute network. The broader deployment framework entails an explicit capital allocation spread across strategic computational zones over the next fiscal cycle. This initiative targets the ingestion of agricultural patterns, municipal resource strains, and multi-lingual public feedback vectors to train contextual LLMs natively. It integrates high-capacity nodes to facilitate instant localized administrative processing, lowering latencies in tier-2 and tier-3 municipalities. Additionally, the system provides standard API endpoints for regional governance applications, offering automated multi-lingual drafting support for local clerks.",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
      category: "india",
      date: "May 31, 2026",
      author: "P. R. Shashtri",
      tags: ["Digital Policy", "AI Governance", "UPSC GS-III"]
    },
    {
      id: "ind-02",
      title: "National Quantum Mission Establishes Four Academic Science Hubs",
      summary: "The Indian Government has earmarked ₹6,003 crore under the National Quantum Mission (NQM) to launch four thematic research hubs at top medical and engineering institutions.",
      fullContent: "To accelerate R&D in quantum computing, communication, and metrology, the Department of Science and Technology (DST) has finalized the setup of four highly advanced centers. These units will focus on building secure quantum key distribution (QKD) nodes across major Indian cities, developing high-sensitivity quantum sensors for weather anomalies, and synthesizing next-generation superconducting materials. Top scientists from IISc, IITs, and Tata Institute of Fundamental Research (TIFR) will collaborate on these hubs. Experts emphasize this as a crucial step for achieving technological security in financial and defense communications over the next decade.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
      category: "india",
      date: "May 28, 2026",
      author: "Dr. Ananya Roy",
      tags: ["Science & Tech", "NQM", "Competitive Exams"]
    },
    {
      id: "ind-03",
      title: "UPI Expands Globally: India Cooperates with UAE, France & Singapore for Cross-Border Settlement",
      summary: "The Unified Payments Interface (UPI) has established direct settlement links with global payment networks, allowing travelers to complete instant retail transactions abroad.",
      fullContent: "Under the supervision of the Reserve Bank of India (RBI) and National Payments Corporation of India (NPCI), the Unified Payments Interface (UPI) is rapidly transitioning into an international payment facilitator. Direct integration with Singapore's PayNow, UAE's Jaywan, and France's Lyra network enables instant, low-cost cross-border retail payments using standard QR codes. This bilateral corridor eliminates high exchange rate overheads and provides seamless remittance transfers for expatriates and students. Financial experts note that exporting India's Digital Public Infrastructure (DPI) serves as a strategic sovereign outreach tool, positioning the e-Rupee and UPI as highly stable alternatives to traditional Western correspondent banking channels.",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800",
      category: "india",
      date: "May 27, 2026",
      author: "Rajesh Seshadri",
      tags: ["DPI", "Economy", "UPI International"]
    },
    {
      id: "ind-04",
      title: "India Semiconductor Mission Initiates Construction of Mega Fabrication Plant in Gujarat",
      summary: "Construction has officially commenced on the high-tech silicon wafer fab facility in Dholera, signaling India's formal entry into commercial semiconductor manufacturing.",
      fullContent: "Marking a pivotal milestone in the 'Atmanirbhar Bharat' tech ecosystem, the India Semiconductor Mission (ISM) has greenlit the foundational phase of the semiconductor factory in Dholera, Gujarat. Partnering with top global silicon consortiums, the project involves an investment exceeding ₹76,000 crore. The mega-fab focuses on producing 28nm and 40nm nodes, which are vital for automotive electronics, aerospace, IoT devices, and sovereign communications grids. Simultaneously, cleanroom modules are being calibrated alongside an adjacent chemical extraction corridor in Assam. This foundational structure decreases geographical reliance on East Asian silicon foundries, creating over 20,000 highly specialized science and engineering jobs.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      category: "india",
      date: "May 25, 2026",
      author: "Siddharth Verma",
      tags: ["Semiconductors", "Atmanirbhar Bharat", "Syllabus GS-III"]
    },
    {
      id: "ind-05",
      title: "ISRO Gaganyaan Mission Completes Cryogenic Engine Flight-Acceptance Evaluation",
      summary: "ISRO has successfully tested high-altitude cryogenic engines for the LVM3 launch vehicle, clearing a vital safety gating milestone for manned space flight.",
      fullContent: "The Indian Space Research Organisation (ISRO) has completed the flight-acceptance hot test of the CE-20 cryogenic engine at the Propulsion Complex in Mahendragiri, Tamil Nadu. Operating with liquid hydrogen and liquid oxygen, the engine was fired for its full operational duration of 650 seconds, satisfying all safety telemetry parameters. The engine is designated to power the upper stage of the Launch Vehicle Mark-3 (LVM3) for the Gaganyaan mission, India's first human-crewed orbital flight. Aerospace engineering advisors confirmed that redundant thermal barriers and autonomous abort protocols are operating optimally, clearing the path for unmanned experimental test vehicle launches scheduled for late autumn.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      category: "india",
      date: "May 24, 2026",
      author: "Radha Krishnan",
      tags: ["ISRO", "Gaganyaan", "Space Science"]
    },
    {
      id: "ind-06",
      title: "National Green Hydrogen Initiative Approves Development of Clean Fuel Transit Rail Corridor",
      summary: "The Ministry of New and Renewable Energy has launched the pilot phase of India's first hydrogen-powered passenger train network with custom fuel cells.",
      fullContent: "In pursuit of the net-zero carbon goals slated for 2070, the Indian Government has officially commissioned the construction of its premier green hydrogen transport corridor in Haryana. Leveraging fuel-cell stacks engineered by domestic research partnerships, the train emits only water vapor and minor thermal outputs, eliminating carbon footprints entirely. The National Green Hydrogen Mission targets the creation of localized green ammonia clusters and pipelines, supported by massive solar generation feeds in Rajasthan and Gujarat. Academic observers state that scaling hydrogen locomotives provides a highly repeatable blueprint for decarbonizing dense cargo freight networks worldwide.",
      image: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?w=800",
      category: "india",
      date: "May 22, 2026",
      author: "Amit Mehra",
      tags: ["Green Energy", "Climate Action", "Infrastructure"]
    },
    {
      id: "ind-07",
      title: "ONDC Ecosystem Integrates 5 Lakh Local Retail Merchants to Promote Democratic Commerce",
      summary: "The Open Network for Digital Commerce (ONDC) has onboarded over 500,000 neighborhood shops, creating an open-standard alternative to commercial platforms.",
      fullContent: "The Department for Promotion of Industry and Internal Trade (DPIIT) reported a highly successful uptick in community registrations on the Open Network for Digital Commerce (ONDC). This sovereign, decentralized network unbundles services so that local kirana stores, regional craftsmen, and family restaurants can publish inventory prices directly. In doing so, it eliminates heavy commission margins and lets buyers use any compliant logistics application. By providing a standard, democratic marketplace with shared cataloging, ONDC promotes a fairer digital retail economy. Candidates studying public administration should observe this as a classic case study in state-backed technology disrupting monopolistic market dynamics.",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
      category: "india",
      date: "May 20, 2026",
      author: "Nandini Rao",
      tags: ["ONDC", "Digital Retail", "Economic Governance"]
    },
    {
      id: "ind-08",
      title: "Ayushman Bharat Digital Mission Surpasses 50 Crore Issued Interoperable Health IDs",
      summary: "The National Health Authority (NHA) has issued more than 500 million health lockers, enabling candidates to access secure digital medical records seamlessly.",
      fullContent: "In a sweeping digitization drive for public healthcare delivery, the Ayushman Bharat Digital Mission (ABDM) has passed a key threshold with 500 million verified health ID creations. These digital profiles compile clinical histories, immunization registries, and diagnostic reports across public and private hospitals interoperably. Patients retain full consent control over which data doctors can retrieve via one-time secure keys. Senior officials confirmed this structural data ecosystem streamlines direct-benefit healthcare payout audits, and aids epidemiologists in identifying emerging local infection vectors securely before outbreak situations rise.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
      category: "india",
      date: "May 18, 2026",
      author: "Dr. Sandeep Jha",
      tags: ["Public Health", "ABDM", "Sovereign Welfare"]
    },
    {
      id: "ind-09",
      title: "Sovereign Green Bonds Raise ₹20,000 Crore to Fund National Clean Energy Projects",
      summary: "The Ministry of Finance has successfully completed its second sovereign green bond auction, attracting premium domestic and offshore institutional liquidity.",
      fullContent: "The Ministry of Finance, cooperating with the Reserve Bank of India, has completed its latest scheduled issuance of Sovereign Green Bonds (SGB), raising ₹20,000 crore under a highly tight bidding structure. Proceeds are strictly earmarked for public sector investments in green infrastructure, including high-capacity wind turbine installations, grid-scale hydro-pumped storage projects, and forest restoration. The successful auction demonstrates massive long-term institutional confidence in India's fiscal policies. Financial scholars should reference this as a key tool for mobilizing clean climate funds without exacerbating traditional debt balance ratios.",
      image: "https://images.unsplash.com/photo-1463123081488-729f551ee610?w=800",
      category: "india",
      date: "May 15, 2026",
      author: "Pooja Banerjee",
      tags: ["Green Finance", "Sovereign Bonds", "UPSC GS-III"]
    },
    {
      id: "ind-10",
      title: "Atal Setu Trans Harbour Sea Link Transforms Mumbai and Navi Mumbai Logistics Corridor",
      summary: "India's longest open-sea cable-stayed bridge has completed its third fiscal year of high-efficiency transport operations, boosting economic growth.",
      fullContent: "Stretching 21.8 kilometers across the Arabian Sea, the Mumbai Trans Harbour Link (MTHL), officially named Atal Setu, has significantly transformed regional supply chains. Traffic management audits indicate a 55-minute saving on commercial cargo transport between Mumbai Port and rural manufacturing zones in Pune. The mega structure is built with state-of-the-art orthotropic steel decks and advanced seismic dampers to withstand major marine tectonic tremors. By linking key urban hubs with upcoming shipping ports, the corridor serves as a textbook engineering case of long-term capital assets driving ease-of-business parameters.",
      image: "https://images.unsplash.com/photo-1545137685-1f99a30b5ade?w=800",
      category: "india",
      date: "May 12, 2026",
      author: "Karan Deol",
      tags: ["Infrastructure", "Atal Setu", "Structural Engineering"]
    }
  ],
  international: [
    {
      id: "int-01",
      title: "Global Maritime Coalition Signs Accord on Red Sea Shipping Security",
      summary: "In a landmark international maritime meet in Geneva, 24 nations signed a new framework to secure shipping corridors and stabilize global sea trade chains.",
      fullContent: "Rising geopolitical tensions in major choke points have forced global shipping giants to re-route container ships around Africa, inflating fuel costs and consumer price index margins. The newly signed Geneva Maritime Accord (GMA-2026) establishes defensive joint patrols, standardized electronic alert networks, and mutual naval escort agreements. Financial observers predict this security pact will decrease shipping insurance premiums by 15% and restore container transport times through the Suez Canal to normal operational ratios by late summer. Human rights watchdogs also welcomed the accord's strict guidelines protecting civilian crew members in maritime conflict areas.",
      image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800",
      category: "international",
      date: "May 31, 2026",
      author: "Sarah Jenkins",
      tags: ["Geopolitics", "Trade Accord", "UPSC GS-II"]
    },
    {
      id: "int-02",
      title: "United Nations Framework Convention on Climate Agrees on Unified Carbon Credit Pool",
      summary: "A historic consensus has been reached to establish a globally standard sovereign carbon credit platform with automated blockchain-backed validation audits.",
      fullContent: "Delegates from over 140 countries have resolved the long-standing Article 6 disputes by drafting a transparent carbon accounting protocol. The unified ledger is aimed at preventing double-counting and ensuring that carbon offset trades actively target real reforestation and green energy projects. Developing nations will receive guaranteed technology-transfer grants to install high-precision atmospheric monitoring systems. Observers note that establishing a reliable price floor for international carbon emission credits will encourage venture capital in decarbonization utilities.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
      category: "international",
      date: "May 25, 2026",
      author: "Marcus Vance",
      tags: ["Environment", "Sovereign Trade", "UNFCC"]
    }
  ],
  sports: [
    {
      id: "spo-01",
      title: "Indian Athletes Secure Historic Triple-Gold Championship in World Archery Cup",
      summary: "Indian recurve and compound teams exhibited masterclass precision at the Antalya Archery Finals, securing three gold medals and setting a new championship record.",
      fullContent: "The Indian contingent delivered a dramatic performance at the World Archery Cup in Turkey. The women's recurve team came from behind to defeat South Korea in a thrilling tie-breaker, sealing the gold. In the compound individual category, young prodigy Raghav Verma shot a perfect 150/150 in the final rounds, establishing a new world record. National coaches attributed this spectacular surge to updated computer-vision biomechanics tracking systems deployed at the NIS Patiala training campus, which let athletes analyze arrow-release physics down to the millisecond.",
      image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800",
      category: "sports",
      date: "May 31, 2026",
      author: "Vikram Malhotra",
      tags: ["Archery", "Gold Medal", "Sports Current Affairs"]
    },
    {
      id: "spo-02",
      title: "International Olympic Committee Finalizes AI Referee Integration Guidelines",
      summary: "The IOC has released a comprehensive framework for using computer-vision and multi-point sensor tracking systems to assist human judges in gymnastics and diving.",
      fullContent: "Seeking to eliminate bias and scoring controversies, the International Olympic Committee has approved a unified AI officiating toolkit. The technology translates high-frequency spatial tracking coordinate feeds into perfect 3D joint-angle models, automatically computing rotation velocity and landing offset alignments. While real-time human authority remains paramount on the decision desk, the AI system will serve as the final appeal reference to guarantee transparency across international qualification trails.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
      category: "sports",
      date: "May 24, 2026",
      author: "Elena Petrova",
      tags: ["Olympic Standards", "AI Officiating", "Sports Tech"]
    }
  ],
  economy: [
    {
      id: "eco-01",
      title: "Reserve Bank of India Keeps Repo Rate Stable, Expands Digital Rupee Offline Framework",
      summary: "The RBI Monetary Policy Committee voted to maintain the policy repo rate at 6.5%. The central bank simultaneously introduced offline wallet features for its CBDC.",
      fullContent: "Highlighting strong GDP structural growth projections of 7.2% for the upcoming fiscal, RBI Governor announced that the policy stance would remain focused on withdrawal of accommodation to bring CPI inflation down to its target of 4%. In a major push for financial accessibility, the RBI announced that the Digital Rupee (e₹) will now feature offline peer-to-peer transmission modules utilizing Bluetooth and secure hardware enclave chips. This allows transactions in remote areas without internet services, potentially revolutionizing digital payment penetration in village economies across Central and North India.",
      image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800",
      category: "economy",
      date: "May 31, 2026",
      author: "Rajesh K. Mehta",
      tags: ["RBI Policy", "Digital Rupee", "UPSC GS-III"]
    },
    {
      id: "eco-02",
      title: "Global Sovereign Debt Market Stabilizes Amid Declining Inflation Indices",
      summary: "Major central banks, including the US Federal Reserve and European Central Bank, have signalled subtle policy rate cuts as supply chain backlogs dissolve completely.",
      fullContent: "After nearly three years of elevated borrowing costs, international treasury assets experienced a healthy rally as sovereign bond yields fell below crucial quarterly support levels. This softening comes on the heels of dramatic drops in food and logistics indices worldwide. Financial strategists suggest this macro stabilization will relieve massive repayment pressures in debt-laden emerging economies, enabling developing nations to re-direct budgets toward infrastructure and education programs.",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800",
      category: "economy",
      date: "May 26, 2026",
      author: "Dr. Clara Dupont",
      tags: ["Sovereign Debt", "Global Banks", "Macroeconomics"]
    }
  ],
  technology: [
    {
      id: "tec-01",
      title: "Breakthrough in Room-Temperature Superconducting Thin Films Validated Internationally",
      summary: "A joint research group from Tokyo and Munich has successfully fabricated stable superconducting states in modified copper-apatite lattices under ambient pressure.",
      fullContent: "In what is being called the holy grail of modern physical engineering, researchers have documented persistent zero-resistance electrical currents at temperatures up to 21°C (294 K). This state was achieved using a sophisticated molecular beam epitaxy technique to deposit single-atom layers of oxygen-doped copper-apatite onto matching substrates. The validation data, audited independently by three global laboratory nodes, represents a seismic shift for zero-loss power transmission, hyper-efficient electrical grid infrastructures, high-precision medical imaging, and next-generation particle accelerators.",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800",
      category: "technology",
      date: "May 31, 2026",
      author: "Kenji Sato",
      tags: ["Superconductivity", "Materials Science", "Tech Revolution"]
    },
    {
      id: "tec-02",
      title: "Open-Source Consortium Releases Fully Sovereign 70B AI Parameter Model",
      summary: "The Sovereign AI Foundation has launched 'CivicLLM-70B', optimized for civic query mediation, municipal administration, and legal synthesis across 35 languages.",
      fullContent: "Built on an open-source framework free from corporate proprietary licensing, CivicLLM-70B has been pre-trained on official public archives, state court transcripts, and multi-lingual government gazettes. The model uses an innovative sparse fine-tuning layout to operate at high token-speeds on commodity developer-grade hardware. Local councils can deploy this model offline to parse citizen applications, cross-reference municipal construction laws, and translate official documents into native scripts instantly without internet dependencies.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      category: "technology",
      date: "May 22, 2026",
      author: "Siddharth Nair",
      tags: ["Open Source AI", "CivicLLM", "Tech Governance"]
    }
  ],
  admin: [
    {
      id: "adm-01",
      title: "👑 Editor's Critical Recommendation: Strategic Administrative Frameworks",
      summary: "An in-depth analysis of major administrative frameworks and editorial notes recommended for competitive mains essay preparation.",
      fullContent: "This curated guide highlights key editorial opinions published in leading daily journals like The Hindu and The Indian Express. Topics include cooperative federalism, technological interventions in rural governance (such as SVAMITVA scheme), and structural reforms in bureaucratic execution corridors. Direct mastery of these arguments enables students to frame high-scoring points in civil services essay papers and standard interviews. Read carefully and focus on quoting committees like Sarkaria Commission and 2nd Administrative Reforms Commission (ARC).",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
      category: "admin",
      date: "May 31, 2026",
      author: "Admin Editorial Board",
      tags: ["Administrative Reforms", "UPSC GS-II", "Mains Writing"]
    }
  ],
  exam: [
    {
      id: "exa-01",
      title: "📚 High-Yield Syllabus Mapping & Current Affairs Scoring Matrices",
      summary: "A targeted study planner mapping active macro policies, international treaties, and ecological shifts directly to major competitive examination boards.",
      fullContent: "Current Affairs constitutes up to 35% of scoring nodes in civil and technical administrative exams globally. This syllabus tracking matrix compiles critical milestones: 1) International Solar Alliance expansions, 2) Biological Diversity Act amendments, 3) Indian Penal Laws restructuring, and 4) RBI Banking Ombudsman guidelines. Each event is connected directly to relevant sections of GS paper blueprints. Students are advised to download the associated reference sheets, participate in weekly mock evaluations, and draft concise summary notes using the AI Assistant's customized review outlines.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55?w=800",
      category: "exam",
      date: "May 31, 2026",
      author: "Exams Expert panel",
      tags: ["Syllabus Mapping", "UPSC Strategy", "Civil Services"]
    }
  ]
};
