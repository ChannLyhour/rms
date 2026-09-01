package system

import (
	"github.com/pos-system/backend/pkg/pagination"
)

type Service interface {
	ListSettings(p pagination.Params) ([]Setting, int64, error)
	GetSetting(key string) (*Setting, error)
	SetSetting(key, val string, userID *uint64) error
	DeleteSetting(key string) error
	ListLogs(orderID *uint64, p pagination.Params) ([]OrderStatusLog, int64, error)
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

func (s *service) SetSetting(key, val string, userID *uint64) error {
	return s.repo.UpsertSetting(key, val, userID)
}

func (s *service) DeleteSetting(key string) error {
	return s.repo.DeleteSetting(key)
}

func (s *service) ListLogs(orderID *uint64, p pagination.Params) ([]OrderStatusLog, int64, error) {
	return s.repo.ListOrderStatusLogs(orderID, p)
}
