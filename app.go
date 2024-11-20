package main

import (
	"context"
	// "encoding/base64"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// https://docs.sheetjs.com/docs/demos/desktop/wails/

func (a *App) Export(value string) error {
	fmt.Println(value)

	selection, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Select File",
		DefaultFilename: "cuentas.art",
		Filters: []runtime.FileFilter{
			{DisplayName: "AR-Tracker (*.art)", Pattern: "*.art"},
			// ... more filters for more file types
		},
	})
	if err != nil {
		return err
	}

	fmt.Println(selection)

	_ = os.WriteFile(selection, []byte(value), 0644)

	return nil
}

func (a *App) Import() (string, error) {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File",
		Filters: []runtime.FileFilter{
			{DisplayName: "AR-Tracker (*.art)", Pattern: "*.art"},
			// ... more filters for more file types
		},
	})
	if err != nil {
		fmt.Printf("Failed to select file: %s\n", err)
		return "", err
	}

	data, err := os.ReadFile(selection)
	if err != nil {
		fmt.Printf("Failed to read file %s: %s\n", selection, err)
		return "", err
	}

	fmt.Printf("data: %s\n", string(data))

	return string(data), nil
}
