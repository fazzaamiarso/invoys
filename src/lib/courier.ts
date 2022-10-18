import { CourierClient } from '@trycourier/courier';
import { readFileSync } from 'fs';

const INVOICE_TEMPLATE_ID = '357GQPPVGDMYWZJJ3P8EDNR9VAF4';
const authToken = process.env.COURIER_AUTH_TOKEN;
if (!authToken) throw new Error(`Courier authToken not found!`);

const courierClient = CourierClient({
  authorizationToken: authToken,
});

export const sendInvoice = async ({
  customerName,
  invoiceNumber,
  pdfUri,
}: {
  customerName: string;
  invoiceNumber: string;
  pdfUri: string;
}) => {
  try {
    const { requestId } = await courierClient.send({
      message: {
        to: {
          email: 'fazzarazaq1@gmail.com',
        },
        template: INVOICE_TEMPLATE_ID,
        data: {
          customerName,
          invoiceNumber,
        },
        providers: {
          mailjet: {
            override: {
              body: {
                Attachments: [
                  {
                    ContentType: 'application/pdf',
                    Filename: 'test.pdf',
                    Base64Content: pdfUri.replace(
                      'data:application/pdf;filename=generated.pdf;base64,',
                      ''
                    ),
                  },
                ],
              },
            },
          },
        },
      },
    });
    return requestId;
  } catch (e: any) {
    throw new Error(e);
  }
};
