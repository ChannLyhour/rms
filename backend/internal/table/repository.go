package table

import (
	"time"

	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
)

type Repository interface {
	ListTables(zone string, status string, p pagination.Params) ([]Table, int64, error)
	GetTableByID(id uint64) (*Table, error)
	CreateTable(t *Table) error
	UpdateTable(id uint64, t *Table) error
	DeleteTable(id uint64) error
	UpdateTableStatus(tableID uint64, status string) error

	// Sessions
	CreateSession(session *TableSession) error
	GetSessionByID(id uint64) (*TableSession, error)
	GetSessionByToken(token string) (*TableSession, error)
	GetActiveSessionByTableID(tableID uint64) (*TableSession, error)
	ListSessions(tableID *uint64, status string, p pagination.Params) ([]TableSession, int64, error)
	ListActiveSessions() ([]TableSession, error)
	CloseSession(id uint64) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) ListTables(zone string, status string, p pagination.Params) ([]Table, int64, error) {
	var tables []Table
	var total int64

	q := r.db.Model(&Table{})
	if zone != "" && zone != "All" {
		q = q.Where("floor_zone = ?", zone)
	}
	if status != "" && status != "all" {
		q = q.Where("status = ?", status)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id asc").Limit(p.Limit).Offset(p.Offset).Find(&tables).Error
	return tables, total, err
}

func (r *repository) GetTableByID(id uint64) (*Table, error) {
	var t Table
	err := r.db.First(&t, id).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *repository) CreateTable(t *Table) error {
	return r.db.Create(t).Error
}

func (r *repository) UpdateTable(id uint64, t *Table) error {
	return r.db.Model(&Table{}).Where("id = ?", id).Updates(t).Error
}

func (r *repository) DeleteTable(id uint64) error {
	return r.db.Delete(&Table{}, id).Error
}

func (r *repository) UpdateTableStatus(tableID uint64, status string) error {
	return r.db.Model(&Table{}).Where("id = ?", tableID).Update("status", status).Error
}

func (r *repository) CreateSession(session *TableSession) error {
	return r.db.Create(session).Error
}

func (r *repository) GetSessionByID(id uint64) (*TableSession, error) {
	var s TableSession
	err := r.db.Preload("Table").First(&s, id).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *repository) GetSessionByToken(token string) (*TableSession, error) {
	var s TableSession
	err := r.db.Preload("Table").Where("session_token = ?", token).First(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *repository) GetActiveSessionByTableID(tableID uint64) (*TableSession, error) {
	var s TableSession
	err := r.db.Preload("Table").
		Where("table_id = ? AND status = 'active'", tableID).
		First(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *repository) ListSessions(tableID *uint64, status string, p pagination.Params) ([]TableSession, int64, error) {
	var sessions []TableSession
	var total int64

	q := r.db.Model(&TableSession{}).Preload("Table")
	if tableID != nil && *tableID > 0 {
		q = q.Where("table_id = ?", *tableID)
	}
	if status != "" {
		q = q.Where("status = ?", status)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Preload("Table").Preload("Orders").Order("opened_at desc").Limit(p.Limit).Offset(p.Offset).Find(&sessions).Error
	return sessions, total, err
}

func (r *repository) ListActiveSessions() ([]TableSession, error) {
	var sessions []TableSession
	err := r.db.Preload("Table").
		Preload("Orders").
		Where("status = 'active'").
		Order("opened_at desc").
		Find(&sessions).Error
	return sessions, err
}

func (r *repository) CloseSession(id uint64) error {
	now := time.Now()
	var sess TableSession
	if err := r.db.First(&sess, id).Error; err == nil && sess.TableID > 0 {
		_ = r.db.Model(&Table{}).Where("id = ?", sess.TableID).Update("status", "available").Error
	}
	return r.db.Model(&TableSession{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":    "closed",
			"closed_at": &now,
		}).Error
}
