package enum

// ── Staff & User Roles ───────────────────────────────────────────────────────

// RoleType defines standard staff roles across the multi-venue RMS
type RoleType string

const (
	RoleAdmin   RoleType = "admin"   // Super Administrator (access to all venues & settings)
	RoleManager RoleType = "manager" // Venue Manager
	RoleCashier RoleType = "cashier" // Cashier & Front-of-House
	RoleKitchen RoleType = "kitchen" // Kitchen Chef & Cook
	RoleBarista RoleType = "barista" // Cafe & Beverage Maker
	RoleWaiter  RoleType = "waiter"  // Server & Table Runner
)

func (r RoleType) String() string {
	return string(r)
}

func (r RoleType) IsValid() bool {
	switch r {
	case RoleAdmin, RoleManager, RoleCashier, RoleKitchen, RoleBarista, RoleWaiter:
		return true
	}
	return false
}
