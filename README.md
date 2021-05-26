# KraickList

Haraj take home challenge. A simple web app to search ads.
What have been changed:
- Refactor solution leveraging Amazon Web Services
- Search feature using Elasticsearch with fuzzy query
- Develop ES bulk indexer to load large data (prevent '429 too many request' error)

Live version can be found [here](http://heroj.com.s3-website.me-south-1.amazonaws.com/)

## Pre-requisites
- AWS CLI & its credential
- Serverless framework
- Golang compiler
- Node & npm

## Quick Start
1. Setup pre-requisites
2. Store Elasticsearch username (/kraicklist/prod/es/username) & password (/kraicklist/prod/es/password) in [SSM parameter store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
3. Deploy Elasticsearch service
```
cd ./elasticsearch
sls deploy
```
4. Build & Deploy APIs
```
cd ../api
set GOOS=linux
go build -ldflags="-s -w" -o bin/list list/main.go
go build -ldflags="-s -w" -o bin/search search/main.go
go build -ldflags="-s -w" -o bin/get get/main.go
sls deploy
```
5. Build website files host in S3
```
cd ../client
npm run build
aws s3api create-bucket --bucket [bucket-name]
aws s3 sync build/ s3://[bucket-name]
```
6. Enable website hosting for S3 bucket - [ref](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EnableWebsiteHosting.html/)
7. Import data
```
cd ../data-util
npm install
node es-bulk-indexer.js
```
8. Access website, link can be viewed on [S3 console](https://s3.console.aws.amazon.com/s3/home)

## Future Improvements
- Functional
    - Search filters
    - Product recommendation
    - Predictive typing
    - Infinite scroll / pagination
- Non-Functional
    - Use more elasticsearch data node / replication (performance)
    - Use CDN (performance)
    - Use S3 transfer accelleration (performance)
    - Implement WAF (security)
    - Use single 'makefile' (CI/CD)