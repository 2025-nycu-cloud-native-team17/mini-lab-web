describe('template spec', () => {
  it('Test 1', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('/');
    cy.get(':nth-child(1) > .text-blue-600').click();
    cy.get('.bg-\\[\\#D9D9D9\\] > .space-y-4 > :nth-child(1) > .w-full').clear('u');
    cy.get('.bg-\\[\\#D9D9D9\\] > .space-y-4 > :nth-child(1) > .w-full').type('user1@example.com');
    cy.get('.bg-\\[\\#D9D9D9\\] > .space-y-4 > :nth-child(2) > .w-full').clear();
    cy.get('.bg-\\[\\#D9D9D9\\] > .space-y-4 > :nth-child(2) > .w-full').type('user1');
    cy.get('.bg-blue-600').click();
    cy.get(':nth-child(2) > .text-blue-600').click();
    cy.get('.w-12.mx-6').click();
    cy.get('.flex-col > :nth-child(2) > .flex').click();
    cy.get('.w-12.mx-6').click();
    cy.get(':nth-child(3) > .flex').click();
    /* ==== End Cypress Studio ==== */
  })

  it('Test 2', () => {
  })
})
