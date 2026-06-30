# TicketRaiser 🎫

**TicketRaiser** is a multi-tenant SaaS Bug Tracking and Project Management platform designed to streamline ticket raising, client support, and team collaboration.

---

## 🚀 Tech Stack

### Frontend
- **React 19 & Vite**: Fast client-side rendering and module bundling.
- **Tailwind CSS**: Modern utility-first styling.
- **Lucide React**: Clean, lightweight icons.
- **Native SVGs**: Premium, responsive vector charting engine.

### Backend
- **Node.js & Express**: Extensible REST API backend.
- **MySQL (mysql2)**: Persistent relational database.
- **JWT (JSON Web Tokens)**: Secure token-based user authentication.
- **Multer**: Handled multipart screenshot uploads.

---

## ⚙️ Features

### 1. Multi-Tenant SaaS Engine
- **Companies & Plans**: Each organization gets its own secure workspace.
- **Active Subscription Guard**: Automatically enforces read-only access to endpoints when a company's subscription expires.
- **SaaS Plan Management**: Platform owners can dynamically adjust packages (Starter, Pro, Enterprise), revenue streams, and durations.

### 2. User Roles & Permission Hierarchy
- 👑 **SaaS Owner**: Platform-wide administrator overseeing all companies, subscription renewals, active/expired plans, and platform revenue.
- 💼 **Company Admin**: Manages company-specific projects, assigns team members, configures tags, generates invite codes, and tracks ticket resolutions.
- 🛠️ **Employee**: Views personal ticket dashboard, updates ticket workflow states, leaves remarks, and manages tasks.
- 👥 **Client**: Reports bug tickets, uploads screenshots, tracks project progress, and receives automated status update notifications.

### 3. Dynamic Dashboard & SVGs
- **Priority Distribution (Donut Chart)**: Renders a vector breakdown of ticket priorities (Low, Medium, High, Critical).
- **Status Overview (Bar Chart)**: Vertical bar graph tracking ticket volumes across workflow states (`OPEN`, `ASSIGNED`, `IN PROGRESS`, `TESTING`, `DONE`).
- **Weekly Activity (Line Chart)**: 7-day trend chart monitoring new ticket creation, displaying computed **Average Resolution Times** for closed tasks.

### 4. Tagging System
- Custom colored labels company-wide.
- Admins can create tags on-the-fly with a color picker widget.
- Support for tag multi-select on creation, toggling in details, and grid filtering.

### 5. Collaboration & Invites
- **Comments & Screenshots**: Threaded conversations on tickets with image-based screenshot uploads.
- **Invite Codes**: Company admins can generate role-restricted invitation codes (e.g. employee, client) with expiration and usage limits.
- **Notification Center**: Instant user notifications on ticket updates, status changes, assignments, and comments.

---

## 🗄️ Database Schema

The system relies on a relational schema with cascade deletes to maintain database integrity:
- `companies`: Subscriptions, expirations, and status.
- `users`: User profiles, credentials, role, and timezone info.
- `projects`: Project details, progress tracking, and client associations.
- `tickets`: Core ticket data containing displays (`TKT-101`), statuses, priority, assignee, and reporter.
- `tags` / `ticket_tags`: Multi-tag association tables.
- `comments` / `attachments`: Ticket collaboration elements.
- `invite_codes`: Access token registry for new user registrations.
- `notifications`: User inbox messaging system.

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL Server](https://www.mysql.com/)

### 1. Database Configuration
1. Start your local MySQL instance.
2. The backend is configured to connect to database `bug_ticket_manager` (configured to auto-create missing tables on startup).

### 2. Backend Setup
1. Navigate to `/backend`.
2. Create a `.env` file based on the following pattern:
   ```env
   DB_PORT=3306
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_root_password
   DB_NAME=bug_ticket_manager
   JWT_SECRET=your_jwt_secret_key
   ```
3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies and launch Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🔮 Simulated Features & Future Improvements

*   **Simulated Subscriptions & Payments**: All user interactions (SaaS owners, company administrators, and clients) with the billing and subscription interface are simulated. No live financial transactions are processed.
*   **Automatic Starter Plan Sign-up**: Upon company registration, companies are automatically assigned to the **Starter** plan (defaulting to `$0/mo`) with an Active status. Upgrades to Pro or Enterprise are currently handled mock-style through the dashboard.
*   **Real-time Operations**: Integrating WebSockets (e.g., Socket.io) for real-time notification prompts and live Kanban board updates.
*   **Production Storage Adapters**: Integrating cloud block storage (e.g., AWS S3, Cloudinary) to handle file/screenshot uploads permanently instead of saving files to local ephemeral VPS drives.