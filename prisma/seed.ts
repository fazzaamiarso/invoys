import { PrismaClient, Prisma, InvoiceStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const getRandomDigit = () => {
  return faker.datatype.number({ max: 3, min: 0 });
};

const createRandomInvoices = (
  prefix: string,
  index: number
): Prisma.InvoiceCreateManyCustomerInput => {
  return {
    name: faker.name.jobArea(),
    dueDate: faker.date.future(),
    status: faker.helpers.arrayElement(Object.values(InvoiceStatus)),
    invoiceNumber: `${prefix}-${index.toString().padStart(4, '0')}`,
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
        data: Array.from({ length: getRandomDigit() }).map((_, idx) =>
          createRandomInvoices(prefix, idx)
        ),
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
    quantity: faker.datatype.number({ min: 1, max: 10 }),
    invoiceId,
  };
};

const runSeed = async () => {
  const clients = Array.from({ length: 10 }).map(createRandomClient);

  console.log('🌱 Starting Seed!');

  console.log('👩🏼 Creating Clients with Invoices!');
  clients.forEach(async c => {
    await prisma.customer.create({ data: c });
  });
  console.log('✓ Creating clients successful!');

  console.log('🔍 Finding Clients');
  const invoices = await prisma.invoice.findMany({ select: { id: true } });

  console.log('🧾 Creating Orders!');
  invoices.forEach(async i => {
    await prisma.orderItem.createMany({
      data: Array.from({
        length: faker.datatype.number({ min: 1, max: 2 }),
      }).map(() => createRandomOrders(i.id)),
    });
  });
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
