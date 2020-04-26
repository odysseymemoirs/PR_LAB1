const express = require('express')
const imaps = require('imap-simple');
const nodemailer = require("nodemailer");

const path = require('path')

const app = express()

let subject = 'test'
let body = 'test'
let from = 'test'
let to = 'test'
let lastEmailNumber = 0

app.use(express.json())
app.use(express.static(path.resolve(__dirname)))

var config = {
    imap: {
        user: '',
        password: '',
        host: 'Outlook.Office365.com',
        port: 993,

    },
};
imaps.connect(config).then(function (connection) {
    return connection.openBox('INBOX').then(function (options) {

        connection.on('mail', function (numNewMail) {
            lastEmailNumber = options.messages.total
            // console.log(numNewMail)
            var searchCriteria = [`${lastEmailNumber}:${lastEmailNumber}`];

            var fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: false
            };
            // вытаскиваем subject
            connection.search(searchCriteria, fetchOptions).then(function (results) {
              //  console.log(results[0].parts)
                subject = results.map(function (res) {
                    return res.parts.filter(function (part) {
                        return part.which === 'HEADER';
                    })[0].body.subject[0];
                }).join('');

                from = results.map(function (res) {
                    return res.parts.filter(function (part) {
                        return part.which === 'HEADER';
                    })[0].body.from[0]
                }).join('');

                if(from.includes('gmail')) 
                body = bodyParser(results.map(function (res) {
                    return res.parts.filter(function (part) {
                        return part.which === 'TEXT';
                    })[0].body
                }))
                else body = results.map(function (res) {
                    return res.parts.filter(function (part) {
                        return part.which === 'TEXT';
                    })[0].body
                })

                to = results.map(function (res) {
                    return res.parts.filter(function (part) {
                        return part.which === 'HEADER';
                    })[0].body.to[0]
                }).join('');
            });
        })
    });
});



app.get('/api/get', function (req, res, next) {
        
        res.status(200).json({ id: lastEmailNumber, sub: subject, bod: body, f: from, t: to })
});

app.post('/api/post', (req, res) => {
    const form = { ...req.body }

    res.status(201).json({ message: 'Данные получены', ...form })

    let transporter = nodemailer.createTransport({
        host: form.host,
        port: form.port,
 
        auth: {
            user: form.user,
            pass: form.pass
        }
    });

    const mailOptions = {
        from: form.from, 
        to: form.to, 
        subject: form.subject, 
        text: form.text
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });

})


app.listen('3000', 'localhost', () => { console.log('Сервер работает') })



function bodyParser(body) {
    let text = body.join('')

    let bodyStart = 0;
    let bodyEnd = 0;

    let i = 73;
    while (!bodyStart || !bodyEnd) {

        if (!bodyStart) {
            if (text[i] == '\r' && text[i + 1] == '\n' && text[i + 2] == '\r' && text[i + 3] == '\n') {
                bodyStart = i + 4
                i = i + 4
            }
        }

        if (bodyStart) {
            if (text[i] == '\r' && text[i + 1] == '\n' && text[i + 2] == '\r' && text[i + 3] == '\n') {
                bodyEnd = i
            }
        }
        i++
    }
    return Array.from(text).slice(bodyStart, bodyEnd).join('')

}



