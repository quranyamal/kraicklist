const config = {
    s3: {
      REGION: "me-south-1",
      BUCKET: "hthc-app-uploads",
    },
    apiGateway: {
      REGION: "me-south-1",
      URL: "https://ao7kmvfls9.execute-api.me-south-1.amazonaws.com/prod",
    },
    cognito: {
      REGION: "ap-southeast-1",
      USER_POOL_ID: "ap-southeast-1_juoiN7kLV",
      APP_CLIENT_ID: "7gu6iag2s52c69r6m4etv45k7b",
      IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID",
    },
  };
  
  export default config;