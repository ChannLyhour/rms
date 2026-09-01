package outlet

import (
	"context"
	"errors"
	"fmt"

	"github.com/pos-system/backend/internal/domain"
)

var (
	ErrOutletNotFound  = errors.New("outlet not found")
	ErrZoneNotFound    = errors.New("zone not found")
	ErrStationNotFound = errors.New("station not found")
	ErrDuplicateCode   = errors.New("outlet code already exists")
)

type Service interface {
	// Outlets
	GetAllOutlets(ctx context.Context, search string, onlyActive bool) ([]domain.Outlet, error)
	GetOutletByID(ctx context.Context, id uint64) (*domain.Outlet, error)
	CreateOutlet(ctx context.Context, req *domain.CreateOutletRequest) (*domain.Outlet, error)
	UpdateOutlet(ctx context.Context, id uint64, req *domain.UpdateOutletRequest) (*domain.Outlet, error)
	DeleteOutlet(ctx context.Context, id uint64) error

	// Zones
	GetAllZones(ctx context.Context, outletID *uint64, search string) ([]domain.Zone, error)
	GetZonesByOutlet(ctx context.Context, outletID uint64) ([]domain.Zone, error)
	GetZoneByID(ctx context.Context, id uint64) (*domain.Zone, error)
	CreateZone(ctx context.Context, req *domain.CreateZoneRequest) (*domain.Zone, error)
	UpdateZone(ctx context.Context, id uint64, req *domain.UpdateZoneRequest) (*domain.Zone, error)
	DeleteZone(ctx context.Context, id uint64) error

	// Stations
	GetAllStations(ctx context.Context, outletID *uint64, search string) ([]domain.Station, error)
	GetStationsByOutlet(ctx context.Context, outletID uint64) ([]domain.Station, error)
	GetStationByID(ctx context.Context, id uint64) (*domain.Station, error)
	CreateStation(ctx context.Context, req *domain.CreateStationRequest) (*domain.Station, error)
	UpdateStation(ctx context.Context, id uint64, req *domain.UpdateStationRequest) (*domain.Station, error)
	DeleteStation(ctx context.Context, id uint64) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// ── Outlets ────────────────────────────────────────────────────────

func (s *service) GetAllOutlets(ctx context.Context, search string, onlyActive bool) ([]domain.Outlet, error) {
	return s.repo.FindAll(ctx, search, onlyActive)
}

func (s *service) GetOutletByID(ctx context.Context, id uint64) (*domain.Outlet, error) {
	outlet, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if outlet == nil {
		return nil, ErrOutletNotFound
	}
	return outlet, nil
}

func (s *service) CreateOutlet(ctx context.Context, req *domain.CreateOutletRequest) (*domain.Outlet, error) {
	existing, err := s.repo.FindByCode(ctx, req.Code)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, fmt.Errorf("%w: %s", ErrDuplicateCode, req.Code)
	}

	outlet := &domain.Outlet{
		Name:        req.Name,
		Code:        req.Code,
		Type:        req.Type,
		Description: req.Description,
		HasTables:   req.HasTables,
		IsActive:    req.IsActive,
	}

	if err := s.repo.Create(ctx, outlet); err != nil {
		return nil, err
	}
	return outlet, nil
}

func (s *service) UpdateOutlet(ctx context.Context, id uint64, req *domain.UpdateOutletRequest) (*domain.Outlet, error) {
	outlet, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if outlet == nil {
		return nil, ErrOutletNotFound
	}

	if req.Name != nil {
		outlet.Name = *req.Name
	}
	if req.Code != nil && *req.Code != outlet.Code {
		existing, err := s.repo.FindByCode(ctx, *req.Code)
		if err != nil {
			return nil, err
		}
		if existing != nil && existing.ID != id {
			return nil, fmt.Errorf("%w: %s", ErrDuplicateCode, *req.Code)
		}
		outlet.Code = *req.Code
	}
	if req.Type != nil {
		outlet.Type = *req.Type
	}
	if req.Description != nil {
		outlet.Description = req.Description
	}
	if req.HasTables != nil {
		outlet.HasTables = *req.HasTables
	}
	if req.IsActive != nil {
		outlet.IsActive = *req.IsActive
	}

	if err := s.repo.Update(ctx, outlet); err != nil {
		return nil, err
	}
	return outlet, nil
}

func (s *service) DeleteOutlet(ctx context.Context, id uint64) error {
	outlet, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if outlet == nil {
		return ErrOutletNotFound
	}
	return s.repo.Delete(ctx, id)
}

// ── Zones ──────────────────────────────────────────────────────────

func (s *service) GetAllZones(ctx context.Context, outletID *uint64, search string) ([]domain.Zone, error) {
	return s.repo.FindAllZones(ctx, outletID, search)
}

func (s *service) GetZonesByOutlet(ctx context.Context, outletID uint64) ([]domain.Zone, error) {
	return s.repo.FindZonesByOutletID(ctx, outletID)
}

func (s *service) GetZoneByID(ctx context.Context, id uint64) (*domain.Zone, error) {
	zone, err := s.repo.FindZoneByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if zone == nil {
		return nil, ErrZoneNotFound
	}
	return zone, nil
}

func (s *service) CreateZone(ctx context.Context, req *domain.CreateZoneRequest) (*domain.Zone, error) {
	floor := req.FloorNumber
	if floor == 0 {
		floor = 1
	}

	zone := &domain.Zone{
		OutletID:    req.OutletID,
		Name:        req.Name,
		FloorNumber: floor,
	}

	if err := s.repo.CreateZone(ctx, zone); err != nil {
		return nil, err
	}
	return zone, nil
}

func (s *service) UpdateZone(ctx context.Context, id uint64, req *domain.UpdateZoneRequest) (*domain.Zone, error) {
	zone, err := s.repo.FindZoneByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if zone == nil {
		return nil, ErrZoneNotFound
	}

	if req.OutletID != nil && *req.OutletID > 0 {
		zone.OutletID = *req.OutletID
	}
	if req.Name != nil {
		zone.Name = *req.Name
	}
	if req.FloorNumber != nil {
		zone.FloorNumber = *req.FloorNumber
	}

	if err := s.repo.UpdateZone(ctx, zone); err != nil {
		return nil, err
	}
	return zone, nil
}

func (s *service) DeleteZone(ctx context.Context, id uint64) error {
	zone, err := s.repo.FindZoneByID(ctx, id)
	if err != nil {
		return err
	}
	if zone == nil {
		return ErrZoneNotFound
	}
	return s.repo.DeleteZone(ctx, id)
}

// ── Stations ───────────────────────────────────────────────────────

func (s *service) GetAllStations(ctx context.Context, outletID *uint64, search string) ([]domain.Station, error) {
	return s.repo.FindAllStations(ctx, outletID, search)
}

func (s *service) GetStationsByOutlet(ctx context.Context, outletID uint64) ([]domain.Station, error) {
	return s.repo.FindStationsByOutletID(ctx, outletID)
}

func (s *service) GetStationByID(ctx context.Context, id uint64) (*domain.Station, error) {
	station, err := s.repo.FindStationByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if station == nil {
		return nil, ErrStationNotFound
	}
	return station, nil
}

func (s *service) CreateStation(ctx context.Context, req *domain.CreateStationRequest) (*domain.Station, error) {
	stType := req.Type
	if stType == "" {
		stType = "kds"
	}

	station := &domain.Station{
		OutletID:  req.OutletID,
		Name:      req.Name,
		Type:      stType,
		IPAddress: req.IPAddress,
	}

	if err := s.repo.CreateStation(ctx, station); err != nil {
		return nil, err
	}
	return station, nil
}

func (s *service) UpdateStation(ctx context.Context, id uint64, req *domain.UpdateStationRequest) (*domain.Station, error) {
	station, err := s.repo.FindStationByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if station == nil {
		return nil, ErrStationNotFound
	}

	if req.OutletID != nil && *req.OutletID > 0 {
		station.OutletID = *req.OutletID
	}
	if req.Name != nil {
		station.Name = *req.Name
	}
	if req.Type != nil {
		station.Type = *req.Type
	}
	if req.IPAddress != nil {
		station.IPAddress = req.IPAddress
	}

	if err := s.repo.UpdateStation(ctx, station); err != nil {
		return nil, err
	}
	return station, nil
}

func (s *service) DeleteStation(ctx context.Context, id uint64) error {
	station, err := s.repo.FindStationByID(ctx, id)
	if err != nil {
		return err
	}
	if station == nil {
		return ErrStationNotFound
	}
	return s.repo.DeleteStation(ctx, id)
}
