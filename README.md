# Beraktour Safari

BERAKAH TOURS & TRAVEL

Safari & Travel Management Platform

Project Description and Development Plan

==================================================

1. PROJECT DESCRIPTION

==================================================

Berakah Tours & Travel is a digital tourism platform designed to help travelers discover, customize, book, and manage safari and travel experiences based on their individual interests, budget, preferred destinations, travel dates, group size, and activities.

The platform will showcase Rwanda and other African destinations through carefully designed safari packages while allowing customers to either book an existing package or request a personalized safari.

Core idea:

"Every traveler is different. Every safari should be different."

Instead of forcing customers into fixed packages, the platform should allow Berakah Tours to understand the customer's requirements and build an itinerary around them.

==================================================

2. MAIN OBJECTIVES

==================================================

1. Showcase destinations:

   - Rwanda

   - Uganda

   - Kenya

   - Tanzania

   - Congo

   - Other African destinations

2. Showcase safari packages:

   - Gorilla trekking

   - Wildlife safari

   - City tours

   - Cultural tours

   - Adventure tours

   - Honeymoon

   - Photography

   - Road trips

   - Beach/island trips

   - Custom safaris

3. Allow customers to customize trips.

4. Allow customers to request quotations.

5. Allow customers to book online.

6. Support online and manual payments.

7. Manage customers and bookings.

8. Manage guides, vehicles and accommodation.

9. Communicate with customers.

10. Provide an administration dashboard.

==================================================

3. RECOMMENDED PLATFORM STRUCTURE

==================================================

The platform should be divided into three major applications:

                    BERAKAH TOURS PLATFORM

                             |

            +----------------+----------------+

            |                |                |

        CUSTOMER          STAFF/ADMIN       GUIDE

        PLATFORM          DASHBOARD         PORTAL

            |                |                |

      Discover Tours    Manage Business    Assigned Tours

      Customize Trip   Manage Bookings     Itineraries

      Book              Customers           Customers

      Pay               Payments            Activities

==================================================

4. CUSTOMER WEBSITE

==================================================

The customer website is the public-facing application.

A. Homepage

The homepage should communicate the company's main value proposition.

Hero section:

Headline:

"Your Safari. Your Way."

Supporting text:

"Every safari is built around your wishes, interests, budget and travel style."

CTA buttons:

- Explore Safaris

- Plan My Safari

Homepage sections:

1. Hero

2. Search safari

3. Popular destinations

4. Featured safari packages

5. Why choose Berakah

6. How it works

7. Custom safari

8. Popular activities

9. Testimonials

10. Travel blog

11. Newsletter

12. Contact

13. Footer

==================================================

5. DESTINATION MANAGEMENT

==================================================

Create a dedicated Destinations module.

Each destination should have:

Destination

- Name

- Country

- Region

- Description

- Cover Image

- Gallery

- Best Time to Visit

- Recommended Duration

- Activities

- Attractions

- Accommodation

- Safari Packages

- Map Location

- Travel Information

- FAQ

Example:

Volcanoes National Park

Activities:

- Gorilla trekking

- Golden monkey trekking

- Hiking

- Cultural experiences

- Photography

Destinations should be reusable across multiple safari packages.

==================================================

6. SAFARI PACKAGE MODULE

==================================================

Each safari package should contain:

Safari Package

- Title

- Slug

- Category

- Destination

- Duration

- Starting Price

- Currency

- Short Description

- Full Description

- Cover Image

- Gallery

- Highlights

- Included

- Excluded

- Requirements

- Cancellation Policy

- Available Dates

- Maximum Travelers

- Itinerary

- Accommodation

- Transport

- Activities

Example:

4 Days Rwanda Gorilla Safari

Day 1:

Arrival in Kigali

- Airport pickup

- Hotel

- Kigali city tour

Day 2:

Kigali to Musanze

- Transfer

- Cultural experience

Day 3:

Gorilla Trekking

- Volcanoes National Park

- Gorilla experience

Day 4:

Musanze to Kigali

- Departure

==================================================

7. CUSTOM SAFARI BUILDER

==================================================

This should be the signature feature of the platform.

Instead of only:

"Choose package -> Pay"

the customer gets:

"Build Your Safari"

Step 1 - Traveler Information

- Name

- Email

- Phone

- Country

Step 2 - Travel Dates

- Arrival date

- Departure date

- Flexible dates?

Step 3 - Group

- Adults

- Children

- Infants

Step 4 - Interests

- Wildlife

- Gorilla trekking

- Culture

- Adventure

- Photography

- Hiking

- Honeymoon

- Relaxation

- Food

- History

Step 5 - Budget

- $500 - $1,000

- $1,000 - $2,000

- $2,000 - $5,000

- $5,000+

Step 6 - Accommodation

- Budget

- Mid-range

- Luxury

- Luxury+

Step 7 - Transportation

- Private vehicle

- Shared vehicle

- Airport transfer

- Domestic flight

Step 8 - Destinations

- Rwanda

- Uganda

- Kenya

- Tanzania

- Congo

Step 9 - Additional Requests

- Free-text special requirements

Step 10:

"Request My Safari"

The request is sent to the staff/admin dashboard.

==================================================

8. QUOTE MANAGEMENT

==================================================

A customer submits a custom safari request.

Example:

CUSTOM SAFARI REQUEST #BT-000123

4 Travelers

7 Days

Rwanda + Uganda

Admin prepares:

CUSTOM QUOTE

Accommodation       $1,500

Transport              $800

Guide                  $500

Activities              $700

Meals                   $400

---------------------------

TOTAL                 $3,900

Customer actions:

- Accept quote

- Reject quote

- Request modification

- Ask a question

- Proceed to booking

==================================================

9. BOOKING SYSTEM

==================================================

Customers should be able to book:

Option A:

An existing safari package.

Option B:

A customized safari.

Booking should include:

- Booking Number

- Customer

- Package

- Destination

- Travel Date

- Number of Travelers

- Total Amount

- Deposit

- Remaining Balance

- Payment Status

- Booking Status

- Assigned Guide

- Assigned Vehicle

- Accommodation

Booking statuses:

- Pending

- Quote Sent

- Confirmed

- Deposit Paid

- Fully Paid

- In Progress

- Completed

- Cancelled

==================================================

10. PAYMENT SYSTEM

==================================================

The platform should support payments for bookings and deposits.

Payment entity:

- Booking

- Customer

- Amount

- Currency

- Payment Method

- Transaction Reference

- Status

- Paid At

- Receipt

Possible payment methods:

- Card

- Mobile Money

- Bank transfer

- Manual payment

- Other supported gateways

Payment statuses:

- Pending

- Processing

- Successful

- Failed

- Refunded

- Cancelled

==================================================

11. CUSTOMER ACCOUNT

==================================================

Customers should have their own dashboard.

Dashboard example:

Welcome Customer

Upcoming Trip

-------------------------

Rwanda Gorilla Safari

12 Dec - 16 Dec

Status: Confirmed

Customer menu:

- Dashboard

- My Bookings

- My Trips

- My Quotes

- Payments

- Invoices

- Documents

- Wishlist

- Messages

- Reviews

- Profile

- Security

==================================================

12. TRAVEL DOCUMENTS

==================================================

Customers should be able to access:

- Booking confirmation

- Invoice

- Safari itinerary

- Payment receipt

- Travel requirements

- Emergency contacts

- Accommodation details

- Airport pickup details

Future feature:

"Download Travel Pack PDF"

==================================================

13. GUIDE MANAGEMENT

==================================================

Guide entity:

- Name

- Profile

- Photo

- Languages

- Experience

- Certifications

- Specializations

- Availability

- Contact

- Assigned Trips

Guide dashboard should show:

- Today's trips

- Customer information

- Number of travelers

- Vehicle assignment

- Trip itinerary

==================================================

14. VEHICLE MANAGEMENT

==================================================

Vehicle entity:

- Registration Number

- Model

- Type

- Capacity

- Driver

- Status

- Insurance

- Inspection

- Maintenance

- Availability

Vehicle statuses:

- Available

- Assigned

- On Trip

- Maintenance

- Unavailable

==================================================

15. ACCOMMODATION MANAGEMENT

==================================================

Accommodation entity:

- Name

- Destination

- Type

- Rating

- Price

- Contact

- Images

- Facilities

- Room Types

- Availability

This allows staff to include accommodation when creating customized quotations.

==================================================

16. ADMIN DASHBOARD

==================================================

The admin dashboard is the central business management system.

Dashboard metrics:

- Total Customers

- Total Bookings

- Pending Requests

- Confirmed Trips

- Revenue

- Pending Payments

Main modules:

- Dashboard

- Customers

- Safari Packages

- Destinations

- Bookings

- Custom Requests

- Quotes

- Payments

- Guides

- Drivers

- Vehicles

- Accommodation

- Reviews

- Blogs

- Testimonials

- Messages

- Notifications

- Reports

- Settings

==================================================

17. CUSTOM REQUEST MANAGEMENT

==================================================

Admin sees:

CUSTOM SAFARI REQUESTS

#1024

Customer: John Smith

2 Adults

7 Days

Rwanda

Budget: $3,000

Status: New

Request details:

- Traveler Information

- Preferences

- Destinations

- Activities

- Budget

- Travel Dates

- Accommodation

- Transport

- Special Requests

Admin action:

"Create Quote"

==================================================

18. COMMUNICATION SYSTEM

==================================================

Customer <-> Berakah communication should support:

- Website chat

- Email

- WhatsApp integration

- SMS

- Internal messages

The goal is to allow customers to communicate directly with travel consultants.

==================================================

19. NOTIFICATIONS

==================================================

Customer notifications:

- Booking submitted

- Payment successful

- Quote received

- Quote updated

- Booking confirmed

- Trip reminder

- Payment reminder

- Trip completed

- Review request

Admin notifications:

- New customer

- New booking

- New custom request

- Payment received

- Quote accepted

- Customer message

- Cancellation request

==================================================

20. REVIEWS & TESTIMONIALS

==================================================

After completing a trip, customers should be able to submit:

- Rating

- Written review

- Photos

Admin can:

- Approve

- Reject

- Feature

- Hide

==================================================

21. TRAVEL BLOG

==================================================

Create a content management system for travel articles.

Suggested categories:

- Rwanda Travel

- Gorilla Trekking

- Wildlife

- Culture

- Adventure

- Travel Tips

- Visa & Requirements

- Destinations

- Hotels

- Food

==================================================

22. SEO SYSTEM

==================================================

Every destination, package and blog should support:

- SEO Title

- Meta Description

- Keywords

- Canonical URL

- OG Title

- OG Description

- OG Image

- Slug

- Schema Markup

==================================================

23. RECOMMENDED PUBLIC PAGES

==================================================

/

├── Home

├── About

├── Destinations

│   └── Destination Details

├── Safaris

│   └── Safari Details

├── Activities

├── Custom Safari

├── Hotels

├── Travel Guide

├── Blog

│   └── Article

├── Testimonials

├── Contact

├── FAQ

├── Terms & Conditions

├── Privacy Policy

└── Login/Register

==================================================

24. CUSTOMER ROUTES

==================================================

/dashboard

/bookings

/quotes

/payments

/trips

/messages

/reviews

/profile

==================================================

25. ADMIN ROUTES

==================================================

/admin

/admin/customers

/admin/destinations

/admin/packages

/admin/bookings

/admin/custom-requests

/admin/quotes

/admin/payments

/admin/guides

/admin/vehicles

/admin/accommodation

/admin/reviews

/admin/blog

/admin/messages

/admin/reports

/admin/settings

==================================================

26. RECOMMENDED TECHNOLOGY

==================================================

Frontend:

- Next.js

- TypeScript

- Tailwind CSS

- shadcn/ui

- React Query

- React Hook Form

- Zod

Backend:

- NestJS

- TypeScript

- PostgreSQL

- TypeORM

- Redis

- BullMQ

- JWT

- WebSockets

Storage:

- S3-compatible object storage

Infrastructure:

- Docker

- Nginx

- Ubuntu VPS

- PostgreSQL

- Redis

- Object Storage

- Cloudflare

- GitHub Actions

==================================================

27. RECOMMENDED BACKEND ARCHITECTURE

==================================================

src/

├── auth/

├── users/

├── customers/

├── admins/

├── destinations/

├── countries/

├── activities/

├── packages/

├── itineraries/

├── bookings/

├── custom-safaris/

├── quotes/

├── payments/

├── invoices/

├── guides/

├── drivers/

├── vehicles/

├── accommodations/

├── reviews/

├── testimonials/

├── blogs/

├── messages/

├── notifications/

├── files/

├── reports/

├── settings/

└── common/

==================================================

28. DATABASE CORE ENTITIES

==================================================

users

roles

permissions

customers

admins

guides

drivers

countries

destinations

activities

tour_packages

package_destinations

package_activities

itineraries

itinerary_days

custom_safari_requests

custom_safari_preferences

quotes

quote_items

bookings

booking_travelers

booking_items

payments

payment_transactions

invoices

vehicles

vehicle_assignments

accommodations

rooms

accommodation_bookings

reviews

testimonials

blogs

blog_categories

messages

notifications

files

audit_logs

settings

==================================================

29. DEVELOPMENT PLAN

==================================================

PHASE 1 - FOUNDATION

Goal:

Set up the platform.

Tasks:

- Project architecture

- Next.js setup

- NestJS setup

- PostgreSQL

- TypeORM

- Authentication

- Authorization

- Admin roles

- Customer roles

- Docker

- Environment configuration

- CI/CD

- Logging

- Error handling

PHASE 2 - PUBLIC WEBSITE

Build:

- Homepage

- About

- Destinations

- Safari packages

- Package details

- Activities

- Blog

- Testimonials

- Contact

- FAQ

- SEO

PHASE 3 - CUSTOMER SYSTEM

Build:

- Registration

- Login

- Email verification

- Password reset

- Customer dashboard

- Profile

- Wishlist

- Booking history

- Messages

PHASE 4 - SAFARI BOOKING

Build:

- Package booking

- Traveler information

- Date selection

- Group size

- Availability

- Booking confirmation

- Booking status

PHASE 5 - CUSTOM SAFARI

Build:

- Safari builder

- Destination selection

- Activity selection

- Budget

- Dates

- Travelers

- Accommodation preference

- Transport preference

- Special requirements

- Custom request submission

PHASE 6 - QUOTE SYSTEM

Workflow:

Request

  ↓

Admin Review

  ↓

Create Quote

  ↓

Customer Receives Quote

  ↓

Accept / Modify / Reject

  ↓

Booking

PHASE 7 - PAYMENTS

Build:

- Payment gateway integration

- Manual payments

- Deposits

- Balance payments

- Transactions

- Payment receipts

- Invoices

- Refund handling

PHASE 8 - OPERATIONS

Build:

- Guides

- Drivers

- Vehicles

- Accommodation

- Trip assignments

- Availability

- Maintenance

- Trip schedules

PHASE 9 - COMMUNICATION

Build:

- Notifications

- Email

- SMS

- Internal messaging

- Customer support

- WhatsApp integration if required

PHASE 10 - REPORTS

Build:

- Revenue

- Bookings

- Popular destinations

- Popular packages

- Customer countries

- Payment reports

- Cancelled bookings

- Guide performance

- Vehicle utilization

- Monthly sales

==================================================

30. CORE BUSINESS DIFFERENTIATOR

==================================================

The main selling point should not simply be:

"We have many tour packages."

Instead:

"Tell us how you want to travel. We'll build the safari around you."

The platform should provide:

PLAN YOUR SAFARI

1. Where do you want to go?

2. What do you want to experience?

3. When do you want to travel?

4. How many people are traveling?

5. What is your budget?

6. What level of accommodation do you prefer?

7. Do you have any special requests?

[PLAN MY SAFARI]

This turns the company's statement:

"Every Safari is built around the wishes and needs of our Guests"

into an actual product feature rather than only marketing text.

==================================================

31. PRODUCT POSITIONING

==================================================

Berakah Tours & Travel Platform

"Discover. Customize. Book. Experience."

A complete digital safari platform where travelers can discover African destinations, explore curated safari packages, create personalized itineraries, communicate with travel consultants, receive quotations, make payments, and manage their entire journey from one place.

==================================================

32. LEGACY SYSTEM MIGRATION

==================================================

The existing Berakah system should be treated as a reference for recovering business requirements and existing data, not simply copied into the new application.

Useful legacy concepts include:

- Frontend content

- SEO configuration

- Safari/package content

- User accounts

- Payments/deposits

- Notifications

- Testimonials

- Blog content

- Email/SMS templates

The new platform should redesign these capabilities around the modern tourism workflow and a cleaner architecture.

==================================================

END OF PROJECT DESCRIPTION AND PLAN

==================================================

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://custom-africa-path.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/47b16e0c-b2d8-4357-abe9-1d94d637ea8e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
