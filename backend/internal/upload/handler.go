package upload

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// RegisterRoutes registers all upload routes on a Gin RouterGroup
func (h *UploadHandler) RegisterRoutes(r *gin.RouterGroup) {
	uploadGroup := r.Group("/upload")
	{
		// POST: Upload image (/upload or /upload/:folder)
		uploadGroup.POST("", h.UploadImage)
		uploadGroup.POST("/:folder", h.UploadImage)

		// GET: List uploads or get image metadata
		uploadGroup.GET("", h.ListUploads)
		uploadGroup.GET("/list", h.ListUploads)
		uploadGroup.GET("/list/:folder", h.ListUploads)
		uploadGroup.GET("/info/*filepath", h.GetImageInfo)

		// PUT: Replace / update existing image
		uploadGroup.PUT("", h.UpdateImage)
		uploadGroup.PUT("/file/*filepath", h.UpdateImage)

		// DELETE: Delete image from disk
		uploadGroup.DELETE("", h.DeleteImage)
		uploadGroup.DELETE("/file/*filepath", h.DeleteImage)
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Upload Image (Supports subfolders e.g. /menu, /tables, /avatars)
// ─────────────────────────────────────────────────────────────────────────────

func (h *UploadHandler) UploadImage(c *gin.Context) {
	// 1. Resolve folder (from path param, form value, or query param)
	folder := sanitizeFolder(c.Param("folder"))
	if folder == "" {
		folder = sanitizeFolder(c.PostForm("folder"))
	}
	if folder == "" {
		folder = sanitizeFolder(c.Query("folder"))
	}
	if folder == "" {
		folder = "products"
	}

	fileHeader, err := c.FormFile("image")
	if err != nil {
		// Also support "file" key as fallback
		fileHeader, err = c.FormFile("file")
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "field 'image' or 'file' is required",
		})
		return
	}

	rawContentType := fileHeader.Header.Get("Content-Type")
	contentType := strings.ToLower(strings.TrimSpace(strings.Split(rawContentType, ";")[0]))
	allowedTypes := map[string]bool{
		"image/jpeg":               true,
		"image/jpg":                true,
		"image/pjpeg":              true,
		"image/png":                true,
		"image/x-png":              true,
		"image/webp":               true,
		"image/gif":                true,
		"image/jfif":               true,
		"image/svg+xml":            true,
		"image/avif":               true,
		"image/bmp":                true,
		"image/x-ms-bmp":           true,
		"image/heic":               true,
		"image/heif":               true,
		"image/tiff":               true,
		"image/x-icon":             true,
		"image/vnd.microsoft.icon": true,
		"application/octet-stream": true,
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	validExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true, ".jfif": true, ".svg": true,
		".avif": true, ".bmp": true, ".heic": true, ".heif": true, ".ico": true, ".tiff": true,
	}

	if !allowedTypes[contentType] && !validExts[ext] && !strings.HasPrefix(contentType, "image/") {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   fmt.Sprintf("file type not allowed (Content-Type: %s, file: %s)", rawContentType, fileHeader.Filename),
		})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "cannot open uploaded file: " + err.Error(),
		})
		return
	}
	defer file.Close()

	now := time.Now()
	origName := fileHeader.Filename
	ext = strings.ToLower(filepath.Ext(origName))
	if ext == "" {
		ext = ".jpg"
	}
	// Pure timestamp format: ddmmyy_hhmmss (e.g. 300826_091215.jpg or 300826150405.jpg)
	newFilename := fmt.Sprintf("%s_%03d%s", now.Format("020106_150405"), now.Nanosecond()/1e6, ext)

	uploadsDir := GetUploadsDir()
	targetDir := uploadsDir
	if folder != "" {
		targetDir = filepath.Join(uploadsDir, folder)
	}

	if err := os.MkdirAll(targetDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("cannot create uploads directory (%s): %v", targetDir, err),
		})
		return
	}

	destPath := filepath.Join(targetDir, newFilename)
	dest, err := os.Create(destPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("cannot create file (%s): %v", destPath, err),
		})
		return
	}
	defer dest.Close()

	written, err := io.Copy(dest, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "failed to save file: " + err.Error(),
		})
		return
	}

	scheme := "http"
	if c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	host := c.Request.Host
	if host == "" {
		host = "localhost:8080"
	}

	var apiURL, v1URL, staticPath string
	if folder != "" {
		v1URL = fmt.Sprintf("/api/v1/uploads/%s/%s", folder, newFilename)
		apiURL = fmt.Sprintf("/api/uploads/%s/%s", folder, newFilename)
		staticPath = fmt.Sprintf("/uploads/%s/%s", folder, newFilename)
	} else {
		v1URL = fmt.Sprintf("/api/v1/uploads/%s", newFilename)
		apiURL = fmt.Sprintf("/api/uploads/%s", newFilename)
		staticPath = fmt.Sprintf("/uploads/%s", newFilename)
	}
	fullURL := fmt.Sprintf("%s://%s%s", scheme, host, v1URL)

	// Use /api/v1/uploads as the primary URL
	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"url":       v1URL,
		"v1_url":    v1URL,
		"api_url":   apiURL,
		"full_url":  fullURL,
		"path":      staticPath,
		"filename":  newFilename,
		"folder":    folder,
		"size":      written,
		"mime_type": contentType,
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: List Uploaded Files or Get Image Info
// ─────────────────────────────────────────────────────────────────────────────

type FileInfoItem struct {
	Name      string    `json:"name"`
	Folder    string    `json:"folder,omitempty"`
	URL       string    `json:"url"`
	APIURL    string    `json:"api_url"`
	V1URL     string    `json:"v1_url"`
	FullURL   string    `json:"full_url"`
	Path      string    `json:"path"`
	Size      int64     `json:"size"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (h *UploadHandler) ListUploads(c *gin.Context) {
	folder := sanitizeFolder(c.Param("folder"))
	if folder == "" {
		folder = sanitizeFolder(c.Query("folder"))
	}

	uploadsDir := GetUploadsDir()
	targetDir := uploadsDir
	if folder != "" {
		targetDir = filepath.Join(uploadsDir, folder)
	}

	entries, err := os.ReadDir(targetDir)
	if err != nil {
		if os.IsNotExist(err) {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"folder":  folder,
				"count":   0,
				"files":   []FileInfoItem{},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "cannot read directory: " + err.Error(),
		})
		return
	}

	var files []FileInfoItem
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if name == ".gitignore" || name == ".gitkeep" {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}

		scheme := "http"
		if c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https" {
			scheme = "https"
		}
		host := c.Request.Host
		if host == "" {
			host = "localhost:8080"
		}

		var apiURL, v1URL, staticPath string
		if folder != "" {
			apiURL = fmt.Sprintf("/api/uploads/%s/%s", folder, name)
			v1URL = fmt.Sprintf("/api/v1/uploads/%s/%s", folder, name)
			staticPath = fmt.Sprintf("/uploads/%s/%s", folder, name)
		} else {
			apiURL = fmt.Sprintf("/api/uploads/%s", name)
			v1URL = fmt.Sprintf("/api/v1/uploads/%s", name)
			staticPath = fmt.Sprintf("/uploads/%s", name)
		}
		fullURL := fmt.Sprintf("%s://%s%s", scheme, host, apiURL)

		files = append(files, FileInfoItem{
			Name:      name,
			Folder:    folder,
			URL:       apiURL,
			APIURL:    apiURL,
			V1URL:     v1URL,
			FullURL:   fullURL,
			Path:      staticPath,
			Size:      info.Size(),
			UpdatedAt: info.ModTime(),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"folder":  folder,
		"count":   len(files),
		"files":   files,
	})
}

func (h *UploadHandler) GetImageInfo(c *gin.Context) {
	relPath := strings.TrimPrefix(c.Param("filepath"), "/")
	if relPath == "" {
		folder := sanitizeFolder(c.Query("folder"))
		filename := c.Query("filename")
		if filename != "" {
			if folder != "" {
				relPath = filepath.Join(folder, filename)
			} else {
				relPath = filename
			}
		}
	}

	if relPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "filename or path parameter is required",
		})
		return
	}

	cleanFile := cleanUploadPath(relPath)
	filePath, found := findUploadFile(cleanFile)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{
			"success":  false,
			"error":    "file not found",
			"filename": cleanFile,
		})
		return
	}

	if c.Query("raw") == "true" || strings.Contains(c.GetHeader("Accept"), "image/") {
		c.Header("Cache-Control", "public, max-age=86400")
		c.File(filePath)
		return
	}

	scheme := "http"
	if c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	host := c.Request.Host
	if host == "" {
		host = "localhost:8080"
	}

	info, _ := os.Stat(filePath)
	normalized := strings.ReplaceAll(cleanFile, "\\", "/")
	apiURL := fmt.Sprintf("/api/uploads/%s", normalized)
	v1URL := fmt.Sprintf("/api/v1/uploads/%s", normalized)
	staticPath := fmt.Sprintf("/uploads/%s", normalized)
	fullURL := fmt.Sprintf("%s://%s%s", scheme, host, apiURL)

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"filename":   filepath.Base(cleanFile),
		"url":        apiURL,
		"api_url":    apiURL,
		"v1_url":     v1URL,
		"full_url":   fullURL,
		"path":       staticPath,
		"size":       info.Size(),
		"updated_at": info.ModTime(),
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT: Update / Replace an Image
// ─────────────────────────────────────────────────────────────────────────────

func (h *UploadHandler) UpdateImage(c *gin.Context) {
	oldFile := strings.TrimPrefix(c.Param("filepath"), "/")
	if oldFile == "" {
		oldFile = c.PostForm("old_filename")
	}
	if oldFile == "" {
		oldFile = c.PostForm("old_url")
	}
	if oldFile == "" {
		oldFile = c.Query("old")
	}

	// Delete old file if present
	if oldFile != "" {
		cleanOld := cleanUploadPath(oldFile)
		deleteFromAllUploadDirs(cleanOld)
	}

	// Upload the replacement image
	h.UploadImage(c)
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE: Delete an Image from Disk
// ─────────────────────────────────────────────────────────────────────────────

type DeleteRequest struct {
	Filename string `json:"filename"`
	URL      string `json:"url"`
	Folder   string `json:"folder"`
}

func (h *UploadHandler) DeleteImage(c *gin.Context) {
	target := strings.TrimPrefix(c.Param("filepath"), "/")
	folder := sanitizeFolder(c.Query("folder"))

	if target == "" {
		target = c.Query("filename")
		if target == "" {
			target = c.Query("url")
		}
	}

	if target == "" && c.ContentType() == "application/json" {
		var req DeleteRequest
		if err := c.ShouldBindJSON(&req); err == nil {
			if req.Filename != "" {
				target = req.Filename
			} else if req.URL != "" {
				target = req.URL
			}
			if folder == "" && req.Folder != "" {
				folder = sanitizeFolder(req.Folder)
			}
		}
	}

	if target == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "filename or url parameter is required for deletion",
		})
		return
	}

	cleanTarget := cleanUploadPath(target)
	if folder != "" && !strings.HasPrefix(cleanTarget, folder+"/") {
		cleanTarget = filepath.Join(folder, cleanTarget)
	}

	deleted := deleteFromAllUploadDirs(cleanTarget)
	if !deleted {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   fmt.Sprintf("file '%s' not found or already deleted", cleanTarget),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "image deleted successfully",
		"filename": cleanTarget,
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers & Path Resolution
// ─────────────────────────────────────────────────────────────────────────────

func cleanUploadPath(raw string) string {
	s := strings.TrimSpace(raw)
	s = strings.ReplaceAll(s, "\\", "/")
	if idx := strings.Index(s, "/uploads/"); idx != -1 {
		s = s[idx+len("/uploads/"):]
	} else if idx := strings.Index(s, "/api/uploads/"); idx != -1 {
		s = s[idx+len("/api/uploads/"):]
	}
	s = strings.TrimPrefix(s, "uploads/")
	s = strings.TrimPrefix(s, "/uploads/")
	s = strings.TrimPrefix(s, "api/uploads/")
	s = strings.TrimPrefix(s, "/api/uploads/")
	return filepath.Clean(s)
}

func sanitizeFolder(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	s = strings.ReplaceAll(s, "..", "")
	s = strings.ReplaceAll(s, "/", "")
	s = strings.ReplaceAll(s, "\\", "")
	var sb strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			sb.WriteRune(r)
		}
	}
	return sb.String()
}

func sanitizeFilename(s string) string {
	var sb strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			sb.WriteRune(r)
		} else {
			sb.WriteRune('_')
		}
	}
	res := sb.String()
	if res == "" {
		res = "image"
	}
	return res
}

func findUploadFile(relPath string) (string, bool) {
	uploadsDir := GetUploadsDir()
	candidates := []string{
		filepath.Join(uploadsDir, relPath),
		filepath.Join("./uploads", relPath),
		filepath.Join("./backend/uploads", relPath),
	}
	if exePath, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Join(filepath.Dir(exePath), "uploads", relPath))
	}

	for _, p := range candidates {
		if fi, err := os.Stat(p); err == nil && !fi.IsDir() {
			return p, true
		}
	}
	return "", false
}

func deleteFromAllUploadDirs(relPath string) bool {
	uploadsDir := GetUploadsDir()
	candidates := []string{
		filepath.Join(uploadsDir, relPath),
		filepath.Join("./uploads", relPath),
		filepath.Join("./backend/uploads", relPath),
	}
	if exePath, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Join(filepath.Dir(exePath), "uploads", relPath))
	}

	deletedAny := false
	for _, p := range candidates {
		if fi, err := os.Stat(p); err == nil && !fi.IsDir() {
			if err := os.Remove(p); err == nil {
				deletedAny = true
			}
		}
	}
	return deletedAny
}

// GetUploadsDir returns the directory path used for storing uploads.
func GetUploadsDir() string {
	if envDir := os.Getenv("UPLOADS_DIR"); envDir != "" {
		if abs, err := filepath.Abs(envDir); err == nil {
			return abs
		}
		return envDir
	}

	// 1. Check relative to current running executable
	if exePath, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exePath)
		candidate := filepath.Join(exeDir, "uploads")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
	}

	// 2. Check ./uploads
	if abs, err := filepath.Abs("./uploads"); err == nil {
		if _, err := os.Stat(abs); err == nil {
			return abs
		}
	}

	// 3. Check ./backend/uploads
	if abs, err := filepath.Abs("./backend/uploads"); err == nil {
		if _, err := os.Stat(abs); err == nil {
			return abs
		}
	}

	return "./uploads"
}
