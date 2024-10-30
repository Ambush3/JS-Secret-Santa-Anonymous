// Load environment variables
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const nodemailer = require('nodemailer');

// Initialize variables
let names = [];
let emails = [];
let recipients = [];
const budget = 50;
const mode = process.env.MODE || 'production';

// Helper function to ask a question in the terminal
const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

// Function to validate email format
const validateEmail = (email) => {
    const regex = /^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$/;
    return regex.test(email);
};

// Secret Santa logic to assign recipients
const assignRecipients = (names) => {
    let possibleSantas = [...names];
    let recipients = [];
    let redo = false;

    for (let i = 0; i < names.length; i++) {
        let recipientIndex = Math.floor(Math.random() * possibleSantas.length);
        while (names[i] === possibleSantas[recipientIndex]) {
            if (possibleSantas.length === 1) {
                redo = true;
                break;
            }
            recipientIndex = Math.floor(Math.random() * possibleSantas.length);
        }
        if (!redo) {
            recipients.push(possibleSantas[recipientIndex]);
            possibleSantas.splice(recipientIndex, 1);
        } else {
            recipients = [];
            assignRecipients(names); // Recursively reassign if we hit a deadlock
            break;
        }
    }
    return recipients;
};

// Email sending function using nodemailer
const sendEmails = async (names, emails, recipients) => {
    let transporter;

    if (mode === 'test') {
        console.log("Running in test mode. No real emails will be sent.");
        transporter = nodemailer.createTransport({
            streamTransport: true, // Simulates sending email
            newline: 'unix',
            buffer: true
        });
    } else {
        console.log("Running in production mode. Real emails will be sent.");
        transporter = nodemailer.createTransport({
            service: 'gmail',  // or 'yahoo', 'hotmail', etc.
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
    }

    for (let i = 0; i < names.length; i++) {
        const mailContent = `Hello ${names[i]},
        \nYou are the secret santa of ${recipients[i]}!
        \nRemember the budget is $${budget}.
        `;

        const mailOptions = {
            from: process.env.EMAIL,
            to: emails[i],
            subject: 'Secret Santa',
            text: mailContent
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            if (mode === 'test') {
                console.log(`Pretend email sent to ${emails[i]}:\n`, info.message.toString());
            } else {
                console.log(`Real email sent to ${emails[i]}`);
            }
        } catch (error) {
            console.log(`Failed to send email to ${emails[i]}: ${error}`);
        }
    }
};

// Function to get participant info in production
const getParticipantInfo = async () => {
    console.log("Welcome to the Secret Santa decision-maker!");

    // Choose info entry method
    let option = await askQuestion("How would you like to enter the information? (1 for text file, 2 for manual entry): ");
    option = parseInt(option);

    // Get participant count
    let count = await askQuestion("Enter number of participants: ");
    if (count < 2) {
        console.log("Invalid number of participants. You can't do Secret Santa with just one person. That is silly. Please try again.");
        process.exit();
    }

    count = parseInt(count);

    // Option 1: File input via txt file
    if (option === 1) {
        const filename = await askQuestion("Enter the text file name (must end in .txt): ");
        const fileStream = fs.createReadStream(filename);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            const [name, email] = line.split(', ');
            names.push(name);
            emails.push(email);
        }
    }

    // Option 2: Manual input
    else if (option === 2) {
        console.log("Please manually enter participant details:");

        for (let i = 0; i < count; i++) {
            let name = await askQuestion(`Enter the name of participant ${i + 1}: `);
            names.push(name);

            let validEmail = false;
            while (!validEmail) {
                let email = await askQuestion(`Enter the email of participant ${i + 1}: `);
                if (validateEmail(email)) {
                    emails.push(email);
                    validEmail = true;
                } else {
                    console.log("Invalid email. Please try again.");
                }
            }
        }
    }
};

// Main function to start the script
const startSecretSanta = async () => {
    if (mode === 'production') {
        // Production: ask for participant info
        await getParticipantInfo();
    } else {
        // Test mode: use hardcoded test data
        names = ['John Doe', 'Jane Smith', 'Alice Brown', 'Bob Johnson', 'Charlie Lee', 'Diana Prince', 'Eve Adams', 'Frank Wright'];
        emails = [
            'john.doe@localhost.com', 'jane.smith@localhost.com', 'alice.brown@localhost.com', 'bob.johnson@localhost.com',
            'charlie.lee@localhost.com', 'diana.prince@localhost.com', 'eve.adams@localhost.com', 'frank.wright@localhost.com'
        ];
    }

    recipients = assignRecipients(names);

    await sendEmails(names, emails, recipients);

    // Write allocations to file to be read for testing purposes
    const allocations = fs.createWriteStream('SantaAllocations.txt');
    names.forEach((name, i) => {
        allocations.write(`${name} is the secret santa of ${recipients[i]}\n`);
    });
    allocations.close();

    console.log('Secret Santa assignments saved to SantaAllocations.txt');
};

// Only call startSecretSanta if the script is run directly
if (require.main === module) {
    startSecretSanta();
}

// Export the functions for testing purposes in testSecretSanta.js
module.exports = { assignRecipients, sendEmails, validateEmail };
