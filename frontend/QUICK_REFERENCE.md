# Quick Reference Guide - Dashboard Components

## 🎯 Component Usage Examples

### StatCard
```tsx
import { StatCard } from '@components'

// Basic usage
<StatCard
  title="Total Revenue"
  value="$125,000"
  icon="💰"
  color="cyan"
/>

// With trend
<StatCard
  title="Pending Payments"
  value="$19,000"
  icon="⏳"
  trend={{ value: 5, direction: 'down' }}
  color="purple"
/>

// All color options
<div className="grid grid-cols-4 gap-4">
  <StatCard title="Revenue" value="$125k" icon="💰" color="cyan" />
  <StatCard title="Pending" value="$19k" icon="⏳" color="purple" />
  <StatCard title="Projects" value="5" icon="📋" color="green" />
  <StatCard title="Overdue" value="12" icon="🚨" color="red" />
  <StatCard title="Custom" value="$50k" icon="🎯" color="orange" />
</div>
```

---

### ChartCard
```tsx
import { ChartCard } from '@components'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

// Basic wrapper
<ChartCard title="Revenue Trend" description="Last 6 months" icon="📈">
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="value" stroke="#06b6d4" />
    </LineChart>
  </ResponsiveContainer>
</ChartCard>

// With action button
<ChartCard
  title="Downloads"
  description="Export data"
  icon="📊"
  action={<button className="text-cyan-400 hover:text-cyan-300">↓ Export</button>}
>
  {/* Chart content */}
</ChartCard>
```

---

### DataTable
```tsx
import { DataTable } from '@components'

interface Project {
  id: string
  name: string
  status: 'open' | 'in-progress' | 'completed'
  budget: number
  deadline: string
}

<DataTable<Project>
  title="Recent Projects"
  columns={[
    { key: 'name', label: 'Project Name' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs 
          ${status === 'completed' ? 'bg-green-500/20 text-green-300' 
          : 'bg-yellow-500/20 text-yellow-300'}`}>
          {status}
        </span>
      ),
    },
    {
      key: 'budget',
      label: 'Budget',
      align: 'right',
      render: (budget) => `$${budget?.toLocaleString()}`,
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ]}
  data={projects}
  rowAction={(project) => navigate(`/projects/${project.id}`)}
/>
```

---

### Sidebar
```tsx
// Already integrated in BaseLayout
// Just use BaseLayout and Sidebar is included

<BaseLayout>
  <DashboardPage />
</BaseLayout>

// Sidebar features:
// - 6 navigation items
// - Active glow highlight
// - Collapse toggle
// - Logout button
```

---

### Navbar
```tsx
// Already integrated in BaseLayout
// Features:
// - Search bar
// - Notifications dropdown (3 items)
// - Profile dropdown with logout
// - Click-outside detection
```

---

## 🎨 Styling Patterns Used

### Glass Effect
```tsx
className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl"
```

### Neon Glow Buttons
```tsx
className="shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75"
```

### Gradient Backgrounds
```tsx
className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"
```

### Smooth Transitions
```tsx
className="transition-all duration-300 hover:scale-105"
```

### Active States
```tsx
// On active
className="from-cyan-500/20 to-purple-500/20 text-cyan-400"

// On hover
className="hover:bg-slate-700/30 hover:text-white"
```

---

## 📊 Chart Examples with Recharts

### Line Chart (Revenue Trend)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={revenueData}>
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
    <XAxis stroke="rgba(148, 163, 184, 0.5)" />
    <YAxis stroke="rgba(148, 163, 184, 0.5)" />
    <Tooltip
      contentStyle={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(34, 211, 238, 0.3)',
        borderRadius: '8px',
        color: '#e2e8f0',
      }}
    />
    <Line type="monotone" dataKey="revenue" fill="url(#colorRevenue)" stroke="#06b6d4" />
  </LineChart>
</ResponsiveContainer>

// Data format:
const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 19000 },
  // ...
]
```

### Bar Chart (Client Revenue)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={clientRevenueData}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
    <XAxis stroke="rgba(148, 163, 184, 0.5)" />
    <YAxis stroke="rgba(148, 163, 184, 0.5)" />
    <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>

// Data format:
const clientRevenueData = [
  { client: 'ACME Corp', revenue: 45000 },
  { client: 'Tech Inc', revenue: 38000 },
  // ...
]
```

---

## 🔧 Responsive Grid Layouts

### 4-Column Stats (Responsive)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 4 StatCards */}
</div>

// Breakpoints:
// Mobile (< 640px): 1 column
// Tablet (640px - 1024px): 2 columns
// Desktop (> 1024px): 4 columns
```

### 3-Column Charts (Responsive)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Revenue Chart - 2/3 width on desktop, full on mobile */}
  </div>
  <div>
    {/* Overdue Chart - 1/3 width on desktop, full on mobile */}
  </div>
</div>
```

### Full-Width Sections
```tsx
<ChartCard>
  {/* Client Revenue - takes full width */}
</ChartCard>

<ChartCard>
  {/* Projects Table - takes full width */}
</ChartCard>
```

---

## 🎬 Animation Classes

### Dropdowns
```tsx
className="animate-in fade-in slide-in-from-top-2 duration-200"
```

### Hover Effects
```tsx
className="group-hover:shadow-lg group-hover:shadow-cyan-500/50"
className="hover:scale-105"
className="hover:bg-slate-700/30"
```

### Transitions
```tsx
className="transition-all duration-300"
className="transition-colors duration-200"
className="transition-transform duration-300"
```

### Animated Badge
```tsx
className="animate-pulse"
```

---

## 🔄 API Integration Patterns

### Fetch Dashboard Data
```tsx
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [revenue, overdue, clients] = await Promise.all([
        api.get('/analytics/revenue?months=6'),
        api.get('/analytics/overdue'),
        api.get('/analytics/client-revenue'),
      ])
      
      setRevenueData(revenue.data.monthlyBreakdown)
      setOverdueData(overdue.data.details)
      setClientRevenueData(clients.data.clients)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    }
  }
  
  fetchDashboardData()
}, [])
```

### Fetch Projects for Table
```tsx
useEffect(() => {
  const fetchProjects = async () => {
    const response = await api.get('/projects')
    setProjects(response.data)
  }
  fetchProjects()
}, [])
```

### Subscribe to Notifications (Polling)
```tsx
useEffect(() => {
  const interval = setInterval(async () => {
    const notifications = await api.get('/notifications')
    setNotifications(notifications.data)
  }, 30000) // Every 30 seconds
  
  return () => clearInterval(interval)
}, [])
```

---

## 📐 Component Props Reference

### StatCard Props
```typescript
interface StatCardProps {
  title: string                          // "Total Revenue"
  value: string | number                 // 125000
  icon: string                           // "💰"
  trend?: {
    value: number                        // 12
    direction: 'up' | 'down'             // 'up'
  }
  color?: 'cyan' | 'purple' | 'green' | 'red' | 'orange'  // 'cyan'
}
```

### ChartCard Props
```typescript
interface ChartCardProps {
  title: string                          // "Revenue Trend"
  description?: string                   // "Last 6 months"
  children: ReactNode                    // <LineChart>...</LineChart>
  icon?: string                          // "📈"
  action?: ReactNode                     // <button>Export</button>
}
```

### DataTable Props
```typescript
interface DataTableProps<T> {
  columns: Column<T>[]                   // Column definitions
  data: T[]                              // Row data
  title?: string                         // "Projects"
  emptyMessage?: string                  // "No data"
  rowAction?: (row: T) => void           // Click handler
}

interface Column<T> {
  key: keyof T                           // 'name'
  label: string                          // 'Project Name'
  render?: (value: any, row: T) => ReactNode  // Custom render
  align?: 'left' | 'center' | 'right'   // 'left'
}
```

---

## 🎨 Color Codes Quick Reference

| Element | Color | Hex | Tailwind |
|---------|-------|-----|----------|
| Base | Slate Black | #0f172a | slate-950 |
| Primary Accent | Cyan | #06b6d4 | cyan-400/500 |
| Secondary | Purple | #a855f7 | purple-500 |
| Success | Green | #22c55e | green-400/500 |
| Error | Red | #ef4444 | red-400/500 |
| Warning | Orange | #f97316 | orange-400/500 |
| Card Dark | Dark Slate | #1e293b | slate-800 |
| Border | Medium Slate | #334155 | slate-700 |
| Text Light | Off White | #e2e8f0 | slate-200 |
| Text Dark | Med Gray | #94a3b8 | slate-400 |

---

## 📱 Responsive Breakpoints

```
sm: 640px    → md prefix
md: 768px    → md prefix
lg: 1024px   → lg prefix
xl: 1280px   → xl prefix
2xl: 1536px  → 2xl prefix
```

**Usage in Grid:**
```tsx
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="hidden md:block lg:hidden"
className="w-full lg:w-2/3"
```

---

## 🚀 Performance Tips

1. **Lazy Load Charts**
   ```tsx
   const [showChart, setShowChart] = useState(false)
   // Show only when visible
   ```

2. **Debounce Search**
   ```tsx
   const [search, setSearch] = useState('')
   const debouncedSearch = useCallback(
     debounce((value) => filterData(value), 300),
     []
   )
   ```

3. **Pagination for Large Tables**
   ```tsx
   const itemsPerPage = 10
   const paginatedData = data.slice(0, itemsPerPage)
   ```

4. **Cache API Responses**
   ```tsx
   const cache = useRef({})
   if (cache.current[url]) return cache.current[url]
   ```

---

## 🧪 Testing Patterns

### Mock StatCard
```tsx
<StatCard
  title="Test Revenue"
  value="$100,000"
  icon="💰"
  color="cyan"
/>
```

### Mock DataTable
```tsx
const mockProjects = [
  { id: '1', name: 'Project A', status: 'completed', budget: 10000 }
]

<DataTable
  columns={[{ key: 'name', label: 'Name' }]}
  data={mockProjects}
/>
```

### Mock Chart Data
```tsx
const mockData = [
  { month: 'Jan', value: 100 },
  { month: 'Feb', value: 200 },
]
```

---

## 🛠️ Debugging

### Check Component Rendering
```tsx
// Add console.log in components
console.log('StatCard rendered:', { title, value })

// Use React DevTools
// Inspect component props and state
```

### Debug Styles
```tsx
// Inspect element in browser
// Check Tailwind class application
// Verify z-index stacking
```

### Debug Animations
```tsx
// Use browser DevTools Performance tab
// Check animation frame rate
// Look for layout thrashing
```

---

## 📚 File Locations

```
frontend/src/
├── components/
│   ├── Sidebar.tsx       ← Navigation
│   ├── Navbar.tsx        ← Top bar
│   ├── StatCard.tsx      ← Metric card
│   ├── ChartCard.tsx     ← Chart wrapper
│   ├── DataTable.tsx     ← Table
│   ├── Common.tsx        ← Loading, alerts
│   └── index.ts          ← Exports
│
├── pages/
│   ├── DashboardPage.tsx ← Main page
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
│
├── layouts/
│   └── BaseLayout.tsx    ← Main layout
│
└── App.tsx               ← Router
```

---

**Quick Reference Version**: 1.0
**Last Updated**: March 2026
**Status**: Production Ready ✅
