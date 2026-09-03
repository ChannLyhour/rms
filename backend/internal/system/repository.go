package system

import (
	"time"

	"github.com/google/uuid"
	"github.com/pos-system/backend/pkg/pagination"
	"gorm.io/gorm"
)

type Repository interface {
	ListSettings(p pagination.Params) ([]Setting, int64, error)
	GetSettingByKey(key string) (*Setting, error)
	UpsertSetting(key, val string, userID *uuid.UUID) error
	DeleteSetting(key string) error

	// Logs
	ListOrderStatusLogs(orderID *uuid.UUID, p pagination.Params) ([]OrderStatusLog, int64, error)
	CreateOrderStatusLog(log *OrderStatusLog) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) ListSettings(p pagination.Params) ([]Setting, int64, error) {
	var list []Setting
	var total int64

	q := r.db.Model(&Setting{})
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("id asc").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *repository) GetSettingByKey(key string) (*Setting, error) {
	var s Setting
	if err := r.db.Where("setting_key = ?", key).First(&s).Error; err != nil {
		if key == "tax_rate" {
			defaultRate := "7.0"
			s = Setting{
				SettingKey:   key,
				SettingValue: &defaultRate,
				UpdatedAt:    time.Now(),
			}
			_ = r.db.Create(&s).Error
			return &s, nil
		}
		return nil, err
	}
	return &s, nil
}

func (r *repository) UpsertSetting(key, val string, userID *uuid.UUID) error {
	var s Setting
	err := r.db.Where("setting_key = ?", key).First(&s).Error
	if err == nil {
		return r.db.Model(&s).Updates(map[string]interface{}{
			"setting_value": val,
			"created_by":    userID,
			"updated_at":    time.Now(),
		}).Error
	}
	newSetting := Setting{
		SettingKey:   key,
		SettingValue: &val,
		CreatedBy:    userID,
		UpdatedAt:    time.Now(),
	}
	return r.db.Create(&newSetting).Error
}

func (r *repository) DeleteSetting(key string) error {
	return r.db.Where("setting_key = ?", key).Delete(&Setting{}).Error
}

func (r *repository) ListOrderStatusLogs(orderID *uuid.UUID, p pagination.Params) ([]OrderStatusLog, int64, error) {
	var list []OrderStatusLog
	var total int64

	q := r.db.Model(&OrderStatusLog{})
	if orderID != nil && *orderID != uuid.Nil {
		q = q.Where("order_id = ?", *orderID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("created_at desc").Limit(p.Limit).Offset(p.Offset).Find(&list).Error
	return list, total, err
}

func (r *repository) CreateOrderStatusLog(log *OrderStatusLog) error {
	return r.db.Create(log).Error
}
