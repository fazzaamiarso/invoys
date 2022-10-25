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
  businessName,
}: {
  customerName: string;
  invoiceNumber: string;
  invoiceViewUrl: string;
  businessName: string;
}) => {
  try {
    console.log(invoiceViewUrl);
    const { requestId } = await courierClient.send({
      message: {
        to: {
          email: 'fazzarazaq1@gmail.com',
        },
        template: INVOICE_TEMPLATE_ID,
        // Data is needed for courier email desginer
        data: {
          customerName,
          invoiceNumber,
          invoiceViewUrl,
          businessName,
        },
      },
    });
    return requestId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
};
