var mcSchema = {
    additionalProperties: false,
    required: ['question', 'correctAnswer', 'alternatives', 'type'],
    properties: {
        _id: {
            type: 'string'
        },
        question: {
            minLength: 1,
            type: 'string'
        },
        correctAnswer: {
            minLength: 1,
            type: 'string'
        },
        alternatives: {
            type: 'array',
            minItems: 1,
            items: {
                minLength: 1,
                type: 'string'
            }
        },
        collaborators: {
            type: 'array',
            minItems: 1,
            items: {
                minLength: 1,
                type: 'string'
            }
        },
        type: {
            constant: 'mc'
        },
        image: {
            additionalProperties: false,
            required: ['url'],
            properties: {
                url: {
                    type: 'string',
                    format: 'uri'
                }
            }
        },
        explanation: {
            type: 'string',
            maxLength: 50000
        }
    }
};