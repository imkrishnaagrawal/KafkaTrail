package main

import (
	"embed"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	kakfa := NewKafkaService()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "Kafka Trail",
		Width:            1024,
		Height:           768,
		WindowStartState: options.Maximised,
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: uuid.New().String(),
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: false,
		},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},

		Bind: []interface{}{
			kakfa,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
