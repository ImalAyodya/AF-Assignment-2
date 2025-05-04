describe('Login Page UI Tests', () => {
    beforeEach(() => {
      cy.visit('/login');
    });
    
    it('should display all UI elements correctly', () => {
      // Check page title
      cy.get('h2').contains('Sign in to your account');
      
      // Check form elements exist
      cy.get('label').contains('Email address');
      cy.get('label').contains('Password');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      
      // Check button
      cy.get('button[type="submit"]').contains('Sign in').should('be.visible');
      
      // Check sign up link
      cy.get('a').contains("Don't have an account? Sign up").should('be.visible')
        .and('have.attr', 'href', '/register');
    });
    
    it('should have proper responsive styling', () => {
      // Test on desktop viewport (already set by default)
      cy.get('form').should('have.class', 'bg-white');
      
      // Test on tablet viewport
      cy.viewport('ipad-2');
      cy.get('form').should('be.visible');
      
      // Test on mobile viewport
      cy.viewport('iphone-8');
      cy.get('form').should('be.visible');
    });
    
    it('should toggle to dark mode and retain styling', () => {
      // Find theme toggle in navbar and click it
      cy.get('button[aria-label="Toggle theme"]').click();
      
      // Check if dark mode classes are applied
      cy.get('form').should('have.class', 'dark:bg-neutral-800');
      cy.get('html').should('have.class', 'dark');
      
      // Ensure inputs have dark mode styling
      cy.get('input[type="email"]').should('have.class', 'dark:bg-neutral-900');
      cy.get('input[type="password"]').should('have.class', 'dark:bg-neutral-900');
    });
  });