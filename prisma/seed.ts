import { PrismaClient, Prisma, InvoiceStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const getRandomDigit = (min: number, max: number) => {
  return faker.datatype.number({ max, min });
};

const createRandomInvoices = (
  prefix: string,
  index: number
): Prisma.InvoiceCreateManyCustomerInput => {
  return {
    name: faker.name.jobArea(),
    issuedOn: faker.date.recent(),
    dueDate: faker.date.future(),
    status: faker.helpers.arrayElement(Object.values(InvoiceStatus)),
    invoiceNumber: `${prefix}-${index.toString().padStart(4, '0')}`,
    isDraft: Math.random() > 0.9,
  };
};

const createRandomClient = (): Prisma.CustomerCreateInput => {
  const companyName = faker.company.name();
  const prefix = faker.helpers.unique(faker.random.alpha, [
    {
      casing: 'upper',
      count: 3,
    },
  ]);
  return {
    id: faker.datatype.uuid(),
    name: companyName,
    email: faker.helpers.unique(faker.internet.email, [companyName]),
    phoneNumber: faker.phone.number(),
    address: faker.address.streetAddress(true),
    invoicePrefix: prefix,
    invoices: {
      createMany: {
        data: faker.datatype
          .array(2)
          .map((_, idx) => createRandomInvoices(prefix, idx + 1)),
      },
    },
  };
};

const createRandomOrders = (
  invoiceId: string
): Prisma.OrderItemCreateManyInput => {
  return {
    name: faker.commerce.productName(),
    amount: Number(faker.commerce.price()),
    quantity: getRandomDigit(1, 10),
    invoiceId,
  };
};

const runSeed = async () => {
  const clients = Array.from({ length: 10 }).map(createRandomClient);

  console.log('🌱 Starting Seed!');

  console.log('👩🏼 Creating Clients with Invoices!');
  for (const c of clients) {
    await prisma.customer.create({ data: c });
  }

  console.log('✓ Creating clients successful!');

  console.log('🔍 Finding Invoices');
  const invoiceCount = await prisma.invoice.count();
  const invoices = await prisma.invoice.findMany({
    take: invoiceCount,
  });

  console.log('🧾 Creating Orders for Invoices!');
  for (const i of invoices) {
    const orders = faker.datatype.array(3).map(() => {
      return createRandomOrders(i.id);
    });
    await prisma.orderItem.createMany({
      data: orders,
    });
  }

  await prisma.invoice.deleteMany({ where: { orders: { none: {} } } });
};

runSeed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
