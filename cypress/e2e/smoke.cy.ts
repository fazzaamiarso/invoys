// before(() => {
//   cy.exec('pnpm db:seed-test');
// });

import { faker } from '@faker-js/faker';

beforeEach(() => {
  cy.login();
  cy.visit('/');
});
describe('client', () => {
  it('can add a new client', () => {
    cy.get('h2')
      .should('exist')
      .contains(/dashboard/i);
    cy.visit('/clients');
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

  it('can show client details', () => {
    cy.visit('/clients');
    cy.get('table').find('a').contains(/view/gi).click();
  });

  it('can delete a client', () => {
    cy.visit('/clients');
    cy.get('table').find('a').contains(/view/gi).click();
  });
});

export {};
