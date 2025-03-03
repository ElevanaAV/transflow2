// Custom Firebase Auth Handler to enhance default Firebase auth UI
// This script will be loaded on the Firebase auth action pages

(function() {
  // Style definitions for our custom elements
  const styles = `
    .custom-button {
      display: block;
      width: 100%;
      max-width: 300px;
      margin: 20px auto 0;
      padding: 10px 16px;
      background-color: #38BDF8;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-decoration: none;
    }

    .custom-button:hover {
      background-color: #0284C7;
      transform: scale(1.02);
    }

    .custom-logo {
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      color: #0284C7;
      margin-bottom: 16px;
    }

    .custom-container {
      margin-top: 16px;
    }
  `;

  // Create style element
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Function to add our custom elements
  function enhanceAuthUI() {
    // Check if we're on a password reset success page
    const successMessage = document.querySelector('.firebaseui-id-page-password-reset-success');
    if (successMessage) {
      // Add logo
      const logoDiv = document.createElement('div');
      logoDiv.className = 'custom-logo';
      logoDiv.textContent = 'TranslationFlow';
      successMessage.insertBefore(logoDiv, successMessage.firstChild);
      
      // Add custom container div
      const container = document.createElement('div');
      container.className = 'custom-container';
      
      // Add return to login button
      const loginButton = document.createElement('a');
      loginButton.className = 'custom-button';
      loginButton.textContent = 'Return to Login Page';
      loginButton.href = '/login';
      container.appendChild(loginButton);
      
      // Add the container to the page
      successMessage.appendChild(container);
    }
  }

  // Run our function when the page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAuthUI);
  } else {
    // DOM is already ready
    enhanceAuthUI();
  }

  // Also run when the page is fully loaded (with images, etc.)
  window.addEventListener('load', enhanceAuthUI);
  
  // Run periodically to catch any auth UI elements that might load dynamically
  const interval = setInterval(enhanceAuthUI, 500);
  // Stop checking after 10 seconds
  setTimeout(() => clearInterval(interval), 10000);
})();