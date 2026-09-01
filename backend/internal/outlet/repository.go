package outlet

import (
	"context"
	"errors"

	"github.com/pos-system/backend/internal/domain"
	"gorm.io/gorm"
)

type Repository interface {
	// Outlets
	FindAll(ctx context.Context, search string, onlyActive bool) ([]domain.Outlet, error)
	FindByID(ctx context.Context, id uint64) (*domain.Outlet, error)
	FindByCode(ctx context.Context, code string) (*domain.Outlet, error)
	Create(ctx context.Context, outlet *domain.Outlet) error
	Update(ctx context.Context, outlet *domain.Outlet) error
	Delete(ctx context.Context, id uint64) error

	// Zones
	FindAllZones(ctx context.Context, outletID *uint64, search string) ([]domain.Zone, error)
	FindZonesByOutletID(ctx context.Context, outletID uint64) ([]domain.Zone, error)
	FindZoneByID(ctx context.Context, id uint64) (*domain.Zone, error)
	CreateZone(ctx context.Context, zone *domain.Zone) error
	UpdateZone(ctx context.Context, zone *domain.Zone) error
	DeleteZone(ctx context.Context, id uint64) error

	// Stations
	FindAllStations(ctx context.Context, outletID *uint64, search string) ([]domain.Station, error)
	FindStationsByOutletID(ctx context.Context, outletID uint64) ([]domain.Station, error)
	FindStationByID(ctx context.Context, id uint64) (*domain.Station, error)
	CreateStation(ctx context.Context, station *domain.Station) error
	UpdateStation(ctx context.Context, station *domain.Station) error
	DeleteStation(ctx context.Context, id uint64) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// ── Outlets ────────────────────────────────────────────────────────

func (r *repository) FindAll(ctx context.Context, search string, onlyActive bool) ([]domain.Outlet, error) {
	var outlets []domain.Outlet
	query := r.db.WithContext(ctx).Preload("Zones").Preload("Stations")
	if onlyActive {
		query = query.Where("is_active = ?", true)
	}
	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	err := query.Order("id ASC").Find(&outlets).Error
	return outlets, err
}

func (r *repository) FindByID(ctx context.Context, id uint64) (*domain.Outlet, error) {
	var outlet domain.Outlet
	err := r.db.WithContext(ctx).
		Preload("Zones").
		Preload("Stations").
		First(&outlet, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &outlet, nil
}

func (r *repository) FindByCode(ctx context.Context, code string) (*domain.Outlet, error) {
	var outlet domain.Outlet
	err := r.db.WithContext(ctx).Where("code = ?", code).First(&outlet).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &outlet, nil
}

func (r *repository) Create(ctx context.Context, outlet *domain.Outlet) error {
	return r.db.WithContext(ctx).Create(outlet).Error
}

func (r *repository) Update(ctx context.Context, outlet *domain.Outlet) error {
	return r.db.WithContext(ctx).Save(outlet).Error
}

func (r *repository) Delete(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Delete related stations & zones
		if err := tx.Where("outlet_id = ?", id).Delete(&domain.Station{}).Error; err != nil {
			return err
		}
		if err := tx.Where("outlet_id = ?", id).Delete(&domain.Zone{}).Error; err != nil {
			return err
		}
		return tx.Delete(&domain.Outlet{}, id).Error
	})
}

// ── Zones ──────────────────────────────────────────────────────────

func (r *repository) FindAllZones(ctx context.Context, outletID *uint64, search string) ([]domain.Zone, error) {
	var zones []domain.Zone
	query := r.db.WithContext(ctx)
	if outletID != nil && *outletID > 0 {
		query = query.Where("outlet_id = ?", *outletID)
	}
	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}
	err := query.Order("floor_number ASC, name ASC").Find(&zones).Error
	return zones, err
}

func (r *repository) FindZonesByOutletID(ctx context.Context, outletID uint64) ([]domain.Zone, error) {
	return r.FindAllZones(ctx, &outletID, "")
}

func (r *repository) FindZoneByID(ctx context.Context, id uint64) (*domain.Zone, error) {
	var zone domain.Zone
	err := r.db.WithContext(ctx).First(&zone, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &zone, nil
}

func (r *repository) CreateZone(ctx context.Context, zone *domain.Zone) error {
	return r.db.WithContext(ctx).Create(zone).Error
}

func (r *repository) UpdateZone(ctx context.Context, zone *domain.Zone) error {
	return r.db.WithContext(ctx).Save(zone).Error
}

func (r *repository) DeleteZone(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Delete(&domain.Zone{}, id).Error
}

// ── Stations ───────────────────────────────────────────────────────

func (r *repository) FindAllStations(ctx context.Context, outletID *uint64, search string) ([]domain.Station, error) {
	var stations []domain.Station
	query := r.db.WithContext(ctx)
	if outletID != nil && *outletID > 0 {
		query = query.Where("outlet_id = ?", *outletID)
	}
	if search != "" {
		query = query.Where("name ILIKE ? OR type ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	err := query.Order("name ASC").Find(&stations).Error
	return stations, err
}

func (r *repository) FindStationsByOutletID(ctx context.Context, outletID uint64) ([]domain.Station, error) {
	return r.FindAllStations(ctx, &outletID, "")
}

func (r *repository) FindStationByID(ctx context.Context, id uint64) (*domain.Station, error) {
	var station domain.Station
	err := r.db.WithContext(ctx).First(&station, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &station, nil
}

func (r *repository) CreateStation(ctx context.Context, station *domain.Station) error {
	return r.db.WithContext(ctx).Create(station).Error
}

func (r *repository) UpdateStation(ctx context.Context, station *domain.Station) error {
	return r.db.WithContext(ctx).Save(station).Error
}

func (r *repository) DeleteStation(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Delete(&domain.Station{}, id).Error
}
