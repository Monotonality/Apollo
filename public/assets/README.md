# Apollo Assets Directory

This directory contains all static assets for the Apollo Organizational Management System.

## Directory Structure

```
assets/
├── images/
│   ├── logos/           # Organization and brand logos
│   │   ├── apollo-logo.png
│   │   ├── utd-logo.png
│   │   └── favicon.ico
│   ├── icons/           # UI icons and graphics
│   │   ├── linkedin-icon.svg
│   │   ├── email-icon.svg
│   │   ├── user-icon.svg
│   │   └── role-icons/
│   └── backgrounds/     # Background images
│       └── hero-bg.jpg
├── fonts/               # Custom fonts (if needed)
└── documents/           # PDFs and documents
```

## Usage in Components

### Public Assets (from public/assets/)
```typescript
// Direct URL access
<img src="/assets/images/logos/apollo-logo.png" alt="Apollo Logo" />
<link rel="icon" href="/assets/images/logos/favicon.ico" />
```

### Imported Assets (from src/assets/)
```typescript
// Import and use
import linkedinIcon from '../assets/icons/linkedin-icon.svg';
<img src={linkedinIcon} alt="LinkedIn" />
```

## File Naming Conventions

- **Logos**: `[organization]-logo.[ext]` (e.g., `apollo-logo.png`)
- **Icons**: `[purpose]-icon.[ext]` (e.g., `linkedin-icon.svg`)
- **Backgrounds**: `[purpose]-bg.[ext]` (e.g., `hero-bg.jpg`)
- **Documents**: `[title].[ext]` (e.g., `user-manual.pdf`)

## Supported Formats

- **Images**: PNG, JPG, SVG, WebP
- **Icons**: SVG (preferred), PNG
- **Documents**: PDF, DOC, DOCX
- **Fonts**: WOFF, WOFF2, TTF, OTF

## Optimization

- Use SVG for icons and simple graphics
- Optimize images for web (compress PNG/JPG)
- Use WebP for better compression when supported
- Keep file sizes reasonable for fast loading
