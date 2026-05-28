# RideFlow Frontend Contract — React + Tailwind + shadcn/ui + TanStack Query

## 1. Purpose

This document is the frontend implementation contract for the RideFlow CS lab ride-hailing app.

Give this document together with:

1. `api-contract.md`
2. `frontend-screens-api-map.md`
3. `design(2).md`
4. `database-design.md`

to any AI/frontend developer before building screens.

The goal is to make frontend and backend development run in parallel. The frontend must work against a mock server first and then work against the real Node.js + Express backend by changing only environment configuration, not screen logic or response handling.

---

## 2. Non-Negotiable Project Rules

| Rule | Decision |
|---|---|
| Framework | React JS |
| Language | Plain JavaScript only |
| File extensions | `.js` and `.jsx`; do not use `.ts` or `.tsx` |
| Styling | Tailwind CSS |
| UI library | shadcn/ui first, Tailwind custom classes second |
| Server state | TanStack Query |
| HTTP client | Axios |
| Realtime | Socket.IO client |
| Maps | Mapbox |
| Mobile runtime | Capacitor Android WebView |
| API key format | Use snake_case API fields exactly as returned by backend |
| State library | Do not use Zustand initially |
| Mock compatibility | Must work with mock server and real backend without changing DTO shapes |

### 2.1 Plain JavaScript Override

The design guideline file may mention TypeScript in its suggested stack. Ignore that part.

This app must use:

```text
Plain React JavaScript
.jsx components
.js hooks/services
No TypeScript
No Zod type schemas
```

Use simple validation helper functions or React Hook Form only if needed.

---

## 3. Required Dependencies

Use these packages unless the project already has equivalents installed:

```bash
npm install axios @tanstack/react-query socket.io-client mapbox-gl lucide-react
```

Install shadcn/ui components as needed:

```bash
npx shadcn@latest add button input card sheet dialog tabs badge avatar separator toast sonner switch textarea select skeleton dropdown-menu alert alert-dialog form label
```

Recommended routing:

```bash
npm install react-router-dom
```

Optional for mobile geolocation:

```bash
npm install @capacitor/geolocation @capacitor/preferences
```

Do not add extra UI libraries. Do not mix Material UI, Bootstrap, Ant Design, Chakra, or DaisyUI with shadcn/ui.

---

## 4. Design System Contract

The app must follow the uploaded RideFlow design guidelines.

### 4.1 Visual Style

The UI should be:

- Modern
- Minimal
- Mobile-first
- Premium but simple
- Clean white interface
- Soft rounded components
- Teal/green accent color
- High readability
- Bottom-sheet-friendly for map screens

Avoid loud colors, heavy shadows, dense layouts, complex gradients, and unnecessary animations.

### 4.2 Brand Colors

Use these exact colors unless shadcn theme variables are mapped to them:

| Token | Hex | Usage |
|---|---:|---|
| `brand-primary` | `#008C78` | Primary buttons, active states, links |
| `brand-primary-dark` | `#006F60` | Pressed/hover primary state |
| `brand-primary-light` | `#E8F7F4` | Selected tab background |
| `brand-primary-soft` | `#F1FBF9` | Soft panels |
| `background` | `#FFFFFF` | Main app background |
| `surface-muted` | `#F7F8FA` | Secondary panels |
| `border` | `#E1E5EA` | Input/card borders |
| `text-primary` | `#101820` | Headings |
| `text-secondary` | `#4B5563` | Subtitles |
| `text-muted` | `#8A9099` | Placeholder/helper text |
| `success` | `#16A34A` | Completed/success |
| `warning` | `#F59E0B` | Surge/pending/traffic |
| `danger` | `#DC2626` | Error/cancel |

### 4.3 Layout Rules

Use these layout rules on every screen:

```text
Mobile target width: 360px - 430px
Horizontal padding: 24px for normal screens
Card padding: 16px
Bottom sheet padding: 16px - 24px
Primary button height: 52px - 56px
Input height: 52px - 56px
Input radius: 14px
Button radius: 14px
Card radius: 20px - 24px
Touch target: at least 44px
```

### 4.4 shadcn/ui Usage Rule

Always use shadcn/ui components where possible.

Use shadcn for:

```text
Button
Input
Card
Sheet
Dialog
AlertDialog
Tabs
Badge
Avatar
Separator
Switch
Textarea
Select
Skeleton
Toast/Sonner
DropdownMenu
Label
Form wrappers if needed
```

Use Tailwind when:

1. shadcn does not provide the exact layout component.
2. Building map overlays.
3. Building custom ride cards, markers, or bottom sheet internals.
4. Creating spacing, colors, and responsive mobile layouts.

Do not create raw `<button>` or `<input>` elements unless the shadcn component is unsuitable for the specific case.

### 4.5 Component Style Examples

Primary button:

```jsx
<Button className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]">
  Confirm ride
</Button>
```

Input:

```jsx
<Input className="h-14 rounded-[14px] border-[#E1E5EA] text-base focus-visible:ring-[#008C78]/20" />
```

Card:

```jsx
<Card className="rounded-[24px] border-[#E1E5EA] bg-white shadow-sm" />
```

Bottom sheet:

```jsx
<SheetContent side="bottom" className="rounded-t-[24px] border-[#E1E5EA] px-6 pb-6 pt-4" />
```

---

## 5. API Integration Contract

### 5.1 Base API URL

Use environment variable:

```text
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Fallback for local development:

```text
/api/v1
```

### 5.2 API Response Envelope

All API responses follow the API contract envelope:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "meta": null
}
```

For list endpoints:

```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Frontend hooks should normally return `response.data.data`.

If pagination is needed, return both:

```js
return {
  data: response.data.data,
  meta: response.data.meta,
};
```

### 5.3 Error Format

Backend and mock server return:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {}
  },
  "data": null,
  "meta": null
}
```

Frontend error handling must display:

```js
error.response?.data?.message || "Something went wrong"
```

### 5.4 JSON Naming

Do not convert API keys to camelCase.

Correct:

```js
ride.estimated_distance_km
user.profile_photo_url
offer.offer_status
```

Incorrect:

```js
ride.estimatedDistanceKm
user.profilePhotoUrl
offer.offerStatus
```

This keeps frontend, mock server, and Express backend simple.

---

## 6. API Client Setup

Create:

```text
src/api/client.js
```

Required implementation pattern:

```js
import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
```

For file uploads, override headers at request level.

---

## 7. TanStack Query Contract

### 7.1 Query Client Setup

Create:

```text
src/query/queryClient.js
```

```js
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

Wrap the app:

```jsx
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 7.2 Query Key Rules

Create:

```text
src/query/queryKeys.js
```

```js
export const queryKeys = {
  me: ["me"],

  riderProfile: ["rider", "me"],
  savedPlaces: ["rider", "saved_places"],

  driverProfile: ["driver", "me"],
  driverVehicles: ["driver", "vehicles"],
  driverDocuments: ["driver", "documents"],
  driverOffers: (status) => ["driver", "offers", status || "all"],
  driverEarnings: (period, from, to) => ["driver", "earnings", period, from, to],
  driverRatings: ["driver", "ratings"],

  rides: (filters) => ["rides", filters || {}],
  ride: (rideId) => ["rides", rideId],
  rideLive: (rideId) => ["rides", rideId, "live"],
  rideRoute: (rideId, routeType) => ["rides", rideId, "route", routeType],
  rideTracking: (rideId) => ["rides", rideId, "tracking"],
  rideReceipt: (rideId) => ["rides", rideId, "receipt"],

  mapConfig: ["maps", "config"],
  nearbyDrivers: (lat, lng, radiusKm) => ["maps", "nearby_drivers", lat, lng, radiusKm],
  surgeZones: (city) => ["maps", "surge_zones", city],

  adminPricingRules: ["admin", "pricing_rules"],
  adminMlModels: ["admin", "ml_models"],
  adminPredictionLogs: (rideId) => ["admin", "rides", rideId, "fare_prediction_logs"],
};
```

### 7.3 Hook Rules

All API calls must be wrapped in hooks.

Good:

```js
const { data, isLoading } = useSavedPlaces();
```

Bad:

```js
useEffect(() => {
  api.get("/riders/me/saved-places");
}, []);
```

Use bare Axios only inside `src/api/*.api.js` or query hooks.

### 7.4 Mutation Rules

After mutations, invalidate affected queries.

Example:

```js
const queryClient = useQueryClient();

return useMutation({
  mutationFn: createSavedPlace,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces });
  },
});
```

### 7.5 Server State vs Local State

| State | Where it belongs |
|---|---|
| Logged-in user | TanStack Query `useMe()` |
| Access token | `localStorage` or Capacitor Preferences |
| Saved places | TanStack Query |
| Ride estimate response | TanStack Query mutation result/local state |
| Active ride | TanStack Query + Socket.IO cache updates |
| Driver offers | TanStack Query + Socket.IO cache updates |
| Map camera position | React local state |
| Pickup/dropoff draft | React local state until submitted |
| Modal/sheet open state | React local state |
| Form field values | React local state or React Hook Form |
| Global UI state | Avoid Zustand initially |

Do not copy server data into local global state.

---

## 8. Socket.IO Contract

### 8.1 Socket Setup

Create:

```text
src/socket/socket.js
```

```js
import { io } from "socket.io-client";

export function createSocket(accessToken) {
  const baseUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_ORIGIN ||
    "http://localhost:5000";

  return io(`${baseUrl}/realtime`, {
    auth: {
      token: accessToken,
    },
    transports: ["websocket"],
  });
}
```

### 8.2 Client Emits

Use the API contract payloads exactly.

```text
ride:join
ride:leave
driver:location:update
ride:tracking:update
```

### 8.3 Server Emits

Frontend must handle:

```text
nearby_drivers:update
ride:offer
ride:offer:expired
ride:status:update
ride:live:update
ride:route:update
ride:cancelled
surge:update
```

### 8.4 Socket Cache Update Rule

Socket events should update TanStack Query cache.

Example:

```js
queryClient.setQueryData(queryKeys.rideLive(rideId), (oldData) => ({
  ...(oldData || {}),
  ...liveUpdate,
}));
```

Do not build a separate socket-only state store.

### 8.5 REST Still Required

Socket.IO is for live updates. Official actions must still call REST APIs.

Examples:

| User action | REST API | Socket role |
|---|---|---|
| Rider creates ride | `POST /rides` | Backend emits updates |
| Driver accepts offer | `POST /drivers/me/ride-offers/:offer_id/accept` | Backend emits ride status |
| Driver sends location | REST or socket | Socket preferred for live movement |
| Driver completes ride | `POST /rides/:ride_id/complete` | Backend emits completed status |

---

## 9. Mapbox Contract

### 9.1 Map Config

Frontend should call:

```text
GET /maps/config
```

Use the returned Mapbox public token/config. If the mock server returns a fake token, show a fallback placeholder map only.

### 9.2 Address Search

Use backend endpoint:

```text
GET /maps/autocomplete
```

Do not call Mapbox Search API directly from every screen unless specifically required. Keeping autocomplete behind backend/mock API ensures mock and real backend are replaceable.

### 9.3 Reverse Geocoding

Use:

```text
GET /maps/reverse-geocode
```

Used when the rider adjusts pickup pin on map.

### 9.4 Route Preview

Use:

```text
POST /maps/route-preview
```

Use this before showing estimate or route polyline.

### 9.5 Nearby Drivers

Use:

```text
GET /maps/nearby-drivers
```

For pre-booking driver markers.

### 9.6 Surge Zones

Use:

```text
GET /maps/surge-zones
```

For rider surge display and driver heatmap/demand map.

---

## 10. Project Folder Structure

Use this structure:

```text
src/
  api/
    client.js
    auth.api.js
    users.api.js
    riders.api.js
    drivers.api.js
    maps.api.js
    rides.api.js
    admin.api.js

  hooks/
    auth/
      useLogin.js
      useRegisterRider.js
      useRegisterDriver.js
      useMe.js
      useOtp.js
    rider/
      useRiderProfile.js
      useSavedPlaces.js
    driver/
      useDriverProfile.js
      useDriverAvailability.js
      useDriverDocuments.js
      useDriverVehicles.js
      useDriverOffers.js
      useDriverEarnings.js
      useDriverRatings.js
    rides/
      useRideEstimate.js
      useCreateRide.js
      useRides.js
      useRide.js
      useRideLive.js
      useCancelRide.js
      useRideLifecycle.js
      useRateRide.js
      useRideReceipt.js
    maps/
      useMapConfig.js
      useAddressAutocomplete.js
      useReverseGeocode.js
      useRoutePreview.js
      useNearbyDrivers.js
      useSurgeZones.js
    admin/
      usePricingRules.js
      useAdminActions.js
      useMlModels.js
      usePredictionLogs.js

  socket/
    socket.js
    SocketProvider.jsx
    useRideSocket.js
    useDriverSocket.js

  components/
    layout/
      MobileShell.jsx
      AppHeader.jsx
      BottomNav.jsx
      PageContainer.jsx
    common/
      LoadingState.jsx
      ErrorState.jsx
      EmptyState.jsx
      StatusBadge.jsx
      ConfirmDialog.jsx
    auth/
      AuthLayout.jsx
      RoleTabs.jsx
      AuthInput.jsx
      PasswordInput.jsx
      RideIllustration.jsx
    map/
      MapboxMap.jsx
      DriverMarker.jsx
      RiderMarker.jsx
      RoutePolyline.jsx
      SurgeZoneOverlay.jsx
      MapFloatingButton.jsx
    ride/
      LocationSearchInput.jsx
      StopListEditor.jsx
      FareEstimateCard.jsx
      RideStatusCard.jsx
      DriverInfoCard.jsx
      RideActionSheet.jsx
      RatingDialog.jsx
      ReceiptCard.jsx
    driver/
      AvailabilityToggle.jsx
      RideOfferCard.jsx
      VehicleCard.jsx
      DocumentUploadCard.jsx
      EarningsSummaryCard.jsx
    admin/
      PricingRuleForm.jsx
      SurgeZoneForm.jsx
      DriverDocumentReviewCard.jsx

  pages/
    auth/
      SplashPage.jsx
      LoginPage.jsx
      RegisterRiderPage.jsx
      RegisterDriverPage.jsx
      OtpPage.jsx
    rider/
      RiderHomePage.jsx
      RiderRideLivePage.jsx
      RiderRideHistoryPage.jsx
      RiderRideDetailsPage.jsx
      SavedPlacesPage.jsx
      RiderProfilePage.jsx
    driver/
      DriverHomePage.jsx
      DriverRideNavigationPage.jsx
      DriverVehiclesPage.jsx
      DriverDocumentsPage.jsx
      DriverEarningsPage.jsx
      DriverRatingsPage.jsx
      DriverProfilePage.jsx
    admin/
      AdminDashboardPage.jsx
      PricingRulesPage.jsx
      DriverDocumentReviewPage.jsx
      SurgeZonesPage.jsx
      MlModelsPage.jsx
      RidePredictionLogsPage.jsx

  routes/
    AppRouter.jsx
    ProtectedRoute.jsx
    RoleRoute.jsx

  utils/
    formatters.js
    validators.js
    constants.js
    rideStatus.js
```

---

## 11. Routing Contract

Use React Router.

### 11.1 Public Routes

| Route | Page |
|---|---|
| `/splash` | `SplashPage` |
| `/auth/login` | `LoginPage` |
| `/auth/register/rider` | `RegisterRiderPage` |
| `/auth/register/driver` | `RegisterDriverPage` |
| `/auth/otp` | `OtpPage` |

### 11.2 Rider Routes

| Route | Page |
|---|---|
| `/rider/home` | `RiderHomePage` |
| `/rider/rides/:ride_id/live` | `RiderRideLivePage` |
| `/rider/rides` | `RiderRideHistoryPage` |
| `/rider/rides/:ride_id` | `RiderRideDetailsPage` |
| `/rider/saved-places` | `SavedPlacesPage` |
| `/rider/profile` | `RiderProfilePage` |

### 11.3 Driver Routes

| Route | Page |
|---|---|
| `/driver/home` | `DriverHomePage` |
| `/driver/rides/:ride_id/navigation` | `DriverRideNavigationPage` |
| `/driver/vehicles` | `DriverVehiclesPage` |
| `/driver/documents` | `DriverDocumentsPage` |
| `/driver/earnings` | `DriverEarningsPage` |
| `/driver/ratings` | `DriverRatingsPage` |
| `/driver/profile` | `DriverProfilePage` |

### 11.4 Admin/Demo Routes

| Route | Page |
|---|---|
| `/admin/dashboard` | `AdminDashboardPage` |
| `/admin/pricing-rules` | `PricingRulesPage` |
| `/admin/driver-documents` | `DriverDocumentReviewPage` |
| `/admin/surge-zones` | `SurgeZonesPage` |
| `/admin/ml-models` | `MlModelsPage` |
| `/admin/rides/:ride_id/prediction-logs` | `RidePredictionLogsPage` |

### 11.5 Role Redirects

After login or app boot:

| Role | Redirect |
|---|---|
| `rider` | `/rider/home` |
| `driver` | `/driver/home` |
| `admin` | `/admin/dashboard` |

---

## 12. Screen-by-Screen Contract

Each screen below lists purpose, required APIs, realtime events, required components, and completion criteria.

---

# 12A. Auth and Shared Screens

## 12A.1 Splash / App Boot Screen

Route:

```text
/splash
```

Purpose:

- Check saved token.
- Call `GET /auth/me`.
- Redirect by role.

APIs:

```text
GET /auth/me
GET /maps/config optional
```

UI:

- Simple centered app logo/name.
- Loading spinner or skeleton.
- White background.

shadcn:

```text
Card optional
Skeleton optional
```

Done when:

- No token routes to login.
- Valid rider token routes to rider home.
- Valid driver token routes to driver home.
- Valid admin token routes to admin dashboard.
- Invalid token clears storage and routes to login.

---

## 12A.2 Login Screen

Route:

```text
/auth/login
```

Purpose:

- Login as rider, driver, or admin.
- Role tabs default to rider.
- Save access token.
- Redirect by returned user role.

APIs:

```text
POST /auth/login
GET /auth/me optional after login
```

Request fields:

```json
{
  "login": "email_or_phone",
  "password": "password",
  "role": "rider"
}
```

UI must follow design:

- App logo/title.
- Ride illustration.
- Heading: `Welcome back`.
- Rider/Driver segmented control.
- Email/phone input.
- Password input with show/hide.
- Forgot password link can be non-functional or toast.
- Login button.
- OTP button.
- Signup link.

shadcn:

```text
Button
Input
Card optional
Tabs or custom segmented control
Separator
Toast/Sonner
```

Done when:

- Valid login stores `access_token`.
- Role redirect works.
- Loading and error states are shown.
- UI matches teal/white rounded design.

---

## 12A.3 Rider Registration Screen

Route:

```text
/auth/register/rider
```

Purpose:

- Register rider account.
- Submit user profile.
- Save token if backend returns it.
- Route to OTP or rider home depending API response.

APIs:

```text
POST /auth/register/rider
POST /auth/otp/send optional
```

Fields:

```text
name
email
phone
password
confirm_password local only
```

shadcn:

```text
Input
Button
Card
Toast/Sonner
```

Done when:

- Client validates required fields.
- Password confirmation is checked locally.
- API errors are displayed.
- Successful registration routes forward.

---

## 12A.4 Driver Registration Screen

Route:

```text
/auth/register/driver
```

Purpose:

- Register driver account.
- Keep simple; vehicle/documents can be completed after login.

APIs:

```text
POST /auth/register/driver
POST /auth/otp/send optional
```

Fields:

```text
name
email
phone
password
confirm_password local only
```

Done when:

- Driver account created.
- User routes to driver home or driver documents screen.

---

## 12A.5 OTP Verification Screen

Route:

```text
/auth/otp
```

Purpose:

- Mock email/phone OTP verification.

APIs:

```text
POST /auth/otp/send
POST /auth/otp/verify
GET /auth/me optional after verification
```

UI:

- OTP input.
- Resend OTP button.
- Verify button.
- Explain that OTP is mock/demo.

shadcn:

```text
Input
Button
Card
Toast/Sonner
```

Done when:

- OTP verify success updates user state.
- Resend works.
- Errors display.

---

# 12B. Rider Screens

## 12B.1 Rider Home Map / Book Ride Screen

Route:

```text
/rider/home
```

Purpose:

- Main rider screen.
- Show Mapbox map.
- Let rider select pickup/dropoff.
- Show nearby drivers.
- Show surge zones.
- Estimate fare.
- Request standard/scheduled/recurring ride.
- Support multiple stops and ride note.

APIs:

```text
GET /maps/config
GET /maps/autocomplete
GET /maps/reverse-geocode
POST /maps/route-preview
GET /maps/nearby-drivers
GET /maps/surge-zones
POST /rides/estimate
POST /rides
GET /riders/me/saved-places
```

Socket events:

```text
Client emits:
ride:join after ride is created

Server listens:
nearby_drivers:update
surge:update
ride:status:update
ride:live:update
ride:cancelled
```

Required UI states:

1. Initial map with pickup defaulting to current location if allowed.
2. Pickup selection state.
3. Dropoff selection state.
4. Optional intermediate stop list.
5. Fare estimate state.
6. Confirm ride state.
7. Searching driver state.
8. Driver assigned state.

Required components:

```text
MapboxMap
LocationSearchInput
StopListEditor
FareEstimateCard
RideActionSheet
DriverMarker
SurgeZoneOverlay
```

shadcn:

```text
Sheet
Button
Input
Card
Badge
Separator
Dialog/AlertDialog
Skeleton
```

Done when:

- User can choose pickup/dropoff.
- Route preview appears.
- Fare estimate appears with surge multiplier if any.
- User can submit `POST /rides`.
- Successful ride navigates to `/rider/rides/:ride_id/live`.
- Mock server and backend can use the same payload shape.

---

## 12B.2 Rider Live Ride Screen

Route:

```text
/rider/rides/:ride_id/live
```

Purpose:

- Track active ride.
- Show driver location.
- Show ETA.
- Show route.
- Allow cancellation before completion.

APIs:

```text
GET /rides/:ride_id
GET /rides/:ride_id/live
GET /rides/:ride_id/route
POST /rides/:ride_id/cancel
```

Socket events:

```text
Client emits:
ride:join
ride:leave

Server listens:
ride:status:update
ride:live:update
ride:route:update
ride:cancelled
```

Required UI:

- Map full screen.
- Bottom sheet with ride status.
- Driver card.
- ETA and distance remaining.
- Cancel button if status allows.
- Completed state with rating prompt.

shadcn:

```text
Sheet
Card
Button
Badge
AlertDialog
Skeleton
```

Done when:

- Live socket updates move driver marker.
- Status changes update UI.
- Cancel flow works.
- Completed ride routes to rating or details.

---

## 12B.3 Rider Ride History Screen

Route:

```text
/rider/rides
```

Purpose:

- List rider rides.

APIs:

```text
GET /rides?status=completed&page=1&limit=20
GET /rides?status=cancelled&page=1&limit=20 optional
```

UI:

- Tabs for completed/cancelled/active.
- Ride cards with date, pickup, dropoff, final fare/status.
- Tap opens details.

shadcn:

```text
Tabs
Card
Badge
Skeleton
Button
```

Done when:

- List loads from API.
- Empty state displays.
- Pagination/load more works if meta exists.

---

## 12B.4 Rider Ride Details Screen

Route:

```text
/rider/rides/:ride_id
```

Purpose:

- Show ride summary.

APIs:

```text
GET /rides/:ride_id
GET /rides/:ride_id/route
GET /rides/:ride_id/receipt
```

UI:

- Pickup/dropoff/stops.
- Driver and vehicle.
- Fare breakdown.
- Route preview if available.
- Receipt button.
- Rating button if not rated.

shadcn:

```text
Card
Badge
Separator
Button
```

Done when:

- All fields render safely.
- Missing route or receipt does not crash UI.

---

## 12B.5 Saved Places Screen

Route:

```text
/rider/saved-places
```

Purpose:

- Manage Home, Work, Favorites.

APIs:

```text
GET /riders/me/saved-places
POST /riders/me/saved-places
PATCH /riders/me/saved-places/:saved_place_id
DELETE /riders/me/saved-places/:saved_place_id
GET /maps/autocomplete
```

UI:

- List saved places.
- Add/edit place dialog or sheet.
- Address autocomplete.
- Delete confirmation.

shadcn:

```text
Card
Button
Input
Sheet/Dialog
AlertDialog
Badge
```

Done when:

- CRUD works against mock API.
- Query invalidation updates list.

---

## 12B.6 Rider Profile Screen

Route:

```text
/rider/profile
```

Purpose:

- Show and edit rider account profile.
- Upload profile photo.

APIs:

```text
GET /auth/me
GET /riders/me
PATCH /users/me
POST /users/me/profile-photo
POST /auth/logout
```

UI:

- Avatar.
- Name, phone, email.
- Verification badges.
- Edit profile form.
- Logout button.

shadcn:

```text
Avatar
Card
Input
Button
Badge
Dialog
```

Done when:

- Profile update works.
- Photo upload uses multipart.
- Logout clears token and cache.

---

# 12C. Driver Screens

## 12C.1 Driver Home Screen

Route:

```text
/driver/home
```

Purpose:

- Driver dashboard/map.
- Toggle availability.
- Send location.
- Receive ride offers.
- Show demand/surge zones.

APIs:

```text
GET /drivers/me
PATCH /drivers/me/availability
POST /drivers/me/location
GET /drivers/me/ride-offers?status=sent
GET /maps/surge-zones
GET /maps/config
```

Socket events:

```text
Client emits:
driver:location:update

Server listens:
ride:offer
ride:offer:expired
surge:update
```

UI:

- Map with current location.
- Availability switch.
- Incoming offer card/modal.
- Demand/surge overlays.
- Quick links to earnings, vehicles, documents.

shadcn:

```text
Switch
Card
Button
Sheet/Dialog
Badge
Skeleton
```

Done when:

- Availability updates via API.
- Location updates via REST or socket.
- Incoming offer appears from socket or query.
- Accept/decline actions work.

---

## 12C.2 Driver Ride Offer Component/Screen

This can be a modal/sheet inside Driver Home rather than a full route.

Purpose:

- Display incoming ride request.
- Accept or decline.

APIs:

```text
POST /drivers/me/ride-offers/:offer_id/accept
POST /drivers/me/ride-offers/:offer_id/decline
```

Socket events:

```text
Server listens:
ride:offer
ride:offer:expired
```

UI:

- Pickup/dropoff.
- Estimated fare.
- Distance to pickup.
- Rider note.
- Accept button.
- Decline button.
- Countdown if `expires_at` exists.

shadcn:

```text
Sheet/Dialog
Card
Button
Badge
Progress optional
```

Done when:

- Accept navigates to `/driver/rides/:ride_id/navigation`.
- Decline removes offer.
- Expired event removes offer.

---

## 12C.3 Driver Navigation / Active Ride Screen

Route:

```text
/driver/rides/:ride_id/navigation
```

Purpose:

- Driver-side ride execution.
- Show route steps.
- Arrive/start/complete ride lifecycle.
- Send tracking updates.

APIs:

```text
GET /rides/:ride_id
GET /rides/:ride_id/live
GET /rides/:ride_id/route?route_type=driver_to_pickup
GET /rides/:ride_id/route?route_type=pickup_to_dropoff
POST /rides/:ride_id/arrive
POST /rides/:ride_id/start
POST /rides/:ride_id/tracking
POST /rides/:ride_id/complete
POST /rides/:ride_id/cancel
```

Socket events:

```text
Client emits:
ride:join
ride:tracking:update
driver:location:update
ride:leave

Server listens:
ride:status:update
ride:route:update
ride:cancelled
```

UI:

- Map with route.
- Current step/instruction.
- Status-based action button:
  - accepted -> Arrived
  - arrived -> Start ride
  - started -> Complete ride
- Cancel button.
- Rider note visible.
- Fare summary after completion.

shadcn:

```text
Sheet
Card
Button
Badge
AlertDialog
Separator
```

Done when:

- Status transitions call correct APIs.
- Location/tracking updates are sent.
- Completion shows final fare and routes back to driver home/earnings.

---

## 12C.4 Driver Vehicles Screen

Route:

```text
/driver/vehicles
```

Purpose:

- Manage vehicle profile.

APIs:

```text
GET /drivers/me/vehicles
POST /drivers/me/vehicles
PATCH /drivers/me/vehicles/:vehicle_id
POST /drivers/me/vehicles/:vehicle_id/set-active
```

UI:

- Vehicle cards.
- Add/edit vehicle form.
- Active vehicle badge.

shadcn:

```text
Card
Button
Input
Dialog/Sheet
Badge
Select
```

Done when:

- CRUD works.
- Set active invalidates vehicle and driver profile queries.

---

## 12C.5 Driver Documents Screen

Route:

```text
/driver/documents
```

Purpose:

- Upload CNIC, license, vehicle registration documents.

APIs:

```text
GET /drivers/me/documents
POST /drivers/me/documents
```

Upload format:

```text
multipart/form-data
```

UI:

- Document cards for:
  - CNIC
  - License
  - Vehicle registration
- Upload button.
- Status badge: pending/approved/rejected.

shadcn:

```text
Card
Button
Badge
Input type=file
Alert
```

Done when:

- File upload works.
- Existing documents show status.
- Rejected state shows reason if present.

---

## 12C.6 Driver Earnings Screen

Route:

```text
/driver/earnings
```

Purpose:

- Show daily/weekly/monthly earnings.

APIs:

```text
GET /drivers/me/earnings?period=daily&from=YYYY-MM-DD&to=YYYY-MM-DD
GET /drivers/me/earnings?period=weekly&from=YYYY-MM-DD&to=YYYY-MM-DD
GET /drivers/me/earnings?period=monthly&from=YYYY-MM-DD&to=YYYY-MM-DD
```

UI:

- Period tabs.
- Total gross earnings.
- Estimated driver net.
- Ride breakdown list.

shadcn:

```text
Tabs
Card
Badge
Select
Skeleton
```

Done when:

- Period switching changes query key.
- Empty state works.
- Data can be mocked easily.

---

## 12C.7 Driver Ratings Screen

Route:

```text
/driver/ratings
```

Purpose:

- Show driver ratings and rider feedback.

APIs:

```text
GET /drivers/me/ratings?page=1&limit=20
```

UI:

- Average rating.
- Review list.
- Rating stars.

shadcn:

```text
Card
Badge
Skeleton
```

Done when:

- Ratings list loads.
- Empty state works.

---

## 12C.8 Driver Profile Screen

Route:

```text
/driver/profile
```

Purpose:

- Show/edit account and driver approval status.

APIs:

```text
GET /auth/me
GET /drivers/me
PATCH /users/me
POST /users/me/profile-photo
POST /auth/logout
```

UI:

- Avatar.
- Name, email, phone.
- Approval status badge.
- Document/vehicle shortcuts.
- Logout.

shadcn:

```text
Avatar
Card
Button
Badge
Input
Dialog
```

---

# 12D. Admin/Demo Screens

Admin screens are useful for lab demonstration, but should remain simple.

## 12D.1 Admin Dashboard

Route:

```text
/admin/dashboard
```

Purpose:

- Entry point for lab admin/demo controls.

APIs:

```text
GET /admin/pricing-rules
GET /maps/surge-zones
GET /admin/ml-models
```

UI:

- Cards linking to pricing, surge zones, document review, ML models.
- No complex analytics required.

shadcn:

```text
Card
Button
Badge
```

---

## 12D.2 Pricing Rules Screen

Route:

```text
/admin/pricing-rules
```

APIs:

```text
GET /admin/pricing-rules
POST /admin/pricing-rules
PATCH /admin/pricing-rules/:pricing_rule_id
```

UI:

- Pricing rules table/cards.
- Add/edit rule form.
- Active status.

shadcn:

```text
Card
Button
Input
Dialog/Sheet
Switch
Select
```

---

## 12D.3 Driver Document Review Screen

Route:

```text
/admin/driver-documents
```

Important note:

The API contract includes:

```text
PATCH /admin/driver-documents/:document_id/review
```

If a list endpoint exists in the final API, use it. If not, the mock server can expose demo documents or this screen can use seeded document IDs for lab presentation.

Recommended endpoint to add if possible:

```text
GET /admin/driver-documents?status=pending
```

UI:

- Pending document cards.
- Approve/reject buttons.
- Rejection reason dialog.

shadcn:

```text
Card
Button
Badge
Dialog
Textarea
```

---

## 12D.4 Surge Zones Screen

Route:

```text
/admin/surge-zones
```

APIs:

```text
GET /maps/surge-zones
POST /admin/surge-zones
```

UI:

- List zones.
- Add/update simple zone with area name, city, radius, multiplier.
- Optional map preview.

shadcn:

```text
Card
Button
Input
Dialog/Sheet
Badge
```

---

## 12D.5 ML Models Screen

Route:

```text
/admin/ml-models
```

APIs:

```text
GET /admin/ml-models
```

UI:

- Model version list.
- Metrics card.
- Active model badge.

shadcn:

```text
Card
Badge
Skeleton
```

---

## 12D.6 Ride Prediction Logs Screen

Route:

```text
/admin/rides/:ride_id/prediction-logs
```

APIs:

```text
GET /admin/rides/:ride_id/fare-prediction-logs
```

UI:

- ML input features.
- Predicted fare.
- Actual final fare.
- Prediction error.

shadcn:

```text
Card
Badge
Separator
```

---

## 13. Required API Modules

Implement API modules before pages.

### 13.1 `auth.api.js`

Functions:

```js
registerRider(payload)
registerDriver(payload)
login(payload)
getMe()
sendOtp(payload)
verifyOtp(payload)
logout()
```

### 13.2 `users.api.js`

Functions:

```js
updateMe(payload)
uploadProfilePhoto(file)
```

### 13.3 `riders.api.js`

Functions:

```js
getRiderProfile()
getSavedPlaces()
createSavedPlace(payload)
updateSavedPlace(savedPlaceId, payload)
deleteSavedPlace(savedPlaceId)
```

### 13.4 `drivers.api.js`

Functions:

```js
getDriverProfile()
updateDriverAvailability(payload)
updateDriverLocation(payload)
getDriverDocuments()
uploadDriverDocument(formData)
getDriverVehicles()
createDriverVehicle(payload)
updateDriverVehicle(vehicleId, payload)
setActiveVehicle(vehicleId)
getDriverOffers(status)
acceptRideOffer(offerId)
declineRideOffer(offerId, payload)
getDriverEarnings(params)
getDriverRatings(params)
```

### 13.5 `maps.api.js`

Functions:

```js
getMapConfig()
autocompleteAddress(params)
reverseGeocode(params)
routePreview(payload)
getNearbyDrivers(params)
getSurgeZones(params)
```

### 13.6 `rides.api.js`

Functions:

```js
estimateRide(payload)
createRide(payload)
getRides(params)
getRide(rideId)
getRideRoute(rideId, params)
getRideLive(rideId)
cancelRide(rideId, payload)
markArrived(rideId)
startRide(rideId)
submitTrackingPoint(rideId, payload)
getRideTracking(rideId)
completeRide(rideId, payload)
rateRide(rideId, payload)
getRideReceipt(rideId)
```

### 13.7 `admin.api.js`

Functions:

```js
getPricingRules()
createPricingRule(payload)
updatePricingRule(pricingRuleId, payload)
reviewDriverDocument(documentId, payload)
updateDriverApproval(driverId, payload)
createSurgeZone(payload)
getMlModels()
getFarePredictionLogs(rideId)
```

---

## 14. Required Hooks

Use hooks as the only interface pages call.

Minimum hooks to implement:

```text
useLogin
useRegisterRider
useRegisterDriver
useMe
useOtp

useRiderProfile
useSavedPlaces

useDriverProfile
useDriverAvailability
useDriverDocuments
useDriverVehicles
useDriverOffers
useDriverEarnings
useDriverRatings

useMapConfig
useAddressAutocomplete
useReverseGeocode
useRoutePreview
useNearbyDrivers
useSurgeZones

useRideEstimate
useCreateRide
useRides
useRide
useRideLive
useRideRoute
useCancelRide
useRideLifecycle
useRateRide
useRideReceipt

usePricingRules
useAdminActions
useMlModels
usePredictionLogs
```

---

## 15. Mock Server Compatibility Rules

The frontend must be mock-server friendly.

### 15.1 Do

- Use `VITE_API_BASE_URL`.
- Use the same request/response shapes as `api-contract.md`.
- Keep all mock data inside mock server or fixture files.
- Handle loading, error, empty, and success states.
- Use stable IDs in mock data.
- Mock Socket.IO events for active ride and driver offer screens.

### 15.2 Do Not

- Do not hardcode fake API responses inside pages.
- Do not create frontend-only response shapes.
- Do not use camelCase aliases for API data.
- Do not depend on backend-only implementation details.
- Do not skip error/loading states.

### 15.3 Mock Socket Requirement

For mock server, simulate:

```text
ride:offer
ride:status:update
ride:live:update
nearby_drivers:update
surge:update
```

This lets frontend ride flow be tested before backend is ready.

---

## 16. Build Roadmap

Follow this order for fastest delivery.

## Phase 0 — Project Setup

Deliver:

```text
Vite React project
Tailwind configured
shadcn/ui configured
React Router configured
TanStack Query configured
Axios client configured
Base layout components
Design tokens
```

Screens:

```text
SplashPage placeholder
LoginPage shell
```

Completion:

- App runs.
- shadcn Button/Input/Card render.
- API client points to mock server.

---

## Phase 1 — Auth Flow

Build:

```text
LoginPage
RegisterRiderPage
RegisterDriverPage
OtpPage
ProtectedRoute
RoleRoute
useLogin/useMe hooks
```

APIs:

```text
POST /auth/login
POST /auth/register/rider
POST /auth/register/driver
GET /auth/me
POST /auth/otp/send
POST /auth/otp/verify
```

Completion:

- Rider login redirects to rider home.
- Driver login redirects to driver home.
- Admin login redirects to admin dashboard.
- Token persists after refresh.

---

## Phase 2 — Rider Booking Happy Path

Build:

```text
RiderHomePage
MapboxMap
LocationSearchInput
StopListEditor
FareEstimateCard
RideActionSheet
RiderRideLivePage
```

APIs:

```text
GET /maps/config
GET /maps/autocomplete
GET /maps/reverse-geocode
POST /maps/route-preview
GET /maps/nearby-drivers
GET /maps/surge-zones
POST /rides/estimate
POST /rides
GET /rides/:ride_id/live
```

Completion:

- Rider can search places.
- Rider can estimate fare.
- Rider can request ride.
- Rider can see active ride screen.

---

## Phase 3 — Driver Ride Flow

Build:

```text
DriverHomePage
RideOfferCard
DriverRideNavigationPage
AvailabilityToggle
```

APIs:

```text
GET /drivers/me
PATCH /drivers/me/availability
POST /drivers/me/location
GET /drivers/me/ride-offers
POST /drivers/me/ride-offers/:offer_id/accept
POST /drivers/me/ride-offers/:offer_id/decline
POST /rides/:ride_id/arrive
POST /rides/:ride_id/start
POST /rides/:ride_id/tracking
POST /rides/:ride_id/complete
```

Completion:

- Driver can go online/offline.
- Driver receives mock offer.
- Driver accepts offer.
- Driver can move ride through accepted -> arrived -> started -> completed.

---

## Phase 4 — Rider/Driver Supporting Features

Build:

```text
SavedPlacesPage
RiderRideHistoryPage
RiderRideDetailsPage
RiderProfilePage
DriverVehiclesPage
DriverDocumentsPage
DriverEarningsPage
DriverRatingsPage
DriverProfilePage
```

Completion:

- Shortlisted features are visible.
- CRUD forms work with mock server.
- Earnings and receipts display.

---

## Phase 5 — Admin/Demo Showcase

Build:

```text
AdminDashboardPage
PricingRulesPage
SurgeZonesPage
MlModelsPage
RidePredictionLogsPage
DriverDocumentReviewPage optional
```

Completion:

- Admin can show pricing/surge/ML parts of project.
- Lab demonstration clearly shows PostgreSQL + MongoDB + Neo4j + ML story.

---

## 17. Implementation Rules for AI Agents

When using AI to generate frontend code, give it these rules:

1. Build one screen or one feature slice at a time.
2. Read `api-contract.md` before creating any API call.
3. Use existing hooks before creating new API logic.
4. Use shadcn/ui components wherever possible.
5. Use Tailwind only for layout and customization.
6. Use `.jsx` and `.js` only.
7. Keep API fields in snake_case.
8. Do not introduce TypeScript.
9. Do not introduce Zustand unless explicitly approved.
10. Do not add new dependencies unless necessary.
11. Do not invent endpoints.
12. Do not invent response shapes.
13. Show loading, error, empty, and success states.
14. Make screens mobile-first.
15. Use bottom sheets for map actions.
16. Keep components small and reusable.
17. After generating code, list files created/updated.
18. Use mock server data only through API calls.
19. Never use Uber branding/logos.
20. Match the RideFlow design system.

---

## 18. Screen Completion Checklist

Every screen is complete only when:

```text
[ ] Uses correct route
[ ] Uses shadcn/ui components where possible
[ ] Uses Tailwind for layout/style customization
[ ] Uses TanStack Query hooks for server data
[ ] Uses API contract endpoint shapes exactly
[ ] Handles loading state
[ ] Handles API error state
[ ] Handles empty state where applicable
[ ] Uses mobile-first layout
[ ] Uses teal/white RideFlow design
[ ] Works with mock server
[ ] Does not use hardcoded API data inside page
[ ] Does not convert snake_case fields to camelCase
[ ] Does not use TypeScript
[ ] Does not use Zustand
```

---

## 19. Recommended App Shell

Mobile shell:

```jsx
export function MobileShell({ children }) {
  return (
    <div className="min-h-screen bg-white text-[#101820]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
        {children}
      </div>
    </div>
  );
}
```

Use this shell for all rider and driver screens.

Admin screens may use a wider responsive layout, but still use the same colors and components.

---

## 20. Recommended Status Constants

Create:

```text
src/utils/constants.js
```

```js
export const USER_ROLES = {
  RIDER: "rider",
  DRIVER: "driver",
  ADMIN: "admin",
};

export const RIDE_STATUS = {
  REQUESTED: "requested",
  DRIVER_ASSIGNED: "driver_assigned",
  ACCEPTED: "accepted",
  ARRIVED: "arrived",
  STARTED: "started",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const RIDE_TYPES = {
  STANDARD: "standard",
  SCHEDULED: "scheduled",
  RECURRING: "recurring",
};

export const OFFER_STATUS = {
  SENT: "sent",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
};

export const DOCUMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};
```

Use constants instead of typing string values repeatedly.

---

## 21. Formatting Helpers

Create:

```text
src/utils/formatters.js
```

Required helpers:

```js
formatCurrency(amount)
formatDistanceKm(km)
formatDurationMin(minutes)
formatDateTime(value)
formatRideStatus(status)
formatRating(value)
```

Use PKR for demo currency unless API contract says otherwise.

---

## 22. Validation Helpers

Create:

```text
src/utils/validators.js
```

Simple helpers:

```js
isRequired(value)
isValidEmail(value)
isValidPhone(value)
isValidPassword(value)
validateLoginForm(values)
validateRegisterForm(values)
validateVehicleForm(values)
validateSavedPlaceForm(values)
```

Keep validation simple. Do not over-engineer.

---

## 23. Minimum Demo User Flows

The completed frontend must support these demo flows.

### Rider Flow

```text
Open app
Login as rider
Select pickup
Select dropoff
Add optional stop/note
View fare estimate with surge
Confirm ride
See driver matching
Track driver live
Cancel or complete ride through mock/backend
Rate driver
View receipt
View ride history
```

### Driver Flow

```text
Open app
Login as driver
Go online
Send/update location
Receive ride offer
Accept/decline offer
Navigate to pickup
Mark arrived
Start ride
Send tracking updates
Complete ride
View earnings
View ratings
Manage vehicle/documents
```

### Admin/Demo Flow

```text
Login as admin
View pricing rules
Create/update pricing rule
View/create surge zone
View ML models
View fare prediction logs for a ride
Review driver document if list endpoint/mock data exists
```

---

## 24. Final Frontend Contract Statement

This frontend must be built as a clean, mobile-first React JS app using Tailwind, shadcn/ui, TanStack Query, Axios, Socket.IO, and Mapbox.

The frontend must depend only on `api-contract.md` for backend communication. It must use the same JSON shapes with snake_case fields against both the mock server and the real Express backend.

Use shadcn/ui components first. Use Tailwind for layout and precise RideFlow styling. Keep the app simple, fast to generate with AI, and focused on demonstrating the required CS lab features.
