# Frontend Architecture Documentation

This comprehensively documents every primary editable file operating inside the `frontend/` directory, detailing its exact responsibilities, underlying architecture, and how it can be modified.

---

## 1. the Next.js `app/` Directory (Routing & Pages)

The `app` directory utilizes Next.js 14's App Router, which inherently assigns files to UI routes matching the file-tree path.

### `app/layout.tsx`
- **Role:** The ultimate root wrapper of the DOM. 
- **Technical Details:** This file acts as the `<html>` and `<body>` tags of the entire SPA. It strictly injects the `globals.css` theme and physically wraps every subsequent page inside our custom `<Providers>` component so that authentication state is preserved application-wide without un-mounting during page transitions.

### `app/page.tsx`
- **Role:** The root URL endpoint (`/`).
- **Technical Details:** Serves as a strict transit hub. Because the platform expects users to be acting out of their dashboard natively, this file simply runs a client-side `redirect('/dashboard')` upon render.

### `app/globals.css`
- **Role:** Stylesheet & Design System foundation.
- **Technical Details:** Bootstraps Tailwind CSS utilities. Instead of using standard classes everywhere, this file establishes CSS Custom Properties (CSS variables) to define the specific zinc (`--background`, `--foreground`) and indigo (`--primary`) hex values shaping the precise dark-themed aesthetic globally.

### `app/login/page.tsx` & `app/register/page.tsx`
- **Role:** Public Authentication Gateways.
- **Technical Details:** Employs `react-hook-form` coupled with `zod` for real-time validation typing (e.g. checking email strings visually before submission). They dispatch `POST` requests directly via `api.post` and subsequently trigger `login(accessToken, user)` exported from the `AuthContext` to transition the app's global state and push routing over to `/dashboard` instantly.

### `app/dashboard/page.tsx`
- **Role:** The primary authenticated landing view.
- **Technical Details:** Operates as a secure client boundary. It mounts, securely polls `api.get('/papers/recent')`, and feeds that mapped array into an isometric grid utilizing our `PaperCard` components. If `useAuth().isAuthenticated` returns false, it will securely bounce the user back to `/login`. 

### `app/search/page.tsx`
- **Role:** Global paper discovery parameterized via URL queries.
- **Technical Details:** It actively parses `?q=` queries using `useSearchParams`. To compile properly under Next.js static bundling, the parsing logic is purposefully nested inside a `<React.Suspense>` boundary. As the URL mutates, a `useEffect` natively re-fires to ping the backend search directory mapping results instantly.

### `app/papers/[id]/page.tsx`
- **Role:** Deep view of isolated Academic Papers.
- **Technical Details:** Uses dynamic routing (`[id]` parameter). This file is highly active: it manages loading the core paper data, iterating across a nested `comments` array structure dynamically, and managing local optimistic state mutations when new comments are sent so that the UI responds instantly before the backend successfully resolves. **Note:** PDF downloads currently mock an `alert()` response here waiting for backend `Blob` resolutions.

### `app/papers/publish/page.tsx`
- **Role:** Data ingestion system for standardizing new academic documentation.
- **Technical Details:** Distinctly relies on `multipart/form-data`. Because standard JSON requests cannot reliably pipe native `.pdf` files efficiently, we instantiate a `FormData` object explicitly, appending typed metadata explicitly alongside the file, and emit it strictly as a multipart packet.

### `app/messages/page.tsx`
- **Role:** Instant Messaging Interface.
- **Technical Details:** Features a split "Two-Pane" architecture. It queries `GET /conversations` entirely once for the sidebar. Then, it utilizes a Javascript `setInterval` instance (typically firing every ~3000ms) to rapidly "short-poll" the backend's `/messages` route specifically for the `activeConvId` resolving new chat injections, utilizing local `React.useRef` bounding techniques to automatically force scroll boundaries pinning users to the newest incoming message block.

### `app/profile/[id]/page.tsx`
- **Role:** Read-only User metadata view.
- **Technical Details:** Acts conditionally based on context. If the dynamic `[id]` route matches the logged-in user natively (`currentUser?.id === id`), it bypasses networking entirely and binds to local context instantly. Otherwise, it polls the backend users interface exactly to assemble foreign researchers. Contains native link pathways establishing strict conversations via `POST /conversations` automatically mapping users.

---

## 2. Core State & Networking (`lib/` & `contexts/`)

### `lib/api.ts`
- **Role:** The Global Network Interceptor.
- **Technical Details:** You will manipulate this file anytime global networking parameters evolve. It sets up `axios.create` targeting the value of `process.env.NEXT_PUBLIC_API_URL`. Highly critically, it attaches the `accessToken` in raw memory natively to all headers, and manages an `interceptors.response`. If your backend uniquely drops a `401 Unauthorized` block, this file halts the pipeline silently, runs the `POST /auth/refresh` cycle resolving an `httpOnly` cookie implicitly, replaces the memory token, and re-fires the blocked networking request sequentially.

### `contexts/AuthContext.tsx`
- **Role:** Ephemeral App State / Context Provider.
- **Technical Details:** Utilizes React's `createContext`. On initial execution (such as pressing `F5` Refresh in the browser), raw memory fails; this context explicitly triggers `api.get('/auth/me')` internally. Upon approval, it hydrates the context and cascades DOM trees unlocking the application routes.

---

## 3. Shared Resources (`components/`)

### `components/Navbar.tsx`
- **Role:** Persistent global DOM overlay.
- **Technical Details:** Attached globally in `layout.tsx`. It intelligently hooks into `useAuth()` to deduce if you are securely authenticated over the tree. If yes, it mounts the global site routes, the `<form>` execution block tying `router.push('/search')`, and handles the `<button onClick={logout}>` execution resetting raw application architectures locally. 

### `components/PaperCard.tsx`
- **Role:** Reusable modular architecture layout.
- **Technical Details:** Consumes a strict `Paper` interface prop. Used identically in Dashboard feeds, Profile feeds, and Search feeds resolving identical DOM classes and `Link` overlays preventing architectural divergence.
