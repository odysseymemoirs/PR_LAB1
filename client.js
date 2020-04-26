
function value(id) {
    let el = document.getElementById(id)
    return el.value;
}

let form = {
    host: value('host'),
    port: value('port'),
    user: value('user'),
    pass: value('pass'),
    from: value('from'),
    to: value('to'),
    subject: value('msgSubject'),
    text: value('textarea')

}

document.getElementById('mainForm').addEventListener('input', () => {
    form = {
        host: value('host'),
        port: value('port'),
        user: value('user'),
        pass: value('pass'),
        from: value('from'),
        to: value('to'),
        subject: value('msgSubject'),
        text: value('textarea')
    }
})

document.getElementById('sendBtn').addEventListener(
    'click', sendMail, false
);


async function sendMail(e) {
    
    e.preventDefault()
    await request(`/api/post`, 'POST', form)

}


 
    let int = setInterval(async () => {
        const response = await request(`/api/get`, 'GET')
       
            displayMessage(response)
            // clearInterval(int)

    }, 3000
    )


function displayMessage(response) {

    console.log("res",response.sub)
    let element = document.getElementById('emailRecieveFrorm')
    element.innerHTML = ''

    
    let fromText = document.createTextNode('От: ' +response.f)
    let toText = document.createTextNode('Кому: '+ response.t)
    
    let from = document.createElement('p')
    let to = document.createElement('p')

    from.appendChild(fromText)
    to.appendChild(toText)


        let subjectTextNode = document.createTextNode(response.sub)
        let bodyTextNode = document.createTextNode(response.bod)
    
    
        let h5 = document.createElement('h5')
        h5.appendChild(subjectTextNode)
        let header = document.createElement('li')
        header.appendChild(h5)
        header.className = "collection-header"
    
        let body = document.createElement('li')
        body.appendChild(bodyTextNode)
        body.className = 'collection-item'
    
        element.appendChild(from)
        element.appendChild(to)
        element.appendChild(header)
        element.appendChild(body)


    }



async function request(url, method, data = null) {

    try {
        const headers = {}
        let body

        if (data) {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(data)
        }

        const response = await fetch(url, {
            method,
            headers,
            body,

        })

        return await response.json()
    } catch (error) {
        console.warn('Error: ', error.message)
    }
}



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