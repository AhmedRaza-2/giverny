/*
 * Giverny skill index: SERVER ONLY. Never served to browsers.
 * Install commands live here so the site can hand them out only after the GitHub follow + star check.
 * Edit this file, then run: node scripts/build-public.mjs (regenerates data/skills.js without commands).
 *
 * Fields: id, name, by, repo, path?, cat, official?, desc, cmd, alt?, plugin? { add, install }, kind?, ask, stars
 */
export const UPDATED = "2026-11-22";
export const SKILLS = [
  {
    "id": "frontend-design",
    "name": "Frontend Design",
    "by": "Anthropic",
    "repo": "anthropics/skills",
    "path": "skills/frontend-design",
    "cat": "taste",
    "official": true,
    "desc": "Anthropic's own skill for distinctive, production-grade interfaces. It makes Claude commit to an aesthetic instead of falling back on generic layouts.",
    "cmd": "claude plugin install frontend-design@claude-plugins-official",
    "alt": "npx skills add anthropics/skills --skill frontend-design",
    "plugin": {
      "add": null,
      "install": "frontend-design@claude-plugins-official"
    },
    "ask": "Use frontend-design to build a landing page for my bakery.",
    "stars": 198899
  },
  {
    "id": "ui-ux-pro-max",
    "name": "UI UX Pro Max",
    "by": "Next Level Builder",
    "repo": "nextlevelbuilder/ui-ux-pro-max-skill",
    "cat": "taste",
    "desc": "A searchable design library of styles, color palettes, font pairings and UX rules across web and mobile stacks. Claude picks a full design system before it writes code.",
    "cmd": "npx ui-ux-pro-max-cli init --ai claude",
    "plugin": {
      "add": "nextlevelbuilder/ui-ux-pro-max-skill",
      "install": "ui-ux-pro-max@ui-ux-pro-max-skill"
    },
    "ask": "Generate a design system for a fintech dashboard, then build the overview screen.",
    "stars": 152779
  },
  {
    "id": "taste-skill",
    "name": "Taste Skill",
    "by": "Leonxlnx",
    "repo": "Leonxlnx/taste-skill",
    "cat": "taste",
    "desc": "Art direction, real reference photos and a browser check, so Claude builds company-grade websites instead of a template landing page.",
    "cmd": "npx skills add Leonxlnx/taste-skill --skill design-taste-frontend",
    "plugin": {
      "add": "Leonxlnx/taste-skill",
      "install": "taste-skill@taste-skill"
    },
    "ask": "Redesign my homepage with taste-skill and check it in the browser.",
    "stars": 120004
  },
  {
    "id": "impeccable",
    "name": "Impeccable",
    "by": "Paul Bakaus",
    "repo": "pbakaus/impeccable",
    "cat": "taste",
    "desc": "A design vocabulary for your agent: polish, bolder, critique, audit. Includes a detector and an optional hook that catches AI slop before Claude calls the work done.",
    "cmd": "npx impeccable install",
    "plugin": {
      "add": "pbakaus/impeccable",
      "install": "impeccable@impeccable"
    },
    "ask": "Run an impeccable critique on this page, then polish it.",
    "stars": 114909
  },
  {
    "id": "ui-skills",
    "name": "UI Skills",
    "by": "ibelick",
    "repo": "ibelick/ui-skills",
    "cat": "taste",
    "desc": "Opinionated constraints for design engineers: a baseline UI ruleset, accessibility and motion-performance fixes, metadata, and DESIGN.md creation.",
    "cmd": "npx skills add ibelick/ui-skills",
    "ask": "Apply baseline-ui to this component and fix the accessibility issues.",
    "stars": 11308
  },
  {
    "id": "interface-design",
    "name": "Interface Design",
    "by": "Dammyjay93",
    "repo": "Dammyjay93/interface-design",
    "cat": "taste",
    "desc": "Craft, memory and enforcement for consistent UI. Claude records your design decisions and keeps every new screen in line with them.",
    "cmd": "npx skills add dammyjay93/interface-design --skill interface-design",
    "plugin": {
      "add": "Dammyjay93/interface-design",
      "install": "interface-design@interface-design"
    },
    "ask": "Set up interface-design for this project and build the settings screen.",
    "stars": 6025
  },
  {
    "id": "oil-ui",
    "name": "Oil UI",
    "by": "oil-oil",
    "repo": "oil-oil/oil-ui",
    "cat": "taste",
    "desc": "Recommends one clear visual direction and refines it against real browser screenshots, or explores three distinct directions side by side when you want to compare.",
    "cmd": "npx skills add oil-oil/oil-ui",
    "ask": "Show me three directions for my pricing page with oil-ui.",
    "stars": 3863
  },
  {
    "id": "superdesign",
    "name": "Superdesign",
    "by": "Superdesign",
    "repo": "superdesigndev/superdesign-skill",
    "cat": "taste",
    "desc": "Reads your codebase, sets up a design system and generates branchable UI drafts you refine on an infinite canvas.",
    "cmd": "npx skills add superdesigndev/superdesign-skill",
    "plugin": {
      "add": "superdesigndev/superdesign-skill",
      "install": "superdesign@superdesign"
    },
    "ask": "Use superdesign to draft three versions of my onboarding flow.",
    "stars": 1047
  },
  {
    "id": "styleseed",
    "name": "StyleSeed",
    "by": "bitjaru",
    "repo": "bitjaru/styleseed",
    "cat": "taste",
    "desc": "Locks design rules in, then runs a render, score and revise loop so Claude's output measurably improves rather than drifting.",
    "cmd": "npx -y skills add bitjaru/styleseed -a claude-code -y --copy",
    "plugin": {
      "add": "bitjaru/styleseed",
      "install": "styleseed@styleseed"
    },
    "ask": "Use styleseed to rebuild this dashboard and score the result.",
    "stars": 1029
  },
  {
    "id": "auteur",
    "name": "Auteur",
    "by": "agiwhitelist",
    "repo": "agiwhitelist/auteur",
    "cat": "taste",
    "desc": "Directs a website like a film. Art direction is locked before any code, assets are generated locally, and every ship passes an anti-slop linter and a motion check.",
    "cmd": "npx skills add agiwhitelist/auteur",
    "plugin": {
      "add": "agiwhitelist/auteur",
      "install": "auteur@auteur"
    },
    "ask": "Use auteur to direct and build a launch site for my app.",
    "stars": 934
  },
  {
    "id": "awesome-design-md",
    "name": "Awesome DESIGN.md",
    "by": "VoltAgent",
    "repo": "VoltAgent/awesome-design-md",
    "cat": "systems",
    "desc": "84 design systems analysed from real sites like Linear, Apple, Notion and Figma, each as a DESIGN.md. Drop one in your project and Claude builds in that visual language.",
    "cmd": "curl -o DESIGN.md https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/linear.app/DESIGN.md",
    "kind": "file",
    "ask": "Read DESIGN.md and build my settings page in that style.",
    "stars": 128624
  },
  {
    "id": "stitch-design-md",
    "name": "DESIGN.md Writer",
    "by": "Google Labs",
    "repo": "google-labs-code/stitch-skills",
    "path": "plugins/stitch-utilities/skills/design-md",
    "cat": "systems",
    "official": true,
    "desc": "Writes a DESIGN.md for your project: a plain-text design system in Google Stitch's format that any coding agent can follow.",
    "cmd": "npx skills add google-labs-code/stitch-skills --skill design-md",
    "ask": "Create a DESIGN.md from my current site's styles.",
    "stars": 11827
  },
  {
    "id": "designer-skills",
    "name": "Designer Skills",
    "by": "Marie Claire Dean",
    "repo": "Owl-Listener/designer-skills",
    "cat": "systems",
    "desc": "111 skills in 12 plugins covering the whole design process: research, UX strategy, design systems, UI, interaction, prototyping, critique and design ops.",
    "cmd": "claude plugin marketplace add Owl-Listener/designer-skills && claude plugin install ui-design@designer-skills",
    "plugin": {
      "add": "Owl-Listener/designer-skills",
      "install": "ui-design@designer-skills"
    },
    "ask": "Use the ui-design skills to define a type scale and spacing system for my app.",
    "stars": 3462
  },
  {
    "id": "typeui",
    "name": "TypeUI Design Skills",
    "by": "Bergside",
    "repo": "bergside/awesome-design-skills",
    "cat": "systems",
    "desc": "67 ready-made style skills, from bento and neon to enterprise and minimal. Pull one into your project and Claude designs in that style.",
    "cmd": "npx typeui.sh pull bento",
    "ask": "Use the bento style skill to lay out my features section.",
    "stars": 3770
  },
  {
    "id": "dembrandt",
    "name": "Dembrandt",
    "by": "Dembrandt",
    "repo": "dembrandt/dembrandt-skills",
    "cat": "systems",
    "desc": "90 senior-level UX and design-system skills: hierarchy, typography, density, component consistency, overlays and loading states.",
    "cmd": "npx skills add dembrandt/dembrandt-skills --all",
    "plugin": {
      "add": "dembrandt/dembrandt-skills",
      "install": "dembrandt@dembrandt"
    },
    "ask": "Review my component library for consistency with dembrandt.",
    "stars": 202
  },
  {
    "id": "theme-factory",
    "name": "Theme Factory",
    "by": "Anthropic",
    "repo": "anthropics/skills",
    "path": "skills/theme-factory",
    "cat": "systems",
    "official": true,
    "desc": "Ten preset color and font themes Claude can apply to slides, docs, reports and landing pages, or a new theme generated on the spot.",
    "cmd": "npx skills add anthropics/skills --skill theme-factory",
    "ask": "Apply a theme-factory theme to my quarterly report.",
    "stars": 198899
  },
  {
    "id": "brand-guidelines",
    "name": "Brand Guidelines",
    "by": "Anthropic",
    "repo": "anthropics/skills",
    "path": "skills/brand-guidelines",
    "cat": "systems",
    "official": true,
    "desc": "A working example of a brand skill. Fork it, swap in your colors and type, and Claude keeps every artifact on brand.",
    "cmd": "npx skills add anthropics/skills --skill brand-guidelines",
    "ask": "Turn brand-guidelines into a skill for my company's brand.",
    "stars": 198899
  },
  {
    "id": "emil-skills",
    "name": "Emil Kowalski's Skills",
    "by": "Emil Kowalski",
    "repo": "emilkowalski/skills",
    "cat": "motion",
    "desc": "20 skills from the maker of Sonner and Vaul: animate, choreograph, gestures, animation reviews, Apple-style design and design-engineering taste.",
    "cmd": "npx skills@latest add emilkowalski/skills",
    "ask": "Find animation opportunities in this page and choreograph them.",
    "stars": 58814
  },
  {
    "id": "gsap",
    "name": "GSAP Skills",
    "by": "GreenSock",
    "repo": "greensock/gsap-skills",
    "cat": "motion",
    "official": true,
    "desc": "Official GSAP skills for tweens, timelines, ScrollTrigger, React and performance, so Claude writes animation code that works the first time.",
    "cmd": "npx skills add https://github.com/greensock/gsap-skills",
    "plugin": {
      "add": "greensock/gsap-skills",
      "install": "gsap-skills@gsap-skills"
    },
    "ask": "Add a ScrollTrigger reveal to the hero with GSAP.",
    "stars": 18908
  },
  {
    "id": "feel-better",
    "name": "Make Interfaces Feel Better",
    "by": "Jakub Krehel",
    "repo": "jakubkrehel/make-interfaces-feel-better",
    "cat": "motion",
    "desc": "The small details that make UI feel crafted: animation, typography, icons, hover states, optical alignment, concentric radii, shadows and hit areas.",
    "cmd": "npx skills add jakubkrehel/make-interfaces-feel-better",
    "ask": "Make this card component feel better.",
    "stars": 4222
  },
  {
    "id": "view-transitions",
    "name": "React View Transitions",
    "by": "Vercel",
    "repo": "vercel-labs/agent-skills",
    "path": "skills/react-view-transitions",
    "cat": "motion",
    "official": true,
    "desc": "Native-feeling page and element transitions using React's View Transitions API.",
    "cmd": "npx skills add vercel-labs/agent-skills --skill vercel-react-view-transitions",
    "ask": "Add a view transition between the list and detail pages.",
    "stars": 34730
  },
  {
    "id": "web-design-guidelines",
    "name": "Web Design Guidelines",
    "by": "Vercel",
    "repo": "vercel-labs/agent-skills",
    "path": "skills/web-design-guidelines",
    "cat": "review",
    "official": true,
    "desc": "Audits your UI code against Vercel's Web Interface Guidelines: 100+ rules for accessibility, focus, forms, motion and performance.",
    "cmd": "npx skills add vercel-labs/agent-skills --skill web-design-guidelines",
    "ask": "Review my UI against the web design guidelines.",
    "stars": 34730
  },
  {
    "id": "kwp-design",
    "name": "Design Plugin",
    "by": "Anthropic",
    "repo": "anthropics/knowledge-work-plugins",
    "path": "design",
    "cat": "review",
    "official": true,
    "desc": "Design critique, accessibility review, design-system audits, developer handoff specs, UX copy and research synthesis in one plugin.",
    "cmd": "claude plugin marketplace add anthropics/knowledge-work-plugins && claude plugin install design@knowledge-work-plugins",
    "plugin": {
      "add": "anthropics/knowledge-work-plugins",
      "install": "design@knowledge-work-plugins"
    },
    "ask": "Critique this screen and write the handoff spec.",
    "stars": 36683
  },
  {
    "id": "web-quality",
    "name": "Web Quality Skills",
    "by": "Addy Osmani",
    "repo": "addyosmani/web-quality-skills",
    "cat": "review",
    "desc": "Lighthouse-grade audits for performance, Core Web Vitals, accessibility, SEO and best practices, with fixes Claude can apply.",
    "cmd": "npx skills add addyosmani/web-quality-skills",
    "plugin": {
      "add": "addyosmani/web-quality-skills",
      "install": "web-quality-skills@addy-web-quality-skills"
    },
    "ask": "Run a web quality audit on my site and fix the top issues.",
    "stars": 3118
  },
  {
    "id": "playwright-skill",
    "name": "Playwright Skill",
    "by": "lackeyjb",
    "repo": "lackeyjb/playwright-skill",
    "cat": "review",
    "desc": "Claude opens your app in a real browser, clicks through it and takes screenshots, so it can see what it built.",
    "cmd": "npx skills add lackeyjb/playwright-skill --skill playwright-skill",
    "plugin": {
      "add": "lackeyjb/playwright-skill",
      "install": "playwright-skill@playwright-skill"
    },
    "ask": "Open localhost:3000, screenshot every page at mobile width and list layout bugs.",
    "stars": 3312
  },
  {
    "id": "webapp-testing",
    "name": "Webapp Testing",
    "by": "Anthropic",
    "repo": "anthropics/skills",
    "path": "skills/webapp-testing",
    "cat": "review",
    "official": true,
    "desc": "Anthropic's Playwright toolkit for local web apps: verify behaviour, capture screenshots and read browser logs.",
    "cmd": "npx skills add anthropics/skills --skill webapp-testing",
    "ask": "Test the signup flow on my local app and show me screenshots.",
    "stars": 198899
  },
  {
    "id": "wondel-ux",
    "name": "UX Design Frameworks",
    "by": "Wondel.ai",
    "repo": "wondelai/skills",
    "cat": "review",
    "desc": "Classic design books as skills: Refactoring UI, UX heuristics, The Design of Everyday Things, web typography, microinteractions and Hooked.",
    "cmd": "claude plugin marketplace add wondelai/skills && claude plugin install ux-design@wondelai-skills",
    "plugin": {
      "add": "wondelai/skills",
      "install": "ux-design@wondelai-skills"
    },
    "ask": "Review this page using Refactoring UI principles.",
    "stars": 2765
  },
  {
    "id": "color-expert",
    "name": "Color Expert",
    "by": "meodai",
    "repo": "meodai/skill.color-expert",
    "cat": "review",
    "desc": "Color science on tap: OKLCH and OKLAB, palette generation, APCA and WCAG contrast, and color naming.",
    "cmd": "npx skills add meodai/skill.color-expert",
    "ask": "Build an accessible OKLCH palette from my brand blue.",
    "stars": 670
  },
  {
    "id": "platform-design",
    "name": "Platform Design Skills",
    "by": "ehmo",
    "repo": "ehmo/platform-design-skills",
    "cat": "review",
    "desc": "300+ rules from Apple HIG, Material Design 3 and WCAG 2.2, with one skill per platform from iOS and Android to visionOS and the web.",
    "cmd": "npx skills add ehmo/platform-design-skills",
    "ask": "Check my Android screens against Material Design 3.",
    "stars": 650
  },
  {
    "id": "hig-doctor",
    "name": "Apple HIG Doctor",
    "by": "Raintree Technology",
    "repo": "raintree-technology/hig-doctor",
    "cat": "review",
    "desc": "Apple's Human Interface Guidelines as 14 skills, plus a CLI that audits your UI against them.",
    "cmd": "npx skills add raintree-technology/hig-doctor",
    "plugin": {
      "add": "raintree-technology/hig-doctor",
      "install": "apple-hig-skills@apple-hig-skills"
    },
    "ask": "Audit my iOS app's controls against the HIG.",
    "stars": 157
  },
  {
    "id": "chrome-devtools",
    "name": "Chrome DevTools",
    "by": "Google Chrome",
    "repo": "anthropics/claude-plugins-official",
    "cat": "review",
    "official": true,
    "desc": "Claude controls and inspects a live Chrome: performance traces, network requests, console messages and screenshots.",
    "cmd": "claude plugin install chrome-devtools-mcp@claude-plugins-official",
    "plugin": {
      "add": null,
      "install": "chrome-devtools-mcp@claude-plugins-official"
    },
    "ask": "Record a performance trace of my homepage and explain the slow parts.",
    "stars": 47968
  },
  {
    "id": "react-best-practices",
    "name": "React Best Practices",
    "by": "Vercel",
    "repo": "vercel-labs/agent-skills",
    "path": "skills/react-best-practices",
    "cat": "platforms",
    "official": true,
    "desc": "Vercel's rules for fast React and Next.js: rendering, data fetching, bundle size and unnecessary re-renders.",
    "cmd": "npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices",
    "ask": "Review this Next.js page for performance problems.",
    "stars": 34730
  },
  {
    "id": "composition-patterns",
    "name": "Composition Patterns",
    "by": "Vercel",
    "repo": "vercel-labs/agent-skills",
    "path": "skills/composition-patterns",
    "cat": "platforms",
    "official": true,
    "desc": "Component APIs that scale: compound components, slots, and an end to boolean-prop sprawl.",
    "cmd": "npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns",
    "ask": "Refactor my Modal component with composition patterns.",
    "stars": 34730
  },
  {
    "id": "shadcn-ui",
    "name": "shadcn/ui",
    "by": "Google Labs",
    "repo": "google-labs-code/stitch-skills",
    "path": "plugins/stitch-build/skills/shadcn-ui",
    "cat": "platforms",
    "official": true,
    "desc": "Builds with shadcn/ui the intended way: installing, composing and theming components instead of rewriting them.",
    "cmd": "npx skills add google-labs-code/stitch-skills --skill shadcn-ui",
    "ask": "Build a settings form with shadcn/ui components.",
    "stars": 11827
  },
  {
    "id": "modern-web",
    "name": "Modern Web Guidance",
    "by": "Google Chrome",
    "repo": "anthropics/claude-plugins-official",
    "cat": "platforms",
    "official": true,
    "desc": "Keeps Claude current with the latest web platform features and best practices, straight from the Chrome team.",
    "cmd": "claude plugin install modern-web-guidance@claude-plugins-official",
    "plugin": {
      "add": null,
      "install": "modern-web-guidance@claude-plugins-official"
    },
    "ask": "Use modern CSS features to simplify this layout.",
    "stars": 47968
  },
  {
    "id": "threejs",
    "name": "Three.js Skills",
    "by": "CloudAI-X",
    "repo": "CloudAI-X/threejs-skills",
    "cat": "platforms",
    "desc": "13 skills for 3D on the web: scenes, geometry, materials, shaders, lighting, post-processing and React Three Fiber.",
    "cmd": "npx skills add cloudai-x/threejs-skills",
    "ask": "Add an interactive 3D product viewer with Three.js.",
    "stars": 4341
  },
  {
    "id": "expo",
    "name": "Expo",
    "by": "Expo",
    "repo": "expo/skills",
    "cat": "platforms",
    "official": true,
    "desc": "Official Expo skills for React Native: native UI, Expo UI, animation, Expo Router, design systems and app store deploys.",
    "cmd": "claude plugin install expo@claude-plugins-official",
    "alt": "npx skills@latest add expo/skills --skill '*'",
    "plugin": {
      "add": null,
      "install": "expo@claude-plugins-official"
    },
    "ask": "Build a native-feeling tab layout in my Expo app.",
    "stars": 4214
  },
  {
    "id": "react-native-vercel",
    "name": "React Native Skills",
    "by": "Vercel",
    "repo": "vercel-labs/agent-skills",
    "path": "skills/react-native-skills",
    "cat": "platforms",
    "official": true,
    "desc": "Vercel's React Native guidance for performant lists, animations and native-feeling UI.",
    "cmd": "npx skills add vercel-labs/agent-skills --skill vercel-react-native-skills",
    "ask": "Fix the jank in my React Native feed.",
    "stars": 34730
  },
  {
    "id": "callstack-rn",
    "name": "React Native Best Practices",
    "by": "Callstack",
    "repo": "callstackincubator/agent-skills",
    "cat": "platforms",
    "desc": "Callstack's React Native performance and best-practice skills, plus navigation and upgrade guides.",
    "cmd": "npx skills@latest add callstackincubator/agent-skills --skill react-native-best-practices",
    "ask": "Profile and speed up my React Native app's startup.",
    "stars": 1715
  },
  {
    "id": "swiftui-pro",
    "name": "SwiftUI Pro",
    "by": "Paul Hudson",
    "repo": "twostraws/SwiftUI-Agent-Skill",
    "cat": "platforms",
    "desc": "Paul Hudson's SwiftUI skill for iOS 26 and Swift 6: modern APIs, accessibility, performance and the mistakes AI tools commonly make.",
    "cmd": "npx skills add https://github.com/twostraws/swiftui-agent-skill --skill swiftui-pro",
    "plugin": {
      "add": "twostraws/SwiftUI-Agent-Skill",
      "install": "swiftui-pro@swiftui-agent-skill"
    },
    "ask": "Review my SwiftUI views with swiftui-pro.",
    "stars": 6610
  },
  {
    "id": "swiftui-expert",
    "name": "SwiftUI Expert",
    "by": "Antoine van der Lee",
    "repo": "AvdLee/SwiftUI-Agent-Skill",
    "cat": "platforms",
    "desc": "SwiftUI state management, view composition, performance and Liquid Glass adoption, distilled into concise references.",
    "cmd": "npx skills@latest add https://github.com/avdlee/swiftui-agent-skill --skill swiftui-expert-skill",
    "plugin": {
      "add": "AvdLee/SwiftUI-Agent-Skill",
      "install": "swiftui-expert@swiftui-expert-skill"
    },
    "ask": "Adopt Liquid Glass in my app's toolbar.",
    "stars": 3938
  },
  {
    "id": "frontend-slides",
    "name": "Frontend Slides",
    "by": "Zara Zhang",
    "repo": "zarazhangrui/frontend-slides",
    "cat": "visual",
    "desc": "Animation-rich HTML presentations, from scratch or converted from PowerPoint, with style previews to choose from first.",
    "cmd": "claude plugin marketplace add zarazhangrui/frontend-slides && claude plugin install frontend-slides@frontend-slides",
    "alt": "git clone https://github.com/zarazhangrui/frontend-slides.git ~/.claude/skills/frontend-slides",
    "plugin": {
      "add": "zarazhangrui/frontend-slides",
      "install": "frontend-slides@frontend-slides"
    },
    "ask": "Make a 10-slide pitch deck for my startup.",
    "stars": 32768
  },
  {
    "id": "visual-explainer",
    "name": "Visual Explainer",
    "by": "Nico Bailon",
    "repo": "nicobailon/visual-explainer",
    "cat": "visual",
    "desc": "Turns diagrams, diff reviews, plan audits and data tables into rich HTML pages or slide decks.",
    "cmd": "claude plugin marketplace add nicobailon/visual-explainer && claude plugin install visual-explainer@visual-explainer-marketplace",
    "plugin": {
      "add": "nicobailon/visual-explainer",
      "install": "visual-explainer@visual-explainer-marketplace"
    },
    "ask": "Explain this pull request as a visual page.",
    "stars": 11221
  },
  {
    "id": "remotion",
    "name": "Remotion",
    "by": "Remotion",
    "repo": "remotion-dev/skills",
    "cat": "visual",
    "official": true,
    "desc": "Make videos with React: product promos, captions, animated maps and renders, all in code.",
    "cmd": "npx skills add remotion-dev/skills",
    "ask": "Make a 20-second promo video of my app with Remotion.",
    "stars": 7791
  },
  {
    "id": "excalidraw",
    "name": "Excalidraw Diagrams",
    "by": "Cole Medin",
    "repo": "coleam00/excalidraw-diagram-skill",
    "cat": "visual",
    "desc": "Hand-drawn Excalidraw diagrams whose shapes mirror the idea: fan-outs, timelines and convergence instead of uniform box grids.",
    "cmd": "npx skills add coleam00/excalidraw-diagram-skill",
    "ask": "Draw our checkout architecture as an Excalidraw diagram.",
    "stars": 5326
  },
  {
    "id": "canvas-design",
    "name": "Canvas Design",
    "by": "Anthropic",
    "repo": "anthropics/skills",
    "path": "skills/canvas-design",
    "cat": "visual",
    "official": true,
    "desc": "Posters and visual art as PNG or PDF, built from a written design philosophy first.",
    "cmd": "npx skills add anthropics/skills --skill canvas-design",
    "ask": "Design a poster for our product launch.",
    "stars": 198899
  },
  {
    "id": "algorithmic-art",
    "name": "Algorithmic Art",
    "by": "Anthropic",
    "repo": "anthropics/skills",
    "path": "skills/algorithmic-art",
    "cat": "visual",
    "official": true,
    "desc": "Generative art with p5.js: seeded randomness, flow fields and parameters you can tune live.",
    "cmd": "npx skills add anthropics/skills --skill algorithmic-art",
    "ask": "Create a generative flow-field background for my hero.",
    "stars": 198899
  },
  {
    "id": "web-artifacts-builder",
    "name": "Web Artifacts Builder",
    "by": "Anthropic",
    "repo": "anthropics/skills",
    "path": "skills/web-artifacts-builder",
    "cat": "visual",
    "official": true,
    "desc": "Multi-component HTML artifacts with React, Tailwind and shadcn/ui, bundled into a single file.",
    "cmd": "npx skills add anthropics/skills --skill web-artifacts-builder",
    "ask": "Build an interactive pricing calculator as a single-file artifact.",
    "stars": 198899
  },
  {
    "id": "playground",
    "name": "Playground",
    "by": "Anthropic",
    "repo": "anthropics/claude-plugins-official",
    "cat": "visual",
    "official": true,
    "desc": "Self-contained HTML playgrounds with visual controls and a live preview, including templates for exploring design options.",
    "cmd": "claude plugin install playground@claude-plugins-official",
    "plugin": {
      "add": null,
      "install": "playground@claude-plugins-official"
    },
    "ask": "Make a playground to tune the border radius and shadows of my buttons.",
    "stars": 47968
  },
  {
    "id": "figma",
    "name": "Figma",
    "by": "Figma",
    "repo": "figma/mcp-server-guide",
    "cat": "tools",
    "official": true,
    "desc": "Figma's official skills and MCP server: design to code, Code Connect, and generating designs and component libraries inside Figma.",
    "cmd": "claude plugin install figma@claude-plugins-official",
    "plugin": {
      "add": null,
      "install": "figma@claude-plugins-official"
    },
    "ask": "Implement this Figma frame as a React component.",
    "stars": 2225
  },
  {
    "id": "stitch",
    "name": "Stitch",
    "by": "Google Labs",
    "repo": "google-labs-code/stitch-skills",
    "cat": "tools",
    "official": true,
    "desc": "Works with Google Stitch: generate screens, extract a DESIGN.md, and turn designs into React or React Native code.",
    "cmd": "npx skills add google-labs-code/stitch-skills",
    "ask": "Generate a dashboard in Stitch and export it to React.",
    "stars": 11827
  },
  {
    "id": "canva",
    "name": "Canva",
    "by": "Canva",
    "repo": "anthropics/claude-plugins-official",
    "cat": "tools",
    "official": true,
    "desc": "Create, edit, review, resize and brand-check Canva designs through the Canva MCP server.",
    "cmd": "claude plugin install canva@claude-plugins-official",
    "plugin": {
      "add": null,
      "install": "canva@claude-plugins-official"
    },
    "ask": "Resize my Canva launch post for Instagram and LinkedIn.",
    "stars": 47968
  },
  {
    "id": "mobbin",
    "name": "Mobbin",
    "by": "Mobbin",
    "repo": "mobbin/skills",
    "cat": "tools",
    "official": true,
    "desc": "Redesign screens using patterns from real shipped apps in Mobbin's reference library. Needs a Mobbin Pro plan.",
    "cmd": "npx skills add mobbin/skills",
    "plugin": {
      "add": "mobbin/skills",
      "install": "mobbin@mobbin"
    },
    "ask": "Find how top apps design paywalls and redesign mine.",
    "stars": 76
  },
  {
    "id": "adobe",
    "name": "Adobe for Creativity",
    "by": "Adobe",
    "repo": "anthropics/claude-plugins-official",
    "cat": "tools",
    "official": true,
    "desc": "Adobe's creative tools from Claude: background removal, vectorization, retouching and automated design workflows.",
    "cmd": "claude plugin install adobe-for-creativity@claude-plugins-official",
    "plugin": {
      "add": null,
      "install": "adobe-for-creativity@claude-plugins-official"
    },
    "ask": "Remove the background from these product photos.",
    "stars": 47968
  }
];
