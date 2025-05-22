// cypress/e2e/must-fail.cy.js
describe('Must fail test', () => {
    it('should always fail', () => {
        cy.visit('/');
        expect(true).to.equal(false)
    })
})
