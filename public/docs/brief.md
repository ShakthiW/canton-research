# Build: China Product Intelligence

Build a production-quality web application called **China Product Intelligence**.

This application is a personal sourcing and product-research operating system for preparing for the Canton Fair in China and managing the entire product-discovery process before, during, and after the trip.

The application should help me:

* Research potential products
* Track viral/emerging products
* Compare China supplier prices against Sri Lankan selling prices
* Calculate estimated landed costs and margins
* Track suppliers
* Record Canton Fair booth information
* Capture products extremely quickly while walking through the fair
* Score product opportunities
* Compare products side-by-side
* Track samples
* Track supplier conversations
* Track sourcing progress
* Validate products after returning to Sri Lanka
* Decide which products deserve investment
* Eventually manage my first import from discovery → supplier → sample → order → launch

The application should feel like a **modern research cockpit**, NOT an ERP, boring spreadsheet, or traditional CRM.

---

# 1. NON-NEGOTIABLE TECHNOLOGY REQUIREMENTS

Use ONLY:

* Next.js
* TypeScript
* MongoDB
* shadcn/ui
* Tailwind CSS
* Lucide icons

Use the latest stable Next.js App Router architecture available in the project.

Use MongoDB as the only database.

Do NOT introduce:

* PostgreSQL
* Supabase
* Firebase
* Prisma
* Drizzle
* another ORM
* another database
* unnecessary backend services

Use the native MongoDB Node.js driver unless there is a compelling reason otherwise.

Use server components by default.

Use client components only where interactivity genuinely requires them.

---

# 2. PRIMARY DESIGN PHILOSOPHY

The most important requirement is:

## THIS APP MUST BE EXTREMELY FAST.

I will potentially use this application while:

* researching hundreds of products
* opening many product records
* comparing suppliers
* walking around the Canton Fair
* entering information quickly from my phone/laptop
* switching between products constantly

I do NOT want:

* loading screens everywhere
* full-page spinners
* unnecessary skeleton screens
* navigation delays
* excessive animations
* pages that reload after every action
* forms that require multiple screens
* modal overload
* unnecessary API requests
* huge client-side JavaScript bundles

Prefer:

* instant navigation
* optimistic UI
* local state updates
* server actions where appropriate
* parallel data fetching
* cached/static server-rendered UI where appropriate
* URL-based filters
* debounced search
* incremental updates
* MongoDB projections
* pagination
* indexed queries
* connection pooling
* lazy loading for heavy components
* code splitting
* minimal client components

The application should feel like a native desktop application.

---

# 3. IMPORTANT PERFORMANCE RULE

DO NOT use a loading screen as the default response to every operation.

For small mutations:

1. Update UI immediately
2. Send mutation
3. Persist to MongoDB
4. Reconcile result
5. Show a tiny non-blocking error notification only if necessary

Example:

If I change:

Status:
`Researching → Shortlisted`

the row/card should change immediately.

Do NOT:

* disable the entire page
* show a large spinner
* refresh the page
* navigate away
* reload all products

---

# 4. APPLICATION STRUCTURE

Create the following major areas:

## Dashboard

Overview of the entire sourcing project.

## Products

Product research database.

## Suppliers

Supplier CRM/database.

## Canton Fair

Fair-specific research and booth tracking.

## Research

Viral/emerging product research.

## Calculator

Import economics and landed-cost calculator.

## Shortlist

High-potential products.

## Samples

Sample tracking.

## Validation

Post-China product testing.

## Settings

Currencies, scoring configuration, categories, etc.

---

# 5. GLOBAL APP SHELL

Create a premium, modern application shell.

Desktop:

Left sidebar.

Main content area.

Top command/search bar.

Mobile/tablet:

Collapsible sidebar.

Bottom or floating quick-action bar where appropriate.

Sidebar sections:

### WORKSPACE

Dashboard

Products

Suppliers

Canton Fair

Research

Shortlist

Samples

Validation

---

### TOOLS

Import Calculator

Compare Products

Command Center

---

### SYSTEM

Settings

---

Sidebar should show useful counts:

Products
`124`

Shortlisted
`17`

Suppliers
`42`

Samples
`8`

Use subtle badges.

Do not overdecorate.

---

# 6. VISUAL DESIGN

The UI should feel:

* premium
* intelligent
* calm
* focused
* modern
* slightly editorial
* highly functional

Avoid the typical:

"admin dashboard with 15 cards and colorful charts."

Instead use:

* strong typography
* generous spacing
* clear hierarchy
* subtle borders
* restrained shadows
* neutral surfaces
* small accent colors only when meaningful
* excellent whitespace
* large interactive fields
* compact secondary metadata

Use shadcn/ui components as the foundation.

Use:

* Button
* Input
* Textarea
* Select
* Combobox
* Command
* Dialog
* Drawer
* Sheet
* Popover
* Dropdown Menu
* Tabs
* Badge
* Card
* Table
* Data Table
* Tooltip
* Checkbox
* Radio Group
* Calendar
* Date Picker
* Toast/Sonner
* Separator
* Scroll Area

Do not reinvent basic UI components unnecessarily.

---

# 7. COMMAND CENTER

This is one of the most important features.

Use shadcn Command.

Keyboard shortcut:

`⌘ K`

or

`Ctrl K`

Command center should allow:

### Navigation

Go to Dashboard

Go to Products

Go to Suppliers

Go to Shortlist

Go to Canton Fair

Go to Calculator

---

### Creation

Create Product

Create Supplier

Create Fair Visit

Create Research Item

Create Sample

---

### Actions

Search products

Search suppliers

Calculate margin

Compare products

Change product status

Add product to shortlist

Open latest product

---

Make the command system extremely fast.

Example:

`⌘ K → "Create product"`

opens the fast product capture interface.

---

# 8. GLOBAL QUICK ADD

There should always be an easily accessible:

`+ Add`

button.

Clicking it opens a compact command menu:

* Product

* Supplier

* Research Item

* Fair Visit

* Sample

* Validation

The interface should not feel like filling out a long form.

---

# 9. PRODUCT DATABASE

Products are the core entity.

Each product should support:

## Basic Information

* Product name
* Short description
* Category
* Subcategory
* Product image
* Product URL
* Source URL
* Source platform
* Tags
* Notes

Source platform examples:

* TikTok
* Instagram
* YouTube
* Alibaba
* Canton Fair
* Supplier
* Local market
* Other

---

# 10. PRODUCT RESEARCH INFORMATION

Each product should have:

### Demand

* TikTok views
* Instagram engagement
* Google Trends score
* Search interest
* Growth trend
* Viral status
* Demand confidence

Status options:

Emerging

Growing

Viral

Stable

Declining

Unknown

---

### Competition

* Sri Lankan competitors
* Competitor count
* Local selling price
* Local availability
* Marketplace presence
* Competition level

Competition:

Low

Medium

High

Saturated

Unknown

---

# 11. PRODUCT ECONOMICS

Fields:

China unit cost

MOQ

Sample cost

Packaging cost

Estimated shipping/unit

Estimated customs/tax

Other costs

Estimated landed cost

Expected selling price

Expected gross profit

Expected gross margin %

Break-even units

Potential monthly units

Potential monthly revenue

Potential monthly profit

Currency selector:

USD

CNY

LKR

Allow conversions through configurable exchange rates.

Do not call an external exchange-rate API yet.

Store exchange rates in settings so the user can update them.

---

# 12. PRODUCT SCORE

Create a product opportunity scoring system.

Score each product from 0–100.

Components:

### Demand

0–20

### Margin

0–20

### Competition

0–15

### Shipping simplicity

0–10

### Brandability

0–10

### Content potential

0–10

### Repeat purchase potential

0–5

### Regulatory simplicity

0–5

### Supplier quality

0–5

Total:

100

Show:

`82 / 100`

with a visually clear score indicator.

Do NOT make this look like a generic progress bar.

Create a premium circular/ring score or compact score badge.

---

# 13. PRODUCT SCORE CATEGORIES

Automatically classify:

90–100:
Exceptional

80–89:
Strong

70–79:
Promising

60–69:
Needs validation

Below 60:
Weak opportunity

The classification should be configurable later.

---

# 14. PRODUCT DETAIL PAGE

The product detail page should be the heart of the application.

Layout:

### Header

Product image

Product name

Category

Opportunity score

Current status

Quick actions

---

### Quick stats

China Cost

Landed Cost

Selling Price

Gross Margin

MOQ

Opportunity Score

---

### Product Status

Use:

Researching

Shortlisted

Supplier Contacted

Sample Ordered

Sample Received

Testing

Validated

Ready to Order

Ordered

Rejected

Archived

---

### Sections

Overview

Demand

Competition

Economics

Suppliers

Canton Fair

Research

Samples

Validation

Notes

Activity

---

# 15. INLINE EDITING

This is VERY important.

Avoid forcing users to click "Edit" and open a huge form.

Most product fields should support inline editing.

Example:

`MOQ 500`

Click → editable input.

Press Enter → save.

Press Escape → cancel.

Similarly:

China Cost

Selling Price

Category

Status

Score components

Notes

Supplier

etc.

---

# 16. QUICK CAPTURE PRODUCT MODE

Create a special mode called:

## Quick Capture

This is specifically for using at the Canton Fair.

The goal is to capture a product in under 30 seconds.

Fields:

Product name

Photo

Booth number

Supplier name

MOQ

Price

Category

Quick note

Score

Status

That's it.

Everything else is optional.

After saving:

Immediately create the product.

Do NOT open a giant form.

Show:

`Product captured ✓`

Then keep the user in capture mode.

Buttons:

`+ Capture another`

`Open product`

`Add supplier`

---

# 17. QUICK CAPTURE UX

Use a large, comfortable interface.

Example:

---

PRODUCT NAME

[________________________]

PHOTO

[ + Add photo ]

SUPPLIER

[________________________]

BOOTH

[________]

PRICE

[________]

MOQ

[________]

CATEGORY

[ Kitchenware ▾ ]

NOTES

[________________________]

[ Save Product ]

---

But visually make this feel much more polished than a normal form.

Use cards, grouped sections and large touch-friendly controls.

---

# 18. PRODUCT TABLE

Create a powerful product Data Table using shadcn + TanStack Table.

Columns:

Product

Category

Status

China Cost

Landed Cost

Selling Price

Margin

MOQ

Score

Competition

Supplier

Updated

Actions

Support:

* sorting
* filtering
* search
* column visibility
* pagination
* row selection
* bulk actions
* saved filters

---

# 19. PRODUCT CARDS

Provide an alternate visual view:

### Grid View

Each card:

Image

Product name

Score

Status

China cost

Landed cost

Selling price

Margin

MOQ

Supplier

Tags

Quick actions

Allow switching:

`Table | Cards`

Remember the user's preferred view.

---

# 20. SMART FILTERS

Filters should be extremely quick.

Examples:

Score > 80

Margin > 40%

MOQ < 500

Competition = Low

Status = Shortlisted

Source = TikTok

Category = Home

Supplier = Known

Use shadcn Popover/Command style controls.

Do NOT make users navigate to a separate filter page.

---

# 21. SUPPLIER DATABASE

Supplier fields:

Company name

Contact person

Country

City

Booth number

Hall

Email

Phone

WeChat

Alibaba URL

Website

Supplier type

Manufacturer

Trading Company

Unknown

Categories

Products

MOQ

Lead time

Payment terms

Customization

Private labeling

Packaging customization

Sample availability

Sample cost

Notes

Supplier score

---

# 22. SUPPLIER SCORE

Score suppliers:

Product Quality

Pricing

Communication

MOQ

Customization

Lead Time

Reliability

Overall

Show:

`Supplier Score: 87`

---

# 23. SUPPLIER ↔ PRODUCT RELATIONSHIP

A supplier can have many products.

A product can have many suppliers.

Create a many-to-many relationship.

For each product supplier relationship store:

Supplier

Quoted price

MOQ

Quotation date

MOQ at quoted price

Customization available

Packaging available

Lead time

Payment terms

Notes

Status

This is extremely important.

Do NOT store supplier information directly as duplicated fields inside the product only.

---

# 24. CANTON FAIR MODULE

Create a dedicated Canton Fair workspace.

Fair:

140th Canton Fair

Phases:

Phase 1

Phase 2

Phase 3

Allow custom fairs later.

Each fair contains:

* Name
* Year
* Location
* Phase
* Start date
* End date
* Notes

---

# 25. FAIR BOOTH TRACKING

For each booth visit:

Booth number

Hall

Phase

Supplier

Product

Visit date

Notes

Price quoted

MOQ

Photo

Business card/contact

Interest level

Follow-up required

Follow-up date

Status

Status:

Not Reviewed

Interesting

Shortlisted

Follow Up

Rejected

---

# 26. FAIR MODE

Create a special "Fair Mode."

This should be optimized for speed.

Large typography.

Minimal UI.

High contrast.

Quick capture.

The primary screen should contain:

`+ Product`

`+ Supplier`

`+ Note`

`+ Photo`

and a list of recently captured products.

Show:

Last 10 captures

with one-tap access.

---

# 27. RESEARCH MODULE

Create a research feed/database.

A research item contains:

Title

Product

Source

URL

Platform

Date discovered

Views

Likes

Comments

Shares

Trend status

Notes

Potential product

Research score

---

# 28. VIRAL PRODUCT RESEARCH

Create a workflow specifically for discovering products from social media.

Research item:

Product

Platform

URL

Views

Engagement

Date

Growth

Notes

Competition

Potential

Then allow:

`Convert to Product`

One click.

The research item should automatically create a Product using the captured information.

---

# 29. SHORTLIST

Create a dedicated high-signal workspace.

Only show:

Products marked Shortlisted.

Sort by:

Opportunity score

Margin

Demand

Lowest MOQ

Lowest landed cost

Allow:

Compare

Reject

Contact supplier

Order sample

Add note

---

# 30. PRODUCT COMPARISON

Allow selecting multiple products.

Maximum:

5 products.

Display them side-by-side.

Compare:

Product

Score

Demand

Competition

China cost

Landed cost

Selling price

Margin

MOQ

Shipping complexity

Brandability

Content potential

Supplier score

Risk

Show the strongest option visually.

---

# 31. IMPORT CALCULATOR

Create a dedicated calculator.

Inputs:

Product cost

Quantity

Currency

Packaging

Domestic China shipping

International shipping

Insurance

Customs

Taxes

Clearing

Local transport

Other costs

Output:

Total product cost

Total landed cost

Landed cost/unit

Selling price

Gross revenue

Gross profit

Gross margin

ROI

Break-even units

---

# 32. LIVE CALCULATIONS

Calculations should happen instantly as the user types.

No save button required for calculations.

Do not call the server for every keystroke.

Calculate locally.

Only persist when explicitly saved.

---

# 33. CALCULATOR UI

Do not make this a boring calculator form.

Use a split layout.

LEFT:

Inputs

RIGHT:

Large live result.

Example:

### Landed Cost

`LKR 1,842`

### Selling Price

`LKR 4,990`

### Gross Margin

`63.1%`

### Estimated Profit

`LKR 3,148`

Then show a compact economics summary.

---

# 34. SAMPLE TRACKING

Each sample:

Product

Supplier

Order date

Sample cost

Shipping cost

Expected arrival

Received date

Quality score

Packaging score

Product usefulness

Customer appeal

Notes

Photos

Final decision

Decision:

Reject

Modify

Retest

Approve

---

# 35. VALIDATION MODULE

After returning to Sri Lanka, products should move into validation.

Track:

Product

Test date

Test method

Marketing channel

Ad spend

Views

Clicks

Inquiries

Orders

Revenue

Customer feedback

Conversion rate

Cost per acquisition

Result

Result:

Failed

Interesting

Promising

Validated

---

# 36. DASHBOARD

The dashboard should answer:

### What should I work on today?

Display:

Products researched

Shortlisted

High-score opportunities

Supplier follow-ups

Samples pending

Products needing validation

---

### Opportunity overview

Total products

Shortlisted

Average score

Best opportunity

Potential margin

---

### Pipeline

Researching

Shortlisted

Supplier Contacted

Sample Ordered

Testing

Validated

Ready to Order

Use a clean horizontal pipeline or compact kanban.

---

# 37. DASHBOARD "TOP OPPORTUNITIES"

Show the top 5 products.

Each row:

Product

Score

Margin

MOQ

Demand

Status

Quick action

`Open`

---

# 38. ACTIVITY TIMELINE

Every important action should create an activity.

Examples:

Product created

Supplier added

Price changed

Status changed

Sample ordered

Sample received

Product shortlisted

Validation completed

Show recent activity.

---

# 39. NOTES

Every important entity should support notes.

Do not create a giant notes form.

Use a lightweight editor.

Allow:

Plain text

Checklist

Tags

Links

---

# 40. ATTACHMENTS

Allow attaching:

Product photos

Supplier photos

Business cards

Screenshots

Invoices

Quotes

Documents

Design references

For the initial version, store file metadata and structure the code so storage can be added cleanly later.

Do not over-engineer file storage in V1.

---

# 41. MONGODB DATA MODEL

Create appropriate collections:

users

products

suppliers

supplierProducts

researchItems

fairs

fairVisits

samples

validations

activities

settings

savedFilters

Use ObjectId references.

Avoid deeply nested documents where data will frequently be queried independently.

Create indexes for common queries.

At minimum:

products.status

products.category

products.score

products.createdAt

products.updatedAt

products.source

suppliers.name

suppliers.createdAt

researchItems.platform

researchItems.createdAt

samples.status

validations.status

Use compound indexes where query patterns justify them.

---

# 42. MONGODB PERFORMANCE

Create a singleton MongoClient.

Do NOT create a new MongoClient for every request.

Reuse the connection pool.

Use projections when fetching list views.

Do not return enormous documents to the browser.

For tables:

Only retrieve fields required by the current table.

For product detail:

Fetch additional information only when needed.

Paginate large datasets.

Never fetch 5,000 products just to render the first page.

---

# 43. NEXT.JS ARCHITECTURE

Use:

App Router

Server Components by default

Server Actions for appropriate mutations

Route handlers only when they are actually useful

Suspense only where it improves perceived performance

Do not create unnecessary API layers.

Avoid:

Client → API route → server function → MongoDB

when:

Client → Server Action → MongoDB

is sufficient.

---

# 44. NAVIGATION PERFORMANCE

Navigation should feel instant.

Use Next.js prefetching where appropriate.

Prefetch likely destinations.

Do not create unnecessary loading pages.

Avoid giant client bundles.

Heavy components such as:

Charts

Large data tables

Complex comparison interfaces

should be lazy-loaded when appropriate.

---

# 45. SEARCH

Global search should search:

Products

Suppliers

Research

Samples

Fair visits

Use debouncing.

Search results should appear quickly.

Keyboard navigation must work.

Example:

⌘ K

type:

`wireless`

Results:

Products

Suppliers

Research

Commands

---

# 46. KEYBOARD SHORTCUTS

Add useful shortcuts.

`⌘ K`
Command center

`N`
New product when not typing

`S`
Search

`G then P`
Products

`G then S`
Suppliers

`G then R`
Research

`G then C`
Calculator

`Esc`
Close dialog/drawer

Document shortcuts inside Command Center.

---

# 47. FAST DATA ENTRY

The user should be able to use keyboard navigation.

Example:

Product name
Tab
Category
Tab
Price
Tab
MOQ
Tab
Supplier
Enter

Save.

After saving:

Focus returns to Product Name.

This makes entering many products extremely fast.

---

# 48. NO BORING FORMS

This is a major design requirement.

Do NOT build:

Label

Input

Label

Input

Label

Input

Label

Input

Submit

for every workflow.

Instead:

Use contextual cards.

Inline editing.

Command menus.

Comboboxes.

Chips.

Quick selectors.

Stepper-like interactions only when useful.

Expandable sections.

Smart defaults.

Keyboard shortcuts.

---

# 49. SMART DEFAULTS

When creating products:

Default status:

Researching

Default currency:

LKR

Remember last-used category.

Remember last-used source.

Remember last-used fair.

Remember last-used supplier when appropriate.

Do not make the user repeatedly enter the same information.

---

# 50. AUTO-SAVE

For lightweight editable metadata:

Auto-save after a short debounce.

Example:

Notes.

Tags.

Scores.

Status.

For potentially expensive or destructive operations:

Require explicit confirmation.

Never silently lose information.

---

# 51. UNSAVED STATE

If a user is editing something substantial and tries to leave:

Only show a confirmation if there is genuinely unsaved data.

Do not annoy the user with confirmation dialogs for every tiny edit.

---

# 52. TOASTS

Use subtle Sonner toasts.

Examples:

`Product saved`

`Supplier linked`

`Added to shortlist`

`Sample marked received`

Do NOT show giant success modals.

---

# 53. RESPONSIVE DESIGN

Desktop is the primary experience.

But the application must work beautifully on:

Laptop

Tablet

Mobile

The Canton Fair mode especially needs to be mobile-friendly.

Large touch targets.

Easy photo capture.

Quick input.

Minimal scrolling.

---

# 54. ACCESSIBILITY

Use proper:

Labels

Keyboard navigation

Focus states

ARIA attributes

Semantic HTML

Accessible dialogs

Accessible command menus

Do not sacrifice accessibility for visual design.

---

# 55. ERROR HANDLING

Errors should be:

specific

small

recoverable

human-readable.

Example:

Bad:

`Something went wrong.`

Better:

`Couldn't save the product. Your changes are still on this screen. Retry.`

Never wipe entered data because a server mutation failed.

---

# 56. EMPTY STATES

Do not show generic:

"No data."

Instead make them useful.

Products:

"No products yet."

`Capture your first product or import your research list.`

Button:

`+ Add Product`

Shortlist:

`Your strongest opportunities will appear here.`

Button:

`Review Products`

---

# 57. DASHBOARD SHOULD NOT FEEL LIKE A TEMPLATE

Avoid generic dashboard designs with:

Revenue card

Users card

Orders card

Sales graph

etc.

This is NOT a SaaS analytics dashboard.

It is a **research and sourcing cockpit.**

The visual hierarchy should emphasize:

Opportunities

Research

Suppliers

Product economics

Follow-ups

Decisions

---

# 58. PRODUCT CARD DESIGN

Make product cards visually interesting.

Example:

---

[ PRODUCT IMAGE ]

82
STRONG OPPORTUNITY

Magnetic Desk Organizer

Home / Desk

China
$3.20

Landed
LKR 1,280

Sell
LKR 4,990

Margin
74%

MOQ
100

[Shortlisted] [TikTok]

---

Make the numbers easy to scan.

---

# 59. PRODUCT DETAIL HEADER

Header should always show:

Product image

Name

Status

Opportunity score

Margin

MOQ

Supplier

Actions

Actions:

Edit

Shortlist

Compare

Add Supplier

Order Sample

Reject

More

---

# 60. BULK ACTIONS

Product table should support selecting multiple products.

Actions:

Add tag

Change status

Add to shortlist

Assign supplier

Archive

Delete

Export

Do not require opening each product.

---

# 61. IMPORT / EXPORT

Support:

CSV import

CSV export

JSON backup

For CSV import:

Provide mapping UI.

Example:

CSV column:

`Product Name`

maps to:

`Product Name`

Allow preview before importing.

---

# 62. DEMO DATA

Create realistic demo data during development.

Include:

20 products

10 suppliers

15 research items

5 samples

Several fair visits

Multiple statuses

Different scores

Different margins

This is essential for testing the UI.

---

# 63. SEED DATA SHOULD FEEL REAL

Example products:

Portable label printer

Magnetic cable organizer

Travel compression cubes

Desk lighting accessory

Kitchen storage product

Car organization product

Pet accessory

Home organization product

Do not hard-code the app around these examples.

They are only demo data.

---

# 64. PRODUCT LIFECYCLE

The application should visually represent:

Research

↓

Interesting

↓

Shortlisted

↓

Supplier Found

↓

Sample Ordered

↓

Sample Received

↓

Testing

↓

Validated

↓

Ready to Order

↓

Ordered

↓

Launched

↓

Scaling

Allow rejection at any stage.

---

# 65. DECISION LOG

Every rejected product should optionally have:

Rejection reason

Too expensive

Too competitive

Bad margin

MOQ too high

Poor quality

Shipping difficult

Regulatory concern

Supplier unreliable

Low demand

Other

This becomes valuable research later.

---

# 66. ANALYTICS

Keep analytics lightweight.

Useful metrics:

Products researched

Products shortlisted

Average opportunity score

Average margin

Products by category

Products by source

Products by status

Supplier count

Samples pending

Validation success rate

Do not build unnecessary complex BI.

---

# 67. CATEGORY MANAGEMENT

Allow categories such as:

Electronics

Home

Kitchen

Beauty

Automotive

Travel

Fitness

Pets

Office

Lifestyle

Gifts

Other

Allow custom categories.

---

# 68. TAGGING SYSTEM

Products should support tags.

Examples:

TikTok

High Margin

Low MOQ

Private Label

Canton Fair

Emerging

Potential Winner

Needs Sample

Low Competition

Use tag chips.

---

# 69. SAVED VIEWS

Allow saving views such as:

"High Potential"

Filters:

Score > 80

Margin > 50%

Competition = Low

---

"China Fair Shortlist"

Status = Shortlisted

Fair = 140th Canton Fair

---

"Products to Sample"

Status = Supplier Contacted

---

# 70. MOBILE QUICK ACTION BAR

On mobile:

Bottom floating navigation:

Home

Products

Search

Add

More

The `Add` button should be visually prominent but not oversized.

---

# 71. CANTON FAIR MOBILE WORKFLOW

Optimize this exact workflow:

User sees product.

↓

Takes photo.

↓

Clicks `+ Product`.

↓

Product name.

↓

Price.

↓

MOQ.

↓

Supplier.

↓

Booth.

↓

Quick note.

↓

Save.

↓

Immediately ready for next product.

Target:

**under 30 seconds per product.**

---

# 72. PRODUCT IMAGE EXPERIENCE

When adding an image:

Show image preview immediately.

Do not wait for a server round-trip to display it.

Use an optimistic preview.

Allow replacing/removing the image.

---

# 73. QUICK SUPPLIER CAPTURE

Similar to products.

Fields:

Supplier

Booth

Hall

Contact

WeChat

Category

Products

Quick note

Save.

After saving:

Return to capture mode.

---

# 74. PRODUCT + SUPPLIER COMBINED CAPTURE

During Canton Fair, sometimes I will discover a supplier first.

Allow:

`Capture Supplier`

Then:

`Add Product`

and automatically link the product to that supplier.

Similarly, when capturing a product:

`New Supplier`

should create and link the supplier inline.

Do NOT make the user leave the workflow.

---

# 75. UX DETAIL

Whenever a field can be selected from existing data:

Use Combobox / Command.

Example:

Supplier:

[ Search supplier... ]

If no supplier exists:

`+ Create supplier`

This should happen inline.

Same for:

Categories

Tags

Fairs

Sources

---

# 76. CONFIRMATION RULES

Do not ask:

"Are you sure?"

for ordinary actions.

Only confirm:

Permanent deletion

Bulk deletion

Destructive operations

Actions that cannot easily be undone.

For status changes, use immediate update with undo where practical.

---

# 77. UNDO

For actions such as:

Archive

Reject

Remove shortlist

show:

`Product archived — Undo`

This is better than confirmation dialogs.

---

# 78. DATA CONSISTENCY

When changing:

Product supplier

Status

Score

Sample status

etc.

Make sure related UI updates immediately.

Example:

Changing:

`Researching → Shortlisted`

should immediately update:

Product

Dashboard count

Shortlist

Activity timeline

without requiring a full page reload.

---

# 79. SECURITY

Keep MongoDB credentials server-side.

Never expose:

MONGODB_URI

or secrets

to client components.

Validate all server-side inputs.

Use strong TypeScript types.

Validate incoming mutations.

---

# 80. CODE QUALITY

Use a clean structure.

Example:

app/
components/
components/ui/
features/
lib/
lib/mongodb/
lib/queries/
lib/actions/
types/
schemas/

Separate:

UI

business logic

database logic

validation

types

Do not put everything inside page.tsx.

---

# 81. VALIDATION

Use schema validation for data entering MongoDB.

Ensure:

prices are numeric

scores stay within valid ranges

statuses are valid

references are valid

dates are valid

Do not allow malformed data to silently enter the database.

---

# 82. TYPESCRIPT

Strict TypeScript.

Avoid:

`any`

unless genuinely unavoidable.

Create reusable domain types:

Product

Supplier

ResearchItem

Fair

FairVisit

Sample

Validation

Activity

---

# 83. PERFORMANCE BUDGET

Treat performance as a product requirement.

Avoid unnecessary:

dependencies

client-side libraries

animations

large images

large JSON payloads

client-side data fetching

global state

Use CSS/Tailwind for simple interactions.

Use JavaScript only when needed.

---

# 84. ANIMATIONS

Animations should be subtle.

Use animation only for:

* opening panels
* changing state
* adding/removing cards
* hover feedback
* score transitions

Never animate entire pages.

Never make navigation wait for animation.

Prefer ~150–200ms transitions.

Respect reduced-motion preferences.

---

# 85. NO "BUFFER SCREEN" PHILOSOPHY

The app should never feel like:

Click

↓

Loading...

↓

Loading...

↓

Loading...

↓

Page appears.

Instead:

Click

↓

Immediate UI response

↓

Data resolves in background.

Use optimistic updates wherever safe.

---

# 86. INITIAL PAGE LOAD

The initial dashboard should render meaningful content immediately.

Do not wait for every analytics query before rendering the page.

Separate:

critical data

from

secondary data.

Render the important information first.

Load secondary widgets afterward.

---

# 87. DATABASE QUERY STRATEGY

Avoid N+1 queries.

For product tables:

Do not query supplier separately for every product.

Use appropriate aggregation or batch retrieval.

Only retrieve necessary fields.

Paginate.

Use indexes.

---

# 88. URL STATE

Filters, search and sorting should preferably be represented in URL search parameters where useful.

Example:

`/products?status=shortlisted&score=80&sort=margin`

This means:

* refresh preserves the view
* links can be shared
* browser back/forward works
* state isn't unnecessarily held in global React state

---

# 89. PRODUCT DETAIL URL

Use:

`/products/[id]`

Supplier:

`/suppliers/[id]`

Research:

`/research/[id]`

Fair:

`/fairs/[id]`

Sample:

`/samples/[id]`

---

# 90. BUILD ORDER

Implement in this order:

### Phase 1

Application shell

Routing

MongoDB connection

Base shadcn components

Dashboard

Products

---

### Phase 2

Product detail

Inline editing

Quick capture

Product scoring

Product table

Filters

---

### Phase 3

Suppliers

Supplier-product relationships

Canton Fair

Fair mode

---

### Phase 4

Research

Shortlist

Comparison

Calculator

---

### Phase 5

Samples

Validation

Activity timeline

Analytics

---

### Phase 6

Performance optimization

Keyboard shortcuts

Bulk actions

CSV import/export

Saved views

Mobile optimization

---

# 91. FIRST VERSION PRIORITY

Do NOT attempt to build every feature before the core workflow works.

The most important V1 workflow is:

Research product

↓

Capture product

↓

Calculate economics

↓

Score product

↓

Find supplier

↓

Shortlist

↓

Compare

↓

Order sample

↓

Validate

↓

Decide whether to import

Everything else supports this.

---

# 92. FINAL PRODUCT FEEL

When finished, the application should feel like:

**Notion**
+
**Linear**
+
**A lightweight CRM**
+
**A sourcing database**
+
**A financial calculator**

but should NOT look like a copy of any of them.

The product should feel purpose-built for finding the next winning product.

The interface should make the user want to keep researching.

---

# 93. IMPORTANT IMPLEMENTATION RULE

Before writing large amounts of code:

1. Establish the architecture.
2. Establish the MongoDB models.
3. Establish reusable UI primitives.
4. Establish the product lifecycle.
5. Build the core Product experience.
6. Verify the UX.
7. Then expand into the remaining modules.

Do not create dozens of disconnected pages.

The Product entity is the central object around which:

Suppliers

Research

Canton Fair

Samples

Validation

Economics

Activities

should connect.

---

# 94. ACCEPTANCE TEST

The application is not complete until I can perform this workflow quickly:

### Scenario

I discover a product on TikTok.

I create a research item.

I paste the URL.

I enter views.

I convert it into a product.

I enter China price.

I enter MOQ.

I enter expected Sri Lankan selling price.

The app instantly calculates:

Landed cost

Margin

Profit

ROI

I score the product.

I shortlist it.

I add two suppliers.

I compare the suppliers.

I order a sample.

I later mark the sample received.

I enter validation results.

The app tells me whether the product is worth pursuing.

---

# 95. FINAL QUALITY BAR

Before considering the implementation finished, inspect the application critically.

Ask:

### Is entering a product fun?

### Can I capture one in under 30 seconds?

### Can I find anything quickly?

### Can I edit information without opening giant forms?

### Can I compare products instantly?

### Are the important numbers obvious?

### Does the application feel fast?

### Does navigation feel instant?

### Does the UI feel premium?

### Does it work on mobile?

### Can I use it while physically walking around Canton Fair?

### Does it actually help me make better sourcing decisions?

If the answer to any of these is no, improve the UX before adding more features.

The goal is not to build the largest application.

The goal is to build the **fastest and most useful product-research cockpit possible for this sourcing journey.**
