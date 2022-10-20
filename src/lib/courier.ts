import { CourierClient } from '@trycourier/courier';

const INVOICE_TEMPLATE_ID = '357GQPPVGDMYWZJJ3P8EDNR9VAF4';
const authToken = process.env.COURIER_AUTH_TOKEN;
if (!authToken) throw new Error(`Courier authToken not found!`);

const courierClient = CourierClient({
  authorizationToken: authToken,
});

export const sendInvoice = async ({
  customerName,
  invoiceNumber,
  invoiceViewUrl,
}: {
  customerName: string;
  invoiceNumber: string;
  invoiceViewUrl: string;
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
          invoiceViewUrl,
        },
      },
    });
    return requestId;
  } catch (e: any) {
    throw new Error(e);
  }
};
