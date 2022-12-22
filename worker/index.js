import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const clientSqs = new SQSClient({
    region: AwsRegion,
    credentialDefaultProvider: myCredentialProvider
});

async function sendMessage(message) {
    return clientSqs.send(new SendMessageCommand({
        // use wrangler secrets to provide this global variable
        QueueUrl: AwsSqsQueueUrl,
        MessageBody: message,
    }))
}

async function myCredentialProvider() {
    return {
        // use wrangler secrets to provide these global variables
        accessKeyId: AwsAccessKeyId,
        secretAccessKey: AwsSecretAccessKey,
    }
}

addEventListener('fetch', event => {
    event.waitUntil(sendMessage("Hello SQS from a Cloudflare Worker"));
    event.respondWith(new Response(null))
})