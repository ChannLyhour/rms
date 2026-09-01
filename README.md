# POS System — Dynamic QR Table Ordering

A full-stack Point of Sale system with dynamic QR table ordering, complete inventory management, and role-based access control.

## Stack
| Layer | Technology |
|---|---|
| Database | PostgreSQL 16 |
| Backend | Go (Golang) — Clean Architecture |
| Frontend | React + Vite + TailwindCSS |
| Auth | JWT + RBAC |
| Container | Docker Compose |

## Roles
| Role | Access |
|---|---|
| **Admin** | Full system access |
| **Cashier** | Tables, sessions, orders, payments |
| **Kitchen** | View & update kitchen order status |
| **Customer** | Public QR scan → order & track |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Go 1.22+ (for local dev)
- Node.js 20+ (for local dev)

### With Docker Compose
```bash
cp .env.example .env
# Edit .env with your secrets
docker-compose up -d
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/v1

### Local Development

**Backend:**
```bash
cd backend
go mod tidy
go run ./cmd/api/main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials
| Username | Password | Role |
|---|---|---|
| admin | password | Administrator |
| cashier | password | Cashier |
| kitchen | password | Kitchen Staff |

> ⚠️ Change default passwords before deploying to production!

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Login & get JWT |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Get current user |

### Cashier
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/cashier/tables` | List tables |
| POST | `/api/v1/cashier/sessions` | Open table session |
| POST | `/api/v1/cashier/orders` | Create order |
| POST | `/api/v1/cashier/payments` | Process payment |

### Kitchen
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/kitchen/orders` | Active kitchen orders |
| PATCH | `/api/v1/kitchen/orders/:id/status` | Update order status |

### Admin
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/v1/admin/users` | User management |
| GET/POST | `/api/v1/admin/products` | Product catalog |
| GET/POST | `/api/v1/admin/inventory` | Inventory management |
| GET | `/api/v1/admin/reports` | Sales & revenue reports |

### Customer (Public)
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/customer/menu/:token` | Get menu by QR token |
| POST | `/api/v1/customer/orders/:token` | Place order via QR |
| GET | `/api/v1/customer/orders/:token/status` | Track order status |

## Project Structure
```
pos-system-root/
├── docker-compose.yml
├── .env.example
├── database/
│   ├── schema.sql
│   └── seeds/seed.sql
├── backend/               # Go Clean Architecture
│   ├── cmd/api/main.go
│   ├── config/
│   ├── internal/
│   │   ├── domain/        # GORM models
│   │   ├── middleware/    # JWT + RBAC
│   │   ├── repository/   # DB layer
│   │   ├── service/      # Business logic
│   │   └── handler/      # HTTP handlers
│   └── pkg/              # Shared utilities
└── frontend/              # React + Vite + TailwindCSS
    └── src/
        ├── pages/         # Role-based pages
        ├── components/    # Reusable UI
        ├── store/         # Zustand state
        └── routes/        # Protected routing
```
