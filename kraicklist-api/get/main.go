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

// func getItem(id int) (string, error) {

// 	// GetItem request
// 	result, err := svc.GetItem(&dynamodb.GetItemInput{
// 		TableName: aws.String("hthc-kraicklist-data"),
// 		Key: map[string]*dynamodb.AttributeValue{
// 			"id": {
// 				S: aws.String(*aws.String(strconv.Itoa(id))),
// 			},
// 		},
// 	})

// 	// Checking for errors, return error
// 	if err != nil {
// 		fmt.Println("Query API call failed: ", err.Error())
// 	}

// 	unmarshalledResult := unmarshal(result)

// 	return unmarshalledResult, nil
// }

func HandleLambdaEvent(request Request) (Response, error) {

	//searchResult := search(event.Query)
	fmt.Println("request:")
	fmt.Println(request, "", "\t")

	fmt.Println("request.PathParameters[id]")
	fmt.Println(request.PathParameters["id"])

	result, err := svc.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String("hthc-kraicklist-data"),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				N: aws.String(request.PathParameters["id"]),
			},
		},
	})

	// result, err := getItem(request.PathParameters["q"])

	// Created item of type Item
	item := Record{}

	// result is of type *dynamodb.GetItemOutput
	// result.Item is of type map[string]*dynamodb.AttributeValue
	// UnmarshallMap result.item into item
	err = dynamodbattribute.UnmarshalMap(result.Item, &item)

	if err != nil {
		fmt.Println("Failed to UnmarshalMap result.Item: ", err)
	}

	marshalledItem, err := json.Marshal(item)

	fmt.Println("result:")
	fmt.Println(result)

	// Checking for errors, return error
	if err != nil {
		fmt.Println(err.Error())
		return Response{StatusCode: 500}, nil
	}

	// Checking type
	if len(result.Item) == 0 {
		return Response{StatusCode: 404}, nil
	}

	resp := Response{
		StatusCode:      200,
		IsBase64Encoded: false,
		Body:            string(marshalledItem),
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
			"X-HTHC-Func-Reply":           "get-handler",
		},
	}

	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}
