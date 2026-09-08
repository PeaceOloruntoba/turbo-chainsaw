import { S3ClientUploadHandler } from '@payloadcms/storage-s3/client'

// Hand-maintained, not auto-generated.
//
// `payload generate:importmap` currently fails on Windows with newer Node
// versions due to an open Payload core bug (ERR_REQUIRE_ASYNC_MODULE /
// ERR_REQUIRE_ESM depending on Node version — see
// https://github.com/payloadcms/payload/issues/16378). Rather than fight
// that, this file is maintained by hand instead.
//
// This project only uses one plugin that registers an admin UI component:
// @payloadcms/storage-s3, which needs its upload handler mapped below. If
// you add another plugin or custom admin component later and see a
// "PayloadComponent not found in importMap" error again, the error message
// tells you the exact key/path to add here.
export const importMap = {
  '@payloadcms/storage-s3/client#S3ClientUploadHandler': S3ClientUploadHandler,
}