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
)

var (
	documents = []Document{
		{
			fieldNameId:          "base1-1",
			fieldNameName:        "Alakazam",
			fieldNameSupertype:   "Pokémon",
			fieldNameSubtypes:    []string{"Stage 2"},
			fieldNameLevel:       "42",
			fieldNameHp:          "80",
			fieldNameTypes:       []string{"Psychic"},
			fieldNameEvolvesFrom: "Kadabra",
			fieldNameAbilities: []map[string]interface{}{
				{
					"name": "Damage Swap",
					"text": "As often as you like during your turn (before your attack), you may move 1 damage counter from 1 of your Pokémon to another as long as you don't Knock Out that Pokémon. This power can't be used if Alakazam is Asleep, Confused, or Paralyzed.",
					"type": "Pokémon Power",
				},
			},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Confuse Ray",
					"cost":                []string{"Psychic", "Psychic", "Psychic"},
					"convertedEnergyCost": 3,
					"damage":              "30",
					"text":                "Flip a coin. If heads, the Defending Pokémon is now Confused.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Psychic",
					"value": "X2",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   3,
			fieldNameNumber:                 "1",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "Its brain can outperform a supercomputer. Its intelligence quotient is said to be 5000.",
			fieldNameNationalPokedexNumbers: []int{65},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/1.png",
				"large": "https://images.pokemontcg.io/base1/1_hires.png",
			},
		},
		{
			fieldNameId:          "base1-2",
			fieldNameName:        "Alakazam",
			fieldNameSupertype:   "Pokémon",
			fieldNameSubtypes:    []string{"Stage 2"},
			fieldNameLevel:       "42",
			fieldNameHp:          "80",
			fieldNameTypes:       []string{"Psychic"},
			fieldNameEvolvesFrom: "Kadabra",
			fieldNameAbilities: []map[string]interface{}{
				{
					"name": "Damage Swap",
					"text": "As often as you like during your turn (before your attack), you may move 1 damage counter from 1 of your Pokémon to another as long as you don't Knock Out that Pokémon. This power can't be used if Alakazam is Asleep, Confused, or Paralyzed.",
					"type": "Pokémon Power",
				},
			},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Confuse Ray",
					"cost":                []string{"Psychic", "Psychic", "Psychic"},
					"convertedEnergyCost": 3,
					"damage":              "30",
					"text":                "Flip a coin. If heads, the Defending Pokémon is now Confused.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Psychic",
					"value": "X2",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   3,
			fieldNameNumber:                 "1",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "Its brain can outperform a supercomputer. Its intelligence quotient is said to be 5000.",
			fieldNameNationalPokedexNumbers: []int{65},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/1.png",
				"large": "https://images.pokemontcg.io/base1/1_hires.png",
			},
		},
		{
			fieldNameId:          "base1-2",
			fieldNameName:        "Blastoise",
			fieldNameSupertype:   "Pokémon",
			fieldNameSubtypes:    []string{"Stage 2"},
			fieldNameLevel:       "52",
			fieldNameHp:          "100",
			fieldNameTypes:       []string{"Water"},
			fieldNameEvolvesFrom: "Wartortle",
			fieldNameAbilities: []map[string]interface{}{
				{
					"name": "Rain Dance",
					"text": "As often as you like during your turn (before your attack), you may attach 1 Water Energy card to 1 of your Water Pokémon. (This doesn't use up your 1 Energy card attachment for the turn.) This power can't be used if Blastoise is Asleep, Confused, or Paralyzed.",
					"type": "Pokémon Power",
				},
			},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Hydro Pump",
					"cost":                []string{"Water", "Water", "Water"},
					"convertedEnergyCost": 3,
					"damage":              "40+",
					"text":                "Does 40 damage plus 10 more damage for each Water Energy attached to Blastoise but not used to pay for this attack's Energy cost. Extra Water Energy after the 2nd doesn't count.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Lightning",
					"value": "×2",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   3,
			fieldNameNumber:                 "2",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "A brutal Pokémon with pressurized water jets on its shell. They are used for high-speed tackles.",
			fieldNameNationalPokedexNumbers: []int{9},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/2.png",
				"large": "https://images.pokemontcg.io/base1/2_hires.png",
			},
		},
		{
			fieldNameId:        "base1-3",
			fieldNameName:      "Chansey",
			fieldNameSupertype: "Pokémon",
			fieldNameSubtypes:  []string{"Basic"},
			fieldNameLevel:     "55",
			fieldNameHp:        "120",
			fieldNameTypes:     []string{"Colorless"},
			fieldNameEvolvesTo: []string{"Blissey"},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Scrunch",
					"cost":                []string{"Colorless", "Colorless"},
					"convertedEnergyCost": 2,
					"damage":              "",
					"text":                "Flip a coin. If heads, prevent all damage done to Chansey during your opponent's next turn. (Any other effects of attacks still happen.)",
				},
				{
					"name":                "Double-edge",
					"cost":                []string{"Colorless", "Colorless", "Colorless", "Colorless"},
					"convertedEnergyCost": 4,
					"damage":              "80",
					"text":                "Chansey does 80 damage to itself.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Fighting",
					"value": "×2",
				},
			},
			fieldNameResistances: []map[string]interface{}{
				{
					"type":  "Psychic",
					"value": "-30",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless"},
			fieldNameConvertedRetreatCost:   1,
			fieldNameNumber:                 "3",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "A rare and elusive Pokémon that is said to bring happiness to those who manage to catch it.",
			fieldNameNationalPokedexNumbers: []int{113},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/3.png",
				"large": "https://images.pokemontcg.io/base1/3_hires.png",
			},
		},
		{
			fieldNameId:          "base1-4",
			fieldNameName:        "Charizard",
			fieldNameSupertype:   "Pokémon",
			fieldNameSubtypes:    []string{"Stage 2"},
			fieldNameLevel:       "76",
			fieldNameHp:          "120",
			fieldNameTypes:       []string{"Fire"},
			fieldNameEvolvesFrom: "Charmeleon",
			fieldNameAbilities: []map[string]interface{}{
				{
					"name": "Energy Burn",
					"text": "As often as you like during your turn (before your attack), you may turn all Energy attached to Charizard into Fire Energy for the rest of the turn. This power can't be used if Charizard is Asleep, Confused, or Paralyzed.",
					"type": "Pokémon Power",
				},
			},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Fire Spin",
					"cost":                []string{"Fire", "Fire", "Fire", "Fire"},
					"convertedEnergyCost": 4,
					"damage":              "100",
					"text":                "Discard 2 Energy cards attached to Charizard in order to use this attack.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Water",
					"value": "×2",
				},
			},
			fieldNameResistances: []map[string]interface{}{
				{
					"type":  "Fighting",
					"value": "-30",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   3,
			fieldNameNumber:                 "4",
			fieldNameArtist:                 "Mitsuhiro Arita",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "Spits fire that is hot enough to melt boulders. Known to unintentionally cause forest fires.",
			fieldNameNationalPokedexNumbers: []int{6},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/4.png",
				"large": "https://images.pokemontcg.io/base1/4_hires.png",
			},
		},
		{
			fieldNameId:        "base1-5",
			fieldNameName:      "Clefairy",
			fieldNameSupertype: "Pokémon",
			fieldNameSubtypes:  []string{"Basic"},
			fieldNameLevel:     "14",
			fieldNameHp:        "40",
			fieldNameTypes:     []string{"Colorless"},
			fieldNameEvolvesTo: []string{"Clefable"},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Sing",
					"cost":                []string{"Colorless"},
					"convertedEnergyCost": 1,
					"damage":              "",
					"text":                "Flip a coin. If heads, the Defending Pokémon is now Asleep.",
				},
				{
					"name":                "Metronome",
					"cost":                []string{"Colorless", "Colorless", "Colorless"},
					"convertedEnergyCost": 3,
					"damage":              "",
					"text":                "Choose 1 of the Defending Pokémon's attacks. Metronome copies that attack except for its Energy costs and anything else required in order to use that attack, such as discarding Energy cards. (No matter what type the Defending Pokémon is, Clefairy's type is still Colorless.)",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Fighting",
					"value": "×2",
				},
			},
			fieldNameResistances: []map[string]interface{}{
				{
					"type":  "Psychic",
					"value": "-30",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless"},
			fieldNameConvertedRetreatCost:   1,
			fieldNameNumber:                 "5",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "Its magical and cute appeal has many admirers. It is rare and found only in certain areas.",
			fieldNameNationalPokedexNumbers: []int{35},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/5.png",
				"large": "https://images.pokemontcg.io/base1/5_hires.png",
			},
		},
		{
			fieldNameId:          "base1-6",
			fieldNameName:        "Gyarados",
			fieldNameSupertype:   "Pokémon",
			fieldNameSubtypes:    []string{"Stage 1"},
			fieldNameLevel:       "41",
			fieldNameHp:          "100",
			fieldNameTypes:       []string{"Water"},
			fieldNameEvolvesFrom: "Magikarp",
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Dragon Rage",
					"cost":                []string{"Water", "Water", "Water"},
					"convertedEnergyCost": 3,
					"damage":              "50",
					"text":                "",
				},
				{
					"name":                "Bubblebeam",
					"cost":                []string{"Water", "Water", "Water", "Water"},
					"convertedEnergyCost": 4,
					"damage":              "40",
					"text":                "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Grass",
					"value": "×2",
				},
			},
			fieldNameResistances: []map[string]interface{}{
				{
					"type":  "Fighting",
					"value": "-30",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   3,
			fieldNameNumber:                 "6",
			fieldNameArtist:                 "Mitsuhiro Arita",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "Rarely seen in the wild. Huge and vicious, it is capable of destroying entire cities in a rage.",
			fieldNameNationalPokedexNumbers: []int{130},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/6.png",
				"large": "https://images.pokemontcg.io/base1/6_hires.png",
			},
		},
		{
			fieldNameId:        "base1-7",
			fieldNameName:      "Hitmonchan",
			fieldNameSupertype: "Pokémon",
			fieldNameSubtypes:  []string{"Basic"},
			fieldNameLevel:     "33",
			fieldNameHp:        "70",
			fieldNameTypes:     []string{"Fighting"},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Jab",
					"cost":                []string{"Fighting"},
					"convertedEnergyCost": 1,
					"damage":              "20",
					"text":                "",
				},
				{
					"name":                "Special Punch",
					"cost":                []string{"Fighting", "Fighting", "Colorless"},
					"convertedEnergyCost": 3,
					"damage":              "40",
					"text":                "",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Psychic",
					"value": "×2",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   2,
			fieldNameNumber:                 "7",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "While seeming to do nothing, it fires punches in lightning-fast volleys that are impossible to see.",
			fieldNameNationalPokedexNumbers: []int{107},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/7.png",
				"large": "https://images.pokemontcg.io/base1/7_hires.png",
			},
		},
		{
			fieldNameId:          "base1-8",
			fieldNameName:        "Machamp",
			fieldNameSupertype:   "Pokémon",
			fieldNameSubtypes:    []string{"Stage 2"},
			fieldNameLevel:       "67",
			fieldNameHp:          "100",
			fieldNameTypes:       []string{"Fighting"},
			fieldNameEvolvesFrom: "Machoke",
			fieldNameAbilities: []map[string]interface{}{
				{
					"name": "Strikes Back",
					"text": "Whenever your opponent's attack damages Machamp (even if Machamp is Knocked Out), this power does 10 damage to the attacking Pokémon. (Don't apply Weakness and Resistance.) This power can't be used if Machamp is Asleep, Confused, or Paralyzed when your opponent attacks.",
					"type": "Pokémon Power",
				},
			},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Seismic Toss",
					"cost":                []string{"Fighting", "Fighting", "Fighting", "Colorless"},
					"convertedEnergyCost": 4,
					"damage":              "60",
					"text":                "",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Psychic",
					"value": "×2",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   3,
			fieldNameNumber:                 "8",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "Using its amazing muscles, it throws powerful punches that can knock its victim clear over the horizon.",
			fieldNameNationalPokedexNumbers: []int{68},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/8.png",
				"large": "https://images.pokemontcg.io/base1/8_hires.png",
			},
		},
		{
			fieldNameId:          "base1-9",
			fieldNameName:        "Magneton",
			fieldNameSupertype:   "Pokémon",
			fieldNameSubtypes:    []string{"Stage 1"},
			fieldNameLevel:       "28",
			fieldNameHp:          "60",
			fieldNameTypes:       []string{"Lightning"},
			fieldNameEvolvesFrom: "Magnemite",
			fieldNameEvolvesTo:   []string{"Magnezone"},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Thunder Wave",
					"cost":                []string{"Lightning", "Lightning", "Colorless"},
					"convertedEnergyCost": 3,
					"damage":              "30",
					"text":                "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.",
				},
				{
					"name":                "Selfdestruct",
					"cost":                []string{"Lightning", "Lightning", "Colorless", "Colorless"},
					"convertedEnergyCost": 4,
					"damage":              "80",
					"text":                "Does 20 damage to each Pokémon on each player's Bench. (Don't apply Weakness and Resistance for Benched Pokémon.) Magneton does 80 damage to itself.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Fighting",
					"value": "×2",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless"},
			fieldNameConvertedRetreatCost:   1,
			fieldNameNumber:                 "9",
			fieldNameArtist:                 "Keiji Kinebuchi",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "Formed by several Magnemites linked together. It frequently appears when sunspots flare up.",
			fieldNameNationalPokedexNumbers: []int{82},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/9.png",
				"large": "https://images.pokemontcg.io/base1/9_hires.png",
			},
		},
		{
			fieldNameId:        "base1-10",
			fieldNameName:      "Mewtwo",
			fieldNameSupertype: "Pokémon",
			fieldNameSubtypes:  []string{"Basic"},
			fieldNameLevel:     "53",
			fieldNameHp:        "60",
			fieldNameTypes:     []string{"Psychic"},
			fieldNameAttacks: []map[string]interface{}{
				{
					"name":                "Psychic",
					"cost":                []string{"Psychic", "Colorless"},
					"convertedEnergyCost": 2,
					"damage":              "10+",
					"text":                "Does 10 damage plus 10 more damage for each Energy card attached to the Defending Pokémon.",
				},
				{
					"name":                "Barrier",
					"cost":                []string{"Psychic", "Psychic"},
					"convertedEnergyCost": 2,
					"damage":              "",
					"text":                "Discard 1 Psychic Energy card attached to Mewtwo in order to prevent all effects of attacks, including damage, done to Mewtwo during your opponent's next turn.",
				},
			},
			fieldNameWeaknesses: []map[string]interface{}{
				{
					"type":  "Psychic",
					"value": "×2",
				},
			},
			fieldNameRetreatCost:            []string{"Colorless", "Colorless", "Colorless"},
			fieldNameConvertedRetreatCost:   3,
			fieldNameNumber:                 "10",
			fieldNameArtist:                 "Ken Sugimori",
			fieldNameRarity:                 "Rare Holo",
			fieldNameFlavorText:             "A scientist created this Pokémon after years of horrific gene-splicing and DNA engineering experiments.",
			fieldNameNationalPokedexNumbers: []int{150},
			fieldNameLegalities: map[string]string{
				"unlimited": "Legal",
			},
			fieldNameImages: map[string]string{
				"small": "https://images.pokemontcg.io/base1/10.png",
				"large": "https://images.pokemontcg.io/base1/10_hires.png",
			},
		},
	}

	fields = []api.Field{
		{Name: fieldNameId, Type: fieldTypeString},
		{Name: fieldNameName, Type: fieldTypeString},
		{Name: fieldNameSupertype, Type: fieldTypeString},
		{Name: fieldNameSubtypes, Type: fieldTypeArrayString},
		{Name: fieldNameLevel, Type: fieldTypeString},
		{Name: fieldNameHp, Type: fieldTypeString},
		{Name: fieldNameTypes, Type: fieldTypeArrayString},
		{Name: fieldNameEvolvesFrom, Type: fieldTypeString},
		{Name: fieldNameAbilities, Type: fieldTypeString},
		{Name: fieldNameAttacks, Type: fieldTypeString},
		{Name: fieldNameWeaknesses, Type: fieldTypeString},
		{Name: fieldNameResistances, Type: fieldTypeString},
		{Name: fieldNameRetreatCost, Type: fieldTypeString},
		{Name: fieldNameConvertedRetreatCost, Type: fieldTypeInt32},
		{Name: fieldNameNumber, Type: fieldTypeString},
		{Name: fieldNameArtist, Type: fieldTypeString},
		{Name: fieldNameRarity, Type: fieldTypeString},
		{Name: fieldNameFlavorText, Type: fieldTypeString},
		{Name: fieldNameNationalPokedexNumbers, Type: fieldTypeArrayString},
		{Name: fieldNameLegalities, Type: fieldTypeString},
		{Name: fieldNameImages, Type: fieldTypeString},
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
