# 🏠 Cherry Field Housing Management System

Sistem administrasi untuk manajemen perumahan Cherry Field yang dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Management**: React Hook Form + Zod
- **State Management**: React Context
- **Icons**: Lucide React
- **Charts**: Recharts

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   │   ├── dashboard/     # Dashboard components
│   │   ├── login/         # Login page & form
│   │   └── layout.tsx     # Admin layout
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage (redirects to login)
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── emergency/         # Emergency alert components
│   └── ui/                # Base UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # API service functions
└── utils/                 # Helper utilities
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd residence-admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Code Style & Standards

### File Naming Conventions

- **Pages**: `page.tsx` (Next.js App Router standard)
- **Components**: `kebab-case.tsx` (e.g., `login-form.tsx`)
- **Layouts**: `layout.tsx` 
- **Hooks**: `use-hook-name.ts`
- **Utilities**: `kebab-case.ts`

### Component Structure

```typescript
// Component imports first
import { ComponentType } from "react";

// External library imports
import { useForm } from "react-hook-form";

// Internal imports
import { Button } from "@/components/ui/button";

// Type definitions
interface ComponentProps {
  // props definition
}

// Component implementation
export default function ComponentName({ props }: ComponentProps) {
  // component logic
}
```

### TypeScript Guidelines

- Always use TypeScript for type safety
- Define interfaces for all component props
- Use `type` for unions and `interface` for object shapes
- Leverage Zod for runtime validation

## 🧩 Key Features

- **Authentication**: Secure admin login with remember me
- **Dashboard**: Overview of housing management metrics
- **Resident Management**: Manage residents and housing units
- **Financial Management**: Handle IPL billing and transactions
- **Emergency Alerts**: Real-time emergency notification system
- **Document Management**: Handle letters and regulations
- **Complaint Management**: Track and resolve resident complaints

## 📊 Emergency Alert System

The application includes a comprehensive emergency alert system:

- Real-time notifications
- Audio alerts
- Modal overlays
- Context-based state management

## 🔧 Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

## 🎨 UI Components

The project uses a custom design system built on:

- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **Custom Components**: Tailored for housing management needs

## 📱 Responsive Design

- Mobile-first approach
- Responsive sidebar navigation
- Optimized for various screen sizes
- Touch-friendly interface

## 🔒 Security

- JWT-based authentication
- Protected routes
- Client-side token management
- Secure API endpoints

## 🚧 Contributing

1. Follow the established code style
2. Use TypeScript for all new components
3. Write descriptive commit messages
4. Test your changes thoroughly
5. Update documentation as needed

## 📄 License

This project is proprietary software for Cherry Field Housing Management.

---

Built with ❤️ using Next.js and TypeScript
