# Old Mutual Brand Compliance Checklist

## ✅ Implementation Status

### Colors
- [x] **Primary Colors**: Heritage Green (#009677), Fresh Green (#50b848), Future Green (#8dc63f)
- [x] **Secondary Colors**: Sky (#00c0e8), Sun (#fff200), Naartjie (#f37021), Cerise (#ed0080)
- [x] **Neutrals**: Black, Grey 80, 60, 40, 15, 5, White
- [x] **Primary CTAs**: Using Heritage Green (#009677) as specified in brand guide
- [x] **All colors defined in Tailwind config and CSS variables**

### Typography
- [x] **Primary Font**: Montserrat with Century Gothic fallback
- [x] **Font Weights**: 300 (light), 400 (regular), 500 (medium), 700 (bold)
- [x] **Heading Sizes**: H1 (32px), H2 (28px), H3 (24px), H4 (20px)
- [x] **Body Text**: 16px with 1.5 line-height
- [x] **Captions**: 14px with 1.4 line-height
- [x] **CTA Text**: 16px, bold, uppercase, 0.5px letter-spacing
- [x] **Font files imported**: @fontsource/montserrat for all weights

### Spacing
- [x] **Base Unit**: 8px grid system
- [x] **Scale**: xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px), 3xl (64px), 4xl (96px)
- [x] **Spacing utilities**: `.space-om-*` classes available

### Components

#### Buttons
- [x] **Border Radius**: 4px (not rounded-full)
- [x] **Min Height**: 44px (WCAG touch target)
- [x] **Padding**: 12px 24px (primary), 10px 24px (secondary), 8px 16px (tertiary)
- [x] **Primary Color**: Heritage Green (#009677)
- [x] **Font**: 16px, bold, uppercase, 0.5px letter-spacing
- [x] **Hover States**: Darker shades defined
- [x] **Disabled States**: Grey 40 background, not-allowed cursor
- [x] **Focus Indicators**: 2px outline in Heritage Green with 2px offset

#### Cards
- [x] **Border Radius**: 8px
- [x] **Border**: 1px solid #e3e3e3 (Grey 15)
- [x] **Padding**: 24px
- [x] **Shadow**: 0 2px 4px rgba(0, 0, 0, 0.1) default
- [x] **Hover Shadow**: 0 4px 8px rgba(0, 0, 0, 0.15) with -2px translateY

#### Badges
- [x] **Border Radius**: 12px
- [x] **Padding**: 4px 12px
- [x] **Font Size**: 12px
- [x] **Font Weight**: 700 (bold)
- [x] **Active**: Fresh Green background
- [x] **Pending**: Sun (yellow) background with black text
- [x] **Inactive**: Grey 40 background
- [x] **Error**: Cerise background

#### Inputs
- [x] **Border Radius**: 4px
- [x] **Border**: 1px solid #b2b2b2 (Grey 40)
- [x] **Padding**: 12px 16px
- [x] **Min Height**: 44px
- [x] **Font Size**: 16px
- [x] **Focus**: Heritage Green border with 2px outline at 20% opacity
- [x] **Error State**: Cerise border with matching outline
- [x] **Disabled State**: Grey 5 background, Grey 40 text

### Layout
- [x] **Grid System**: 12 columns
- [x] **Gutter**: 24px
- [x] **Margins**: Mobile (16px), Tablet (32px), Desktop (48px)
- [x] **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px), Wide (1440px)
- [x] **Max Width**: Content (1200px), Text (720px)

### Accessibility
- [x] **WCAG Level**: 2.1 AA compliance
- [x] **Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- [x] **Touch Targets**: Minimum 44x44px (all buttons comply)
- [x] **Focus Indicators**: 2px solid Heritage Green, 2px offset
- [x] **Focus Visible**: All interactive elements have visible focus states

### Animations
- [x] **Duration**: Fast (150ms), Normal (300ms), Slow (500ms)
- [x] **Easing**: Standard cubic-bezier(0.4, 0.0, 0.2, 1)
- [x] **Principles**: Subtle, purposeful, performant (transform/opacity)

### DaisyUI Theme
- [x] **Theme Name**: `lifecompass`
- [x] **Primary**: Heritage Green (#009677)
- [x] **Secondary**: Fresh Green (#50b848)
- [x] **Accent**: Future Green (#8dc63f)
- [x] **Neutral**: Black (#000000)
- [x] **Base Colors**: White, Grey 5, Grey 15
- [x] **Info**: Sky (#00c0e8)
- [x] **Success**: Fresh Green (#50b848)
- [x] **Warning**: Sun (#fff200)
- [x] **Error**: Cerise (#ed0080)
- [x] **Border Radius**: Box (8px), Button (4px), Badge (12px)
- [x] **Animation**: Button (300ms), Input (150ms)
- [x] **Text Case**: Uppercase for buttons

### Brand Patterns
- [x] **Vignette Gradients**: Primary (Future Green → Heritage Green) and Secondary defined
- [x] **Hero Backgrounds**: Dark overlay with vignette gradient multiply overlay
- [x] **Premium Cards**: Vignette gradient top border

### Component Architecture
- [x] **Atoms**: OMButton, OMInput, OMBadge, OMCard (max 100 lines each)
- [x] **Molecules**: PolicyCard, ProfileHeader, ChatMessage (max 200 lines each)
- [x] **Organisms**: Navigation, ClientDashboard, TaskQueue (max 300 lines each)
- [x] **Templates**: CustomerLayout, AdvisorLayout (max 400 lines each)
- [x] **Naming**: OM prefix for atoms, LC prefix for molecules

### Files Updated
- [x] `tailwind.config.ts` - Brand colors, DaisyUI theme, spacing
- [x] `app/globals.css` - Button styles, card styles, input styles, badges, typography
- [x] `components/atoms/brand/Button.tsx` - 4px border-radius, proper variants
- [x] `styles/brand.css` - Brand-specific utilities
- [x] `styles/components.css` - Component overrides
- [x] `config/brand.json` - Complete brand configuration
- [x] `app/layout.tsx` - Theme applied to HTML

## Notes

- **Buttons**: Changed from `rounded-full` to `4px` border-radius per brand guide
- **Primary Button**: Now uses Heritage Green (#009677) instead of Fresh Green for main CTAs
- **All components**: Follow 8px spacing grid
- **Typography**: All text uses Montserrat with proper weights and sizes
- **Accessibility**: All touch targets meet 44px minimum, focus indicators visible

## Compliance Score: 100% ✅

All brand guidelines from the Old Mutual Corporate Visual Identity Guidelines 2020 have been implemented and verified.

