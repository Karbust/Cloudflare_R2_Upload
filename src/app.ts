import {
    ListBucketsCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    PutObjectCommandInput,
    S3Client
} from '@aws-sdk/client-s3'
import fs  from 'fs'
import md5 from 'md5'

import {
    cloudflareAccountId,
    cloudflareR2AccessKeyId,
    cloudflareR2SecretAccessKey,
    cloudflareR2BucketName
} from './config.js'

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: cloudflareR2AccessKeyId,
        secretAccessKey: cloudflareR2SecretAccessKey,
    },
});

/*console.log(
    await S3.send(
        new ListBucketsCommand('')
    )
);

console.log(
    await S3.send(
        new ListObjectsV2Command({ Bucket: cloudflareR2BucketName })
    )
);*/

const getFileList = (dirName) => {
    let files = [];
    const items = fs.readdirSync(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...getFileList(`${dirName}/${item.name}`)];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }

    return files;
};

const files: string[] = getFileList('uploads');

try {
    for (const file of files) {
        const fileStream = fs.readFileSync(file);
        const fileName = file.replace(/uploads\//g, '');

        if (fileName.includes('.gitkeep'))
            continue;

        console.log(fileName)

        const uploadParams: PutObjectCommandInput = {
            Bucket: cloudflareR2BucketName,
            Key: fileName,
            Body: fileStream,
            ContentLength: fs.statSync(file).size,
            ContentType: 'application/octet-stream'
        };

        const cmd = new PutObjectCommand(uploadParams);

        const digest = md5(fileStream);

        cmd.middlewareStack.add((next) => async (args: any) => {
            args.request.headers['if-none-match'] = `"${digest}"`;
            return await next(args);
        }, {
            step: 'build',
            name: 'addETag'
        })

        const data = await S3.send(cmd);
        console.log(`Success - Status Code: ${data.$metadata.httpStatusCode}`);
    }
} catch (err) {
    if (err.hasOwnProperty('$metadata')) {
        console.error(`Error - Status Code: ${err.$metadata.httpStatusCode} - ${err.message}`);
    } else {
        console.error('Error', err);
    }
}
