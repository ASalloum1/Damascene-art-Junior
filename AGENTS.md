# Damascene Art - Agent Guidelines

This document provides essential technical context for agentic coding agents working on the Damascene Art repository.

## 1. Project Context
Damascene Art is a premium e-commerce platform for handcrafted Damascus-style wooden boxes. The project aims to provide a "museum-like" digital experience that reflects Syrian heritage through calm luxury and artisanal identity.

## 2. Tech Stack & Commands
The project is a monorepo-style structure with multiple independent components.

### Frontend (Admin Panel, Store Manager, Customer Guest)
- **Framework:** React 19 (Vite)
- **Styling:** CSS Modules + Global Design Tokens
- **Icons:** Lucide React
- **Commands (run within the specific frontend directory):**
  - `npm install` - Install dependencies
  - `npm run dev` - Start development server
  - `npm run build` - Production build (Vite)
  - `npm run lint` - Run ESLint checks

### AI Services (`ai-services/chatbot-rag`)
- **Language:** Python
- **Commands:**
  - `pip install -r requirements.txt` - Install dependencies (when requirements are added)
  - `pytest` - Run tests (when implemented)

### Backend (Future)
- **Framework:** Laravel (API-first)

## 3. Code Style & Guidelines

### UI/UX: The "Premium" Identity
Both the **Admin Panel** and **Store Manager Dashboard** use a unified luxury palette. All new components MUST follow these rules:
- **Palette:** Gold (`#C8A45A`), Navy (`#1A1F3A`), and Cream (`#FFF8F0`).
- **Design Tokens:** ALWAYS use variables from `tokens.css`. Never use hardcoded hex values.
- **Glass Morphism:** Use `backdrop-filter: blur()` for TopBars, headers, and modals.
- **Animations:** 
  - Use staggered card entrances (fadeInUp, slideInRight).
  - Use `skeletonShimmer` for loading states.
  - Respect `prefers-reduced-motion`.

### React Best Practices (Vercel Standards)
- **State Management:** Prefer functional `setState` (e.g., `setCount(c => c + 1)`).
- **Rendering:** Use explicit ternary operators for conditional rendering (`{condition ? <Comp /> : null}`) instead of unsafe `&&`.
- **Performance:** 
  - Implement `content-visibility` for long lists or heavy sections.
  - Use `lazy` state initialization for expensive operations.
  - Avoid inline components; define them outside the main component.
- **Props:** Use destructuring for props and provide default values where appropriate.

### Naming Conventions
- **Components:** PascalCase (e.g., `ProductCard.jsx`).
- **Files:** PascalCase for components, camelCase for hooks and utils.
- **CSS Modules:** PascalCase matches the component (e.g., `Dashboard.module.css`).
- **Variables/Constants:** camelCase for variables, UPPER_SNAKE_CASE for constants.

### Imports
- Group imports: React/Third-party first, then local components, then styles.
- Use absolute paths if configured, otherwise relative paths starting with `./` or `../`.

## 4. Error Handling
- **Frontend:** Implement Error Boundaries where necessary. Use "Gold Glow" focus rings for form validation errors and red glow with shake animations.
- **AI/Backend:** Ensure meaningful error messages are returned to the frontend.

## 5. Repository Structure
- `/frontend/Admin-panel` - Core administrative dashboard.
- `/frontend/store-manager-dashboard` - Merchant/Store management interface.
- `/frontend/customer-guest` - Public-facing visitor site.
- `/ai-services` - Python services for RAG, chatbot, and visual search.
- `/docs` - Requirements and brand guidelines (see `00-project-overview.md`).

## 6. Development Workflow
- **Branching:** Work on feature branches from `develop`.
- **Documentation:** Every feature or significant UI change must be documented.
- **Verification:** Always run `npm run build` before submitting a PR to ensure no CSS or build-blocking bugs (e.g., nested @keyframes).
