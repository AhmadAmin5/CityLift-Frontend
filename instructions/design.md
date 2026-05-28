# RideFlow UI Design Guidelines

## 1. Purpose

This document defines the visual design system and UI rules for the RideFlow mobile app screens. It is based on the generated login screen design and should be used to keep all future screens consistent, modern, minimal, and easy to implement with React.js, Tailwind CSS, shadcn/ui, and Capacitor.

The design direction is:

- Modern
- Minimal
- Mobile-first
- Premium but simple
- Clean white interface
- Soft rounded components
- Teal/green accent color
- High readability
- Fast to implement with AI-generated React components

---

## 2. Overall Visual Direction

### Design Style

Use a clean ride-hailing product style with:

- White and soft-gray backgrounds
- Dark readable text
- Muted teal as the main brand accent
- Rounded cards, inputs, and buttons
- Light shadows only where needed
- Spacious layouts
- Clear visual hierarchy
- Minimal illustrations/icons
- Bottom-sheet-friendly mobile layouts

The UI should feel practical and professional, not overly decorative.

### App Personality

RideFlow should feel:

- Reliable
- Calm
- Fast
- Safe
- Premium but accessible
- Simple enough for daily use

Avoid loud colors, complex gradients, heavy shadows, and cluttered layouts.

---

## 3. Color Palette

### Primary Brand Colors

| Token | Hex | Usage |
|---|---:|---|
| `brand-primary` | `#008C78` | Main buttons, active states, links, selected tabs |
| `brand-primary-dark` | `#006F60` | Button hover/pressed state |
| `brand-primary-light` | `#E8F7F4` | Selected tab background, subtle active backgrounds |
| `brand-primary-soft` | `#F1FBF9` | Light panels, soft highlights |

### Neutral Colors

| Token | Hex | Usage |
|---|---:|---|
| `background` | `#FFFFFF` | Main app background |
| `surface` | `#FFFFFF` | Cards, input containers, sheets |
| `surface-muted` | `#F7F8FA` | Secondary panels, inactive controls |
| `border` | `#E1E5EA` | Input borders, dividers, card outlines |
| `border-strong` | `#CED4DA` | Focus-visible borders, stronger separation |
| `text-primary` | `#101820` | Main headings and important text |
| `text-secondary` | `#4B5563` | Subtitles and secondary content |
| `text-muted` | `#8A9099` | Placeholders, hints, inactive icons |
| `icon-muted` | `#7A8088` | Default icon color |

### Semantic Colors

| Token | Hex | Usage |
|---|---:|---|
| `success` | `#16A34A` | Success states, completed ride |
| `warning` | `#F59E0B` | Surge, traffic warning, pending status |
| `danger` | `#DC2626` | Errors, cancellation, destructive actions |
| `info` | `#2563EB` | Informational status |

### Suggested Tailwind Theme Tokens

```js
colors: {
  brand: {
    primary: "#008C78",
    dark: "#006F60",
    light: "#E8F7F4",
    soft: "#F1FBF9",
  },
  neutral: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    muted: "#F7F8FA",
    border: "#E1E5EA",
    borderStrong: "#CED4DA",
    text: "#101820",
    secondary: "#4B5563",
    placeholder: "#8A9099",
  }
}
```

---

## 4. Typography

### Recommended Font

Use:

```text
Inter
```

Fallback:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Alternative fonts if Inter is unavailable:

- Manrope
- Plus Jakarta Sans
- SF Pro Display/System UI

### Font Usage

| Element | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| App name/logo text | 32px | 700 | 40px | Brand header |
| Page title | 36px | 700 | 44px | Main screen heading |
| Section title | 22px | 700 | 30px | Cards and panels |
| Body text | 16px | 400 | 24px | General content |
| Input text | 16px | 400 | 24px | Form fields |
| Button text | 16px | 600 | 24px | Primary/secondary buttons |
| Caption | 14px | 400 | 20px | Helper text, dividers |
| Small label | 12px | 500 | 16px | Status badges |

### Login Screen Typography

For the login page specifically:

```text
Logo/App name: 32px, 700
Heading "Welcome back": 38px, 700
Subtitle: 18px, 400
Input text: 16px, 400
Button text: 16px, 600
Bottom link: 15px, 500
```

### Typography Rules

- Use dark text for headings.
- Use medium gray for helper text.
- Avoid all-caps labels unless used in small badges.
- Keep text short on mobile screens.
- Do not use more than two font weights on one screen unless necessary.
- Use consistent heading hierarchy across pages.

---

## 5. Layout System

### Mobile Screen Layout

Target Android mobile layout:

```text
Width: 360px - 430px
Safe top spacing: 24px - 48px
Horizontal padding: 24px
Main content max width: 100%
Bottom padding: 24px - 32px
```

### Spacing Scale

Use an 8-point spacing system.

| Token | Value | Use |
|---|---:|---|
| `space-1` | 4px | Tiny gaps |
| `space-2` | 8px | Icon/text gap |
| `space-3` | 12px | Compact component gap |
| `space-4` | 16px | Standard component gap |
| `space-5` | 20px | Form field gap |
| `space-6` | 24px | Section gap |
| `space-8` | 32px | Large section gap |
| `space-10` | 40px | Major vertical separation |
| `space-12` | 48px | Top/bottom hero spacing |

### Layout Rules

- Use `24px` horizontal padding for most mobile screens.
- Use `16px` internal padding inside cards and bottom sheets.
- Keep buttons full width on authentication and ride action screens.
- Use vertical spacing generously.
- Place primary action buttons near the lower part of the screen or bottom sheet.
- Avoid dense layouts on map screens; use bottom sheets for ride actions.

---

## 6. Radius and Shape

### Border Radius Tokens

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 8px | Small badges, tiny controls |
| `radius-md` | 12px | Inputs, small cards |
| `radius-lg` | 16px | Buttons, segmented tabs |
| `radius-xl` | 20px | Cards and bottom sheet panels |
| `radius-2xl` | 24px | Large sheets and premium cards |
| `radius-full` | 999px | Pills, avatars, circular controls |

### Login Screen Radius

Use:

```text
Inputs: 14px
Primary button: 14px
Segmented tabs: 14px
Social buttons: 14px
```

---

## 7. Shadows and Borders

### Shadow Rules

Use shadows very lightly. The design should mostly rely on spacing, borders, and clean contrast.

Recommended shadows:

```css
--shadow-soft: 0 8px 24px rgba(16, 24, 32, 0.06);
--shadow-card: 0 10px 30px rgba(16, 24, 32, 0.08);
--shadow-sheet: 0 -8px 30px rgba(16, 24, 32, 0.10);
```

### Border Rules

- Use borders instead of heavy shadows for inputs and secondary buttons.
- Default border color: `#E1E5EA`
- Focus border color: `#008C78`
- Error border color: `#DC2626`

---

## 8. Buttons

### Primary Button

Used for main actions:

- Log in
- Sign up
- Confirm ride
- Accept ride
- Start ride
- Complete ride

#### Style

```text
Height: 56px
Width: full on mobile
Border radius: 14px
Background: #008C78
Text: white
Font size: 16px
Font weight: 600
Shadow: subtle or none
```

#### States

| State | Style |
|---|---|
| Default | Background `#008C78`, text white |
| Hover/Web | Background `#007C6A` |
| Pressed | Background `#006F60`, slight scale `0.98` |
| Disabled | Background `#D1D5DB`, text `#9CA3AF` |
| Loading | Spinner + label like `Logging in...` |

#### Tailwind Example

```tsx
<Button className="h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]">
  Log in
</Button>
```

---

### Secondary Button

Used for less important actions:

- Google login
- OTP login
- Cancel
- Back
- Edit

#### Style

```text
Height: 52px
Background: white
Border: 1px solid #E1E5EA
Text: #101820
Icon: brand-primary or original provider icon
Radius: 14px
```

#### Tailwind Example

```tsx
<Button
  variant="outline"
  className="h-13 rounded-[14px] border-[#E1E5EA] bg-white text-base font-semibold"
>
  Google
</Button>
```

---

### Text Button / Link Button

Used for:

- Forgot password?
- Sign up
- Resend OTP
- View details

#### Style

```text
Color: #008C78
Font weight: 500 or 600
No underline by default
Underline on hover
```

---

### Destructive Button

Used for:

- Cancel ride
- Delete saved place
- Reject driver

#### Style

```text
Background: #DC2626
Text: white
Radius: 14px
Height: 52px - 56px
```

Use destructive actions sparingly and confirm them with a dialog.

---

## 9. Inputs

### Standard Input

Used for:

- Email/phone
- Password
- Name
- Vehicle details
- Search address
- Fare/pricing admin values

#### Style

```text
Height: 56px
Background: #FFFFFF
Border: 1px solid #E1E5EA
Radius: 14px
Horizontal padding: 16px
Left icon spacing: 12px
Text color: #101820
Placeholder color: #8A9099
```

#### States

| State | Style |
|---|---|
| Default | Border `#E1E5EA` |
| Focus | Border `#008C78`, soft ring `rgba(0, 140, 120, 0.12)` |
| Error | Border `#DC2626`, helper text red |
| Disabled | Background `#F7F8FA`, text muted |
| Filled | Text `#101820`, icon `#008C78` optional |

#### Tailwind Example

```tsx
<div className="flex h-14 items-center gap-3 rounded-[14px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
  <Mail className="h-5 w-5 text-[#7A8088]" />
  <Input
    className="border-0 p-0 text-base shadow-none focus-visible:ring-0"
    placeholder="Email or phone"
  />
</div>
```

---

### Password Input

Password input should include:

- Lock icon on the left
- Eye icon on the right
- Show/hide password toggle
- Same height/radius as normal input

#### Interaction

```text
Tap eye icon:
- If password is hidden, change input type from password to text
- If visible, change input type from text to password
```

---

### Search Input

Used on location search screens.

Style:

```text
Height: 52px
Radius: 16px
Background: #F7F8FA or white
Left search icon
Optional clear button on right
```

---

## 10. Tabs and Segmented Controls

The login screen uses a segmented control for switching between Rider and Driver.

### Segmented Control Container

```text
Height: 56px
Background: #FFFFFF
Border: 1px solid #E1E5EA
Radius: 14px
Padding: 0 or 2px
Display: grid with 2 equal columns
```

### Active Tab

```text
Background: #E8F7F4
Text: #008C78
Icon: #008C78
Font weight: 600
Border: optional 1px solid rgba(0, 140, 120, 0.15)
```

### Inactive Tab

```text
Background: transparent
Text: #101820 or #4B5563
Icon: #7A8088
Font weight: 600
```

### Switching Behavior

When user taps `Rider`:

```text
selectedRole = "rider"
highlight Rider tab
login form submits as rider
after login redirect to Rider Home Map
```

When user taps `Driver`:

```text
selectedRole = "driver"
highlight Driver tab
login form submits as driver
after login redirect to Driver Home Map
```

### Animation

Use subtle transitions only:

```css
transition: all 180ms ease;
```

Do not use heavy animations.

### React State Example

```tsx
const [selectedRole, setSelectedRole] = useState<"rider" | "driver">("rider");

<button
  onClick={() => setSelectedRole("rider")}
  className={selectedRole === "rider" ? "bg-[#E8F7F4] text-[#008C78]" : "text-[#4B5563]"}
>
  Rider
</button>

<button
  onClick={() => setSelectedRole("driver")}
  className={selectedRole === "driver" ? "bg-[#E8F7F4] text-[#008C78]" : "text-[#4B5563]"}
>
  Driver
</button>
```

---

## 11. Authentication Page Design

### Login Page Structure

Recommended layout order:

```text
1. Status-safe top area
2. Logo + app name
3. Subtle ride illustration
4. Heading
5. Subtitle
6. Rider/Driver segmented control
7. Email or phone input
8. Password input
9. Forgot password link
10. Primary login button
11. Divider text: or continue with
12. Google + OTP buttons
13. Signup prompt
```

### Login Page Spacing

```text
Top padding: 48px
Logo section bottom spacing: 28px
Illustration height: 120px - 150px
Heading gap after illustration: 28px
Form gap: 16px
Button gap after forgot password: 32px
Social section gap: 24px
Bottom signup prompt: 28px
```

### Login Page Notes

- Keep the logo centered.
- Keep form fields full width.
- Avoid multiple competing colors.
- Use one primary CTA only.
- Keep the rider/driver switch above inputs.
- Keep the illustration subtle, low contrast, and non-distracting.

---

## 12. Icons

### Icon Library

Use:

```text
lucide-react
```

Recommended icons:

| UI Element | Icon |
|---|---|
| Email/phone | `Mail` |
| Password | `Lock` |
| Show/hide password | `Eye`, `EyeOff` |
| Rider tab | `User` |
| Driver tab | `CircleGauge`, `SteeringWheel` if available, or `Car` |
| OTP | `MessageSquare` |
| Location | `MapPin` |
| Search | `Search` |
| Back | `ChevronLeft` |
| Ride | `Car` |
| Rating | `Star` |

### Icon Style

```text
Size: 20px
Stroke width: 1.8px - 2px
Default color: #7A8088
Active color: #008C78
```

Do not mix filled icons and outline icons unless required by brand/provider, such as the Google logo.

---

## 13. Illustration Style

The login page uses a subtle ride-themed illustration near the top.

### Illustration Elements

- Small car
- Curved route line
- Map pin
- Soft city skyline silhouette

### Illustration Rules

```text
Use low opacity gray background shapes
Use brand-primary for route/pin
Keep illustration height around 120px - 150px
Do not let it overpower the form
Avoid photorealistic or overly detailed artwork
```

### Visual Tone

The illustration should suggest movement and navigation without making the page feel busy.

---

## 14. Forms and Validation

### Error Messages

Error text should appear below the field.

```text
Color: #DC2626
Font size: 13px - 14px
Margin top: 6px
```

Example:

```text
Please enter a valid email or phone number.
```

### Validation Style

On error:

```text
Input border: #DC2626
Optional error icon: #DC2626
Helper text below input
```

### Success Style

Use success styles sparingly. For example:

```text
OTP verified
Profile updated
Login successful
```

---

## 15. Toasts and Feedback

Use shadcn/ui toast or Sonner.

### Toast Style

```text
Radius: 14px
Background: white
Border: #E1E5EA
Shadow: soft
Text: #101820
```

### Toast Types

| Type | Accent |
|---|---|
| Success | `#16A34A` |
| Error | `#DC2626` |
| Warning | `#F59E0B` |
| Info | `#2563EB` |

---

## 16. Accessibility Guidelines

- Minimum touch target size: `44px`
- Main buttons should be at least `52px` high
- Text contrast should be readable on white background
- Inputs must have labels or accessible `aria-label`
- Icons inside buttons should not be the only label
- Do not rely only on color to show errors
- Use visible focus states on web
- Avoid tiny text below `12px`

---

## 17. Motion Guidelines

Use minimal motion.

Recommended transitions:

```css
transition: all 180ms ease;
```

Use motion for:

- Tab switching
- Button press feedback
- Bottom sheet opening
- Toast entry
- Map marker movement

Avoid:

- Long animations
- Flashy effects
- Excessive loading animations
- Heavy parallax

---

## 18. React + Tailwind Implementation Guidelines

### Recommended Component Stack

```text
React.js
TypeScript
Tailwind CSS
shadcn/ui
lucide-react
React Hook Form
Zod
TanStack Query
Capacitor
```

### Component Naming

Use clear reusable component names:

```text
AuthLayout
RoleTabs
AuthInput
PasswordInput
PrimaryButton
SocialLoginButton
RideIllustration
```

### Login Page Components

Suggested structure:

```tsx
<LoginPage>
  <AuthHeader />
  <RideHeroIllustration />
  <AuthFormCard>
    <RoleTabs />
    <AuthInput />
    <PasswordInput />
    <ForgotPasswordLink />
    <PrimaryButton />
    <AuthDivider />
    <SocialLoginActions />
    <SignupPrompt />
  </AuthFormCard>
</LoginPage>
```

---

## 19. shadcn/ui Customization Notes

Use shadcn/ui components where possible:

```text
Button
Input
Form
Card
Tabs
Separator
Toast / Sonner
```

However, for the login segmented Rider/Driver switch, a custom segmented control may be simpler than using full Tabs.

### Button Base Override

```tsx
className="h-14 rounded-[14px] text-base font-semibold"
```

### Input Base Override

```tsx
className="h-14 rounded-[14px] border-[#E1E5EA] text-base"
```

### Card Base Override

```tsx
className="rounded-[24px] border-[#E1E5EA] bg-white shadow-sm"
```

---

## 20. Example Design Tokens

```css
:root {
  --color-brand-primary: #008C78;
  --color-brand-primary-dark: #006F60;
  --color-brand-primary-light: #E8F7F4;
  --color-brand-primary-soft: #F1FBF9;

  --color-background: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F7F8FA;

  --color-border: #E1E5EA;
  --color-border-strong: #CED4DA;

  --color-text-primary: #101820;
  --color-text-secondary: #4B5563;
  --color-text-muted: #8A9099;

  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-danger: #DC2626;
  --color-info: #2563EB;

  --radius-input: 14px;
  --radius-button: 14px;
  --radius-card: 20px;
  --radius-sheet: 24px;

  --shadow-soft: 0 8px 24px rgba(16, 24, 32, 0.06);
  --shadow-card: 0 10px 30px rgba(16, 24, 32, 0.08);
}
```

---

## 21. Example Tailwind Login Screen Styling Summary

```text
Page background: bg-white
Horizontal padding: px-6
Logo: text-3xl font-bold text-[#101820]
Heading: text-4xl font-bold tracking-tight text-[#101820]
Subtitle: text-lg text-[#4B5563]
Input container: h-14 rounded-[14px] border border-[#E1E5EA]
Primary button: h-14 rounded-[14px] bg-[#008C78] text-white
Selected tab: bg-[#E8F7F4] text-[#008C78]
Inactive tab: text-[#4B5563]
Links: text-[#008C78] font-medium
```

---

## 22. Do and Do Not

### Do

- Use consistent spacing
- Use full-width primary buttons
- Use one strong brand accent
- Keep map and ride screens clean
- Use bottom sheets for ride actions
- Use readable typography
- Use reusable components

### Do Not

- Do not use too many colors
- Do not use heavy shadows everywhere
- Do not mix multiple UI kits
- Do not make inputs smaller than 52px height
- Do not clutter the login page
- Do not use complex animations
- Do not use Uber branding or logos

---

## 23. Future Screen Consistency

All future pages should follow the same visual system:

- White background
- Teal primary action
- Rounded inputs/cards
- Minimal icon set
- Bottom sheets over map
- Clean section hierarchy
- Clear primary action on every page

This ensures the Rider app, Driver app, and Admin panel feel like one unified product.
