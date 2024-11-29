package main

import (
	"crypto/rand"
	"encoding/hex"
	"sync"

	"log"
	"time"

	"github.com/robfig/cron/v3"
)

func generateRandomFileName() string {
	bytes := make([]byte, 8)
	_, err := rand.Read(bytes)
	if err != nil {
		return "default_filename"
	}
	return hex.EncodeToString(bytes)
}

func getImageContentType(filename string) string {
	switch {
	case filename[len(filename)-4:] == ".png":
		return "image/png"
	case filename[len(filename)-4:] == ".jpg" || filename[len(filename)-5:] == ".jpeg":
		return "image/jpeg"
	case filename[len(filename)-4:] == ".gif":
		return "image/gif"
	default:
		return "application/octet-stream" // Fallback content type
	}
}

func CronQRStartJobs() {
	c := cron.New()
	_, err := c.AddFunc("@every 1s", func() {
		log.Println("Running monitor booking scheduled job...")
		GenerateQRForUpcomingBookings()
	})
	if err != nil {
		log.Fatalf("Error adding cron job: %v", err)
	}

	c.Start()
	defer c.Stop()

	select {}
}

func GenerateQRForUpcomingBookings() {
	now := time.Now()
	bookings, err := getBookings()
	if err != nil {
		log.Printf("Error fetching upcoming bookings: %v", err)
		return
	}
	for _, b := range bookings {
		if now.After(b.StartTime) {
			err := generateQR(b.ID)
			if err != nil {
				log.Printf("Error generating QR code for booking ID %d: %v", b.ID, err)
				continue
			}
		}
	}
}

func CronLockStartJobs() {
	c := cron.New()
	_, err := c.AddFunc("@every 1s", func() {
		log.Println("Running Police scheduled job...")
		checkQrUsedOrNot()
	})
	if err != nil {
		log.Fatalf("Error adding cron job: %v", err)
	}

	c.Start()
	defer c.Stop()

	select {}
}

func checkQrUsedOrNot() {
	now := time.Now()
	bookings, err := getBookings()
	var wg sync.WaitGroup
	if err != nil {
		log.Printf("Error fetching upcoming bookings: %v", err)
		return
	}
	for _, b := range bookings {
		if now.After(b.StartTime.Add(5 * time.Minute)) {
			wg.Add(1)
			go checkBookingStatus(b.ID, &wg)

		}
	}
}

func CronCompleteStartJobs() {
	c := cron.New()
	_, err := c.AddFunc("@every 1s", func() {
		log.Println("Running Complete Room scheduled job...")
		checkCompleteRoom()
	})
	if err != nil {
		log.Fatalf("Error adding cron job: %v", err)
	}

	c.Start()
	defer c.Stop()

	select {}
}

func checkCompleteRoom() {
	now := time.Now()
	bookings, err := getBookings()
	var wg sync.WaitGroup
	if err != nil {
		log.Printf("Error fetching upcoming bookings: %v", err)
		return
	}
	for _, b := range bookings {
		if now.After(b.EndTime) {
			wg.Add(1)
			go checkCompleteStatus(b.ID, &wg)

		}
	}
}
