package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/expression"
)

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

func searchFromDynamoDB(query string) *dynamodb.ScanOutput {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("me-south-1")},
	)

	fmt.Println("Hello, World!")

	svc := dynamodb.New(sess)

	filt := expression.Name("title").Contains(query)
	proj := expression.NamesList(expression.Name("title"), expression.Name("content"))
	expr, err := expression.NewBuilder().WithFilter(filt).WithProjection(proj).Build()
	if err != nil {
		fmt.Println(err)
	}

	input := &dynamodb.ScanInput{
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression:          expr.Filter(),
		ProjectionExpression:      expr.Projection(),
		TableName:                 aws.String("hthc-kraicklist-data"),
	}

	result, err := svc.Scan(input)

	return result
}

func HandleLambdaEvent(event MyEvent) (MyResponse, error) {

	retVal := searchFromDynamoDB(event.Query)
	fmt.Println(retVal)

	return MyResponse{Message: fmt.Sprintf("%#v", retVal)}, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}
