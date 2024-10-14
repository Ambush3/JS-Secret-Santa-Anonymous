## Clone The Repository
git clone <repository-url>
cd <repository-directory>

## Install Dependencies
npm install

## Create an env file 
### The file should contain the following variables:
EMAIL=your-email@example.com
PASSWORD=your-email-password
MODE=production  # Use 'test' for testing purposes

## Running the Script
### Production Mode
#### Set the mode to production in the env file:
MODE=production

#### Run the script
node secretSantaAnonScript.js

#### Input Methods:
1. Provide a participants.txt file with names and emails
- The file should contain the names and emails in the following format:
  John Doe, johndoe@example.com
  Jane Doe, janedoe@example.com
  John Smith, johnsmith@example.com
  ...

2. Manually enter participants

## Testing Mode
Set the mode to test in the env file
MODE=test

Run The Script
node secretSantaAnonScript.js

## Project Structure
.
├── .env                   # Environment variables
├── README.md              # This file
├── SecretSantaAnonScript.js # Main script for Secret Santa logic
├── SantaAllocations.txt    # Output file for Secret Santa pairings (generated after running the script)
├── package.json           # Node.js dependencies
└── node_modules/          # Installed dependencies


## Output File
After the assignments are made, a SantaAllocations.txt file will be created in the project root directory, listing each participant and their assigned recipient.

John Doe is the secret santa of Jane Smith
Jane Smith is the secret santa of Bob Johnson

## Dependencies 
- nodemailer
- dotenv
- readline-sync