import { CourierClient } from '@trycourier/courier';
import { getErrorMessage } from '@utils/getErrorMessage';

const INVOICE_TEMPLATE_ID = '357GQPPVGDMYWZJJ3P8EDNR9VAF4';
const authToken = process.env.COURIER_AUTH_TOKEN;

const courierClient = CourierClient({
  authorizationToken: authToken,
});

type CourierInvoiceDatas = {
  customerName: string;
  invoiceNumber: string;
  invoiceViewUrl: string;
  businessName: string;
  emailTo: string;
};
/**
 * Send an Invoice with email template defined in Courier Dashboard
 */
export const sendInvoice = async ({
  customerName,
  invoiceNumber,
  invoiceViewUrl,
  businessName,
  emailTo,
}: CourierInvoiceDatas) => {
  const recipientEmail =
    process.env.NODE_ENV === 'production'
      ? emailTo
      : process.env.COURIER_TEST_EMAIL;
  try {
    const { requestId } = await courierClient.send({
      message: {
        to: {
          email: recipientEmail,
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
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
