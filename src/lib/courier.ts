import { SECOND_TO_MS } from '@data/global';
import { CourierClient, CourierHttpClientError } from '@trycourier/courier';
import { getErrorMessage } from '@utils/getErrorMessage';

const __IS_PROD__ = process.env.NODE_ENV === 'production';

const INVOICE_TEMPLATE_ID = '357GQPPVGDMYWZJJ3P8EDNR9VAF4';
const PAYMENT_REMINDER_TEMPLATE_ID = 'B2VWVEF9SAM1QAPX4DC9PHRV8XWF';
const PAYMENT_OVERDUE_TEMPLATE_ID = '2VEY67G0NZ4KKEKGJ1K7K3JGYD2N';

const testEmail = process.env.COURIER_TEST_EMAIL;
const authToken = __IS_PROD__
  ? process.env.COURIER_AUTH_TOKEN
  : process.env.COURIER_AUTH_TEST_TOKEN;

const courierClient = CourierClient({
  authorizationToken: authToken,
});

interface CourierBaseData {
  customerName: string;
  invoiceNumber: string;
  invoiceViewUrl: string;
  emailTo: string;
}

interface SendInvoice extends CourierBaseData {
  productName: string;
  dueDate: string;
}
/**
 * Send an Invoice with email template defined in Courier Dashboard
 */
export const sendInvoice = async ({
  customerName,
  invoiceNumber,
  invoiceViewUrl,
  emailTo,
  productName,
  dueDate,
}: SendInvoice) => {
  const recipientEmail = __IS_PROD__ ? emailTo : testEmail;
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
          productName,
          dueDate,
        },
      },
    });
    return { data: requestId, error: null };
  } catch (error) {
    if (error instanceof CourierHttpClientError) {
      return { data: error.data, error: error.message };
    } else {
      return { data: null, error: getErrorMessage(error) };
    }
  }
};

interface ScheduleReminder extends CourierBaseData {
  scheduledDate: Date;
  invoiceId: string;
}
/**
 * Send a reminder on scheduled date
 */
export const scheduleReminder = async ({
  scheduledDate,
  emailTo,
  invoiceViewUrl,
  invoiceId,
  customerName,
  invoiceNumber,
}: ScheduleReminder) => {
  const delayUntilDate = __IS_PROD__
    ? scheduledDate
    : new Date(Date.now() + SECOND_TO_MS * 20);
  const recipientEmail = __IS_PROD__ ? emailTo : testEmail;

  try {
    const { runId } = await courierClient.automations.invokeAdHocAutomation({
      automation: {
        cancelation_token: `${invoiceId}-reminder`,
        steps: [
          { action: 'delay', until: delayUntilDate.toISOString() },
          {
            action: 'send',
            message: {
              to: { email: recipientEmail },
              template: PAYMENT_REMINDER_TEMPLATE_ID,
              data: {
                invoiceViewUrl,
                customerName,
                invoiceNumber,
              },
            },
          },
        ],
      },
    });
    return { data: runId, error: null };
  } catch (error) {
    if (error instanceof CourierHttpClientError) {
      return { data: error.data, error: error.message };
    } else {
      return { data: null, error: getErrorMessage(error) };
    }
  }
};

interface ScheduleOverdue extends CourierBaseData {
  dueDate: string;
  invoiceId: string;
}
/**
 * Send a notice for overdue invoice payment
 */
export const scheduleOverdueNotice = async ({
  emailTo,
  invoiceViewUrl,
  invoiceId,
  customerName,
  invoiceNumber,
  dueDate,
}: ScheduleOverdue) => {
  const recipientEmail = __IS_PROD__ ? emailTo : testEmail;

  try {
    const { runId } = await courierClient.automations.invokeAdHocAutomation({
      automation: {
        cancelation_token: `${invoiceId}-overdue`,
        steps: [
          { action: 'delay', duration: '1 day' },
          {
            action: 'send',
            message: {
              to: { email: recipientEmail },
              template: PAYMENT_OVERDUE_TEMPLATE_ID,
              data: {
                invoiceViewUrl,
                customerName,
                invoiceNumber,
                dueDate,
              },
            },
          },
        ],
      },
    });
    return { data: runId, error: null };
  } catch (error) {
    if (error instanceof CourierHttpClientError) {
      return { data: error.data, error: error.message };
    } else {
      return { data: null, error: getErrorMessage(error) };
    }
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
    return { data: runId, error: null };
  } catch (error) {
    if (error instanceof CourierHttpClientError) {
      return { data: error.data, error: error.message };
    } else {
      return { data: null, error: getErrorMessage(error) };
    }
  }
};
