package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/typesense/typesense-go/typesense"
	"github.com/typesense/typesense-go/typesense/api"
)

type Document map[string]interface{}

const (
	collectionName                  = "pokemon_cards"
	fieldNameId                     = "id"
	fieldNameName                   = "name"
	fieldNameSupertype              = "supertype"
	fieldNameSubtypes               = "subtypes"
	fieldNameLevel                  = "level"
	fieldNameHp                     = "hp"
	fieldNameTypes                  = "types"
	fieldNameEvolvesFrom            = "evolves_from"
	fieldNameEvolvesTo              = "evolves_to"
	fieldNameAbilities              = "abilities"
	fieldNameAttacks                = "attacks"
	fieldNameWeaknesses             = "weaknesses"
	fieldNameResistances            = "resistances"
	fieldNameRetreatCost            = "retreat_cost"
	fieldNameConvertedRetreatCost   = "converted_retreat_cost"
	fieldNameNumber                 = "number"
	fieldNameArtist                 = "artist"
	fieldNameRarity                 = "rarity"
	fieldNameFlavorText             = "flavor_text"
	fieldNameNationalPokedexNumbers = "national_pokedex_numbers"
	fieldNameLegalities             = "legalities"
	fieldNameImages                 = "images"

	fieldTypeString      = "string"
	fieldTypeInt32       = "int32"
	fieldTypeArrayString = "string[]"
	fieldTypeObject      = "object"
	fieldTypeArrayObject = "object[]"
)

var fields = []api.Field{
	// Will need to declare facet types correctly here
	{Name: ".*", Type: "auto"},
	//{Name: fieldNameId, Type: fieldTypeString},
	//{Name: fieldNameName, Type: fieldTypeString},
	//{Name: fieldNameSupertype, Type: fieldTypeString},
	//{Name: fieldNameSubtypes, Type: fieldTypeArrayString},
	//{Name: fieldNameLevel, Type: fieldTypeString},
	//{Name: fieldNameHp, Type: fieldTypeString},
	//{Name: fieldNameTypes, Type: fieldTypeArrayString},
	//{Name: fieldNameEvolvesFrom, Type: fieldTypeString},
	//{Name: fieldNameEvolvesTo, Type: fieldTypeArrayString},
	//{Name: fieldNameAbilities, Type: fieldTypeArrayObject},
	//{Name: fieldNameAttacks, Type: fieldTypeArrayObject},
	//{Name: fieldNameWeaknesses, Type: fieldTypeArrayObject},
	//{Name: fieldNameResistances, Type: fieldTypeArrayObject},
	//{Name: fieldNameRetreatCost, Type: fieldTypeArrayString},
	//{Name: fieldNameConvertedRetreatCost, Type: fieldTypeInt32},
	//{Name: fieldNameNumber, Type: fieldTypeString},
	//{Name: fieldNameArtist, Type: fieldTypeString},
	//{Name: fieldNameRarity, Type: fieldTypeString},
	//{Name: fieldNameFlavorText, Type: fieldTypeString},
	//{Name: fieldNameNationalPokedexNumbers, Type: fieldTypeArrayString},
	//{Name: fieldNameLegalities, Type: fieldTypeObject},
	//{Name: fieldNameImages, Type: fieldTypeObject},
}

func main() {
	typesenseAPIURL := os.Getenv("TYPESENSE_API_URL")
	if typesenseAPIURL == "" {
		log.Fatal("TYPESENSE_API_URL environment variable is not set")
	}

	typesenseAPIKey := os.Getenv("TYPESENSE_API_KEY")
	if typesenseAPIKey == "" {
		log.Fatal("TYPESENSE_API_KEY environment variable is not set")
	}

	client := typesense.NewClient(
		typesense.WithServer(typesenseAPIURL),
		typesense.WithAPIKey(typesenseAPIKey),
	)

	enableNestedFields := true

	err := retry(10, 5*time.Second, func() error {
		schema := &api.CollectionSchema{
			Name:               collectionName,
			Fields:             fields,
			EnableNestedFields: &enableNestedFields, // Enable nested fields with a pointer to a bool
		}

		if err := createCollection(client, schema); err != nil {
			return err
		}

		documents, err := readDocumentsFromDir("./cards")
		if err != nil {
			log.Fatalf("Error reading documents from directory: %v", err)
		}
		log.Printf("Successfully read %d documents from directory.\n", len(documents))

		if err != nil {
			return err
		}

		action := "create"
		params := &api.ImportDocumentsParams{Action: &action}

		documentsToIndex := make([]interface{}, len(documents))
		for i, doc := range documents {
			documentsToIndex[i] = doc
		}

		if _, err := client.Collection(collectionName).Documents().Import(
			context.Background(),
			documentsToIndex,
			params,
		); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		log.Fatalf("Error seeding data: %v", err)
	}

	log.Println("Seeding completed successfully")
}

func createCollection(client *typesense.Client, schema *api.CollectionSchema) error {
	_, err := client.Collections().Create(context.Background(), schema)
	if err != nil {
		if apiErr, ok := err.(*typesense.HTTPError); ok && apiErr.Status == 409 {
			log.Println("Collection already exists")
		} else {
			log.Printf("Failed to create collection: %v", err)
			return err
		}
	} else {
		log.Println("Collection created successfully")
	}
	return nil
}

func readDocumentsFromDir(rootDir string) ([]Document, error) {
	var documents []Document

	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && filepath.Ext(path) == ".json" {
			fileDocuments, err := readDocumentsFromJSON(path)
			if err != nil {
				return err
			}
			documents = append(documents, fileDocuments...)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to read documents from dir: %w", err)
	}

	return documents, nil
}

func readDocumentsFromJSON(filePath string) ([]Document, error) {
	file, err := os.ReadFile(filePath) // Use os.ReadFile instead of ioutil.ReadFile
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	var documents []Document
	if err := json.Unmarshal(file, &documents); err != nil {
		return nil, fmt.Errorf("failed to unmarshal json: %w", err)
	}

	return documents, nil
}

func retry(attempts int, sleep time.Duration, fn func() error) error {
	for i := 0; i < attempts; i++ {
		err := fn()
		if err == nil {
			return nil
		}
		log.Printf("Attempt %d failed: %v", i+1, err)
		time.Sleep(sleep)
	}
	return fmt.Errorf("after %d attempts, last error: %v", attempts, fn())
}