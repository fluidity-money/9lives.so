package main

import (
	"encoding/csv"
	"fmt"
	"os"

	ethCrypto "github.com/ethereum/go-ethereum/crypto"
)

func main() {
	if len(os.Args) != 4 {
		panic("Missing arguments. Name, description and seed are necessary")
	}

	identifier := ethCrypto.Keccak256([]byte(os.Args[1] + os.Args[2] + os.Args[3]))[:8]

	// Prepare the data to write
	data := []string{
		os.Args[1],                      // Name
		os.Args[2],                      // Description
		os.Args[3],                      // Seed
		fmt.Sprintf("0x%x", identifier), // Identifier in hex format
	}

	// Open the CSV file in append mode
	file, err := os.OpenFile("outcomes.csv", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(fmt.Sprintf("Error opening file: %s", err))
	}
	defer file.Close()

	// Create a CSV writer
	writer := csv.NewWriter(file)

	// Write the data to the CSV file
	if err := writer.Write(data); err != nil {
		panic(fmt.Sprintf("Error writing to CSV: %s", err))
	}

	// Flush the writer to ensure all data is written
	writer.Flush()

	// Check for any error during the flush
	if err := writer.Error(); err != nil {
		panic(fmt.Sprintf("Error flushing data to CSV: %s", err))
	}

	// Print confirmation
	fmt.Println("Data appended to outcomes.csv:")
	fmt.Printf("Name: %s\nDescription: %s\nSeed: %s\nIdentifier: 0x%x\n", os.Args[1], os.Args[2], os.Args[3], identifier)
}
