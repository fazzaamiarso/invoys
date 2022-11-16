import { CourierClient } from '@trycourier/courier';
import { getErrorMessage } from '@utils/getErrorMessage';

const INVOICE_TEMPLATE_ID = '357GQPPVGDMYWZJJ3P8EDNR9VAF4';
const PAYMENT_REMINDER_TEMPLATE_ID = 'B2VWVEF9SAM1QAPX4DC9PHRV8XWF';
const authToken =
  process.env.NODE_ENV === 'development'
    ? process.env.COURIER_AUTH_TEST_TOKEN
    : process.env.COURIER_AUTH_TOKEN;

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
        // Data is needed for courier template desginer
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

type ScheduleReminder = {
  scheduledDate: Date;
  emailTo: string;
  invoiceViewUrl: string;
  invoiceId: string;
  customerName: string;
  businessName: string;
  invoiceNumber: string;
};

/**
 * Send a reminder 1 day before due date
 */
export const scheduleReminder = async ({
  scheduledDate,
  emailTo,
  invoiceViewUrl,
  invoiceId,
  customerName,
  businessName,
  invoiceNumber,
}: ScheduleReminder) => {
  const dateISO = scheduledDate.toISOString();
  const recipientEmail =
    process.env.NODE_ENV === 'production'
      ? emailTo
      : process.env.COURIER_TEST_EMAIL;

  try {
    const { runId } = await courierClient.automations.invokeAdHocAutomation({
      automation: {
        cancelation_token: invoiceId,
        steps: [
          { action: 'delay', until: dateISO },
          {
            action: 'send',
            message: {
              to: { email: recipientEmail },
              template: PAYMENT_REMINDER_TEMPLATE_ID,
              data: {
                invoiceViewUrl,
                customerName,
                businessName,
                invoiceNumber,
              },
            },
          },
        ],
      },
    });
    return runId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Cancel a running automation workflow specified with it's cancelation_token
 */
export const cancelAutomationWorkflow = async ({
  cancelation_token,
}: {
  cancelation_token: string;
}) => {
  try {
    const { runId } = await courierClient.automations.invokeAdHocAutomation({
      automation: {
        steps: [{ action: 'cancel', cancelation_token }],
      },
    });
    return runId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
