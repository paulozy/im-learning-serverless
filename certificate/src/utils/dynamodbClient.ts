import { DynamoDB } from 'aws-sdk'

const options = {
  region: "localhost",
  endpoint: "http://localhost:8000",
}

const ifOff = () => {
  return process.env.IS_OFFLINE
}

export const document = ifOff() ? new DynamoDB.DocumentClient(options) : new DynamoDB.DocumentClient()