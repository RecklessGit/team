package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/typesense/typesense-go/v2/typesense"
	"github.com/typesense/typesense-go/v2/typesense/api"
)

type Document map[string]interface{}

const (
	pokemonCollectionName           = "pokemon"
	conversationStoreCollectionName = "conversation_store"
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
	fieldNameEmbedding              = "embedding"
	fieldTypeString                 = "string"
	fieldTypeInt32                  = "int32"
	fieldTypeArrayString            = "string[]"
	fieldTypeObject                 = "object"
	fieldTypeArrayObject            = "object[]"
	fieldTypeFloat                  = "float[]"
)

var (
	typesenseTrue  = true
	typesenseFalse = false
)

var pokemonFields = []api.Field{
	{Name: fieldNameId, Type: fieldTypeString},
	{Name: fieldNameName, Type: fieldTypeString, Infix: &typesenseTrue, Optional: &typesenseTrue},
	{Name: fieldNameSupertype, Type: fieldTypeString, Infix: &typesenseTrue, Optional: &typesenseTrue, Facet: &typesenseTrue},
	{Name: fieldNameSubtypes, Type: fieldTypeArrayString, Infix: &typesenseTrue, Optional: &typesenseTrue, Facet: &typesenseTrue},
	{Name: fieldNameTypes, Type: fieldTypeArrayString, Infix: &typesenseTrue, Optional: &typesenseTrue, Facet: &typesenseTrue},
	{Name: fieldNameAbilities, Type: fieldTypeArrayObject, Optional: &typesenseTrue},
	{Name: fieldNameAttacks, Type: fieldTypeArrayObject, Optional: &typesenseTrue, Facet: &typesenseTrue},
	{Name: fieldNameWeaknesses, Type: fieldTypeArrayObject, Optional: &typesenseTrue, Facet: &typesenseTrue},
	{Name: fieldNameResistances, Type: fieldTypeArrayObject, Optional: &typesenseTrue, Facet: &typesenseTrue},
	{Name: fieldNameRarity, Type: fieldTypeString, Optional: &typesenseTrue},
	{Name: fieldNameFlavorText, Type: fieldTypeString, Optional: &typesenseTrue},
	{Name: fieldNameLevel, Type: fieldTypeString, Optional: &typesenseTrue, Sort: &typesenseTrue},
	{
		Name:     fieldNameEmbedding,
		Type:     fieldTypeFloat,
		Optional: &typesenseTrue,
		Index:    &typesenseTrue,
		Embed: &struct {
			From        []string `json:"from"`
			ModelConfig struct {
				AccessToken   *string `json:"access_token,omitempty"`
				ApiKey        *string `json:"api_key,omitempty"`
				ClientId      *string `json:"client_id,omitempty"`
				ClientSecret  *string `json:"client_secret,omitempty"`
				ModelName     string  `json:"model_name"`
				ProjectId     *string `json:"project_id,omitempty"`
			} `json:"model_config"`
		}{
			From: []string{
				fieldNameName,
				fieldNameSupertype,
				fieldNameSubtypes,
				fieldNameTypes,
				fieldNameFlavorText,
			},
			ModelConfig: struct {
				AccessToken   *string `json:"access_token,omitempty"`
				ApiKey        *string `json:"api_key,omitempty"`
				ClientId      *string `json:"client_id,omitempty"`
				ClientSecret  *string `json:"client_secret,omitempty"`
				ModelName     string  `json:"model_name"`
				ProjectId     *string `json:"project_id,omitempty"`
			}{
				ModelName: "openai/text-embedding-ada-002",
				ApiKey:    stringPtr(),
			},
		},
	},
}

func stringPtr(s string) *string {
	return &s
}

var conversationStoreFields = []api.Field{
	{Name: "conversation_id", Type: "string"},
	{Name: "model_id", Type: "string"},
	{Name: "timestamp", Type: "int32"},
	{Name: "role", Type: "string", Index: &typesenseFalse},
	{Name: "message", Type: "string", Index: &typesenseFalse},
}

func main() {
	if err := checkEnvironmentVariables(); err != nil {
		log.Fatalf("Environment variable error: %v", err)
	}

	typesenseAPIURL := os.Getenv("TYPESENSE_API_URL")
	typesenseAPIKey := os.Getenv("TYPESENSE_API_KEY")

	// typesenseAPIURL := "http://localhost:8108"
	// typesenseAPIKey := "Hu52dwsas2AdxdE"



	client := typesense.NewClient(
		typesense.WithServer(typesenseAPIURL),
		typesense.WithAPIKey(typesenseAPIKey),
	)

	if err := testTypesenseConnection(client); err != nil {
		log.Fatalf("Typesense connection error: %v", err)
	}

	enableNestedFields := true
	err := retry(10, 5*time.Second, func() error {
		if err := createPokemonCollection(client, enableNestedFields); err != nil {
			log.Printf("Failed to create Pokemon collection: %v", err)
			return fmt.Errorf("failed to create Pokemon collection: %w", err)
		}

		if err := createConversationStoreCollection(client); err != nil {
			log.Printf("Failed to create Conversation Store collection: %v", err)
			return fmt.Errorf("failed to create Conversation Store collection: %w", err)
		}

		if err := importPokemonDocuments(client); err != nil {
			log.Printf("Failed to import Pokemon documents: %v", err)
			return fmt.Errorf("failed to import Pokemon documents: %w", err)
		}

		return nil
	})

	if err != nil {
		log.Fatalf("Error seeding data: %v", err)
	}

	log.Println("Seeding completed successfully")
}

func checkEnvironmentVariables() error {
	requiredEnvVars := []string{"TYPESENSE_API_URL", "TYPESENSE_API_KEY"}
	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			return fmt.Errorf("%s environment variable is not set", envVar)
		}
	}
	return nil
}

func testTypesenseConnection(client *typesense.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Health(ctx, 5*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to Typesense: %w", err)
	}
	return nil
}

func createPokemonCollection(client *typesense.Client, enableNestedFields bool) error {
	log.Printf("Attempting to create Pokemon collection...")
	pokemonSchema := &api.CollectionSchema{
		Name:               pokemonCollectionName,
		Fields:             pokemonFields,
		EnableNestedFields: &enableNestedFields,
	}
	return createOrUpdateCollection(client, pokemonSchema)
}

func createConversationStoreCollection(client *typesense.Client) error {
	log.Printf("Attempting to create Conversation Store collection...")
	conversationStoreSchema := &api.CollectionSchema{
		Name:   conversationStoreCollectionName,
		Fields: conversationStoreFields,
	}
	return createOrUpdateCollection(client, conversationStoreSchema)
}

func createOrUpdateCollection(client *typesense.Client, schema *api.CollectionSchema) error {
	if err := deleteCollectionIfExists(client, schema.Name); err != nil {
		log.Printf("Error deleting existing collection %s: %v", schema.Name, err)
		return err
	}

	log.Printf("Creating collection %s...", schema.Name)
	_, err := client.Collections().Create(context.Background(), schema)
	if err != nil {
		log.Printf("Error creating collection %s: %v", schema.Name, err)
		return fmt.Errorf("failed to create collection %s: %w", schema.Name, err)
	}

	log.Printf("Collection %s created successfully", schema.Name)
	return nil
}

func deleteCollectionIfExists(client *typesense.Client, collectionName string) error {
	log.Printf("Attempting to delete collection %s if it exists...", collectionName)
	_, err := client.Collection(collectionName).Delete(context.Background())
	if err != nil {
		if apiErr, ok := err.(*typesense.HTTPError); ok && apiErr.Status == 404 {
			log.Printf("Collection %s does not exist", collectionName)
		} else {
			log.Printf("Error deleting collection %s: %v", collectionName, err)
			return fmt.Errorf("failed to delete collection %s: %w", collectionName, err)
		}
	} else {
		log.Printf("Collection %s deleted successfully", collectionName)
	}
	return nil
}

func importPokemonDocuments(client *typesense.Client) error {
	log.Printf("Starting import of Pokemon documents...")
	documents, err := readDocumentsFromDir("./cards")
	if err != nil {
		log.Printf("Error reading documents from directory: %v", err)
		return fmt.Errorf("error reading documents from directory: %w", err)
	}
	log.Printf("Successfully read %d documents from directory.", len(documents))

	action := "create"
	params := &api.ImportDocumentsParams{Action: &action}
	documentsToIndex := make([]interface{}, len(documents))
	for i, doc := range documents {
		if err := validateDocument(doc); err != nil {
			log.Printf("Invalid document at index %d: %v", i, err)
			return fmt.Errorf("invalid document at index %d: %w", i, err)
		}
		documentsToIndex[i] = doc
	}

	log.Printf("Importing %d documents...", len(documentsToIndex))
	_, err = client.Collection(pokemonCollectionName).Documents().Import(
		context.Background(),
		documentsToIndex,
		params,
	)
	if err != nil {
		log.Printf("Error importing documents: %v", err)
		return fmt.Errorf("error importing documents: %w", err)
	}

	log.Printf("Documents imported successfully")
	return nil
}

func validateDocument(doc Document) error {
	requiredFields := []string{fieldNameId, fieldNameName}
	for _, field := range requiredFields {
		if _, ok := doc[field]; !ok {
			return fmt.Errorf("document is missing required field: %s", field)
		}
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
	file, err := os.ReadFile(filePath)
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