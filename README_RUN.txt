=========================================
      KavachPay - Local Runner Guide
=========================================

Welcome to KavachPay! This project is pre-configured to run locally
on Windows with minimal setup.

--- QUICK START ---

1.  Make sure you have Python 3.x and Node.js installed.
2.  Double-click 'setup.bat' to initialize the environment.
    - This will create a virtual environment, install dependencies,
      and set up default .env files.
3.  Double-click 'start.bat' to launch the application.
    - Three windows will open: Backend, Mock API, and Frontend.

--- PREREQUISITES ---

- Python: https://www.python.org/
- Node.js: https://nodejs.org/

--- CONFIGURATION ---

- Firebase: Place your 'firebase-credentials.json' in common/backend/
  before starting.
- Env Files: The setup script creates .env files in 'backend/' and 'frontend/'.
  You can edit these to change ports or API URLs.

--- TROUBLESHOOTING ---

- If dependencies fail to install, try running the batch files as Administrator.
- Ensure ports 3000, 5000, and 5001 are not in use by other applications.

=========================================
            Protecting Gig Workers
=========================================
