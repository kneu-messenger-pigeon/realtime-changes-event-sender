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
 * @param form Object
 * @param headers Headers
 * @return {Promise}
 */
async function sendMessage(form, headers) {
    if (!Object.keys(form).length) {
        return new Promise.resolve();
    }

    let eventData = {
        timestamp: Date.now() / 1E3 | 0,
        ip:  headers.get("Cf-Connecting-Ip"),
        referer: headers.get("Referer"),
        form: form,
    }

    return clientSqs.send(new SendMessageCommand({
        // use wrangler secrets to provide this global variable
        QueueUrl: AwsSqsQueueUrl,
        MessageBody: JSON.stringify(eventData),
        MessageGroupId: "dekanat",
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