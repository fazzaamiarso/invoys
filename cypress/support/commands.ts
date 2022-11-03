/// <reference types="cypress" />
import { signIn } from 'next-auth/react';
import '@testing-library/cypress/add-commands';

const selById = <T extends keyof HTMLElementTagNameMap>(el: T, id: string) => {
  return cy.get(`${el}[id="${id}"]`);
};

Cypress.Commands.add('login', () => {
  return cy.wrap(signIn('credentials', { redirect: false }));
});

Cypress.Commands.add('selById', selById);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(): Chainable<unknown>;
      selById: typeof selById;
    }
  }
}
