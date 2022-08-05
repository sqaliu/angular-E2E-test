describe('Home Page', () => {

    beforeEach("set backend server to get data ready", () => {
        // monk a http backend as cypress backend server
        cy.fixture('courses.json').as("coursesJSON");
        cy.server();
        cy.route('/api/courses', "@coursesJSON").as("courses");
        cy.visit('/'); // visit the root component
    });

    it('should display a list of course', () => {              
        cy.contains("All Courses");
        cy.wait('@courses');
        cy.get("mat-card").should("have.length", 9);
    });

    it('should display the advanced courses', () => {
        cy.get('.mat-tab-label').should("have.length", 2);
        cy.get('.mat-tab-label').last().click();  // unlike in jasmine unit test, cypress takes care of the asynchronous problem

        cy.get('.mat-tab-body-active .mat-card-title').its('length').should('be.gt', 1); // at least 1 i.e. greater than 1
        cy.get('.mat-tab-body-active .mat-card-title').first()
            .should('contain', "Angular Security Course");

    });
})