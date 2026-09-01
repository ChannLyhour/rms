package domain

import "time"

// Category is a product category (supports parent/child hierarchy)
type Category struct {
	ID          uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	ParentID    *uint64     `json:"parent_id"`
	Name        string      `gorm:"size:255;not null" json:"name"`
	Description *string     `json:"description"`
	ImageURL    *string     `gorm:"type:text" json:"image_url"`
	SortOrder   int         `gorm:"default:0" json:"sort_order"`
	IsActive    bool        `gorm:"default:true" json:"is_active"`
	CreatedBy   *uint64     `json:"created_by"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	Children    []Category  `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

// Product represents a menu item
type Product struct {
	ID                uint64        `gorm:"primaryKey;autoIncrement" json:"id"`
	CategoryID        uint64        `gorm:"not null" json:"category_id"`
	Name              string        `gorm:"size:255;not null" json:"name"`
	Description       *string       `json:"description"`
	Price             float64       `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	StockQuantity     int           `gorm:"default:0" json:"stock_quantity"`
	LowStockThreshold int           `gorm:"default:5" json:"low_stock_threshold"`
	TrackStock        bool          `gorm:"default:false" json:"track_stock"`
	ImageURL          *string       `gorm:"type:text" json:"image_url"`
	IsAvailable       bool          `gorm:"default:true" json:"is_available"`
	CreatedBy         *uint64       `json:"created_by"`
	CreatedAt         time.Time     `json:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at"`
	Category          *Category     `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	OptionGroups      []OptionGroup `gorm:"many2many:product_option_group;" json:"option_groups,omitempty"`
}

// OptionGroup is a group of option choices (e.g., "Size", "Toppings")
type OptionGroup struct {
	ID         uint64        `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string        `gorm:"size:255;not null" json:"name"`
	Type       string        `gorm:"size:20;default:'single'" json:"type"` // single | multiple
	IsRequired bool          `gorm:"default:false" json:"is_required"`
	CreatedBy  *uint64       `json:"created_by"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
	Values     []OptionValue `gorm:"foreignKey:OptionGroupID" json:"values,omitempty"`
}

// OptionValue is a single choice within an OptionGroup
type OptionValue struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OptionGroupID uint64    `gorm:"not null" json:"option_group_id"`
	Name          string    `gorm:"size:255;not null" json:"name"`
	Price         float64   `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	CreatedBy     *uint64   `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ProductOptionGroup is the join table for product_option_group
type ProductOptionGroup struct {
	ProductID     uint64  `gorm:"primaryKey" json:"product_id"`
	OptionGroupID uint64  `gorm:"primaryKey" json:"option_group_id"`
	CreatedBy     *uint64 `json:"created_by"`
}

// CreateProductRequest is the payload for creating a product
type CreateProductRequest struct {
	CategoryID        uint64  `json:"category_id" binding:"required"`
	Name              string  `json:"name" binding:"required"`
	Description       *string `json:"description"`
	Price             float64 `json:"price" binding:"required,min=0"`
	StockQuantity     int     `json:"stock_quantity"`
	LowStockThreshold int     `json:"low_stock_threshold"`
	TrackStock        bool    `json:"track_stock"`
	ImageURL          *string `json:"image_url"`
	IsAvailable       bool    `json:"is_available"`
	OptionGroupIDs    []uint64 `json:"option_group_ids"`
}
