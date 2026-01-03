
## What this Secret Santa Script Does:
This script, once ran, will take either a txt file with the correct formatted information (Name, email, location), or manual entry. 
Once the respective prompt is chosen and we are pointed to the correct txt file, then based on location of those part of Secret Santa, will then be chosen anonymously, with emails being sent out. 
This script will make it so that people who live in close proximity to one another, do not have eachother for Secret Santa.

## Clone The Repository
- git clone <https://github.com/Ambush3/JS-Secret-Santa-Anonymous.git>
- cd </directory/structure/to/JS-Secret-Santa-Anonymous>

## Install Dependencies
npm install

## Create an env file 
### The file should contain the following variables:
- EMAIL=your-email@example.com
- PASSWORD=your-email-password
- MODE=production # Use 'test' for testing purposes

## Running the Script
### Production Mode
#### Set the mode to production in the env file:
MODE=production

#### Run the script
node secretSantaAnonScript.js

#### Input Methods:
1. Provide a participants.txt file with names and emails
- The file should contain the names and emails in the following format:
  - John Doe, johndoe@example.com
  - Jane Doe, janedoe@example.com
  - John Smith, johnsmith@example.com

2. Manually enter participants

##### If input method one is selected:
- Then enter in number of participants
- Enter in the text file name (ex: participants.txt)
- Emails will be sent out

##### If input method two is selected:
- Then enter in number of participants
- Enter names and emails of each participant
- Emails will be sent out

## Testing Mode
Set the mode to test in the env file
MODE=test

Run The Script
node secretSantaAnonScript.js

## Project Structure

```
.
├── .env                   # Environment variables
├── README.md              # This file
├── SecretSantaAnonScript.js # Main script for Secret Santa logic
├── SantaAllocations.txt    # Output file for Secret Santa pairings (generated after running the script)
├── package.json           # Node.js dependencies
└── node_modules/          # Installed dependencies
```

## Output File
After the assignments are made, a SantaAllocations.txt file will be created in the project root directory, listing each participant and their assigned recipient.

- John Doe is the secret santa of Jane Smith
- Jane Smith is the secret santa of Bob Johnson

## Email Received 
Hello John Doe,
You are the secret santa of Jane Doe!
Remember the budget is $50.

## Dependencies 
- nodemailer
- dotenv
- readline-sync

## Future Enhancements
In the future, I will be adding a prompt to ask if you want to use the filter for close proximity or not. 