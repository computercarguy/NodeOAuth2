// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

//const useAwsSecrets = require("../hooks/useAwsSecrets");

const {
    SecretsManagerClient,
    GetSecretValueCommand,
  } = require("@aws-sdk/client-secrets-manager");  

  const secret_name = "NodeOAuth2";
  
  const client = new SecretsManagerClient({
    region: "us-west-2",
  });
  
  module.exports = async (cbfunc) => {
    
    let response;

    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            }));
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }

    const secret = JSON.parse(response.SecretString);
    
    if (cbfunc) {
        cbfunc(secret);
    }

    return secret;
}