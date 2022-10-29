it('Smoke!', () => {
  cy.login().then(() => {
    cy.visit('/');
  });

  cy.get('h2').should('exist');
});
