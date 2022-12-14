import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'certificate',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dynamodb-local', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      binaryMediaTypes: ['*/*'],
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      bucketName: 'certificate-template-paulozy',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ["dynamodb:*"],
        Resource: ["*"],
      },
      {
        Effect: 'Allow',
        Action: ["s3:*"],
        Resource: ["*"],
      }
    ]
  },
  // import the function via paths
  functions: {
    hello: {
      handler: 'src/functions/hello.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'hello',
            cors: true,
          }
        }
      ]
    },
    generateCertificate: {
      handler: 'src/functions/generateCertificate.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'generateCertificate',
            cors: true,
          }
        }
      ]
    }
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true
      }
    },
    bucketName: 'certificate-template-paulozy',
  },
  resources: {
    Resources: {
      dbCertificateUsers: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'users_certificate',
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            }
          ]
        }
      },
      templateBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'certificate-template-paulozy',
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
