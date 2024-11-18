const secretName = process.env.secretName;
const hosttype = process.env.hostType;

module.exports = async (savelog, cbfunc) => {
    if (!secretName) {
        return;
    }

    let secret;

    switch (hosttype.toLocaleLowerCase()) {
        case "aws":
            secret = await awsSecrets();
            break;
        case "gcp":
            secret = await gcpSecrets();
            break;
        case "azure":
            secret = await azureSecrets();
            break;
        default:
            break;
    }

    if (cbfunc) {
        cbfunc(secret);
    }

    // console.log(secret);
    return secret;
};

async function awsSecrets() {
    const {
        SecretsManagerClient,
        GetSecretValueCommand
    } = require("@aws-sdk/client-secrets-manager");

    const awsClient = new SecretsManagerClient({ region: "us-west-2" });
    let response;

    try {
        response = await awsClient.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT"
            })
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        savelog("useSecrets.js", "useSecrets", "query", null, error);
    }

    return response ? JSON.parse(response.SecretString) : null;
}

async function gcpSecrets() {
    // https://github.com/googleapis/google-cloud-node/blob/main/packages/google-cloud-secretmanager/samples/generated/v1/secret_manager_service.access_secret_version.js
    // https://cloud.google.com/secret-manager/docs/reference/libraries#client-libraries-install-go
    const { SecretManagerServiceClient } =
        require("@google-cloud/secret-manager").v1;

    const secretmanagerClient = new SecretManagerServiceClient();
    const projectNumber = process.env.GOOGLE_CLOUD_PROJECT;
    const response = await secretmanagerClient.accessSecretVersion({
        name: `projects/${projectNumber}/secrets/${secretName}/versions/latest`
    });
    // console.log(response[0].payload.data.toString());

    return response ? JSON.parse(response[0].payload.data.toString()) : null;
}

async function azureSecrets() {
    // Eventually Azure Secrets code will go here.
}
