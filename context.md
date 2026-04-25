🗂️ Project Structure
/src/app/
├── App.tsx                        ← Entry point, wraps RouterProvider
├── routes.tsx                     ← All 7 routes defined
├── pages/
│   ├── LandingPage.tsx
│   ├── SignUpPage.tsx
│   ├── DashboardPage.tsx
│   ├── PostCreationPage.tsx
│   ├── ConsultingRequestPage.tsx
│   ├── ProjectDetailPage.tsx
│   └── ContractPaymentPage.tsx
└── components/ui/                 ← Full shadcn/ui component library
    (button, card, input, badge, tabs, avatar, checkbox, separator, etc.)
📄 Page-by-Page Breakdown
1. LandingPage.tsx — Route: /
Purpose: Marketing/home page introducing Synkrisis to new visitors.

Contains:

Header with Synkrisis logo (indigo "S" icon + wordmark) and nav links to anchor sections
Hero Section — large headline "Connect Artists with Builders", subtext, and two CTA buttons: I'm an Artist → /signup?type=artist and I'm a Builder → /signup?type=builder
How It Works — 3-step cards: Sign Up → Connect → Collaborate
For Artists section (anchor #for-artists) — bullet list of platform benefits
For Builders section (anchor #for-builders) — bullet list of platform benefits
Style: bg-gradient-to-br from-blue-50 to-indigo-100, white glassmorphism header
2. SignUpPage.tsx — Route: /signup?type=artist|builder
Purpose: Dual-mode sign-up form. URL param ?type= preselects the tab.

Contains:

Toggle buttons to switch between "Artist Sign-Up" and "Provider Sign-Up"
Artist Form fields: Name, Email, multi-select checkbox for "What do you need help with?" (Development, Marketing, Design, Content Writing, SEO, Social Media)
Provider/Builder Form fields: Name, Email, Portfolio/GitHub URL, multi-select checkbox for "Your Skills" (Web Dev, Mobile Dev, UI/UX, Digital Marketing, SEO, Content Creation, Branding, Data Analysis)
On submit: saves userType ('artist' or 'provider') and userData to sessionStorage, then navigates to /dashboard
Note: The UI labels say "Builder Sign-Up" on the toggle but sessionStorage stores the value as 'provider'
3. DashboardPage.tsx — Route: /dashboard
Purpose: Main hub after login. Adapts based on userType from sessionStorage.

Contains:

Header with logo, user name + role Badge, and a logout button (clears sessionStorage → /)
Sidebar (left):
User Info card (name, email, needs/skills badges, portfolio link)
"Quick Actions" card (Artists only): New Project button → /post-creation
Main area with 3 tabs:
Browse tab: Search bar + skill filter badges + project cards. Each card shows title, description, budget (₹ INR), skill badges, "Posted by", and a View Details button → /project/:id
My Projects tab: Empty state with "Create Your First Project" button (Artists only)
Consulting Requests tab: Artists see a Request Consulting button → /consulting-request; Providers see empty state
Mock data (4 projects):
ID	Title	Budget
1	Artist needs Portfolio Website	₹25,000
2	E-commerce Site for Art Prints	₹83,000
3	Social Media Marketing Campaign	₹41,500
4	Mobile App for Art Gallery	₹1,66,000
4. PostCreationPage.tsx — Route: /post-creation
Purpose: Decision gate for Artists — choose how to post their project needs.

Contains:

Two choice cards:
Post Publicly to Forum — describes getting multiple proposals, comparison shopping, free to post. Currently triggers an alert() then redirects to dashboard (form not yet built)
Request Consulting (highlighted with indigo border) — describes curated matching, expert guidance. Navigates to /consulting-request
Info card at the bottom explaining which option to choose
5. ConsultingRequestPage.tsx — Route: /consulting-request
Purpose: Form for Artists to request personalized builder matching via the Synkrisis team.

Contains:

Two top option cards:
Schedule a Call — opens Calendly (https://calendly.com) in new tab
Submit Request — highlighted info card pointing to the form below
Project Details Form:
Project Description (Textarea, required)
Minimum Budget (₹ INR, number input with ₹ prefix symbol)
Maximum Budget (₹ INR, number input with ₹ prefix symbol)
Expected Timeline (text input, e.g. "2-3 months")
Preferred Skills (multi-select checkboxes: 10 options including E-commerce and Social Media)
On submit: saves to sessionStorage.consultingRequest, shows alert, navigates to /dashboard
"What happens next?" info card with 4-step process
6. ProjectDetailPage.tsx — Route: /project/:id
Purpose: Full detail view of a single project. Adapts based on userType.

Contains:

Left column (2/3 width):
Project header card: title, description, "Assigned via Consulting" badge (if applicable), skill badges, budget/timeline/status grid
Full description card (whitespace-preserving, with requirements list)
Expected Deliverables card (checklist with green CheckCircle2 icons)
Posted By card (avatar with initials, name, posted date)
Right sidebar (1/3 width, sticky):
Provider view: Shows "Apply for this Project" with a simple CTA button that triggers an alert
Artist view: Shows a Recommended Provider card with mock provider Rahul Verma (rating 4.8, 12 projects, full-stack dev, GitHub link, skill badges) and a "Proceed to Contract" button → /contract/:id
Mock project data only exists for id: '1' (falls back to project 1 for all IDs)
7. ContractPaymentPage.tsx — Route: /contract/:id
Purpose: Final step — mutual contract signing and payment initiation.

Contains:

Contract Overview card: Shows Artist (Priya Sharma / PS) and Provider (Rahul Verma / RV) with avatars
Contract Terms card: Milestone list with numbered steps, description, duration, and INR amount per milestone:
Milestone 1 — Design Mockup: ₹8,300 / 1 week
Milestone 2 — Full Site Build: ₹16,700 / 2-3 weeks
Payment Breakdown card:
Total Stipend: ₹25,000
Platform Fee (10%): ₹2,500
TOTAL: ₹27,500 (displayed with IndianRupee Lucide icon)
Green note: "Consulting fee included at no extra cost" (when consultingFee === 0)
Acceptance Status card: Live state for both parties (pending → accepted)
Action Buttons (role-dependent):
Artist: Accept & Pay ₹27,500 (green button) → sets artistAccepted = true
Provider: Accept Contract → sets providerAccepted = true
Both accepted: Proceed to Project Dashboard (indigo) → /dashboard
Terms & Conditions info card (escrow, milestone release, dispute resolution, etc.)
🔧 Tech & Architecture Notes
Aspect	Detail
Framework	React + TypeScript
Routing	react-router (Data mode, createBrowserRouter)
Styling	Tailwind CSS v4 + shadcn/ui component library
State	sessionStorage for user session (userType, userData, consultingRequest)
Currency	All amounts in ₹ INR using toLocaleString('en-IN') and IndianRupee icon
Mock Data	Hardcoded in each page file; no backend/API yet
Icons	lucide-react
Auth	Simulated — no real auth, just sessionStorage flag
🔗 Navigation Flow
/ (Landing)
  └─ /signup?type=artist   → /dashboard
  └─ /signup?type=builder  → /dashboard
         └─ /post-creation
               └─ /consulting-request → /dashboard
         └─ /project/:id
               └─ /contract/:id → /dashboard
The platform is fully scaffolded with mock data, INR pricing, and role-based UI logic. The main gaps are: no real public post creation form (just an alert), no real auth, and all data is ephemeral (sessionStorage only).

**What i want the project to be like**
In terms of the page itself were building a simple posting forum where artists can drop their requirements along with their work and different people whove signed up on our platform can see it, meet the requirements and connect with them to earn a stipend provided they complete deliverables 

Assume an Artist requires help with marketing or web page building and has zero knowledge of the same.
We can get a 4th year Engineering student who also has a passion for building creative websites on the side to actually use his skill and earn an income from it through which we take a cut.

This opens up possibilities for us to connect two very distinct niche groups that would never cross paths in terms of networking otherwise
The wireframe of it is such that

First we have a sign up page which is the main collection of data and info

either an artist or a service provider
FOR Artist a)
SIGN UP 
then choose consulting method and service options
Opt for call in or post straight through algorithm

Find relevant service provider and task
come to a contractual understanding to then pay
For Service provider b)

Provide details through sign up 
get approved by showing work or progress or success.

Find work opportunities, get assigned opportunities from consulting calls 

complete deliverables and get paid
in terms of the website itself we have one main forum page
the profile pages
and whatever transitioning pages we require for payment, confirmation, connecting both sides .
We try and complete the lack of skills for newer age less connected artists by putting them across a forum where they can connect to people with those skills from a relatively distinct background compared to the native service pool.