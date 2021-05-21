const config = {
    s3: {
      REGION: "me-south-1",
      BUCKET: "hthc-app-uploads",
    },
    apiGateway: {
      REGION: "me-south-1",
      URL: "https://chtigmoe7g.execute-api.me-south-1.amazonaws.com",
    },
    elasticsearchLocal: {
      URL: "http://localhost:9200",
    },
    elasticsearchLive: {
      URL: "https://search-kraicklist-kbskg2co6dxfa7ce6dklrnlemm.me-south-1.es.amazonaws.com",
    },
    cognito: {
      REGION: "ap-southeast-1",
      USER_POOL_ID: "ap-southeast-1_juoiN7kLV",
      APP_CLIENT_ID: "7gu6iag2s52c69r6m4etv45k7b",
      IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID",
    },
  };
  
  export default config;