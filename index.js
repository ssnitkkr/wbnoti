const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const serverless = require('serverless-http');




const app = express();
app.use(bodyParser.json());
app.use(cors());


const client = new Client(
    {
        authStrategy: new LocalAuth()
    }
);

// client.on('qr', qr => {
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
// });




client.initialize();

client.on("message", async (msg) => {
    try {

        const contact = await msg.getContact()
        console.log(contact, msg.from)

    } catch (error) {
        console.error(error)
    }
})

app.get('/', async (req, res) => {
    try {
        let qr = await new Promise((resolve, reject) => {
            // Handle the 'qr' event
            client.once('qr', (qrCode) => {
                console.log('QR Code received:', qrCode);
                resolve(qrCode);
            });

            // Set a timeout in case 'qr' event doesn't occur within 15 seconds
            const qrTimeout = setTimeout(() => {
                reject(new Error("QR event wasn't emitted in 15 seconds."));
            }, 150000);

            // Handle the 'ready' event
            client.once('ready', () => {
                console.log('Client is ready!');
                // Clear the timeout if 'ready' is emitted before the 'qr' event
                clearTimeout(qrTimeout);
                // Sending a message to the frontend indicating that the client is ready
                res.send({ qr: "2" });
            });
        });


        res.send({ qr });
    } catch (err) {

        res.send(err.message);
    }
});




app.post('/place-order', (req, res) => {
    const { number, orderid, name } = req.body;
    const userNumber = `91${number}@c.us`;

    // Message to be sent to the user
    const messageToUser = `Dear ${name},\nThank you for placing an order with us!\nOrder ID: ${orderid}\nWe will process your order and keep you updated on its status.\nBest regards,\nThe Biryani Adda.`;

    // Send order confirmation to user
    sendOrderConfirmationToUser(userNumber, messageToUser);

    // Message to be sent to the owner
    const messageToOwner = `New Order Alert!\n\nOrder ID: ${orderid}\nUser Contact: ${number}`;

    // Send order details to owner
    sendOrderToOwner(messageToOwner);
    console.log(messageToUser);

    res.send("ok");
});

// Function to send order confirmation to the user
function sendOrderConfirmationToUser(userNumber, messageToUser) {


    client.sendMessage(userNumber, messageToUser).then((message) => {
        console.log('Order confirmation sent to user:', message.body);
    }).catch((error) => {
        console.error('Error sending order confirmation to user:', error);
    });
}

// Function to send order details to the owner
function sendOrderToOwner(messageToOwner) {
    const ownerNumber = '919839019095@c.us'; // Replace with the owner's phone number


    client.sendMessage(ownerNumber, messageToOwner).then((message) => {
        console.log('Order sent to owner:', message.body);
    }).catch((error) => {
        console.error('Error sending order to owner:', error);
    });
}

// Listen for incoming messages from users

const port = process.env.PORT || 8000;


app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${8000}`);
// });


