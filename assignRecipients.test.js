const assert = require('assert');
const { assignRecipients } = require('./SecretSantaAnonScript');

const participants = [
    { name: 'A1', location: 'A' },
    { name: 'A2', location: 'A' },
    { name: 'B1', location: 'B' },
    { name: 'B2', location: 'B' }
];

const recipients = assignRecipients(participants);

recipients.forEach((recipient, i) => {
    assert.notStrictEqual(
        participants[i].location,
        recipient.location,
        'Same-group assignment detected'
    );
});

console.log('Test passed: no same-group assignments');
