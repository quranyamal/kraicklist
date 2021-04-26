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

type MyResponse struct {
	Message string `json:"Result:"`
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

func unmarshal(scanOutput *dynamodb.ScanOutput) (string, error) {

	var recordArray []Record

	for _, i := range scanOutput.Items {
		record := Record{}
		err = dynamodbattribute.UnmarshalMap(i, &record)

		if err != nil {
			fmt.Println("Got error unmarshalling: ", err.Error())
			return "", err
		}

		recordArray = append(recordArray, record)
	}

	recJson, err := json.Marshal(recordArray)
	if err != nil {
		fmt.Println("Got error marshaling result: ", err.Error())
		return "", err
	}

	return string(recJson), nil
}

func search(query string) (string, error) {

	filt := expression.Name("title").Contains(query)
	expr, err := expression.NewBuilder().WithFilter(filt).Build()
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	input := &dynamodb.ScanInput{
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression:          expr.Filter(),
		TableName:                 aws.String("hthc-kraicklist-data"),
	}

	result, err := svc.Scan(input)
	if err != nil {
		fmt.Println("Query API call failed: ", err.Error())
		return "", err
	}

	unmarshalledResult, err := unmarshal(result)
	if err != nil {
		return "", err
	}

	return unmarshalledResult, nil
}

func HandleApiGatewayEvent(req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	searchResult, err := search(req.QueryStringParameters["q"])

	if err != nil {
		fmt.Println("Search error: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: searchResult,
	}, nil
}

func main() {
	lambda.Start(HandleApiGatewayEvent)
}
