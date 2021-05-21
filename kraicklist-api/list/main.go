package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

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

func listProduct() string {

	expr, err := expression.NewBuilder().Build()
	if err != nil {
		fmt.Println(err)
	}

	input := &dynamodb.ScanInput{
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression:          expr.Filter(),
		TableName:                 aws.String(os.Getenv("DYNAMODB_TABLE")),
	}

	result, err := svc.Scan(input)

	// Checking for errors, return error
	if err != nil {
		fmt.Println("Query API call failed: ", err.Error())
	}

	unmarshalledResult := unmarshal(result)

	return unmarshalledResult
}

func HandleLambdaEvent(ctx context.Context) (Response, error) {

	// result := listProduct()

	// fmt.Println("result:")
	// fmt.Println(result)

	// todo: fix
	client := &http.Client{}
	url := os.Getenv("ELASTICSEARCH_DOMAIN") + "/products/_search?size=12"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte("elastic:zC9/k@v{=ch%")))
	// req.Header.Set("Authorization", "Basic ZWxhc3RpYzp6Qzkva0B2ez1jaCU=")

	apiResponse, err := client.Do(req)
	if err != nil {
		fmt.Print(err.Error())
		os.Exit(123)
	}
	defer apiResponse.Body.Close()

	bodyBytes, err := ioutil.ReadAll(apiResponse.Body)
	if err != nil {
		fmt.Print(err.Error())
		os.Exit(1234)
	}

	fmt.Print("bodyBytes v2")
	fmt.Print(string(bodyBytes))

	bodyString := string(bodyBytes)

	resp := Response{
		StatusCode:      200,
		IsBase64Encoded: false,
		Body:            bodyString,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
			"X-HTHC-Func-Reply":           "list-handler",
		},
	}

	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}
