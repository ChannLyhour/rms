package qrcode

import (
	"encoding/base64"
	"fmt"

	qr "github.com/skip2/go-qrcode"
)

// GenerateBase64 returns a base64-encoded PNG QR code for the given content
func GenerateBase64(content string, size int) (string, error) {
	if size <= 0 {
		size = 256
	}
	png, err := qr.Encode(content, qr.Medium, size)
	if err != nil {
		return "", fmt.Errorf("qrcode: failed to generate: %w", err)
	}
	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(png), nil
}

// GenerateSessionURL builds the customer-facing URL and returns its QR code as base64
func GenerateSessionURL(frontendURL, sessionToken string) (string, error) {
	url := fmt.Sprintf("%s/menu/%s", frontendURL, sessionToken)
	return GenerateBase64(url, 256)
}
