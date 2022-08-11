import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from "aws-sdk";
import { PDFDocument, TextAlignment } from 'pdf-lib';

const s3 = new S3();

interface ICreateCertificate {
  id: string;
  name: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {

  try {
    const body = JSON.parse(Buffer.from(event.body, 'base64').toString()) as ICreateCertificate

    const template = await s3.getObject({
      Bucket: process.env.bucketName,
      Key: 'template-with-form.pdf'
    }).promise()

    const pdfDoc = await PDFDocument.load(template.Body.toString('base64'))

    const form = pdfDoc.getForm();

    form.getTextField('name').setAlignment(TextAlignment.Center);
    form.getTextField('name').setText(body.name);
    form.getTextField('date').setAlignment(TextAlignment.Center);
    form.getTextField('date').setText(new Date().toLocaleDateString());
    form.getTextField('id').setAlignment(TextAlignment.Center);
    form.getTextField('id').setText(body.id);

    form.flatten()

    const pdfOut = await pdfDoc.saveAsBase64()

    // await document.put({
    //   TableName: 'users_certificate',
    //   Item: {
    //     body.id,
    //     body.name,
    //     created_at: new Date().getTime()
    //   }
    // }).promise()

    return {
      statusCode: 201,
      body: pdfOut,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
      }
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
      }),
    }
  }
};