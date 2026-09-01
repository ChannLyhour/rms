package pagination

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// Params contains parsed pagination limit and offset parameters
type Params struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
	Page   int `json:"page"`
}

// GetPagination parses limit, offset, and page from query parameters
func GetPagination(c *gin.Context) Params {
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	pageStr := c.DefaultQuery("page", "")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}
	if limit > 200 {
		limit = 200
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	page := 1
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
			offset = (page - 1) * limit
		}
	} else if limit > 0 {
		page = (offset / limit) + 1
	}

	return Params{
		Limit:  limit,
		Offset: offset,
		Page:   page,
	}
}

// PaginatedResponse wraps list results with pagination metadata
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Total      int64       `json:"total"`
	Limit      int         `json:"limit"`
	Offset     int         `json:"offset"`
	Page       int         `json:"page"`
	TotalPages int         `json:"total_pages"`
}

// NewResponse creates a unified PaginatedResponse object
func NewResponse(data interface{}, total int64, p Params) PaginatedResponse {
	totalPages := 1
	if p.Limit > 0 {
		totalPages = int((total + int64(p.Limit) - 1) / int64(p.Limit))
		if totalPages == 0 {
			totalPages = 1
		}
	}
	return PaginatedResponse{
		Data:       data,
		Total:      total,
		Limit:      p.Limit,
		Offset:     p.Offset,
		Page:       p.Page,
		TotalPages: totalPages,
	}
}
