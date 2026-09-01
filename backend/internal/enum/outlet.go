package enum

// ── Venue / Outlet Type ──────────────────────────────────────────────────────

// OutletType defines the business concept & operational mode for each venue
type OutletType string

const (
	OutletTypeDineIn OutletType = "dine_in" // Grand Restaurant / Table service dining
	OutletTypeCafe   OutletType = "cafe"    // Cafe & Bakery / Quick service (Pay-first + Buzzer)
	OutletTypeBar    OutletType = "bar"     // SkyBar & Lounge / Tab service
	OutletTypeRetail OutletType = "retail"  // Mart & Supermarket / Barcode instant checkout
)

// String returns the string representation of OutletType
func (o OutletType) String() string {
	return string(o)
}

// IsValid checks if the OutletType is recognized
func (o OutletType) IsValid() bool {
	switch o {
	case OutletTypeDineIn, OutletTypeCafe, OutletTypeBar, OutletTypeRetail:
		return true
	}
	return false
}

// DisplayName returns a human-friendly name in Khmer & English
func (o OutletType) DisplayName() string {
	switch o {
	case OutletTypeDineIn:
		return "Grand Restaurant (Dine-in)"
	case OutletTypeCafe:
		return "Cafe & Bakery"
	case OutletTypeBar:
		return "SkyBar & Lounge"
	case OutletTypeRetail:
		return "Mart & Supermarket"
	default:
		return string(o)
	}
}
