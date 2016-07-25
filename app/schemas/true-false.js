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
                }
            }
        }
    }
}