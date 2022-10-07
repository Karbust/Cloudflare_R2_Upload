# Cloudflare R2 Upload

## Introduction

This is a simple script to upload files to Cloudflare R2. It is written in TypeScript and uses `@aws-sdk/client-s3`.

**Note:** Uploads using signed urls are not covered in this script.

## Getting Started

Install NodeJS: https://nodejs.org/en/download/ or https://github.com/coreybutler/nvm-windows _(not required, but usefull to manage multiple NodeJS versions in the same system)_\
Install Yarn: https://yarnpkg.com/getting-started/install

Minimum NodeJS Version: **10**
**Note:** This code was developed and tested with Node v18.10.0.

Clone the repository:
```bash
git clone https://github.com/Karbust/Cloudflare_R2_Upload.git
```
Install the dependencies:

```bash
yarn install
```

Follow this instructions to get the necessary information about the API Tokens: https://developers.cloudflare.com/r2/data-access/s3-api/tokens/

Rename `.env.sample` to `.env` and edit with your own values.

## Available Commands

| Command                 | Purpose                                                                   |
|-------------------------|---------------------------------------------------------------------------|
| yarn run dev            | Starts the application in development mode and monitors for file changes. |
| yarn run build          | Builds a production bundle in javascript.                                 |

## Using

Place the files you want to upload inside the `uploads` folder. \
All files inside this folder will be uploaded to the Cloudflare R2 Storage and the hierarchic structure will be kept.

The code is able to prevent duplicate files uploads (using the [conditional header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests) [`If-None-Match`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match)), so if you run the code multiple times, it will only upload the files that are not already uploaded.

## Error Messages

If you get an error message like this:

```text
Status Code: 412 - At least one of the pre-conditions you specified did not hold.
```

That means the file already exists with the same ETag (aka MD5 Hash) in the Cloudflare R2 Storage.

Other error messages are not caught and debug may be in order to figure them out individually.
