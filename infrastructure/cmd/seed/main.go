package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/typesense/typesense-go/typesense"
	"github.com/typesense/typesense-go/typesense/api"
)

type Document map[string]interface{}

const (
	collectionName           = "books"
	fieldNameId              = "id"
	fieldNameTitle           = "title"
	fieldNameAuthor          = "author"
	fieldNamePublicationYear = "publication_year"

	fieldTypeString = "string"
	fieldTypeInt32  = "int32"
)

var (
	documents = []Document{
		// Terry Pratchett's Discworld series
		{fieldNameId: "1", fieldNameTitle: "The Colour of Magic", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1983},
		{fieldNameId: "2", fieldNameTitle: "The Light Fantastic", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1986},
		{fieldNameId: "3", fieldNameTitle: "Equal Rites", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1987},
		{fieldNameId: "4", fieldNameTitle: "Mort", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1987},
		{fieldNameId: "5", fieldNameTitle: "Sourcery", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1988},
		{fieldNameId: "6", fieldNameTitle: "Wyrd Sisters", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1988},
		{fieldNameId: "7", fieldNameTitle: "Pyramids", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1989},
		{fieldNameId: "8", fieldNameTitle: "Guards! Guards!", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1989},
		{fieldNameId: "9", fieldNameTitle: "Eric", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1990},
		{fieldNameId: "10", fieldNameTitle: "Moving Pictures", fieldNameAuthor: "Terry Pratchett", fieldNamePublicationYear: 1990},

		// J.R.R. Tolkien's The Lord of the Rings series
		{fieldNameId: "11", fieldNameTitle: "The Fellowship of the Ring", fieldNameAuthor: "J.R.R. Tolkien", fieldNamePublicationYear: 1954},
		{fieldNameId: "12", fieldNameTitle: "The Two Towers", fieldNameAuthor: "J.R.R. Tolkien", fieldNamePublicationYear: 1954},
		{fieldNameId: "13", fieldNameTitle: "The Return of the King", fieldNameAuthor: "J.R.R. Tolkien", fieldNamePublicationYear: 1955},

		// Philip Pullman's His Dark Materials series
		{fieldNameId: "14", fieldNameTitle: "Northern Lights", fieldNameAuthor: "Philip Pullman", fieldNamePublicationYear: 1995},
		{fieldNameId: "15", fieldNameTitle: "The Subtle Knife", fieldNameAuthor: "Philip Pullman", fieldNamePublicationYear: 1997},
		{fieldNameId: "16", fieldNameTitle: "The Amber Spyglass", fieldNameAuthor: "Philip Pullman", fieldNamePublicationYear: 2000},
	}
	trueFacet = true
	fields    = []api.Field{
		{Name: fieldNameId, Type: fieldTypeString},
		{Name: fieldNameTitle, Type: fieldTypeString},
		{Name: fieldNameAuthor, Type: fieldTypeString, Facet: &trueFacet},
		{Name: fieldNamePublicationYear, Type: fieldTypeInt32},
	}
)

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

	err := retry(10, 5*time.Second, func() error {
		schema := &api.CollectionSchema{
			Name:   collectionName,
			Fields: fields,
		}

		if err := createCollection(client, schema); err != nil {
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
