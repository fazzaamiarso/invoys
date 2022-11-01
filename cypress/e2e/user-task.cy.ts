import { faker } from '@faker-js/faker';

before(() => {
  cy.exec('pnpm db:seed-test');
});

beforeEach(() => {
  cy.login();
  cy.visit('/');
});

describe('Clients', () => {
  beforeEach(() => {
    cy.visit('/clients');
  });
  it('sort correctly', () => {
    cy.intercept('/api/trpc/customer.infiniteClients*').as('sorting');
    cy.findByRole('table').within(() => {
      cy.findByRole('columnheader', { name: /name/i })
        .findByRole('button')
        .as('sort-name')
        .click();
      cy.wait('@sorting');

      //find a better selector? feels bad to use data-cy
      cy.get('span[data-cy="client-name"]')
        .should('have.length', 10)
        .should($items => {
          expect($items.first().text().charCodeAt(0)).lt(
            $items.last().text().charCodeAt(0)
          );
        });

      cy.get('@sort-name').click();
      cy.wait('@sorting');
      cy.get('span[data-cy="client-name"]')
        .should('have.length', 10)
        .should($items => {
          expect($items.first().text().charCodeAt(0)).gt(
            $items.last().text().charCodeAt(0)
          );
        });
    });
  });
  it('can add a new client', () => {
    cy.get('button')
      .contains(/add client/gi)
      .click();

    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    cy.get('input[name="name"]').type(`${firstName} ${lastName}`);
    cy.get('input[name="email"]').type(
      faker.internet.email(firstName, lastName)
    );
    cy.get('input[name="phoneNumber"]').type(faker.phone.number('###-###-###'));
    cy.get('input[name="address"]').type(faker.address.streetAddress());
    cy.get('button')
      .contains(/new client/i)
      .click();

    cy.get('h2').should('have.text', `${firstName} ${lastName}`);
  });

  it('can edit a client', () => {
    cy.get('table').find('a').contains(/view/i).click();

    cy.get("div[data-cy='button-group']").contains('button', /edit/i).click();

    const newFirstName = faker.name.firstName();
    const newLastName = faker.name.lastName();
    const newFullName = `${newFirstName} ${newLastName}`;
    const newEmail = faker.internet.email(newFirstName, newLastName);
    cy.get('input[name="name"]').clear().type(newFullName);
    cy.get('input[name="email"]').clear().type(newEmail);

    cy.get('button').contains(/save/i).click();

    cy.get('main').within(() => {
      cy.get('h2').should('have.text', newFullName);
      cy.get('h4').contains(/email/i).next('p').should('have.text', newEmail);
    });
  });

  it('can delete a client', () => {
    cy.get('table').find('a').contains(/view/gi).click();
    cy.get("div[data-cy='button-group']")
      .contains('button', /delete/i)
      .click();

    cy.findByRole('button', { name: /confirm/gi }).click();
    cy.findByRole('heading', { name: /clients/gi, level: 2 });
  });
});

describe('Invoices', () => {
  beforeEach(() => {
    cy.visit('/invoices');
  });

  it('can add a new invoice as draft', () => {
    cy.findByRole('banner')
      .findByRole('button', { name: /new invoice/gi })
      .click();

    const projectName = faker.name.jobArea();
    const notes = faker.lorem.sentences();
    const dueDate = new Date(faker.date.future());

    cy.findByRole('dialog').within(() => {
      cy.intercept('/api/trpc/invoice.create*').as('create-invoice');
      cy.findByLabelText(/project/gi).type(projectName);
      cy.get("td > input[id='orders.0.name']").type(faker.commerce.product());
      cy.get("td > input[id='orders.0.quantity']")
        .clear()
        .type(faker.commerce.price());
      cy.get("td > input[id='orders.0.amount']")
        .clear()
        .type(faker.random.numeric(3));

      cy.findByLabelText(/due on/i).type(
        `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${dueDate.getDate().toString().padStart(2, '0')}`
      );
      cy.findByRole('textbox', { name: /notes/i }).type(notes);
      cy.findByRole('switch', { name: /draft/gi }).click();
      cy.findByRole('button', { name: /create invoice/gi }).click();
    });
    cy.wait('@create-invoice');
    cy.findByRole('heading', { name: /projects detail/i }).should('exist');
  });

  it('can preview an invoice', () => {
    cy.findByRole('table').find('a').contains(/view/i).first().click();
    cy.findByRole('link', { name: /preview/i })
      .invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'preview');
  });

  it('can delete an invoice', () => {
    cy.intercept('/api/trpc/invoice.infinite*').as('invoices');
    cy.wait('@invoices');
    cy.get('table').find('a').contains(/view/gi).click();

    cy.get('div[data-cy="button-group"]')
      .find('button')
      .contains(/delete/i)
      .click();

    cy.findByRole('button', { name: /confirm/gi }).click();
    cy.findByRole('heading', { name: /invoices/gi, level: 2 });
  });

  it('can edit an invoice', () => {
    cy.intercept('/api/trpc/invoice.getSingle*').as('editing');
    cy.findByRole('table').find('a').contains(/view/i).first().click();
    cy.get('div[data-cy="button-group"]')
      .find('button')
      .contains(/edit/i)
      .click();

    const newProjectName = faker.name.jobArea();
    const newOrderName = faker.commerce.product();
    cy.findByRole('dialog')
      .as('dialog')
      .within(() => {
        cy.findByLabelText(/project/gi).type(newProjectName);

        cy.get("td > input[id='orders.0.name']").clear().type(newOrderName);
        cy.get("td > input[id='orders.0.quantity']")
          .clear()
          .type(faker.commerce.price());
        cy.get("td > input[id='orders.0.amount']")
          .clear()
          .type(faker.random.numeric(3));

        cy.findByRole('button', { name: /save/gi }).click();
      });

    cy.wait('@editing');
    cy.get('@dialog').should('not.exist');

    cy.get("h4[data-cy='order-name']")
      .first()
      .invoke('text')
      .should('include', newOrderName);
  });
  it('can filter status correctly', () => {
    cy.intercept('/api/trpc/invoice.infinite*').as('filtering');

    cy.findByRole('button', { name: /all status/i }).click();
    cy.get('li').focused().type('{downArrow}').type('{enter}');

    cy.wait('@filtering');

    cy.get('div[data-cy="invoice-status"]').each($item => {
      expect($item.text()).contains('Pending');
    });
  });

  it('can sort correctly');

  it.skip('can download a pdf', () => {
    cy.findByRole('table').find('a').contains(/view/i).first().click();
    cy.findByRole('heading', { level: 2 }).invoke('text').as('invoice');

    cy.findByRole('button', { name: /download pdf/i });
  });
});
