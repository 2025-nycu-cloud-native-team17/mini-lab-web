// cypress/e2e/must-fail.cy.js
describe('Must fail test', () => {
    it('should always fail', () => {
        cy.visit('/');
        cy.get('#this-element-does-not-exist', { timeout: 2000 });
    })
})
