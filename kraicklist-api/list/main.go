package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleLambdaEvent(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	client := &http.Client{}
	url := os.Getenv("ELASTICSEARCH_DOMAIN") + "/products/_search?size=12"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Basic ZWxhc3RpYzp6Qzkva0B2ez1jaCU=")

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

	bodyString := string(bodyBytes)
	fmt.Print("response body:")
	fmt.Print(bodyString)

	resp := events.APIGatewayProxyResponse{
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
