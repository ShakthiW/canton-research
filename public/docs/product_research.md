# FEATURE: Rapid Product Capture / Product Discovery Inbox

## Context

We are building **China Product Intelligence**, a sourcing and product-research operating system for discovering products that may eventually be sourced from China and sold in Sri Lanka.

The application uses:

* Next.js App Router
* TypeScript
* MongoDB
* Tailwind CSS
* shadcn/ui
* Remix Icons
* Server Components by default
* Client Components only where interaction requires them

The application is already built and contains:

* Dashboard
* Products
* Product detail
* Canton Fair
* Research
* Suppliers
* Samples
* Validation
* Calculator
* Comparison
* Command Center

We now need to redesign the **initial product capture workflow**.

---

# 1. CORE PRINCIPLE

Do NOT treat this as a conventional CRUD form.

This is a **rapid research capture interface**.

The user will often be:

* scrolling TikTok
* watching Instagram content
* browsing Alibaba
* browsing Amazon
* looking at Facebook ads
* looking at Google search results
* walking around the Canton Fair
* talking to another person about a product
* seeing a product in a physical store
* finding a product through another research source

The user should be able to think:

> "That's interesting."

Open the application.

Capture the idea.

Save it.

Continue researching.

The initial capture process should ideally take:

**15–40 seconds.**

Never force the user to enter supplier information, detailed economics, customs information, shipping information, market research or opportunity scores during this stage.

Those belong to subsequent analysis stages.

---

# 2. INFORMATION ARCHITECTURE

Separate product information into three conceptual layers.

## Layer A — Discovery Capture

Information known when the user first sees the product.

Examples:

* Product image
* Product name / temporary name
* Where it was discovered
* Source URL
* Why it caught attention
* Basic category
* Initial interest
* Optional price seen
* Optional engagement metrics

This should be extremely fast.

---

## Layer B — Product Intelligence

Added later.

Examples:

* Exact product identification
* Product specifications
* Dimensions
* Weight
* Materials
* Packaging
* Variants
* Alibaba matches
* Supplier candidates
* MOQ
* China unit price
* Shipping estimates
* HS code
* Customs treatment
* Taxes
* Landed cost
* Sri Lankan selling price
* Competition
* Market demand
* Google Trends
* TikTok trends
* Social engagement
* Local sellers
* Opportunity score

---

## Layer C — Decision / Validation

Added after research.

Examples:

* Shortlisted
* Sample ordered
* Sample received
* Testing
* Validation campaign
* Validated
* Ready to order
* Ordered
* Rejected
* Reason for rejection

The capture form MUST NOT try to collect Layer B or Layer C information.

---

# 3. PRIMARY USER FLOW

Create a dedicated route:

`/products/capture`

Also expose this action from:

* Command Center
* Products page
* Dashboard
* Research page
* Mobile navigation
* Keyboard shortcut

Recommended keyboard shortcut:

`N`

or

`⌘ + Shift + N`

If the application is already using a different shortcut system, integrate with the existing Command Center instead of creating conflicting shortcuts.

---

# 4. CAPTURE EXPERIENCE

The interface should feel more like a **visual research notebook** than a form.

Do NOT display:

* 20 input fields
* traditional labels everywhere
* giant vertical forms
* unnecessary accordions
* unnecessary dropdowns
* "Next" after every tiny field
* boring CRUD styling

Instead use:

* large cards
* segmented buttons
* selectable chips
* image drop zone
* large text input
* visual source buttons
* keyboard shortcuts
* smart defaults
* auto-save
* progressive disclosure
* subtle animations
* optimistic UI
* immediate feedback

The user should feel:

> "I'm collecting ideas."

not:

> "I'm filling out a database."

---

# 5. STEP 1 — CAPTURE THE PRODUCT

Screen title:

## "What did you find?"

Subtitle:

"Capture it now. We'll research the rest later."

### Product Image

Make image upload the dominant visual element.

Support:

* drag & drop
* paste from clipboard
* file picker
* mobile camera
* image URL

Use a large shadcn Card / Dropzone-like interaction.

When an image is uploaded:

Show:

* thumbnail
* remove button
* replace button
* image filename if relevant

Do NOT require the image.

However, visually encourage it.

---

# 6. PRODUCT NAME

Large input:

### "What is it?"

Placeholder:

`e.g. Portable Car Vacuum`

Allow rough names.

Do not force the user to know the exact product name.

Examples:

* "that magnetic kitchen organizer"
* "mini portable blender"
* "LED car thing"
* "foldable storage box"
* "TikTok cleaning gadget"

The backend can later normalize this using AI.

Label internally as:

`rawProductName`

AI-generated normalized name should be stored separately:

`normalizedProductName`

Never overwrite the user's original description.

---

# 7. DISCOVERY SOURCE

Ask:

## "Where did you find it?"

Use large clickable buttons instead of a dropdown.

Options:

* TikTok
* Instagram
* Facebook
* Alibaba
* Amazon
* YouTube
* Google
* Canton Fair
* Physical Store
* Friend / Contact
* Other

Use icons.

Selecting a source should require ONE click.

Store:

`discoverySource`

Enum:

```text
TIKTOK
INSTAGRAM
FACEBOOK
ALIBABA
AMAZON
YOUTUBE
GOOGLE
CANTON_FAIR
PHYSICAL_STORE
FRIEND
OTHER
```

If the user selects "Other", reveal a small text input.

---

# 8. SOURCE URL

Show:

### "Where can we find it again?"

Input:

`Paste URL`

Make this optional.

If a URL is pasted:

Automatically detect the domain.

Examples:

TikTok URL → TikTok

Alibaba URL → Alibaba

Instagram URL → Instagram

YouTube URL → YouTube

If the source has already been selected manually, don't overwrite it unnecessarily.

Store:

`sourceUrl`

---

# 9. WHY DID IT CATCH YOUR ATTENTION?

This is an important field.

Do NOT use a large textarea by default.

Instead show selectable reasons:

## "Why did this catch your attention?"

Buttons:

* 🔥 Looks viral
* 💰 Looks profitable
* 🇱🇰 I haven't seen this locally
* 😮 Interesting / unusual
* 🧠 Solves a problem
* 🎁 Good gift product
* 📱 Great content potential
* 🛒 Already seeing people buy it
* 👀 Just curious

Allow multiple selections.

Store:

`discoveryReasons[]`

This becomes useful later for analyzing what types of products the user tends to discover.

---

# 10. INITIAL INTEREST

Ask:

## "How interesting is it?"

Use a visual 4-level selector.

### 🔥 Must investigate

"This could actually be something."

### ⭐ Interesting

"Definitely worth researching."

### 👀 Maybe

"Interesting, but not sure yet."

### 💤 Just saving

"Don't want to lose this idea."

Store:

`initialInterest`

Enum:

```text
MUST_INVESTIGATE
INTERESTING
MAYBE
JUST_SAVING
```

Default:

`INTERESTING`

Do not use a traditional select.

---

# 11. PRICE SEEN

Do NOT force pricing.

Show a compact optional section:

### "Did you see a price?"

Buttons:

* Yes
* No

If "Yes":

Reveal:

### "What price did you see?"

Use a large numeric field.

Then a compact currency selector:

* USD
* CNY
* LKR
* EUR
* GBP
* Other

Store:

```text
observedPrice
observedCurrency
priceContext
```

For `priceContext`, provide:

* Retail price
* Wholesale price
* Alibaba price
* Ad price
* Marketplace price
* Unknown

This is useful because a TikTok retail price should never be treated as a supplier price.

---

# 12. CATEGORY

Do NOT initially show a huge category dropdown.

Show common visual categories as chips:

* Home
* Kitchen
* Beauty
* Fitness
* Electronics
* Auto
* Kids
* Pet
* Fashion
* Travel
* Office
* Outdoor
* Tools
* Other

Allow one selection.

If the user selects Other:

show:

`What category?`

Later AI can normalize the category.

Store:

`rawCategory`

and later:

`normalizedCategory`

---

# 13. OPTIONAL MARKET SIGNAL

This section should be intentionally lightweight.

Question:

## "Did you notice any traction?"

Buttons:

* 🔥 Lots of views
* ❤️ Lots of likes
* 💬 Lots of comments
* 🛒 People buying
* 📈 Multiple sellers
* 🤷 Not sure

Allow multiple.

Do not require actual numbers.

If the user knows them, allow optional metrics.

For example:

### Views

`1.2M`

### Likes

`85K`

### Comments

`3.2K`

### Shares

`12K`

The user should never have to enter these.

---

# 14. OPTIONAL NOTE

At the end:

## "Anything worth remembering?"

Large but compact textarea.

Placeholder:

`e.g. Saw this three times today. Seems very popular in US TikTok. Could work for Sri Lanka.`

This should be optional.

Store:

`discoveryNote`

---

# 15. FINAL STEP

The final screen should NOT say:

"Submit Form"

Instead say:

# "Capture Product"

Primary button:

### `+ Capture Product`

Secondary:

### `Capture & Add Another`

After saving:

Show an immediate success state:

```text
✓ Product captured

Portable Car Vacuum

TikTok • Interesting

Saved 2 seconds ago
```

Then offer:

### `Continue Research`

### `View Product`

### `Capture Another`

The default should return the user to their previous research context or immediately reopen capture mode.

---

# 16. QUICK CAPTURE MODE

Add an even faster mode.

When the user presses:

`N`

or chooses:

`Quick Capture`

open a compact command-style overlay.

Fields:

1. Image
2. Product name
3. Source
4. URL
5. Interest
6. Save

Everything else optional.

Target completion time:

**under 20 seconds.**

---

# 17. SMART DEFAULTS

The application should aggressively reduce typing.

Examples:

If URL contains:

`tiktok.com`

automatically select:

TikTok.

If URL contains:

`alibaba.com`

automatically select:

Alibaba.

If the image contains a recognizable product, do NOT automatically overwrite the product name.

Instead later run:

`Identify Product`

AI action.

If a previous capture was:

Category = Kitchen

and user captures another product immediately afterward:

Preselect Kitchen but make it easy to change.

Do not create assumptions that could silently corrupt data.

---

# 18. AI POST-CAPTURE PROCESS

After saving the product, trigger background enrichment.

Do NOT make the user wait.

The product should immediately exist in MongoDB.

Then enqueue enrichment tasks.

Example:

```text
PRODUCT_CAPTURED

        ↓

Background Enrichment

        ├── Product Identification
        ├── Category Normalization
        ├── Duplicate Detection
        ├── Keyword Generation
        └── Research Preparation
```

The capture page should never display a blocking loading screen while these tasks execute.

---

# 19. DUPLICATE DETECTION

After saving:

Search existing products using:

* normalized product name
* semantic similarity
* source URL
* image similarity if available
* generated keywords

If a possible duplicate exists:

Do NOT prevent creation.

Instead show:

### "Possible existing match"

with 1–3 product cards.

Buttons:

`View Existing`

`Keep New`

`Merge Later`

This is important because the same product can appear in many different TikTok videos.

---

# 20. PRODUCT DETAIL — DISCOVERY SECTION

Once captured, the product detail page should show a section:

# Discovery

Display:

* Original image
* Raw product name
* Normalized name
* Discovery source
* Source URL
* Discovery date
* Discovery reasons
* Initial interest
* Observed price
* Category
* Discovery note
* Original source metadata

Everything captured here must remain editable later.

But NOT inside the initial capture workflow.

---

# 21. EDIT LATER

Create an explicit:

`Edit Discovery Data`

action.

When clicked, open a separate editing interface.

This is where users can modify:

* Product name
* Category
* Source
* URL
* Price
* Interest
* Reasons
* Engagement metrics
* Notes

The user should NOT be editing these fields while performing the initial capture.

This separation is deliberate.

---

# 22. "RESEARCH THIS PRODUCT" ACTION

After capture, show a prominent CTA:

## 🔎 Research Product

This starts the deeper intelligence workflow.

It should not happen automatically unless configured.

The user explicitly controls when deeper research happens.

Pipeline:

```text
Captured
   ↓
Research Requested
   ↓
Product Identification
   ↓
Market Research
   ↓
Supplier Research
   ↓
Economics
   ↓
Competition
   ↓
Opportunity Score
```

Each stage should report its status independently.

---

# 23. RESEARCH METRICS TO SUPPORT

The later research engine should be designed around measurable signals.

### Demand

Track:

* Google search interest
* Google Trends direction
* search growth
* related search terms
* seasonality
* regional interest
* trend persistence
* trend acceleration

Google Trends supports exploring search interest and related trend information, so store both the observed metric and its timestamp/source rather than treating the number as permanent.

### TikTok / Social

Track where available:

* views
* likes
* comments
* shares
* engagement rate
* number of relevant videos
* creator count
* recent growth
* hashtag growth
* regional relevance
* content velocity

TikTok Creative Center specifically provides trendlines, related videos, audience insights, regional popularity and related hashtags for trends, making these useful concepts for the research model.

### Competition

Track:

* number of Sri Lankan sellers discovered
* seller names
* selling prices
* estimated positioning
* marketplace presence
* social presence
* review counts where available
* review sentiment where available
* content activity
* price range

### Supplierability

Later track:

* Alibaba matches
* supplier count
* MOQ
* supplier price
* verified supplier status
* transaction history where available
* lead time
* customization
* certifications
* packaging
* dimensions
* weight

Alibaba's own sourcing workflow treats product specifications, target quantity and target price as sourcing requirements, so these should remain separate from the initial discovery capture.

---

# 24. SOURCE EVIDENCE MODEL

Every research result should preserve its evidence.

Never store only:

`Google Trends = 82`

Instead store:

```typescript
{
  metric: "google_trends_interest",
  value: 82,
  geography: "LK",
  timeframe: "12_MONTHS",
  source: "Google Trends",
  sourceUrl: "...",
  collectedAt: Date,
  confidence: 0.87
}
```

Similarly:

```typescript
{
  metric: "tiktok_views",
  value: 1200000,
  sourceUrl: "...",
  collectedAt: Date,
  confidence: 0.91
}
```

This allows the system to distinguish:

* observed data
* estimated data
* AI inference
* user-entered data

---

# 25. DATA PROVENANCE

Every important field should eventually support:

```text
SOURCE
USER
AI
CALCULATED
ESTIMATED
IMPORTED
```

Use:

```typescript
valueSource
confidence
sourceUrl
collectedAt
```

where appropriate.

Never let AI-generated information silently appear as fact.

---

# 26. UX DESIGN REQUIREMENTS

The entire experience should feel like a premium research tool.

Avoid:

* generic admin dashboard aesthetics
* excessive borders
* tiny inputs
* dense tables during capture
* 10px text
* giant forms
* excessive dropdowns
* unnecessary confirmation dialogs
* page reloads

Use:

* large typography
* strong visual hierarchy
* cards
* chips
* segmented controls
* icons
* subtle motion
* generous spacing
* keyboard navigation
* focus states
* optimistic updates
* progressive disclosure

Use shadcn/ui components wherever applicable:

* Button
* Card
* Input
* Textarea
* Badge
* Toggle
* Separator
* Tooltip
* Dialog
* Command
* Popover
* DropdownMenu
* ScrollArea
* Progress
* Tabs
* Sheet

Do not build custom UI primitives when an appropriate shadcn component exists.

---

# 27. MOBILE UX

This is extremely important because the user may be researching while walking around.

The capture experience must work exceptionally well on mobile.

Minimum requirements:

* large tap targets
* bottom-sheet interactions
* sticky save button
* camera upload
* paste URL
* one-handed interaction
* minimal typing
* no horizontal scrolling
* no tiny dropdowns

The primary CTA should remain reachable.

---

# 28. PERFORMANCE REQUIREMENTS

The capture page must feel instant.

DO NOT introduce:

* blocking AI requests
* blocking image analysis
* blocking API calls
* unnecessary server round trips
* full-page refreshes
* loading screens between steps

Saving the initial product should require only the minimum database operation.

Ideal:

```text
User clicks Capture
       ↓
Optimistic UI
       ↓
MongoDB insert
       ↓
Immediate success
       ↓
Background enrichment
```

The user should never wait for AI.

---

# 29. SERVER / CLIENT ARCHITECTURE

Use:

### Server Components

For:

* page shells
* initial product history
* navigation
* server-side data retrieval

### Client Components

Only for:

* capture interaction
* keyboard handling
* image preview
* optimistic state
* interactive selectors
* progress UI

Keep client-side JavaScript minimal.

Do not turn the entire application into a Client Component.

---

# 30. MONGODB DATA MODEL

Create or extend the Product document.

Suggested structure:

```typescript
{
  _id,

  rawProductName,

  normalizedProductName,

  images: [],

  discovery: {
    source,
    sourceUrl,

    reasons: [],

    initialInterest,

    rawCategory,

    normalizedCategory,

    observedPrice: {
      amount,
      currency,
      context
    },

    engagement: {
      views,
      likes,
      comments,
      shares
    },

    note,

    discoveredAt,

    capturedAt
  },

  status,

  intelligence: {
    identification,
    demand,
    competition,
    suppliers,
    economics,
    opportunityScore
  },

  createdAt,
  updatedAt
}
```

Do not place every future field into the initial capture UI.

The schema can be richer than the capture interface.

---

# 31. AUDITABILITY

Every major enrichment operation should create an event.

Example:

```typescript
{
  type: "PRODUCT_RESEARCH_STARTED",
  productId,
  timestamp,
  triggeredBy
}
```

Other events:

```text
PRODUCT_CAPTURED
PRODUCT_UPDATED
RESEARCH_STARTED
RESEARCH_COMPLETED
SUPPLIER_RESEARCH_COMPLETED
MARKET_RESEARCH_COMPLETED
ECONOMICS_CALCULATED
OPPORTUNITY_SCORE_UPDATED
```

This will later power the activity feed.

---

# 32. CAPTURE ANALYTICS

Track how the user captures products.

Useful internal metrics:

* average capture duration
* abandoned captures
* most common sources
* most common categories
* average products captured per session
* percentage with images
* percentage with URLs
* percentage researched
* percentage shortlisted
* percentage eventually rejected
* conversion from captured → researched
* conversion from researched → shortlisted

This is useful because the application itself should eventually learn what discovery sources produce the best products.

---

# 33. SMART "CAPTURE ANOTHER"

After saving, provide:

### `Capture Another`

Keep the capture UI open.

Preserve useful context:

* last source
* last category
* last currency

But NEVER automatically copy:

* product name
* price
* notes

unless explicitly requested.

This makes batch research extremely fast.

Example:

The user finds 10 TikTok products.

They can capture:

```text
Product 1 → Save → Capture Another
Product 2 → Save → Capture Another
Product 3 → Save → Capture Another
...
```

without navigating through the application repeatedly.

---

# 34. COMMAND CENTER INTEGRATION

Add:

`Capture Product`

to the global Command Center.

Command:

`⌘K → Capture Product`

Also support search:

`new product`

`capture`

`add product`

`log product`

All should open the same capture interface.

---

# 35. EMPTY STATE

If no products exist:

Do not display:

"No products found."

Instead show:

# "Start building your product radar."

Subtext:

"Every interesting product starts as a small observation."

CTA:

`+ Capture Your First Product`

Secondary:

`Explore Research`

---

# 36. VISUAL PRODUCT CARD

Captured products should visually communicate discovery context.

Example:

┌─────────────────────────────────┐
│                                 │
│          PRODUCT IMAGE          │
│                                 │
│  🔥 MUST INVESTIGATE            │
│                                 │
├─────────────────────────────────┤
│ Portable Car Vacuum             │
│                                 │
│ TikTok  •  Kitchen              │
│                                 │
│ 🔥 Looks viral                  │
│ 🇱🇰 Not seen locally             │
│                                 │
│ Captured 12 min ago             │
└─────────────────────────────────┘

Cards should prioritize:

1. Image
2. Product name
3. Interest
4. Discovery source
5. Key reason
6. Research state

---

# 37. RESEARCH STATUS

A captured product should visually show:

```text
Captured
   ↓
Research Pending
```

After research:

```text
Captured
   ↓
Researching
   ↓
Research Complete
```

Then:

```text
Opportunity: 78
```

Do not calculate the opportunity score during initial capture.

---

# 38. FUTURE AI EXTENSION

Architect the system so the captured product can later be passed to the research orchestrator.

Example:

```typescript
ResearchRequest {
  productId,
  requestedEngines: [
    "IDENTIFICATION",
    "DEMAND",
    "COMPETITION",
    "SUPPLIER",
    "ECONOMICS"
  ]
}
```

The capture interface should therefore produce clean structured data that downstream AI agents can consume.

---

# 39. IMPORTANT PRODUCT PRINCIPLE

The capture workflow should answer only:

> "What did I find?"

The research workflow answers:

> "Is this actually worth pursuing?"

The sourcing workflow answers:

> "Can I buy it?"

The economics workflow answers:

> "Can I make money importing it?"

The validation workflow answers:

> "Will Sri Lankan customers actually buy it?"

The decision workflow answers:

> "Should I order it?"

Do not combine these workflows.

---

# 40. FINAL IMPLEMENTATION REQUIREMENT

Build this feature into the existing application rather than creating a separate product.

Reuse:

* existing Product model
* existing navigation
* existing command center
* existing theme
* existing design tokens
* existing MongoDB connection
* existing authentication
* existing status system

Do not duplicate infrastructure.

Before implementation:

1. Inspect the existing Product schema.
2. Inspect current product creation routes.
3. Inspect existing shadcn components.
4. Inspect Command Center.
5. Inspect mobile navigation.
6. Inspect existing design tokens.
7. Inspect current API/server actions.
8. Reuse existing patterns where possible.

Then implement:

1. `/products/capture`
2. Quick Capture
3. Multi-step interactive UI
4. MongoDB persistence
5. Optimistic save
6. Image upload
7. URL detection
8. smart source detection
9. duplicate detection
10. post-capture success state
11. discovery edit interface
12. Command Center integration
13. mobile capture experience
14. background enrichment hook
15. capture analytics events

Do not implement supplier research, customs calculations or deep market research inside this feature. Those are downstream intelligence workflows.

The final result should feel like a **high-speed product radar / research cockpit**, not a conventional database form.
