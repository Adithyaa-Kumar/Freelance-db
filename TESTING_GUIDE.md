# 🧪 TESTING GUIDE - Login Authentication Flow

Welcome! This document guides you through testing the complete login and authentication flow that has just been fixed.

---

## ✅ QUICK START

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
# Or directly:
node src/server.js
```

**Expected output:**
```
[2026-04-02 18:50:00] Server running on http://localhost:5000
Database connected
```

### Step 2: Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.4.21
Ready in 234 ms

➜  Local:   http://localhost:5173/
```

### Step 3: Open Frontend
- Go to: `http://localhost:5173`
- Should see: Login page

---

## 🧪 TEST 1: Login Flow

### Prerequisites
- Backend running on port 5000
- Frontend running on port 5173

### Test Data
```
Email:    test@example.com
Password: password123
```

### Steps
1. Navigate to `http://localhost:5173/login`
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click **"Sign In"** button
5. **Expected Result:** 
   - ✅ Redirects to `/dashboard`
   - ✅ Dashboard loads with data
   - ✅ Sidebar visible
   - ✅ No console errors

### What's Happening Behind the Scenes

```
1. LoginPage calls: authApi.login(email, password)
   ↓
2. Frontend sends: POST http://localhost:5000/api/auth/login
   Body: { email, password }
   ↓
3. Backend validates credentials
   ↓
4. Backend returns:
   {
     "success": true,
     "data": {
       "user": {
         "id": "1",
         "email": "test@example.com",
         "name": "Test User"
       },
       "token": "dGVzdEB..."  // base64 encoded
     }
   }
   ↓
5. Frontend response interceptor unwraps:
   response.data = { user, token }
   ↓
6. LoginPage extracts: const { token, user } = response.data
   ↓
7. Zustand: setToken(token), setUser(user)
   ↓
8. Zustand persist writes to localStorage:
   localStorage.auth-storage = {
     "state": { "user": {...}, "token": "..." }
   }
   ↓
9. Navigate to /dashboard (50ms delay)
   ↓
10. ProtectedRoute checks token from Zustand ✅
    ↓
11. Dashboard renders ✅
```

---

## 🧪 TEST 2: Token Persistence

### Test: Page Reload
1. Complete TEST 1 (login successful)
2. Press **F5** to refresh page
3. **Expected Result:**
   - ✅ Stays on dashboard
   - ✅ User still authenticated
   - ✅ No redirect to login

### What's Happening
```
1. Page reloads
   ↓
2. Zustand persist middleware loads:
   localStorage.auth-storage → { user, token }
   ↓
3. useAuth hook runs and detects token
   ↓
4. ProtectedRoute sees token from Zustand state ✅
   ↓
5. Dashboard renders (user never sees login) ✅
```

---

## 🧪 TEST 3: Logout

### Steps
1. Login successfully (TEST 1)
2. Click **Logout** button (Sidebar or Navbar)
3. **Expected Result:**
   - ✅ Redirects to `/login`
   - ✅ localStorage cleared
   - ✅ All auth state cleared

### What's Happening
```
1. Logout button calls: authStore.logout()
   ↓
2. Zustand updates:
   user = null
   token = null
   ↓
3. Zustand persist updates localStorage:
   localStorage.auth-storage = { "state": { user: null, token: null } }
   ↓
4. App component re-renders
   ↓
5. ProtectedRoute sees no token
   ↓
6. Redirect to /login ✅
```

---

## 🧪 TEST 4: API Requests with Token

### Prerequisites
- Must be logged in (TEST 1)

### Test: Fetch Projects
1. Login successfully
2. Dashboard should load projects list
3. **Expected Result:**
   - ✅ Projects load with data
   - ✅ Console shows no auth errors
   - ✅ Tables display correctly

### What's Happening
```
1. `api.get('/api/projects')` is called
   ↓
2. Request interceptor runs:
   - Reads localStorage.auth-storage
   - Parses JSON state object
   - Extracts token
   - Adds header: Authorization: Bearer <token>
   ↓
3. Request sent to backend:
   GET /api/projects
   Header: Authorization: Bearer dGVzdEB...
   ↓
4. Backend verifies token ✅
   ↓
5. Backend returns projects data
   ↓
6. Response interceptor unwraps if needed
   ↓
7. Data displayed on dashboard ✅
```

---

## 🧪 TEST 5: Protected Routes

### Test: Access Protected Route Without Login
1. **Clear localStorage:**
   ```javascript
   // Open DevTools Console (F12) and run:
   localStorage.clear()
   ```
2. Navigate directly to `/dashboard`
3. **Expected Result:**
   - ✅ Redirects to `/login`
   - ✅ No console errors
   - ✅ Login page displays

---

## 🧪 TEST 6: Invalid Credentials

### Steps
1. Navigate to `http://localhost:5173/login`
2. Enter: `test@example.com`
3. Enter password: `wrong123`
4. Click **"Sign In"** button
5. **Expected Result:**
   - ✅ Error message displayed
   - ✅ Stays on login page
   - ✅ No redirect to dashboard

### Expected Error Message
```
"Invalid credentials"
or
"User not found"
```

---

## 🧪 TEST 7: Sign Up (New User)

### Steps
1. Navigate to `http://localhost:5173/signup`
2. Fill in form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm: `password123`
3. Click **"Create Account"** button
4. **Expected Result:**
   - ✅ Account created
   - ✅ Redirects to `/dashboard`
   - ✅ Logged in as the new user

---

## 🧪 TEST 8: Sign Up - Password Mismatch

### Steps
1. Navigate to `http://localhost:5173/signup`
2. Fill in form:
   - Name: `Jane Doe`
   - Email: `jane@example.com`
   - Password: `password123`
   - Confirm: `different456`
3. Click **"Create Account"** button
4. **Expected Result:**
   - ✅ Error message: "Passwords do not match"
   - ✅ Stays on signup page
   - ✅ No redirect

---

## 🔍 DEBUGGING TIPS

### Enable Console Logging
Open DevTools (F12) → Console tab

**Look for:**
- ✅ `[Auth] Token set to: ...` (successful login)
- ✅ `[API] Request interceptor: Token found` (API requests)
- ❌ `[Auth] Invalid credentials` (failed login)
- ❌ `[API] No token found` (auth not working)

### Check localStorage
```javascript
// In Console:
localStorage.getItem('auth-storage')

// Should output:
{
  "state": {
    "user": {
      "id": "1",
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "dGVzdEB..."
  },
  "version": 1
}
```

### Check Network Requests
DevTools → Network tab
- Look for requests to `/api/auth/login`
- Check response has:
  ```json
  {
    "success": true,
    "data": {
      "user": {...},
      "token": "..."
    }
  }
  ```

### Inspect API Errors
```javascript
// In Console during failed login:
// Should show detailed error message from server
console.error(err?.response?.data?.message)
```

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot POST /api/auth/login"
**Solution:**
- Backend not running
- CORS not configured
- Wrong API base URL

**Fix:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Problem: "401 Invalid token"
**Solution:**
- Token not being read from localStorage
- Token format wrong
- Backend auth middleware failing

**Debug:**
```javascript
// In Console:
localStorage.getItem('auth-storage')
// Check if token exists in output
```

### Problem: Login works but redirect fails
**Solution:**
- 50ms delay too short
- Zustand persist not writing

**Fix:** Edit `frontend/src/pages/LoginPage.jsx`
```javascript
setTimeout(() => {
  navigate('/dashboard', { replace: true });
}, 100);  // Try 100ms instead of 50ms
```

### Problem: "Module not found: 'dotenv'"
**Solution:**
```bash
# In backend folder:
npm install

# Or force reinstall:
npm install --force
```

---

## ✅ ALL TESTS PASSING CHECKLIST

- [ ] Test 1: Login successful → Dashboard
- [ ] Test 2: Token persists on page reload
- [ ] Test 3: Logout clears all state
- [ ] Test 4: API requests include auth token
- [ ] Test 5: Protected routes redirect unauthenticated users
- [ ] Test 6: Invalid credentials show error
- [ ] Test 7: Sign up creates new user and logs in
- [ ] Test 8: Sign up validates password match
- [ ] Bonus: All network requests successful (Network tab)
- [ ] Bonus: No console errors (Console tab)

---

## 📝 KNOWN ISSUES & LIMITATIONS

### Current Limitations (Development Only)
- ⚠️ Passwords stored in plaintext (mock data)
- ⚠️ Tokens are Base64 encoded (not JWT)
- ⚠️ No real password hashing (for development testing)
- ⚠️ No token expiration
- ⚠️ No refresh token mechanism

### Production TODOs
- 🔜 Implement JWT token signing
- 🔜 Add bcrypt password hashing
- 🔜 Database integration with Prisma
- 🔜 Token expiration and refresh
- 🔜 Rate limiting on auth endpoints
- 🔜 Admin panel for user management

---

## 📞 SUPPORT

Issues or questions? Check the following files:
- [LOGIN_FIX_SUMMARY.md](LOGIN_FIX_SUMMARY.md) - Details of all fixes
- [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) - API endpoint details
- [FIXES_AND_IMPROVEMENTS.md](FIXES_AND_IMPROVEMENTS.md) - All changes made

---

**Happy Testing! 🚀**
