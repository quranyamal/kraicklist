package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Response events.APIGatewayProxyResponse
type Request events.APIGatewayProxyRequest

func HandleLambdaEvent(request Request) (Response, error) {

	uri := "https://" + os.Getenv("ELASTICSEARCH_ENDPOINT") + "/products/_search"
	var query = `{"size": 12, "query": { "match": {"title": {`
	query += `"query":"` + request.PathParameters["q"] + `", "fuzziness": 1 }}}}`
	req, _ := http.NewRequest("GET", uri, bytes.NewBuffer([]byte(query)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic ZWxhc3RpYzp6Qzkva0B2ez1jaCU=")

	fmt.Print("query:")
	fmt.Print(query)

	client := &http.Client{}
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
