# Grotrack - Grocery Inventory App

## Project Overview
A Progressive Web App (PWA) for managing home grocery inventory, accessible from any phone, tablet, or desktop browser. Users can track what's in stock, monitor expiration dates, and scan receipts to automatically add items.

---

## Technology Stack

### Frontend
- **React 18** - Component-based UI framework
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Rapid, responsive styling
- **PWA (Workbox)** - Offline support, installable on devices
- **React DnD** - Drag and drop functionality
- **Zustand** - Lightweight state management

### Backend
- **Node.js + Express** - API server
- **MongoDB** - Flexible document storage for inventory items
- **Tesseract.js** - Client-side OCR for receipt scanning
- **Cloudinary/AWS S3** - Image storage for item photos

### APIs & Services
- **Open Food Facts API** - Free product database for item images/info
- **Google Cloud Vision** (optional) - Enhanced OCR accuracy

---

## Core Features

### 1. Inventory Dashboard
```
+------------------------------------------+
|  [Search Bar]                    [+ Add] |
+------------------------------------------+
|  COMPARTMENTS                            |
|  +--------+  +--------+  +--------+      |
|  | Fridge |  | Freezer|  | Pantry |      |
|  +--------+  +--------+  +--------+      |
|  +--------+  +--------+  +--------+      |
|  | Snacks |  | Dry    |  | Wet    |      |
|  +--------+  +--------+  +--------+      |
+------------------------------------------+
|  ITEMS IN: Fridge (12 items)             |
|  +------+  +------+  +------+            |
|  | Milk |  | Eggs |  |Butter|            |
|  | [img]|  | [img]|  | [img]|            |
|  | 3days|  | 5days|  | 2wks |            |
|  +------+  +------+  +------+            |
+------------------------------------------+
```

### 2. Compartment System
| Compartment | Icon | Typical Items |
|-------------|------|---------------|
| Fridge | Snowflake | Dairy, fresh produce, leftovers |
| Freezer | Ice cube | Frozen meals, ice cream, meat |
| Pantry | House | Canned goods, pasta, rice |
| Snacks | Cookie | Chips, cookies, candy |
| Dry Ingredients | Wheat | Flour, sugar, spices |
| Wet Ingredients | Bottle | Oils, sauces, condiments |

*Users can create custom compartments*

### 3. Item Card Design
```
+------------------+
|    [Item Image]  |
|                  |
|  Item Name       |
|  Qty: 2          |
|  ---------------  |
|  Expires: 5d     |  <- Green (>7d), Yellow (3-7d), Red (<3d)
|  [Edit] [Remove] |
+------------------+
```

### 4. Receipt Scanning Flow
```
[Camera] -> [Capture Receipt] -> [OCR Processing] -> [Item Extraction]
                                                           |
                                                           v
[Review Items] <- [Auto-categorize] <- [Match to Product DB]
      |
      v
[Confirm & Add to Inventory]
```

### 5. Expiration Date Logic
| Category | Default Expiry |
|----------|---------------|
| Fresh Dairy | 7-14 days |
| Fresh Produce | 5-10 days |
| Fresh Meat | 3-5 days |
| Frozen Items | 3-6 months |
| Canned Goods | 1-2 years |
| Dry Goods | 6-12 months |
| Condiments | 1-3 months (opened) |

*Users can override with actual expiry dates*

---

## Data Models

### Item
```typescript
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'pieces' | 'kg' | 'g' | 'L' | 'ml' | 'pack';
  compartment: CompartmentType;
  category: FoodCategory;
  imageUrl?: string;
  purchaseDate: Date;
  expirationDate: Date;
  isExpiringSoon: boolean;  // computed
  barcode?: string;
  notes?: string;
}
```

### Compartment
```typescript
interface Compartment {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  items: InventoryItem[];
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  household: string;  // Allow family sharing
  compartments: Compartment[];
  settings: UserSettings;
}
```

---

## Screen Wireframes

### Home Screen
- Header with app logo and search icon
- Quick stats: Total items, expiring soon, low stock
- Compartment grid (tap to view items)
- Floating action button for quick add

### Compartment View
- Back button + compartment name
- Sort/filter options
- Grid of item cards (2-3 columns on mobile)
- Drag to reorder or move to another compartment

### Add Item Screen
- Camera button for receipt scan
- Manual entry form:
  - Item name (with autocomplete)
  - Quantity + unit selector
  - Compartment dropdown
  - Expiration date picker (with smart defaults)
  - Optional: photo capture

### Receipt Scan Screen
- Camera viewfinder
- Capture button
- Processing overlay
- Results list with checkboxes
- Edit individual items before confirming

### Search Screen
- Search input with real-time filtering
- Filter chips: compartment, expiring soon, category
- Results list with quick actions

---

## User Flows

### Flow 1: Quick Manual Add
1. Tap (+) button
2. Type item name -> autocomplete suggests
3. Select compartment
4. Adjust quantity/expiry if needed
5. Tap "Add" -> item appears in compartment

### Flow 2: Receipt Scan Add
1. Tap (+) -> Select "Scan Receipt"
2. Capture photo of receipt
3. OCR extracts line items
4. Review detected items (edit/remove as needed)
5. Auto-categorize suggests compartments
6. Confirm -> items added to inventory

### Flow 3: Use While Shopping
1. Open app at store
2. Search for item (e.g., "milk")
3. See: "Milk - 1 in Fridge, expires in 2 days"
4. Decide whether to buy more

### Flow 4: Check Expiring Items
1. Open app
2. See "3 items expiring soon" badge
3. Tap to view expiring items
4. Use or discard, then remove from inventory

---

## Folder Structure
```
Grotrack/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icons/               # App icons (various sizes)
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/          # Button, Card, Modal, etc.
│   │   ├── inventory/       # ItemCard, CompartmentGrid
│   │   ├── scanner/         # ReceiptScanner, OCRResults
│   │   └── layout/          # Header, Navigation, FAB
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Compartment.tsx
│   │   ├── AddItem.tsx
│   │   ├── ScanReceipt.tsx
│   │   └── Search.tsx
│   ├── hooks/
│   │   ├── useInventory.ts
│   │   ├── useOCR.ts
│   │   └── useProductLookup.ts
│   ├── store/
│   │   └── inventoryStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── ocr.ts
│   │   └── productDatabase.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── expirationDefaults.ts
│   │   └── categorization.ts
│   ├── App.tsx
│   └── index.tsx
├── server/                   # Backend (Phase 2)
│   ├── routes/
│   ├── models/
│   └── index.ts
├── package.json
└── tailwind.config.js
```

---

## Development Phases

### Phase 1: MVP Prototype (Current Focus)
- [ ] Project setup with React + TypeScript + Tailwind
- [ ] Basic compartment view
- [ ] Manual add/remove items
- [ ] Local storage persistence
- [ ] Basic search functionality
- [ ] Mobile-responsive design

### Phase 2: Core Features
- [ ] Receipt scanning with Tesseract.js
- [ ] Drag and drop between compartments
- [ ] Expiration date tracking with alerts
- [ ] Product image lookup (Open Food Facts API)

### Phase 3: Enhanced Experience
- [ ] PWA setup (offline support, install prompt)
- [ ] User accounts and cloud sync
- [ ] Household sharing
- [ ] Shopping list integration
- [ ] Push notifications for expiring items

### Phase 4: Polish
- [ ] Barcode scanning
- [ ] Recipe suggestions based on inventory
- [ ] Analytics (waste tracking)
- [ ] Dark mode

---

## Notes & Considerations

1. **Offline-First**: Store data locally first, sync when online
2. **Image Optimization**: Compress item photos for fast loading
3. **OCR Accuracy**: Receipt formats vary - need robust parsing
4. **Privacy**: All processing can happen client-side
5. **Accessibility**: Support screen readers, high contrast

---

*Ready to begin Phase 1 prototype!*
