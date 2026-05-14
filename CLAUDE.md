# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Albasheer (البشير للكهربائيات)** is a Django REST Framework backend API for an Arabic e-commerce platform selling electrical goods. Despite being in a `flutterProjects` folder, this is a pure Django/Python project. A companion Vue.js frontend lives at `../albasheer_front/`.

## Common Commands

```bash
# Activate virtual environment (Windows)
venv\Scripts\activate

# Run development server
python manage.py runserver

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Django shell
python manage.py shell

# Create superuser
python manage.py createsuperuser

# Run with Docker
docker-compose up --build
```

No test suite or linter is currently configured.

## Architecture

### App Structure

| App | Responsibility |
|-----|---------------|
| `config/` | Settings, main URL routing |
| `accounts/` | Phone-based auth, OTP, JWT, user profiles, addresses |
| `products/` | Categories, products, images, specs, bundles |
| `orders/` | Order lifecycle, status logging, ratings |
| `branches/` | Store locations |
| `ads/` | Marketing ads (images/videos) |
| `settings_app/` | Singleton site-wide config (deposit percent, contact phone) |
| `notifications/` | Reserved — models empty |

### Authentication Flow

Two separate flows:

**Customer (OTP-based):**
1. POST `/api/auth/request-code/` → OTP sent via `otp.anycode-sy.com`
2. POST `/api/auth/verify-code/` → creates user if new, returns JWT tokens

**Staff (password-based):**
1. POST `/api/auth/staff/login/` with phone + password (admin/branch_manager/delivery only)

Phone numbers are normalized to E.164 format (`+963XXXXXXXXX`) — supports Syrian (09/963) and Turkish (05/90) prefixes. See `accounts/utils.py`.

JWT: 1-day access token, 30-day refresh token.

### User Roles

`customer` | `branch_manager` | `delivery` | `admin` — stored as a string field on `User`. Role assignment also sets `is_staff` and Django Group membership via a post_save signal (`accounts/signals.py`).

`branch_manager` and `delivery` users have a `branch` FK — they only see data for their branch.

### Order Status Flow

```
PENDING → CONFIRMED → PREPARING → SHIPPING → DELIVERED
                                              (delivery staff)
         ← CANCELLED (from PENDING or CONFIRMED) →
```

Each transition is role-gated. Status changes auto-create an `OrderStatusLog` record via `orders/signals.py`. A WhatsApp notification fires when status reaches `shipping`.

### Admin Permission Architecture

`accounts/admin_mixins.py` provides reusable helpers:
- `is_superadmin()` / `is_branch_manager()` / `is_delivery_manager()` — role checks
- `ReadOnlyForBranchMixin` — admins get full access, branch_managers get read-only
- `BranchScopedMixin` — filters querysets to the user's branch, hides add/delete for non-admins

### Key Design Decisions

- **Bilingual content**: User-facing models have `name`/`name_ar` and `description`/`description_ar` fields.
- **Price snapshots**: `OrderItem.unit_price` stores the price at purchase time, not a FK to the current product price.
- **Deposit system**: `Order.deposit_percent` is read from `SiteSettings.get()` at order creation time; `deposit_amount` is calculated and stored.
- **Singleton config**: `SiteSettings.get()` returns or creates the single config record; admin prevents deletion.
- **Address snapshot**: `Order.delivery_address` is a text snapshot, not a FK to `Address`.
- **Atomic order creation**: `OrderCreateSerializer` uses `bulk_create` for items within a transaction.

## URL Map

```
/admin/
/api/auth/request-code/
/api/auth/verify-code/
/api/auth/me/
/api/auth/staff/login/
/api/auth/staff/me/
/api/addresses/
/api/addresses/<id>/
/api/addresses/<id>/set-default/
/api/products/categories/
/api/products/featured/
/api/products/bundles/
/api/products/bundles/<id>/
/api/products/
/api/products/<slug>/
/api/orders/                          (customer: list/create)
/api/orders/<id>/
/api/orders/<id>/upload-receipt/
/api/orders/<id>/cancel/
/api/orders/<id>/tracking/
/api/orders/<id>/rate/
/api/orders/<id>/status/              (flexible status update)
/api/orders/branch/                   (branch manager: list)
/api/orders/branch/<id>/
/api/orders/branch/<id>/confirm/
/api/orders/branch/<id>/reject/
/api/orders/branch/<id>/prepare/
/api/orders/branch/<id>/assign-delivery/
/api/orders/branch/<id>/ready/
/api/delivery/orders/                 (delivery staff)
/api/delivery/orders/<id>/start/
/api/delivery/orders/<id>/complete/
/api/branches/
/api/branches/<id>/
/api/ads/
```

## Database

PostgreSQL, credentials in `config/settings.py` (env-based; see `.env.example`). Docker Compose starts PostgreSQL on port 5432.

## External Services

- **OTP**: `https://otp.anycode-sy.com/api/auth`
- **WhatsApp**: `http://72.61.109.216:3000` (order status notifications, fires on SHIPPING)
- **Frontend**: Vue.js/Vite at `localhost:5173` (CORS configured)
