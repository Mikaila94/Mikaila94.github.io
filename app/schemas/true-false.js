var tfSchema = {
    additionalProperties: false,
    required: ['question', 'correctAnswer', 'type'],
    properties: {
        _id: {
            type: 'string'
        },
        question: {
            minLength: 1,
            type: 'string'
        },
        correctAnswer: {
            type: 'boolean'
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
            constant: 'tf'
        },
        image: {
            additionalProperties: false,
            required: ['url'],
            properties: {
                url: {
                    type: 'string',
                    format: 'uri'
                },
                _id: {
                    type: 'string'
                }
            }
        },
        explanation: {
            type: 'string',
            maxLength: 500
        }
    }
}