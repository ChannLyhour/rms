package repository

import (
	"github.com/google/uuid"
	"github.com/pos-system/backend/internal/domain"
	"gorm.io/gorm"
)

// TableRepository handles table and session database operations
type TableRepository struct {
	db *gorm.DB
}

// NewTableRepository creates a new TableRepository
func NewTableRepository(db *gorm.DB) *TableRepository {
	return &TableRepository{db: db}
}

// ListTables returns all tables
func (r *TableRepository) ListTables() ([]domain.Table, error) {
	var tables []domain.Table
	err := r.db.Order("table_number").Find(&tables).Error
	return tables, err
}

// FindTableByID returns a single table
func (r *TableRepository) FindTableByID(id uuid.UUID) (*domain.Table, error) {
	var table domain.Table
	err := r.db.First(&table, id).Error
	return &table, err
}

// CreateTable inserts a new table
func (r *TableRepository) CreateTable(t *domain.Table) error {
	return r.db.Create(t).Error
}

// UpdateTable saves changes to a table
func (r *TableRepository) UpdateTable(t *domain.Table) error {
	return r.db.Save(t).Error
}

// UpdateTableStatus updates only the status field of a table
func (r *TableRepository) UpdateTableStatus(tableID uuid.UUID, status string) error {
	return r.db.Model(&domain.Table{}).Where("id = ?", tableID).Update("status", status).Error
}

// --- Sessions ---

// CreateSession inserts a new table session
func (r *TableRepository) CreateSession(s *domain.TableSession) error {
	return r.db.Create(s).Error
}

// FindSessionByToken returns a session by its QR token
func (r *TableRepository) FindSessionByToken(token string) (*domain.TableSession, error) {
	var session domain.TableSession
	err := r.db.Preload("Table").Where("session_token = ?", token).First(&session).Error
	return &session, err
}

// FindActiveSessionByTableID returns the open session for a table
func (r *TableRepository) FindActiveSessionByTableID(tableID uuid.UUID) (*domain.TableSession, error) {
	var session domain.TableSession
	err := r.db.Where("table_id = ? AND status = 'active'", tableID).First(&session).Error
	return &session, err
}

// ListActiveSessions returns all active sessions with table info
func (r *TableRepository) ListActiveSessions() ([]domain.TableSession, error) {
	var sessions []domain.TableSession
	err := r.db.Preload("Table").Preload("Orders.Items.Product").
		Where("status = 'active'").Find(&sessions).Error
	return sessions, err
}

// CloseSession marks a session as closed
func (r *TableRepository) CloseSession(sessionID uuid.UUID) error {
	var sess domain.TableSession
	if err := r.db.First(&sess, sessionID).Error; err == nil && sess.TableID != uuid.Nil {
		_ = r.db.Model(&domain.Table{}).Where("id = ?", sess.TableID).Update("status", "available").Error
	}
	return r.db.Model(&domain.TableSession{}).Where("id = ?", sessionID).
		Updates(map[string]interface{}{"status": "closed", "closed_at": gorm.Expr("NOW()")}).Error
}
