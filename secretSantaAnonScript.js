require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const nodemailer = require('nodemailer');

const budget = 50;
const mode = process.env.MODE || 'production';
const participants = [];

const askQuestion = (query) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
};

const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const weightedRandomPick = (items) => {
    const totalWeight = items.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of items) {
        if (r < item.weight) return item;
        r -= item.weight;
    }
};

const assignRecipients = (participants, maxAttempts = 1000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const available = [...participants];
        const assignments = [];
        let failed = false;

        for (const santa of participants) {
            let candidates = available.filter(
                p => p.name !== santa.name && p.location !== santa.location
            );

            if (candidates.length === 0) {
                candidates = available.filter(p => p.name !== santa.name);
            }

            if (candidates.length === 0) {
                failed = true;
                break;
            }

            const chosen =
                candidates[Math.floor(Math.random() * candidates.length)];

            assignments.push(chosen);

            const index = available.findIndex(p => p.name === chosen.name);
            available.splice(index, 1);
        }

        if (!failed) return assignments;
    }

    throw new Error('Unable to generate Secret Santa assignments');
};

const sendEmails = async (participants, recipients) => {
    let transporter;

    if (mode === 'test') {
        transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });
    } else {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
    }

    for (let i = 0; i < participants.length; i++) {
        const santa = participants[i];
        const recipient = recipients[i];
        const wishlistPath = recipient.wishlist;

        if (mode === 'test') {
            console.log(`EMAIL: ${santa.name} → ${recipient.name}`);
            console.log(`ATTACH: ${recipient.name} → ${wishlistPath}`);
        }

        const mailOptions = {
            from: process.env.EMAIL,
            to: santa.email,
            subject: 'Secret Santa',
            text: `Hello ${santa.name},

You are getting a gift for ${recipient.name}!

Remember the budget is $${budget}.`,
            attachments: []
        };

        if (wishlistPath && fs.existsSync(wishlistPath)) {
            mailOptions.attachments.push({
                filename: `${recipient.name}-wishlist.txt`,
                path: wishlistPath
            });
        }

        await transporter.sendMail(mailOptions);
    }
};


const getParticipantInfo = async () => {
    let option = parseInt(await askQuestion('How would you like to enter the information? (1 for text file, 2 for manual entry): '));
    let count = parseInt(await askQuestion('Enter number of participants: '));

    if (count < 2) process.exit();

    if (option === 1) {
        const filename = await askQuestion('Enter the text file name (must end in .txt): ');
        const rl = readline.createInterface({
            input: fs.createReadStream(filename),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            const [name, email, location] = line.split(',').map(s => s.trim());
            if (!validateEmail(email)) {
                console.error('Invalid email:', email);
                process.exit(1);
            }
            participants.push({ name, email, location, wishlist: `wishlists/${name}.txt` });
        }
    } else {
        for (let i = 0; i < count; i++) {
            const name = await askQuestion(`Enter name for participant ${i + 1}: `);
            let email;
            do {
                email = await askQuestion(`Enter email for participant ${i + 1}: `);
            } while (!validateEmail(email));
            const location = await askQuestion(`Enter location for participant ${i + 1}: `);
            participants.push({ name, email, location });
        }
    }
};

const startSecretSanta = async () => {
    await getParticipantInfo();

    console.log('Participants loaded:', participants.length);
    
    const recipients = assignRecipients(participants);
    await sendEmails(participants, recipients);

    const output = fs.createWriteStream('SantaAllocations.txt');
    participants.forEach((p, i) => {
        output.write(`${p.name} is gifting to ${recipients[i].name}\n`);
    });
    output.close();
};

if (require.main === module) {
    startSecretSanta();
}

module.exports = { assignRecipients, validateEmail };
