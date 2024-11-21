package main

import (
	"context"
	// "encoding/base64"
	"encoding/json"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx           context.Context
	lastFile      string
	cacheFilePath string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	userCacheDirPath, err := os.UserCacheDir()
	if err != nil {
		fmt.Println(err)
		return
	}

	// set user preferences file path
	a.cacheFilePath = fmt.Sprintf("%s/artracker_preferences.json", userCacheDirPath)

	// read user preferences
	byteValue, err := os.ReadFile(a.cacheFilePath)
	if err != nil {
		fmt.Println(err)
		return
	}

	type UserPreferences struct {
		LastFile string `json:"lastFile"`
	}

	var result UserPreferences
	err = json.Unmarshal(byteValue, &result)
	if err != nil {
		fmt.Printf("Failed to unmarshall: %s\n", err)
	}

	a.lastFile = result.LastFile
}

// https://docs.sheetjs.com/docs/demos/desktop/wails/

func (a *App) Export(value string) error {
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

	a.lastFile = selection
	err = savePreferences(a)
	if err != nil {
		fmt.Println(err)
	}

	_ = os.WriteFile(selection, []byte(value), 0644)

	return nil
}

func (a *App) Import(value string) (string, error) {
	var selection string
	var err error

	if value != "" {
		selection = value
	} else {
		selection, err = runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
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
	}

	data, err := os.ReadFile(selection)
	if err != nil {
		fmt.Printf("Failed to read file %s: %s\n", selection, err)
		return "", err
	}

	a.lastFile = selection
	err = savePreferences(a)
	if err != nil {
		fmt.Println(err)
	}

	return string(data), nil
}

func (a *App) GetLastFile() (string, error) {
	return a.lastFile, nil
}

func (a *App) ClearLastFile() error {
	a.lastFile = ""
	err := savePreferences(a)
	if err != nil {
		fmt.Println(err)
	}
	return nil
}

func savePreferences(a *App) error {
	err := os.WriteFile(a.cacheFilePath, []byte(fmt.Sprintf(`{"lastFile":"%s"}`, a.lastFile)), 0644)
	return err
}
