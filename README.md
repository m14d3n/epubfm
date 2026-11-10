# epubfm - Audiobook Player & MP3 Converter

A **100% client-side, zero-backend web application** that turns `.epub`, `.pdf`, and `.txt` books into an interactive audiobook reader with real-time word-boundary highlighting, persistent playback history/bookmarks, and in-browser `.mp3` audiobook export.

Designed to run effortlessly both on **GitHub Pages** and **locally**.

---

## ✨ Key Features

- **Persistent Local Library & Offline Storage**
  - **IndexedDB Storage**: Uploaded `.epub`, `.pdf`, `.txt`, and pasted documents are automatically stored locally in browser `IndexedDB` (with `localStorage` fallback). No data is sent to external servers.
  - **Library Management**: View all saved books with format badges (`EPUB`, `PDF`, `TXT`), word and paragraph counts. Switch between books with 1 click or remove unwanted books anytime.
  - **Quick Book Search**: Instant filter bar across all books saved in your local library.
  - **Save Pasted Text to Library**: Save custom text typed or pasted in the editor as a distinct book entry with a title.
- **Collapsible Workspace & Distraction-Free "Zen Mode"**
  - **Zen Mode**: 1-click toggle in the header (or hotkey `Z` / `Escape`) that collapses all tool panels and the audio deck, centering the reader at optimal reading width with comfortable margins, expanded height, and an unobtrusive floating playback pill.
  - **Independently Collapsible Areas**: The Audio Transport Deck can be collapsed into a compact mini transport bar; the Sidebar can be hidden to give the reader full width; and each sidebar panel (Local Library, History, Editor) can be individually collapsed. All panel preferences are persisted.
- **Unified Client-Side Book Parser (`.epub`, `.pdf`, `.txt`)**
  - **EPUB**: Extracts chapters in accurate reading order by parsing `META-INF/container.xml` and the OPF `<spine>` manifest in-browser via [JSZip](https://stuk.github.io/jszip/), with automatic fallback to sorted XHTML/HTML files.
  - **PDF**: Intelligent book parser that skips running headers, footers, page numbers, and footnotes; merges multi-line prose into natural EPUB-like paragraphs; de-hyphenates split words; joins cross-page sentence continuations; and handles two-column layouts using [PDF.js](https://mozilla.github.io/pdf.js/).
  - **TXT & Raw Text Editor**: Upload plain text files or paste/edit chapters directly in the built-in Raw Book Text editor.
- **Interactive Reader & Live Word Highlighting**
  - Click any paragraph card to immediately start playback from that exact position.
  - Real-time **paragraph highlighting** (with smooth auto-scroll) and **live spoken-word highlighting** powered by `SpeechSynthesisUtterance` word-boundary events.
  - Instant in-book **search/filter** bar to locate specific passages or chapters.
- **Full Audio Transport & Voice Controls**
  - Select from any available system/browser TTS narrator voice (`window.speechSynthesis`).
  - Adjustable **Reading Speed** (`0.5x` – `2.5x`) and **Voice Pitch** (`0.5` – `1.5`) with live remaining-time estimation.
  - Interactive progress scrubber, Previous/Next paragraph buttons, Pause/Resume, Stop, and direct **Jump to Paragraph #**.
- **Automatic Playback History, Bookmarks & Smart Resume**
  - Automatically logs `Started`, `Paused`, `Stopped`, and manual `Bookmark` events with paragraph numbers, text snippets, and timestamps in `localStorage`.
  - Click any history entry to jump back and resume from that paragraph.
  - Displays a **Resume Banner** on reload so you can pick up right where you left off.
- **Two In-Browser MP3 Audiobook Export Modes**
  - **Option 1 — Fast Cloud TTS to MP3 Synthesis**: Splits your selected paragraph range into speech segments, fetches neural TTS MP3 streams (supporting English, Spanish, French, German, Italian, Portuguese, and Croatian), and merges them into a single downloadable `.mp3` file.
  - **Option 2 — Live System Voice Capture + LameJS Encoder**: Uses `navigator.mediaDevices.getDisplayMedia` (tab audio capture) and Web Audio API + [LameJS](https://github.com/zhuker/lamejs) to record your exact local system narrator voice and encode it into a 128kbps `.mp3` file directly in the browser.
- **PWA Installation & Offline Support**
  - **Installable Desktop & Mobile App**: Complies with Progressive Web App specifications (Web App Manifest + Service Worker). Install directly from Chrome, Edge, Safari, or mobile browsers, or via the in-app **Install App** button in the header.
  - **Standalone Window Experience**: Runs in its own dedicated, chromeless desktop/mobile window like a native application with high-res app icons.
  - **Offline Caching**: Service Worker (`sw.js`) pre-caches core runtime assets (Tailwind, JSZip, PDF.js, LameJS) so your local library and player work completely offline.
- **Auto-Load Books via URL Parameter (`?book=`)**
  - Append `?book=yourbook.epub` (or `.pdf` / `.txt`) to the URL to automatically fetch and load a book hosted in the same repository/folder.

---

## 🚀 Running Locally

Although `index.html` is a standalone file, running it over a local HTTP server (`http://localhost:8080`) is recommended over `file://` so that:
1. Auto-loading books via `?book=filename.epub` works without browser `file://` CORS restrictions.
2. PDF.js web workers and Web Audio / `getDisplayMedia` tab audio capture run in a secure `localhost` context.

### Option 1: Double-Click / One-Command Launcher (Windows)

- **Command Prompt / File Explorer**: Double-click **`run-local.bat`** or run:
  ```bat
  .\run-local.bat
  ```
- **PowerShell**:
  ```powershell
  .\run-local.ps1
  ```
  *(Optional parameters: `.\run-local.ps1 -Port 3000 -NoOpen`)*

### Option 2: Node.js (Zero Dependencies — No `npm install` Needed)

Requires [Node.js](https://nodejs.org/) (uses built-in `http`, `fs`, and `path` modules only):

```bash
# Start server and open http://localhost:8080 in your default browser
npm start

# Or start server without auto-opening the browser
npm run serve

# Custom port
PORT=3000 node server.js --open
```

When started, `server.js` automatically scans the folder for any `.epub`, `.pdf`, or `.txt` files and prints direct `http://localhost:8080/?book=...` links in the terminal.

### Option 3: Python Built-in HTTP Server

If you prefer Python:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🌐 Deploying to GitHub Pages

This repository is ready for direct deployment on **GitHub Pages** with zero build steps:

1. Push this repository (`index.html`, `.nojekyll`, `README.md`, and any optional `.epub`/`.pdf` files) to GitHub:
   ```bash
   git add .
   git commit -m "Add local server and documentation"
   git push origin main
   ```
2. In your GitHub repository, navigate to **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `/ (root)`
4. Click **Save**. Your audiobook player will be live at:
   ```text
   https://<your-username>.github.io/epubfm/
   ```

### Pre-loading Books via URL Parameter

If you commit an `.epub`, `.pdf`, or `.txt` file into the repository (or place it in the project folder locally), you can share a direct link that automatically loads the book on startup:

- **GitHub Pages**: `https://<your-username>.github.io/epubfm/?book=my-book.epub`
- **Local Server**: `http://localhost:8080/?book=my-book.epub`

---

## 🛠️ Tech Stack & Architecture

All application logic, styles, and UI components live in [`index.html`](./index.html) with zero backend dependencies:

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **UI & Styling** | [Tailwind CSS](https://tailwindcss.com/) + Google Fonts (`Inter`, `Merriweather`) | Responsive dark-mode studio layout & comfortable book typography |
| **Speech Engine** | Web Speech API (`window.speechSynthesis`) | Native browser TTS playback and real-time `onboundary` word tracking |
| **EPUB Parser** | [JSZip 3.10.1](https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js) + `DOMParser` | Client-side `.epub` archive extraction and OPF `<spine>` chapter ordering |
| **PDF Parser** | [PDF.js 3.11.174](https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js) | Client-side `.pdf` text extraction and line-to-paragraph reconstruction |
| **MP3 Encoder** | [LameJS 1.2.1](https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js) + Web Audio API | In-browser 128kbps MP3 encoding & Cloud TTS MP3 buffer merging |
| **State & Library Storage** | `IndexedDB` + `window.localStorage` | Persistent client-side book library storage (`epubfm_local_library`), playback history (`studio_audiobook_history_v2`) & workspace UI preferences |
| **Local Server** | [`server.js`](./server.js) (Node.js built-ins) | Zero-dependency static HTTP server for local development and `?book=` loading |

---

## 📁 Project Structure

```text
epubfm/
├── index.html       # Complete single-file epubfm web application
├── server.js        # Zero-dependency Node.js local static HTTP server
├── package.json     # npm scripts (`npm start`, `npm run serve`)
├── run-local.bat    # Windows Command Prompt / double-click launcher
├── run-local.ps1    # Windows PowerShell launcher
├── .nojekyll        # Tells GitHub Pages to serve static files without Jekyll processing
└── README.md        # Application & usage documentation
```
