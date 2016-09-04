var
    answer = helper.answer,
    question = helper.question;

var pdSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['question', 'correct', 'tags', 'type'],
    properties: {
        _id: {
            type: 'string'
        },
        question: question,
        correct: answer,
        type: {
            constant: 'pd'
        },
        collaborators: {
            type: 'array',
            items: {
                minLength: 1,
                type: 'string'
            }
        },
        explanation: question,
        tags: {
            type: 'array',
            minItems: 1,
            items: {
                minLength: 1,
                type: 'string'
            }
        }
    }
};