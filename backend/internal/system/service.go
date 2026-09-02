package system

import (
	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
)

type Service interface {
	ListSettings(p pagination.Params) ([]Setting, int64, error)
	GetSetting(key string) (*Setting, error)
	SetSetting(key, val string, userID *uuid.UUID) error
	DeleteSetting(key string) error
	ListLogs(orderID *uuid.UUID, p pagination.Params) ([]OrderStatusLog, int64, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListSettings(p pagination.Params) ([]Setting, int64, error) {
	return s.repo.ListSettings(p)
}

func (s *service) GetSetting(key string) (*Setting, error) {
	return s.repo.GetSettingByKey(key)
}

func (s *service) SetSetting(key, val string, userID *uuid.UUID) error {
	return s.repo.UpsertSetting(key, val, userID)
}

func (s *service) DeleteSetting(key string) error {
	return s.repo.DeleteSetting(key)
}

func (s *service) ListLogs(orderID *uuid.UUID, p pagination.Params) ([]OrderStatusLog, int64, error) {
	return s.repo.ListOrderStatusLogs(orderID, p)
}
