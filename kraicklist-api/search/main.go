package main

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/service/dynamodb/expression"
)

var sess, err = session.NewSession(&aws.Config{
	Region: aws.String("me-south-1")},
)

var svc = dynamodb.New(sess)

type MyEvent struct {
	Query string `json:"q"`
}

type Response events.APIGatewayProxyResponse
type Request events.APIGatewayProxyRequest

type Record struct {
	ID        int64    `json:"id"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	ThumbURL  string   `json:"thumb_url"`
	Tags      []string `json:"tags"`
	UpdatedAt int64    `json:"updated_at"`
	ImageURLs []string `json:"image_urls"`
}

func unmarshal(scanOutput *dynamodb.ScanOutput) string {

	var recordArray []Record

	for _, i := range scanOutput.Items {
		record := Record{}
		err = dynamodbattribute.UnmarshalMap(i, &record)

		if err != nil {
			fmt.Println("Got error unmarshalling: ", err.Error())
		}

		recordArray = append(recordArray, record)
	}

	recJson, err := json.Marshal(recordArray)
	if err != nil {
		fmt.Println(err)
	}

	return string(recJson)

}

func search(query string) string {

	filt := expression.Name("title").Contains(query)
	expr, err := expression.NewBuilder().WithFilter(filt).Build()
	if err != nil {
		fmt.Println(err)
	}

	input := &dynamodb.ScanInput{
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression:          expr.Filter(),
		TableName:                 aws.String("hthc-kraicklist-data"),
	}

	result, err := svc.Scan(input)

	// Checking for errors, return error
	if err != nil {
		fmt.Println("Query API call failed: ", err.Error())
	}

	unmarshalledResult := unmarshal(result)

	return unmarshalledResult
}

func HandleLambdaEvent(request Request) (Response, error) {

	//searchResult := search(event.Query)
	fmt.Println("requst:")
	fmt.Println(json.MarshalIndent(request, "", "\t"))

	fmt.Println("request.PathParameters[q]")
	fmt.Println(request.PathParameters["q"])
	searchResult := search(request.PathParameters["q"])

	fmt.Println("searchResult:")
	fmt.Println(searchResult)

	resp := Response{
		StatusCode:      200,
		IsBase64Encoded: false,
		Body:            searchResult,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
			"X-HTHC-Func-Reply":           "search-handler",
		},
	}

	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}
