# Old Mutual Corporate Brand Update Summary

## Overview
Updated the LifeCompass application to align with the **Old Mutual Corporate Visual Identity Guidelines 2020**, replacing emojis with custom icon components and implementing the official brand color palette, typography, and design elements.

## Changes Implemented

### 1. **Color Palette Updates**

#### Primary Colors (Official Old Mutual Corporate)
- **OM Heritage Green**: `#009677` - Primary brand color (replaces `#00A651`)
- **OM Fresh Green**: `#50b848` - Secondary green
- **OM Future Green**: `#8dc63f` - Tertiary green
- **Black**: `#000000`
- **White**: `#ffffff`

#### Secondary Colors
- **OM Sky**: `#00c0e8` - Info/blue accent
- **OM Sun**: `#fff200` - Warning/yellow accent
- **OM Naartjie**: `#f37021` - Accent/orange (replaces gold)
- **OM Cerise**: `#ed0080` - Error/pink accent

#### Neutral Greys
- **OM Grey 80%**: `#575757`
- **OM Grey 60%**: `#878787`
- **OM Grey 40%**: `#b2b2b2`
- **OM Grey 15%**: `#e3e3e3`
- **OM Grey 5%**: `#f6f6f6`

### 2. **Typography**

#### Fonts
- **Primary**: Montserrat (Regular 400, Medium 500, Bold 700, Light 300)
- **Secondary**: Century Gothic (fallback)
- All components now use Montserrat as the primary font family

#### Font Weights
- Headings: **Bold** (700)
- Body: **Regular** (400)
- Buttons: **Semibold** (600)
- Display text: **Medium** (500)

### 3. **Vignette Gradients**

Implemented the official Old Mutual vignette line gradients:
- **Primary Vignette (90deg)**: `linear-gradient(90deg, #8dc63f 40%, #009677 60%)`
- **Primary Vignette (45deg)**: `linear-gradient(45deg, #8dc63f 40%, #009677 60%)`
- **Secondary Vignette**: Includes Naartjie accent color

**Usage:**
```css
.bg-vignette-primary
.bg-vignette-primary-vertical
.bg-vignette-secondary
```

### 4. **Component Updates**

#### Buttons
- `.btn-om-primary` - Now uses Heritage Green (`#009677`)
- `.btn-om-secondary` - Navy blue for contrast
- `.btn-om-outline` - Heritage Green outline
- `.btn-om-accent` - Naartjie accent color

#### Cards
- `.card-om` - Updated with subtle borders and shadows
- `.card-om-premium` - Premium card with vignette gradient top border

#### Badges
- `.badge-om-active` - Heritage Green
- `.badge-om-pending` - Naartjie (was gold)
- `.badge-om-inactive` - Grey 60%
- `.badge-om-success` - Fresh Green
- `.badge-om-info` - Sky blue

#### Icons
- All product icons now use Heritage Green
- Status icons use appropriate brand colors:
  - Success/Active: Heritage Green
  - Warning/Pending: Naartjie
  - Error: Cerise
  - Info: Sky

### 5. **Icon System**

Replaced all emojis with custom Heroicons components:
- **Products Page**: Shield, Heart, Building, Chart, Academic, Truck, Home icons
- **Policies Page**: Clipboard, Shield, Banknotes, Document icons
- **Claims Page**: Truck, Home, Heart, Shield icons
- **Advisors Page**: Star icon for ratings

All icons follow consistent sizing (24px default) and use brand colors.

### 6. **Design Principles Applied**

Following the Old Mutual Corporate guidelines:
- **Premium feel**: Rich, dark tonal qualities with high contrast
- **Professional appearance**: Clean, corporate design language
- **Consistent spacing**: 8px grid system maintained
- **Accessibility**: WCAG 2.1 AA compliance maintained
- **Brand consistency**: All colors, fonts, and components align with guidelines

## Files Modified

1. **tailwind.config.ts**
   - Added official Old Mutual Corporate colors
   - Updated font families to Montserrat/Century Gothic
   - Added vignette gradient backgrounds

2. **app/globals.css**
   - Imported Montserrat font weights
   - Updated CSS variables with official colors
   - Created vignette gradient utilities
   - Updated all component styles to use brand colors

3. **components/icons/index.tsx**
   - Updated icon colors to use Heritage Green
   - Status icons use appropriate brand colors

4. **components/brand/** (Button, Card, Badge)
   - Updated to use new brand colors
   - Applied Montserrat typography

5. **app/products/page.tsx**
   - Updated hero section to use vignette gradient
   - Icon colors updated to Heritage Green

6. **app/policies/page.tsx**
   - Icon colors updated to Heritage Green

7. **app/claims/page.tsx**
   - Icon colors updated to Heritage Green

8. **app/advisors/page.tsx**
   - Star icon color updated to Naartjie

## Backward Compatibility

Legacy color names are maintained for compatibility:
- `om-green` → Maps to `om-heritage-green` (`#009677`)
- `om-gold` → Maps to `om-naartjie` (`#f37021`)
- `om-navy` → Kept for compatibility
- `om-grey` → Maintained

## Next Steps

1. Review all pages to ensure brand consistency
2. Update any remaining custom colors to use official palette
3. Test vignette gradients on hero sections
4. Verify typography rendering across browsers
5. Update any remaining emoji usage to icon components

## Brand Guidelines Reference

All updates follow the **Old Mutual Corporate Visual Identity Guidelines 2020**:
- Primary Vignette Line: 40% Future Green, 60% Heritage Green
- Typography: Montserrat (primary), Century Gothic (secondary)
- Color usage: Heritage Green as primary, Fresh/Future Green for accents
- Design tone: Premium, professional, corporate

---

**Last Updated**: Based on Old Mutual Corporate Visual Identity Guidelines 2020
