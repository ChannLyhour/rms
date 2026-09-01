package table

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/pos-system/backend/pkg/pagination"
	"github.com/pos-system/backend/pkg/qrcode"
)

type Service interface {
	ListTables(zone string, status string, p pagination.Params) ([]Table, int64, error)
	GetTable(id uint64) (*Table, error)
	CreateTable(t *Table) error
	UpdateTable(id uint64, t *Table) error
	DeleteTable(id uint64) error
	UpdateTableStatus(tableID uint64, status string) error

	// Sessions
	OpenSession(tableID uint64, customerName *string, guestCount int, waiterID *uint64) (*TableSession, string, error)
	GetSessionByID(id uint64) (*TableSession, error)
	GetSessionByToken(token string) (*TableSession, error)
	ListSessions(tableID *uint64, status string, p pagination.Params) ([]TableSession, int64, error)
	ListActiveSessions() ([]TableSession, error)
	CloseSession(sessionID, tableID uint64) error
}

type service struct {
	repo        Repository
	frontendURL string
}

func NewService(repo Repository, frontendURL string) Service {
	return &service{repo: repo, frontendURL: frontendURL}
}

func (s *service) ListTables(zone string, status string, p pagination.Params) ([]Table, int64, error) {
	return s.repo.ListTables(zone, status, p)
}

func (s *service) GetTable(id uint64) (*Table, error) {
	return s.repo.GetTableByID(id)
}

func (s *service) CreateTable(t *Table) error {
	t.Status = "available"
	return s.repo.CreateTable(t)
}

func (s *service) UpdateTable(id uint64, t *Table) error {
	return s.repo.UpdateTable(id, t)
}

func (s *service) DeleteTable(id uint64) error {
	return s.repo.DeleteTable(id)
}

func (s *service) UpdateTableStatus(tableID uint64, status string) error {
	return s.repo.UpdateTableStatus(tableID, status)
}

func (s *service) OpenSession(tableID uint64, customerName *string, guestCount int, waiterID *uint64) (*TableSession, string, error) {
	_, err := s.repo.GetTableByID(tableID)
	if err != nil {
		return nil, "", errors.New("table not found")
	}

	activeSession, _ := s.repo.GetActiveSessionByTableID(tableID)
	if activeSession != nil {
		qrBase64, _ := qrcode.GenerateSessionURL(s.frontendURL, activeSession.SessionToken)
		return activeSession, qrBase64, nil
	}

	tokenBytes := make([]byte, 16)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, "", err
	}
	sessionToken := hex.EncodeToString(tokenBytes)

	now := time.Now()

	session := &TableSession{
		TableID:      tableID,
		SessionToken: sessionToken,
		Status:       "active",
		OpenedAt:     now,
		CreatedBy:    waiterID,
	}

	if err := s.repo.CreateSession(session); err != nil {
		return nil, "", err
	}

	_ = s.repo.UpdateTableStatus(tableID, "occupied")

	qrBase64, err := qrcode.GenerateSessionURL(s.frontendURL, sessionToken)
	if err != nil {
		return session, "", nil
	}

	return session, qrBase64, nil
}

func (s *service) GetSessionByID(id uint64) (*TableSession, error) {
	return s.repo.GetSessionByID(id)
}

func (s *service) GetSessionByToken(token string) (*TableSession, error) {
	// 1. Try by session token directly
	sess, err := s.repo.GetSessionByToken(token)
	if err == nil && sess != nil {
		if sess.Status != "active" {
			return nil, errors.New("this dining session has been closed or expired")
		}
		return sess, nil
	}

	// 2. Try by table ID if token is numeric (e.g. "8")
	if tid, errConv := strconv.ParseUint(token, 10, 64); errConv == nil && tid > 0 {
		activeSess, errAct := s.repo.GetActiveSessionByTableID(tid)
		if errAct == nil && activeSess != nil {
			return activeSess, nil
		}
		return nil, errors.New("no active dining session for this table")
	}

	// 3. Try by table_number (e.g. "T-8", "8", "Table 8")
	tables, _, errList := s.repo.ListTables("", "", pagination.Params{Limit: 200, Offset: 0})
	if errList == nil {
		cleanToken := strings.ToLower(strings.TrimSpace(token))
		cleanToken = strings.TrimPrefix(cleanToken, "t-")
		cleanToken = strings.TrimPrefix(cleanToken, "table ")
		cleanToken = strings.TrimPrefix(cleanToken, "table-")
		cleanToken = strings.TrimPrefix(cleanToken, "table#")
		cleanToken = strings.TrimPrefix(cleanToken, "#")

		for _, tbl := range tables {
			cleanTblNum := strings.ToLower(strings.TrimSpace(tbl.TableNumber))
			cleanTblNum = strings.TrimPrefix(cleanTblNum, "t-")
			cleanTblNum = strings.TrimPrefix(cleanTblNum, "table ")
			cleanTblNum = strings.TrimPrefix(cleanTblNum, "table-")
			cleanTblNum = strings.TrimPrefix(cleanTblNum, "table#")
			cleanTblNum = strings.TrimPrefix(cleanTblNum, "#")

			if cleanTblNum == cleanToken || strconv.FormatUint(tbl.ID, 10) == cleanToken {
				activeSess, errAct := s.repo.GetActiveSessionByTableID(tbl.ID)
				if errAct == nil && activeSess != nil {
					return activeSess, nil
				}
				return nil, errors.New("no active dining session for this table")
			}
		}
	}

	return nil, errors.New("invalid or expired session token")
}

func (s *service) ListSessions(tableID *uint64, status string, p pagination.Params) ([]TableSession, int64, error) {
	return s.repo.ListSessions(tableID, status, p)
}

func (s *service) ListActiveSessions() ([]TableSession, error) {
	return s.repo.ListActiveSessions()
}

func (s *service) CloseSession(sessionID, tableID uint64) error {
	if tableID == 0 {
		sess, err := s.repo.GetSessionByID(sessionID)
		if err == nil && sess != nil {
			tableID = sess.TableID
		}
	}
	if err := s.repo.CloseSession(sessionID); err != nil {
		return err
	}
	if tableID > 0 {
		_ = s.repo.UpdateTableStatus(tableID, "available")
	}
	return nil
}
