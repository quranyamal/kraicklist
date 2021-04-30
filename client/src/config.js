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
      REGION: "me-south-1",
      USER_POOL_ID: "YOUR_COGNITO_USER_POOL_ID",
      APP_CLIENT_ID: "YOUR_COGNITO_APP_CLIENT_ID",
      IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID",
    },
  };
  
  export default config;