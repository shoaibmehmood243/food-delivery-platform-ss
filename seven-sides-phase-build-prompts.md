# Seven Sides — Phase-by-Phase Build Spec (for AI coding tools)

How to use this: work through phases in order. For each phase, copy the "Prompt to give the AI tool" block as-is (it already contains the context the tool needs), let it build, then run through the Acceptance Checklist before moving to the next phase. Each phase assumes the previous ones are done — don't skip ahead even if it's tempting.

---

## Phase 0 — Project scaffold

**Objective:** Empty but correctly wired Next.js + Prisma + Postgres project, deployable from day one.

**Tasks**
- Next.js 14 (App Router) + TypeScript project
- Tailwind CSS configured with the Seven Sides design tokens (colors, fonts)
- Prisma installed, connected to a Postgres instance (Neon/Supabase)
- `.env` with `DATABASE_URL`, basic folder structure: `/app`, `/components`, `/lib`, `/prisma`
- Deployed once to Vercel (even blank) to confirm the pipeline works

**Prompt to give the AI tool:**
> Set up a new Next.js 14 project using the App Router and TypeScript. Add Tailwind CSS and configure these custom colors in tailwind.config: teal-deep #0B4F4C, teal-bright #1E8C86, orange #F5A623, ink #141414, cream #FFF7EA, red #E2402F. Add these Google Fonts: Anton (display), Work Sans (body), JetBrains Mono (prices/utility). Install Prisma and configure it to connect to a PostgreSQL database via a DATABASE_URL environment variable. Set up the folder structure: /app, /components, /lib, /prisma. Add a placeholder homepage that just says "Seven Sides — coming soon" styled with the ink background and cream text, so I can confirm the Tailwind theme is wired correctly. Give me the exact steps to deploy this to Vercel afterward.

**Acceptance checklist**
- [ ] `npm run dev` runs with no errors
- [ ] Tailwind custom colors work (test with a `bg-ink text-cream` div)
- [ ] Prisma connects to the database (`npx prisma db pull` or a migration succeeds)
- [ ] Deployed to a live Vercel URL

---

## Phase 1 — Database schema + seed data

**Objective:** Full schema in place, seeded with the real Seven Sides menu and branches so every later phase has real data to work against.

**Prompt to give the AI tool:**
> Using Prisma, create a schema.prisma with these models:
>
> - Branch: id, name, slug, address, phone, lat, lng, hoursOpen, hoursClose, deliveryFee (int), deliveryRadiusKm (float), isActive (bool, default true)
> - Category: id, name, sortOrder (int)
> - MenuItem: id, categoryId (relation), name, slug, description, price (int, in PKR), imageUrl (string, nullable), hasHeatGauge (bool default false), flavorOptions (string array, nullable), isActive (bool default true), isNew (bool default false), isSignature (bool default false)
> - AddonOption: id, menuItemId (relation), name, price (int)
> - Order: id, orderNumber (unique string), branchId (relation), customerName, customerPhone, customerAddress (nullable), customerLat (float, nullable), customerLng (float, nullable), notes (nullable), orderType (enum: delivery, pickup), subtotal (int), deliveryFee (int), total (int), status (enum: placed, confirmed, preparing, out_for_delivery, ready_for_pickup, delivered, cancelled; default placed), estimatedReadyAt (datetime, nullable), createdAt, updatedAt
> - OrderItem: id, orderId (relation), menuItemId (relation), nameSnapshot, unitPriceSnapshot (int), qty (int), selectedHeat (nullable), selectedFlavor (nullable), selectedAddons (json, nullable)
> - OrderStatusHistory: id, orderId (relation), status, changedAt (datetime default now)
> - AdminUser: id, email (unique), passwordHash, role (enum: owner, branch_staff), branchId (relation, nullable)
>
> Run the migration. Then write a seed script (prisma/seed.ts) that inserts:
>
> Branches: "DHA Phase 5" (15-A Street 2, Sector A, Phase 5, DHA, Lahore, phone 923196481040, hours 12 PM–12 AM, deliveryFee 150, deliveryRadiusKm 5), "Lake City" (Lake City, Lahore, phone 923196481040, hours 12 PM–12 AM, deliveryFee 150, deliveryRadiusKm 5), "Cantt" (Girja Chowk, Bagh Ali Road, Cantt, Lahore, phone 923227694926, hours 12 PM–12 AM, deliveryFee 150, deliveryRadiusKm 5).
>
> Categories and items (all prices in PKR):
> - Bird Menu: The Sando (1070, "House bread, hot chicken tenders, cheese fondue & comeback sauce", hasHeatGauge true, isSignature true)
> - Tenders: Red Tenders (1390, "5 pcs of tenders served with fries & comeback sauce", hasHeatGauge true), Crunchy Tenders (1390, same description, hasHeatGauge true)
> - Wraps: Crispy Chicken Wrap (945, "Crispy chicken tenders, jalapeños, lettuce & secret sauce")
> - Sliders: Hot Chicken (895, "House bun, hot chicken, coleslaw, pickles", hasHeatGauge true), Honey Sriracha (895, "House bun, crispy chicken fillet, lettuce, pickles, cheese & honey sriracha sauce", isNew true), Hot Honey Ranch (895, "House bun, crispy chicken fillet, lettuce, cheese & honey ranch mayo", isNew true), Caesar Chicken (895, "House bun, crispy chicken fillet, lettuce & secret sauce", isNew true)
> - Hand Cut Fries: Loaded Waffle Fries (995, "Criss cross potato fries, hot chicken, pickles, parsley & sauce")
> - Hand Spun Shakes (750 each, no description): Choco Berry, Chocolate, Strawberry, Cookies & Cream, Vanilla, Salted Caramel
> - Extras: Crinkle Fries (400), Waffle Fries (400), Mac & Cheese (550)
> - SS Treats: Toastie (645, "Choose your flavour", isNew true, flavorOptions ["Nutella","Strawberry","Dark Choc"]), Churros (500, "5 churro sticks dusted with cinnamon sugar & 1 dip", flavorOptions ["Nutella","Caramel","Dark Choc"], with two AddonOptions: "Add 1 scoop of vanilla ice cream" (100), "Extra dip" (200))
> - Make It A Meal: Fries & Drink (530), Fries & Shake (1150)
> - Drinks (130 each): Pepsi, Diet Pepsi, 7Up, Mirinda, Water
> - Sauce (120 each): Comeback, Salsa, Garlic Mayo, Chipotle
>
> Leave imageUrl null for now — I'll add real images in a later phase. Run the seed and confirm the data is in the database.

**Acceptance checklist**
- [ ] All 7 models exist and migrate cleanly
- [ ] Seed script runs without errors
- [ ] Querying the DB shows 3 branches, 11 categories, ~28 items with correct prices

---

## Phase 2 — Branch selection modal + dynamic homepage

**Objective:** First-visit branch modal, and a homepage pulling real data instead of hardcoded arrays.

**Prompt to give the AI tool:**
> Build a branch-selection modal that appears on first visit if no `branch_id` cookie is set. It should fetch active branches from the database and display each with name, address, and hours, with a "Select" button per branch. On selection, set a `branch_id` cookie (1 year expiry) and close the modal. Add a branch switcher in the site header (shows the currently selected branch name, clicking it reopens the same modal) so users can change branches anytime.
>
> Then build the homepage with these sections, matching this visual style: dark teal background (#0B4F4C), bold Anton-font headlines, orange (#F5A623) accents, a scrolling marquee ticker, and cream (#FFF7EA) cards for content blocks.
> 1. Hero: headline "Not just a sandwich. It's a vibe.", subtext about Seven Sides, two CTAs ("See the menu", "Change branch")
> 2. Scrolling marquee ticker with a few menu highlights and "Cash on Delivery"
> 3. "Fan favourites" section — pull the 4 items where isSignature or isNew is true from the database, not hardcoded
> 4. "Our branches" section — list all branches from the database with address, hours, and an "Order from here" button that sets that branch as selected and navigates to the menu page
> 5. Footer — branch addresses and phone numbers, opening hours, links for Instagram/TikTok/Facebook (placeholder URLs for now), a short About blurb, and a copyright line

**Acceptance checklist**
- [ ] First-time visitor sees the branch modal before anything else
- [ ] Selecting a branch sets a cookie and the modal doesn't reappear on refresh
- [ ] Header shows the selected branch and lets you change it
- [ ] Homepage sections pull from the database (change a price/flag in the DB and confirm it reflects on the page)
- [ ] Footer is present with real branch info

---

## Phase 3 — Menu page with images + item customization

**Objective:** Full menu browsing experience with real images and the heat-gauge/flavor/addon customization sheet.

**Prompt to give the AI tool:**
> Build the menu page at /menu. Fetch all categories and their items from the database, server-side. Layout: a sticky category nav bar at the top that jumps to each category section on click (smooth scroll), and below it, each category rendered as a labeled section with a grid of item cards. Each item card shows: image (use Next.js Image component, with a placeholder/fallback image if imageUrl is null), name, price, a "NEW" or "SIGNATURE" tag badge if applicable, and an add button.
>
> Clicking a card opens a bottom sheet (modal on mobile, centered modal on desktop) for customization:
> - If hasHeatGauge is true, show an interactive 4-level heat gauge (chili icons, click to select level: No Heat / Mild Heat / Country Heat / Uncommon Heat)
> - If flavorOptions is present, show them as selectable chips
> - If the item has AddonOptions, show them as checkboxes with their price
> - A quantity stepper and an "Add to cart" button showing the running total for that line
>
> Use the teal/orange/black/cream design tokens and Anton/Work Sans/JetBrains Mono fonts already configured. For now, use royalty-free stock food photography as placeholder images for each item (I'll replace these with real photography before launch) — make sure the imageUrl field in the database is what's actually rendered, so swapping in real photos later is just a data update.

**Acceptance checklist**
- [ ] Menu page loads all categories/items from the database
- [ ] Category nav scroll-jump works
- [ ] Item images render (placeholder or real) with no layout shift
- [ ] Heat gauge, flavor chips, and addons work correctly per item type
- [ ] Adding an item with options produces a correctly priced cart line

---

## Phase 4 — Cart (persisted, branch-scoped)

**Objective:** A working cart that survives refresh and handles branch switching sensibly.

**Prompt to give the AI tool:**
> Implement the shopping cart using Zustand. The cart should:
> - Store line items with: cartId, menuItemId, name, unitPrice, qty, and selected options (heat/flavor/addons)
> - Persist to a cookie so the cart survives a page refresh
> - Be scoped to the currently selected branch — if the customer changes branch while the cart is not empty, show a confirmation dialog: "Switching branches will clear your cart — continue?" and only clear it if they confirm
> - Power a slide-out cart drawer (opened via a cart icon in the header showing the item count) listing each line with quantity +/- controls, a remove button, and a subtotal at the bottom
> - Include a "Checkout" button in the drawer that navigates to /checkout

**Acceptance checklist**
- [ ] Adding items updates the cart badge count immediately
- [ ] Refreshing the page keeps the cart intact
- [ ] Switching branches with items in the cart triggers the confirmation dialog
- [ ] Quantity controls and remove work correctly and update the subtotal live

---

## Phase 5 — Checkout (advanced)

**Objective:** Full checkout with delivery-zone validation and order creation in the database.

**Prompt to give the AI tool:**
> Build the /checkout page:
> 1. Order type toggle: Delivery / Pickup
> 2. Branch confirmation (shows the currently selected branch, with a way to change it)
> 3. If Delivery: an embedded Google Map where the customer drops a pin for their location (use the Google Maps JavaScript API), plus a text address field. On pin drop, calculate the distance from the branch's lat/lng using the Haversine formula and compare it to the branch's deliveryRadiusKm. If outside the radius, show a warning: "This address may be outside our delivery zone for [branch name] — you can still place the order, or switch to a closer branch." Don't hard-block the order, just warn.
> 4. Customer fields: full name, phone number, notes (optional)
> 5. An order review section styled as a perforated "ticket" (cream background, dashed lines between rows) showing each line item, subtotal, delivery fee (or "Pickup — no delivery fee"), and total
> 6. A "Place order · Pay with cash" button, disabled until name, phone, and (if delivery) address are filled
>
> On submit: create an Order record in the database (status "placed") with its OrderItems (snapshotting name and price at time of order), generate an order number like SS-XXXX, then redirect to /order/[orderNumber] (the confirmation page). Also build the API route that handles this creation server-side — don't create the order client-side directly against the database.

**Acceptance checklist**
- [ ] Map pin drop works and calculates distance correctly
- [ ] Out-of-radius warning appears but doesn't block the order
- [ ] Order and OrderItems are correctly written to the database on submit
- [ ] Redirect to the confirmation page happens with the right order number

---

## Phase 6 — Confirmation page with live status

**Objective:** Order confirmation page showing a live-updating status timeline and ETA.

**Prompt to give the AI tool:**
> Build /order/[orderNumber] as the confirmation page. On load, fetch the order from the database by orderNumber. Display:
> - Order number and a success message
> - A horizontal status timeline: Placed → Confirmed → Preparing → (Out for Delivery or Ready for Pickup, depending on orderType) → Delivered, with the current status highlighted
> - Estimated ready time: if the order has estimatedReadyAt set, show it; otherwise show a static default (45 minutes for delivery, 20 minutes for pickup) from createdAt
> - A "Send order on WhatsApp" button that builds the same formatted order-summary message as before and opens a wa.me link to the branch's phone number
> - Poll the order status every 15 seconds (simple fetch interval, no websockets needed) and update the timeline live without a full page reload if the admin changes the status elsewhere
>
> Also set a cookie storing the last order number, so if the customer closes the tab and reopens the site, there's a "Track your last order" link available from the homepage.

**Acceptance checklist**
- [ ] Confirmation page loads the correct order by number
- [ ] Timeline correctly reflects current status
- [ ] ETA displays correctly for both delivery and pickup
- [ ] Changing the order's status directly in the database (or later, via the admin portal) is reflected on this page within ~15 seconds without a manual refresh

---

## Phase 7 — Admin portal: auth + order management

**Objective:** Secure admin login and a working order dashboard where staff can update statuses.

**Prompt to give the AI tool:**
> Build an /admin section protected by authentication (use NextAuth with a credentials provider, checking against the AdminUser table with bcrypt-hashed passwords). Build:
> 1. /admin/login — email/password form
> 2. /admin/orders — a dashboard listing all orders, newest first, with columns: order number, branch, customer name, total, status, created time. Add filters for branch and status. Auto-refresh the list every 15–20 seconds.
> 3. /admin/orders/[id] — order detail view showing full item breakdown (with selected options), customer info, address/map pin if delivery, and a status dropdown (placed, confirmed, preparing, out_for_delivery, ready_for_pickup, delivered, cancelled) plus an editable ETA field. Saving writes to the Order table and adds a row to OrderStatusHistory.
>
> If the logged-in AdminUser has role "branch_staff", scope both the dashboard and order detail views to only their own branchId. If role is "owner", show all branches.

**Acceptance checklist**
- [ ] Login works and blocks unauthenticated access to /admin routes
- [ ] Order dashboard lists real orders and filters correctly
- [ ] Changing status on an order updates the database and appears on the customer's confirmation page within the poll interval
- [ ] Branch-scoped staff accounts only see their own branch's orders

---

## Phase 8 — Admin portal: menu & branch management

**Objective:** Full CRUD for menu items, categories, and branches, with image upload.

**Prompt to give the AI tool:**
> Build these admin sections:
> 1. /admin/menu — list all categories and items. Allow creating/editing/deleting categories (name, sort order) and items (name, description, price, category, hasHeatGauge toggle, flavorOptions, addons, isNew/isSignature toggles, isActive toggle to hide sold-out items instantly). Image upload should go to Cloudinary (use their upload widget or a signed upload API route) and store the resulting URL in imageUrl.
> 2. /admin/branches — list all branches. Allow creating/editing (name, address, phone, hours, deliveryFee, deliveryRadiusKm, isActive toggle) and deleting (with a confirmation, and only if the branch has no orders — otherwise block deletion and suggest setting isActive to false instead).
>
> Both sections should be owner-only (branch_staff role should not see menu/branch management, only their own order queue from Phase 7).

**Acceptance checklist**
- [ ] Creating/editing/deleting categories and items works and reflects immediately on the live menu page
- [ ] Image upload works end-to-end (admin uploads → Cloudinary URL saved → shows on menu page)
- [ ] Toggling isActive on an item hides it from the customer-facing menu without deleting data
- [ ] Branch CRUD works, and deletion is blocked for branches with existing orders

---

## Phase 9 — Polish, real content, deploy

**Objective:** Production-ready launch.

**Tasks (not a single AI prompt — mostly manual/content work)**
- Replace placeholder images with real photography for all ~28 items
- Confirm and correct both branch phone numbers (Cantt differs from DHA Phase 5/Lake City)
- Confirm delivery radius per branch with the owner
- Point the `sevensides.pk` domain at the Vercel deployment (or register it if it isn't already)
- Mobile QA pass on real devices — most traffic will be Instagram/TikTok referred, so test from an actual phone browser, not just resized desktop
- Set up basic analytics (Vercel Analytics or Plausible) so you can show them real usage numbers after launch — useful both for the client relationship and for your portfolio case study

**Acceptance checklist**
- [ ] All menu items have real photos
- [ ] Domain is live and pointed correctly
- [ ] Full order flow tested end-to-end on a real phone: branch select → menu → cart → checkout → confirmation → admin status update → confirmation page reflects it
- [ ] Analytics installed and reporting
