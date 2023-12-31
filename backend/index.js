const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const axios = require('axios')

app.use(express.static('dist', {
    maxAge: 1
}))

const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
});

class Student {
    constructor(id, question) {
        this.id = id;
        this.timestamp = new Date();
        this.question = question;
        this.beginHelpedByID = "";
    }
}

class TA {
    constructor(id) {
        this.id = id
    }
}

rooms = {
    '5-7PM Office Hours': {
        class: "CS 1110",
        description: "Rice 130 Office Hours",
        isActive: true,
        avgStudentTime: 324,
        'queue': [
            {
                id: "Alice",
                timestamp: new Date(),
                question: "How to print in python?",
                beginHelpedByID: ""
            },
            {
                id: "Danny X",
                timestamp: new Date(),
                question: "How to get input in python",
                beginHelpedByID: ""
            },
            {
                id: "Edgar P",
                timestamp: new Date(),
                question: "Get user input",
                beginHelpedByID: ""
            },
            {
                id: "Frank S",
                timestamp: new Date(),
                question: "How to install python",
                beginHelpedByID: ""
            },
            {
                id: "Garry G",
                timestamp: new Date(),
                question: "Install python on windows",
                beginHelpedByID: ""
            },
            {
                id: "Harry L",
                timestamp: new Date(),
                question: "How to run python program",
                beginHelpedByID: ""
            }
        ],
        'TAs': ['Alice C', 'Bob P']
    },
    'Thornton Stacks DSA2': {
        class: "CS 3100",
        description: "Office hours in the engineering building attic",
        isActive: true,
        avgStudentTime: 624,
        'queue': [
            {
                id: "Ginny G",
                timestamp: new Date(),
                question: "Memoization help for drainage homework",
                beginHelpedByID: ""
            },
            {
                id: "Hank L",
                timestamp: new Date(),
                question: "What is Djikstras and how to implement",
                beginHelpedByID: ""
            },
            {
                id: "Ian I",
                timestamp: new Date(),
                question: "How do you find the shortest path in a weighted graph?",
                beginHelpedByID: ""
            },
            {
                id: "Grace W",
                timestamp: new Date(),
                question: "Conceptual Questions on Djikstra's algorithm",
                beginHelpedByID: ""
            },
            {
                id: "Jackson M",
                timestamp: new Date(),
                question: "Going over coin change",
                beginHelpedByID: ""
            },
            {
                id: "Sullivan M",
                timestamp: new Date(),
                question: "Question on greedy choice property for DSA2",
                beginHelpedByID: ""
            }
        ],
        'TAs': ['Janice P', 'Kim P']
    },
    'Confusing OH': {
        class: "CS 9999",
        description: "Office hours in the engineering building hidden room",
        isActive: true,
        avgStudentTime: 482,
        'queue': [
            {
                id: "Ginny Z",
                timestamp: new Date(),
                question: "I solved P=NP help me verify my answer",
                beginHelpedByID: ""
            },
            {
                id: "Hank X",
                timestamp: new Date(),
                question: "Last step for turing-complete plants",
                beginHelpedByID: ""
            },
            {
                id: "Alan T",
                timestamp: new Date(),
                question: "Finalizing Shors algorithm",
                beginHelpedByID: ""
            },
            {
                id: "Edwin Djikstra",
                timestamp: new Date(),
                question: "Solving the discrete logarithm homework problem",
                beginHelpedByID: ""
            },
            {
                id: "Grace H",
                timestamp: new Date(),
                question: "I don't know how to solve the halting problem",
                beginHelpedByID: ""
            }
        ],
        'TAs': ['Petra K', 'Frank Q']
    },
    '5-7PM In Person OH': {
        class: "CS 2130",
        description: "Office hours in Rice 025",
        isActive: true,
        avgStudentTime: 482,
        'queue': [
            {
                id: "Ford Tran",
                timestamp: new Date(),
                question: "Bit fiddling homework help",
                beginHelpedByID: ""
            },
            {
                id: "Dwight S",
                timestamp: new Date(),
                question: "How negative numbers are in binary",
                beginHelpedByID: ""
            },
            {
                id: "Jim H",
                timestamp: new Date(),
                question: "Circuit construction help",
                beginHelpedByID: ""
            },
            {
                id: "Pam B",
                timestamp: new Date(),
                question: "Segmentation fault in my code ... help",
                beginHelpedByID: ""
            },
            {
                id: "Grace H",
                timestamp: new Date(),
                question: "Memory allocation error, not sure how to diagnose",
                beginHelpedByID: ""
            }
        ],
        'TAs': ['Brandon', 'Ravi', 'Ed']
    },
}

const sendUpdate = () => {
    io.emit("changed", rooms)
}

io.on('connection', (socket) => {
    console.log('a user connected');
    sendUpdate()

    socket.on('playerDataUp', (msg) => {
        console.log("HIII")
    })
});

app.use((req, res, next) => {
    // console.log("A request was sent!", req)
    next()
})

app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const postData = {
    questions: [
        "How does bubble sort work?",
        "What is dynamic programming?",
        "How do you find the shortest path in a weighted graph?"
    ]
}

app.get('/api/ml/summarize', async (req, res) => {
    room = rooms[req.query.roomID]

    console.log("SUMMARIZING")
    const postData = {
        questions: []
    }

    room.queue.forEach(s => postData.questions.push(s.question))

    axios.post('http://localhost:8000/current-topic', postData).then(result => {
        res.json(result.data)
        console.log(result.data)
    }).catch(e => {
        res.status(500).send()
    })
})

app.get('/api/ml/help', async (req, res) => {
    console.log("HELPING")
    const postData = {
        question: req.query.question
    }

    axios.post('http://localhost:8000/help', postData).then(result => {
        res.json(result.data)
        console.log(result.data)
    })
});

app.post('/api/ml/similarity', async (req, res) => {
    console.log(req.body)
    axios.post('http://127.0.0.1:8000/similarity', {
        target_string: req.body.request.target_string,
        string_list: req.body.request.string_list
    }).then(result => {
        console.log()
        res.json(result.data.similarity_scores[0])
    })
});

app.get('/api/rooms/create', (req, res) => {
    if (req.query.roomID in rooms) {
        return res.send("failed to create the room")
    }

    rooms[req.query.roomID] = {
        id: req.query.roomID,
        queue: [],
        TAs: []
    }

    res.send("created the room")
})

app.get('/api/student/join', (req, res) => {
    room = rooms[req.query.roomID]
    room.queue.push(new Student(req.query.id, req.query.question))
    res.send('Joined the queue')
    console.log("SOMEONE JOINED THE QUEUE")
    sendUpdate()
});

app.get('/api/student/edit', (req, res) => {
    room = rooms[req.query.roomID]
    student = room.queue.find(s => s.id === req.query.id)
    student.question = req.query.question
    res.send('Updated the question')
    sendUpdate()
});

app.get('/api/student/leave', (req, res) => {
    room = rooms[req.query.roomID]
    if (!room) return res.send('failed');
    room.queue = room.queue.filter(s => s.id !== req.query.id)
    res.send('Left the queue')
    sendUpdate()
});

app.get('/api/ta/join', (req, res) => {
    room = rooms[req.query.roomID]
    room.TAs.push(req.query.id)
    res.send('Joined the TAs')
    sendUpdate()
});

app.get('/api/ta/leave', (req, res) => {
    console.log(req.query.id)
    console.log(rooms)
    room = rooms[req.query.roomID]
    room.TAs = room.TAs.filter(ta => ta !== req.query.id)
    console.log(room.TAs)
    res.send('Left the TAs')
    console.log("LEFT SUCCESSFULLY")
    console.log(rooms)
    sendUpdate()
});

app.get('/api/ta/move', (req, res) => {
    room = rooms[req.query.roomID]
    student = room.queue.find(s => s.id === req.query.id)
    if (student) {
        room.queue = room.queue.filter(s => s.id !== student.id)
        if (req.query.unhelp) {
            student.beginHelpedByID = ""
        }
        if (req.query.index === -1) {
            req.query.index.push(student)
        } else {
            room.queue.splice(req.query.index, 0, student)
        }
        console.log('moving someone')
        res.send("Moved the student")
    } else {
        console.log('failed to move someone')
        res.send("Failed to move the student")
    }
    sendUpdate()
})

app.get('/api/ta/kick', (req, res) => {
    room = rooms[req.query.roomID]
    room.queue = room.queue.filter(s => s.id !== req.query.id)
    res.send("Kicked student " + req.params.id)
    sendUpdate()
})

app.get('/api/ta/help', (req, res) => {
    room = rooms[req.query.roomID]
    s = room.queue.find(s => s.id === req.query.id)
    s.beginHelpedByID = req.query.taID
    res.send(`Ta ${req.query.taID} is now helping ${req.query.id}`)
    sendUpdate()
})

app.get('/api/ta/putback', (req, res) => {
    console.log('putting back' + req.query.id)
    room = rooms[req.query.roomID]
    student = room.queue.find(s => s.id === req.query.id)
    student.beginHelpedByID = ''
    if (student) {
        room.queue = room.queue.filter(s => s.id !== student.id)
        room.queue.splice(req.query.index, 0, student)
    }
    res.send(`${req.query.id} is no longer being helped and is now moved to ${req.query.index}`)
    sendUpdate()
})

server.listen(3000, () => {
    console.log(`App running on port ${3000}`)
})