```javascript
let data = {
    // TODO: insert your data structure that contains 
    // users + quizzes here
    users: {
        authUserId: 1,
        email: "email@email.com",
        password: "password12345!!!",
        nameFirst: "Name"
        nameLast: "Name"
        oldPassword: ["oldPassword1^^^", "oldPassword2$$$"],
        newPassword: "passowrd12345!!!"
        numSuccessfulLogins: 0,
        numFailedPasswordsSinceLastLogin: 56743,
        timeCreated: 12394293,
        timeLastEdited: 19884239,
        sessions: [123123, 4523122]
    }
    quizzes: {
        quizId: 1,
        owner: 1, //UserId
        name: "quiz",
        description: "quiz description",
        timeCreated: 12394293,
        timeLastEdited: 12391293,
        questions: [{
            {
                {
                    questionId: 1,
                    questionPrompt: "Who let the dogs out",
                    answers: [
                        "Who", "Hugh", "Hoo", "You"
                    ],
                    correct_answer: "Who"
                }
            }
        }]
    }
}
//what the question struct is supposed to look like
let question = {
    questionId: 1,
    questionPrompt: "Who let the dogs out",
    answers: [
        "Who", "Hugh", "Hoo", "You"
    ],
    correct_answer: "Who"
}
//Token/Session data structure draft
let token = {
    sessionId:
}
sessions = [{
    {
        sessionId: "16dgsad"
    },
    {
        sessionId: "asdj61j"
    }
}]
```

[Optional] short description: 

This initial data structure is based off the return types and parameters given to us in the project spec + a few assumptions we've made based on that. These assumptions include timeCreated and timeLastEdited fields for the user since it is present for quizzes, making oldPassword an array of strings since a user may reset their password multiple times, and making newPassword equivalent to password(they may end up being the same variable though).
