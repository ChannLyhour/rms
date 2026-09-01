package enum

// ── Restaurant Table Status ──────────────────────────────────────────────────

// TableStatus defines the physical seating / session state of a dining table
type TableStatus string

const (
	TableStatusAvailable TableStatus = "available" // Ready for new guests
	TableStatusOccupied  TableStatus = "occupied"  // Active guests dining
	TableStatusReserved  TableStatus = "reserved"  // Reserved in advance
	TableStatusCleaning  TableStatus = "cleaning"  // Guests left / awaiting cleaning
)

func (t TableStatus) String() string {
	return string(t)
}

func (t TableStatus) IsValid() bool {
	switch t {
	case TableStatusAvailable, TableStatusOccupied, TableStatusReserved, TableStatusCleaning:
		return true
	}
	return false
}
