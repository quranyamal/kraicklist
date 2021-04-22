package main

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
)

type MyEvent struct {
	Query string `json:"q"`
}

type MyResponse struct {
	Message string `json:"Result:"`
}

type Searcher struct {
	records []Record
}

type Record struct {
	ID        int64    `json:"id"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	ThumbURL  string   `json:"thumb_url"`
	Tags      []string `json:"tags"`
	UpdatedAt int64    `json:"updated_at"`
	ImageURLs []string `json:"image_urls"`
}

func (s *Searcher) Load(filepath string) error {
	// open file
	file, err := os.Open(filepath)
	if err != nil {
		return fmt.Errorf("unable to open source file due: %v", err)
	}
	defer file.Close()
	// read as gzip
	reader, err := gzip.NewReader(file)
	if err != nil {
		return fmt.Errorf("unable to initialize gzip reader due: %v", err)
	}
	// read the reader using scanner to contstruct records
	var records []Record
	cs := bufio.NewScanner(reader)
	for cs.Scan() {
		var r Record
		err = json.Unmarshal(cs.Bytes(), &r)
		if err != nil {
			continue
		}
		records = append(records, r)
	}
	s.records = records

	return nil
}

func (s *Searcher) Search(query string) ([]Record, error) {
	var result []Record
	for _, record := range s.records {
		if strings.Contains(record.Title, query) || strings.Contains(record.Content, query) {
			result = append(result, record)
		}
	}
	return result, nil
}

func HandleLambdaEvent(event MyEvent) (MyResponse, error) {

	// initialize searcher
	searcher := &Searcher{}
	err := searcher.Load("data.gz")
	if err != nil {
		log.Fatalf("unable to load search data due: %v", err)
	}

	// search relevant records
	records, err := searcher.Search(event.Query)
	if err != nil {
		//return
	}

	return MyResponse{Message: fmt.Sprintf("%#v", records)}, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}
