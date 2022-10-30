import { faker } from '@faker-js/faker';

// before(() => {
//   cy.exec('pnpm db:seed-test');
// });

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
  it('can add a new invoice');
  it('can delete an invoice');
  it('can edit an invoice');
  it('can download a pdf');
  it('can preview an invoice');
  it('can sort correctly');
});
