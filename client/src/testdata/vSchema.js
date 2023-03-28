{
    "mutationName": null,
    "queryName": {
        "name": "Query"
    },
    "objectTypes": [
        {
            "name": "Continent",
            "fields": [
                {
                    "fieldName": "code",
                    "returnType": "ID!"
                },
                {
                    "fieldName": "countries",
                    "returnType": "[Country!]!",
                    "relationship": "Country"
                },
                {
                    "fieldName": "name",
                    "returnType": "String!"
                }
            ]
        },
        {
            "name": "Country",
            "fields": [
                {
                    "fieldName": "awsRegion",
                    "returnType": "String!"
                },
                {
                    "fieldName": "capital",
                    "returnType": "String"
                },
                {
                    "fieldName": "code",
                    "returnType": "ID!"
                },
                {
                    "fieldName": "continent",
                    "returnType": "Continent!",
                    "relationship": "Continent"
                },
                {
                    "fieldName": "currencies",
                    "returnType": "[String!]!"
                },
                {
                    "fieldName": "currency",
                    "returnType": "String"
                },
                {
                    "fieldName": "emoji",
                    "returnType": "String!"
                },
                {
                    "fieldName": "emojiU",
                    "returnType": "String!"
                },
                {
                    "fieldName": "languages",
                    "returnType": "[Language!]!",
                    "relationship": "Language"
                },
                {
                    "fieldName": "name",
                    "returnType": "String!"
                },
                {
                    "fieldName": "native",
                    "returnType": "String!"
                },
                {
                    "fieldName": "phone",
                    "returnType": "String!"
                },
                {
                    "fieldName": "phones",
                    "returnType": "[String!]!"
                },
                {
                    "fieldName": "states",
                    "returnType": "[State!]!",
                    "relationship": "State"
                }
            ]
        },
        {
            "name": "Language",
            "fields": [
                {
                    "fieldName": "code",
                    "returnType": "ID!"
                },
                {
                    "fieldName": "name",
                    "returnType": "String!"
                },
                {
                    "fieldName": "native",
                    "returnType": "String!"
                },
                {
                    "fieldName": "rtl",
                    "returnType": "Boolean!"
                }
            ]
        },
        {
            "name": "Query",
            "fields": [
                {
                    "fieldName": "continent",
                    "returnType": "Continent",
                    "relationship": "Continent"
                },
                {
                    "fieldName": "continents",
                    "returnType": "[Continent!]!",
                    "relationship": "Continent"
                },
                {
                    "fieldName": "countries",
                    "returnType": "[Country!]!",
                    "relationship": "Country"
                },
                {
                    "fieldName": "country",
                    "returnType": "Country",
                    "relationship": "Country"
                },
                {
                    "fieldName": "language",
                    "returnType": "Language",
                    "relationship": "Language"
                },
                {
                    "fieldName": "languages",
                    "returnType": "[Language!]!",
                    "relationship": "Language"
                }
            ]
        },
        {
            "name": "State",
            "fields": [
                {
                    "fieldName": "code",
                    "returnType": "String"
                },
                {
                    "fieldName": "country",
                    "returnType": "Country!",
                    "relationship": "Country"
                },
                {
                    "fieldName": "name",
                    "returnType": "String!"
                }
            ]
        }
    ]
}