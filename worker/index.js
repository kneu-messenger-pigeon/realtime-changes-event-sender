import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const clientSqs = new SQSClient({
    region: AwsRegion,
    credentialDefaultProvider: myCredentialProvider
});

function myCredentialProvider() {
    return {
        // use wrangler secrets to provide these global variables
        accessKeyId: AwsAccessKeyId,
        secretAccessKey: AwsSecretAccessKey,
    }
}

/**
 * @param payload Object
 * @param headers Headers
 * @return {Promise}
 */
async function sendMessage(payload, headers) {
    if (!Object.keys(payload).length) {
        return new Promise.resolve();
    }

    payload.IP = headers.get("Cf-Connecting-Ip")
    payload.Referer = headers.get("Referer")

    return clientSqs.send(new SendMessageCommand({
        // use wrangler secrets to provide this global variable
        QueueUrl: AwsSqsQueueUrl,
        MessageBody: JSON.stringify(payload),
    }));
}

const corsHeaders = {
    "Allow": "HEAD,POST,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
}

/**
 *
 * @param event Event
 * @return {Promise<Response>}
 */
async function handleRequest (event) {
    const { request } = event;

    if (event.request.method === 'POST') {
        let payload = await request.json()
        event.waitUntil(sendMessage(payload, request.headers))
    }

    return new Response(null, {
        headers: corsHeaders,
    })
}


addEventListener('fetch',   event => {
    event.respondWith(handleRequest(event))
})