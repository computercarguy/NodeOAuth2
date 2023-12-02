const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");  

const secret_name = "NodeOAuth2";

const client = new SecretsManagerClient({region: "us-west-2"});

module.exports = async (cbfunc) => {
    let response;

    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT"
            })
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }

    if (!response) {
        return;
    }

    const secret = JSON.parse(response.SecretString);

    if (cbfunc) {
        cbfunc(secret);
    }

    return secret;
}