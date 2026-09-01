package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/pos-system/backend/internal/domain"
	"github.com/pos-system/backend/internal/repository"
	"github.com/pos-system/backend/pkg/qrcode"
)

// TableService handles table and session business logic
type TableService struct {
	tableRepo   *repository.TableRepository
	frontendURL string
}

// NewTableService creates a new TableService
func NewTableService(tableRepo *repository.TableRepository, frontendURL string) *TableService {
	return &TableService{tableRepo: tableRepo, frontendURL: frontendURL}
}

// ListTables returns all tables
func (s *TableService) ListTables() ([]domain.Table, error) {
	return s.tableRepo.ListTables()
}

// OpenSession creates a new QR session for a table
func (s *TableService) OpenSession(tableID, userID uint64) (*domain.TableSession, string, error) {
	// Ensure table exists
	_, err := s.tableRepo.FindTableByID(tableID)
	if err != nil {
		return nil, "", errors.New("table not found")
	}

	// Check for existing active session
	existing, err := s.tableRepo.FindActiveSessionByTableID(tableID)
	if err == nil && existing != nil {
		return nil, "", errors.New("table already has an active session")
	}

	// Generate unique token
	token, err := generateSecureToken(32)
	if err != nil {
		return nil, "", fmt.Errorf("token generation failed: %w", err)
	}

	session := &domain.TableSession{
		TableID:      tableID,
		SessionToken: token,
		Status:       "active",
		OpenedAt:     time.Now(),
		CreatedBy:    &userID,
	}

	if err := s.tableRepo.CreateSession(session); err != nil {
		return nil, "", fmt.Errorf("failed to create session: %w", err)
	}

	// Update table status
	_ = s.tableRepo.UpdateTableStatus(tableID, "occupied")

	// Generate QR code as base64
	qrData, err := qrcode.GenerateSessionURL(s.frontendURL, token)
	if err != nil {
		qrData = ""
	}

	return session, qrData, nil
}

// ListActiveSessions returns all active sessions
func (s *TableService) ListActiveSessions() ([]domain.TableSession, error) {
	return s.tableRepo.ListActiveSessions()
}

// CloseSession closes a session and marks the table as available
func (s *TableService) CloseSession(sessionID, tableID uint64) error {
	if err := s.tableRepo.CloseSession(sessionID); err != nil {
		return err
	}
	return s.tableRepo.UpdateTableStatus(tableID, "available")
}

// GetSessionByToken returns a session by its QR token (used by customer flow)
func (s *TableService) GetSessionByToken(token string) (*domain.TableSession, error) {
	session, err := s.tableRepo.FindSessionByToken(token)
	if err != nil {
		return nil, errors.New("session not found")
	}
	if session.Status != "active" {
		return nil, errors.New("session is no longer active")
	}
	return session, nil
}

// generateSecureToken creates a hex-encoded random token
func generateSecureToken(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
