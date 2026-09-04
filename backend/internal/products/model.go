package products

import (
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/enum"
	"gorm.io/gorm"
)

// Category is a product category (supports hierarchy)
type Category struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OutletID    *uuid.UUID     `gorm:"type:uuid" json:"outlet_id"`
	ParentID    *uuid.UUID     `gorm:"type:uuid" json:"parent_id"`
	Name        string         `gorm:"size:255;not null" json:"name"`
	Description *string        `json:"description"`
	ImageURL    *string        `gorm:"type:text" json:"image_url"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedBy   *uuid.UUID     `gorm:"type:uuid" json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	Outlet      *Outlet        `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Children    []Category     `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

// Station represents a preparation/kitchen routing station (KDS, Bar, Bakery, etc.)
type Station struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OutletID  uuid.UUID `gorm:"type:uuid;not null" json:"outlet_id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Type      string    `gorm:"size:50;not null;default:'kds'" json:"type"` // kds, printer, cashier
	IPAddress *string   `gorm:"size:45" json:"ip_address,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Station) TableName() string {
	return "stations"
}

// Media represents central uploaded media/images
type Media struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	URL       string    `gorm:"type:text;not null" json:"url"`
	FileName  *string   `gorm:"size:255" json:"file_name,omitempty"`
	FileType  *string   `gorm:"size:50" json:"file_type,omitempty"`
	FileSize  int64     `gorm:"default:0" json:"file_size,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Media) TableName() string {
	return "media"
}

// ProductImage represents product gallery image
type ProductImage struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	MediaID   uuid.UUID `gorm:"type:uuid;not null" json:"media_id"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	Media     *Media    `gorm:"foreignKey:MediaID" json:"media,omitempty"`
}

func (ProductImage) TableName() string {
	return "product_image"
}

// Product represents a menu item
type Product struct {
	ID                uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OutletID          *uuid.UUID     `gorm:"type:uuid" json:"outlet_id"`
	StationID         *uuid.UUID     `gorm:"type:uuid" json:"station_id"`
	CategoryID        uuid.UUID      `gorm:"type:uuid;not null" json:"category_id"`
	Name              string         `gorm:"size:255;not null" json:"name"`
	Barcode           *string        `gorm:"size:100;index" json:"barcode"`
	Description       *string        `json:"description"`
	Price             float64        `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	CostPrice         float64        `gorm:"type:numeric(10,2);default:0.00" json:"cost_price"`
	DiscountType      string         `gorm:"size:20;default:'percentage'" json:"discount_type"` // percentage | fixed
	DiscountValue     float64        `gorm:"type:numeric(10,2);default:0.00" json:"discount_value"`
	DiscountPct       float64        `gorm:"type:numeric(5,2);default:0.00" json:"discount_pct"`
	StockQuantity     int            `gorm:"default:0" json:"stock_quantity"`
	LowStockThreshold int            `gorm:"default:5" json:"low_stock_threshold"`
	TrackStock        bool           `gorm:"default:false" json:"track_stock"`
	IsUnlimited       bool           `gorm:"default:false" json:"is_unlimited"`
	ImageProductsID   *uuid.UUID     `gorm:"type:uuid" json:"image_products_id"`
	ImageURL          *string        `gorm:"type:text" json:"image_url"`
	IsAvailable       bool           `gorm:"default:true" json:"is_available"`
	IsFeatured        bool           `gorm:"default:false" json:"is_featured"`
	KitchenStation    string         `gorm:"size:100;default:'Kitchen'" json:"kitchen_station"`
	PrepTimeMins      int            `gorm:"default:15" json:"prep_time_mins"`
	CreatedBy         *uuid.UUID     `gorm:"type:uuid" json:"created_by"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	Category          *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Outlet            *Outlet        `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Station           *Station       `gorm:"foreignKey:StationID" json:"station,omitempty"`
	OptionGroups      []OptionGroup  `gorm:"many2many:product_option_group;" json:"option_groups,omitempty"`
	Images            []ProductImage `gorm:"foreignKey:ProductID" json:"images,omitempty"`
}

// Outlet is a minimal representation of an outlet venue
type Outlet struct {
	ID   uuid.UUID       `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name string          `gorm:"size:100;not null" json:"name"`
	Code string          `gorm:"size:50;not null" json:"code"`
	Type enum.OutletType `gorm:"size:50;not null" json:"type"`
}

// OptionGroup is a group of options (e.g. Size, Sweetness)
type OptionGroup struct {
	ID         uuid.UUID     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OutletID   *uuid.UUID    `gorm:"type:uuid" json:"outlet_id"`
	Name       string        `gorm:"size:255;not null" json:"name"`
	Type       string        `gorm:"size:20;default:'single'" json:"type"` // single | multiple
	IsRequired bool          `gorm:"default:false" json:"is_required"`
	CreatedBy  *uuid.UUID    `gorm:"type:uuid" json:"created_by"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
	Outlet     *Outlet       `gorm:"foreignKey:OutletID" json:"outlet,omitempty"`
	Values     []OptionValue `gorm:"foreignKey:OptionGroupID" json:"values,omitempty"`
}

// OptionValue represents a single selection choice
type OptionValue struct {
	ID            uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OptionGroupID uuid.UUID  `gorm:"type:uuid;not null" json:"option_group_id"`
	Name          string     `gorm:"size:255;not null" json:"name"`
	Price         float64    `gorm:"type:numeric(10,2);default:0.00" json:"price"`
	StockQuantity int        `gorm:"default:0" json:"stock_quantity"`
	IsUnlimited   *bool      `json:"is_unlimited"`
	CreatedBy     *uuid.UUID `gorm:"type:uuid" json:"created_by"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// ProductOptionGroup join table
type ProductOptionGroup struct {
	ProductID     uuid.UUID  `gorm:"type:uuid;primaryKey" json:"product_id"`
	OptionGroupID uuid.UUID  `gorm:"type:uuid;primaryKey" json:"option_group_id"`
	CreatedBy     *uuid.UUID `gorm:"type:uuid" json:"created_by"`
}

// TableName overrides the default plural table name for ProductOptionGroup
func (ProductOptionGroup) TableName() string {
	return "product_option_group"
}

// CreateProductRequest payload
type CreateProductRequest struct {
	OutletID          *uuid.UUID  `json:"outlet_id"`
	StationID         *uuid.UUID  `json:"station_id"`
	CategoryID        uuid.UUID   `json:"category_id" binding:"required"`
	Name              string      `json:"name" binding:"required"`
	Barcode           *string     `json:"barcode"`
	Description       *string     `json:"description"`
	Price             float64     `json:"price" binding:"min=0"`
	CostPrice         float64     `json:"cost_price"`
	DiscountType      *string     `json:"discount_type"` // percentage | fixed
	DiscountValue     float64     `json:"discount_value"`
	DiscountPct       float64     `json:"discount_pct"`
	StockQuantity     int         `json:"stock_quantity"`
	LowStockThreshold int         `json:"low_stock_threshold"`
	TrackStock        bool        `json:"track_stock"`
	IsUnlimited       *bool       `json:"is_unlimited"`
	ImageProductsID   *uuid.UUID  `json:"image_products_id"`
	ImageURL          *string     `json:"image_url"`
	IsAvailable       *bool       `json:"is_available"`
	IsFeatured        *bool       `json:"is_featured"`
	KitchenStation    *string     `json:"kitchen_station"`
	PrepTimeMins      *int        `json:"prep_time_mins"`
	OptionGroupIDs    []uuid.UUID `json:"option_group_ids"`
}

// UpdateProductRequest payload
type UpdateProductRequest struct {
	OutletID          *uuid.UUID   `json:"outlet_id"`
	StationID         *uuid.UUID   `json:"station_id"`
	CategoryID        *uuid.UUID   `json:"category_id"`
	Name              *string      `json:"name"`
	Barcode           *string      `json:"barcode"`
	Description       *string      `json:"description"`
	Price             *float64     `json:"price"`
	CostPrice         *float64     `json:"cost_price"`
	DiscountType      *string      `json:"discount_type"`
	DiscountValue     *float64     `json:"discount_value"`
	DiscountPct       *float64     `json:"discount_pct"`
	StockQuantity     *int         `json:"stock_quantity"`
	LowStockThreshold *int         `json:"low_stock_threshold"`
	TrackStock        *bool        `json:"track_stock"`
	IsUnlimited       *bool        `json:"is_unlimited"`
	ImageProductsID   *uuid.UUID   `json:"image_products_id"`
	ImageURL          *string      `json:"image_url"`
	IsAvailable       *bool        `json:"is_available"`
	IsFeatured        *bool        `json:"is_featured"`
	KitchenStation    *string      `json:"kitchen_station"`
	PrepTimeMins      *int         `json:"prep_time_mins"`
	OptionGroupIDs    *[]uuid.UUID `json:"option_group_ids"`
}

// CreateCategoryRequest payload
type CreateCategoryRequest struct {
	OutletID    *uuid.UUID `json:"outlet_id"`
	ParentID    *uuid.UUID `json:"parent_id"`
	Name        string     `json:"name" binding:"required"`
	Description *string    `json:"description"`
	ImageURL    *string    `json:"image_url"`
	SortOrder   int        `json:"sort_order"`
	IsActive    *bool      `json:"is_active"`
}

// OptionValueInput represents input for creating an option value
type OptionValueInput struct {
	Name          string  `json:"name" binding:"required"`
	Price         float64 `json:"price"`
	StockQuantity int     `json:"stock_quantity"`
	IsUnlimited   *bool   `json:"is_unlimited"`
}

// CreateOptionGroupRequest payload
type CreateOptionGroupRequest struct {
	OutletID   *uuid.UUID         `json:"outlet_id"`
	Name       string             `json:"name" binding:"required"`
	Type       string             `json:"type"` // single | multiple
	IsRequired bool               `json:"is_required"`
	Values     []OptionValueInput `json:"values"`
}
