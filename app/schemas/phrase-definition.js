var pdSchema = {
    additionalProperties: false,
    required: ['question', 'correctAnswer', 'tags', 'type'],
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
        type: {
            constant: 'pd'
        },
        tags: {
            type: 'array',
            minItems: 1,
            items: {
                minLength: 1,
                type: 'string'
            }
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