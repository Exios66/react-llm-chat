describe('Login Flow', () => {
  it('successfully logs in and redirects to room list', () => {
    cy.visit('/');

    // Check if we're on the login page
    cy.contains('Join Chat').should('be.visible');

    // Fill in the login form
    cy.get('input[aria-label="Username"]').type('testuser');
    cy.get('input[aria-label="Room Name"]').type('testroom');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Check if we've been redirected to the room list
    cy.url().should('include', '/chat');
    cy.contains('Room: testroom').should('be.visible');

    // Check if the chat input is available
    cy.get('input[placeholder="Type a message..."]').should('be.visible');

    // Check if the user's name is displayed
    cy.contains('testuser').should('be.visible');
  });

  it('displays an error message for invalid input', () => {
    cy.visit('/');

    // Submit the form without filling it
    cy.get('button[type="submit"]').click();

    // Check if error message is displayed
    cy.contains('Username must be at least 3 characters long').should('be.visible');
  });
});
