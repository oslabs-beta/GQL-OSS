export const schema = {
    "visualizerSchema": {
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
                        "returnType": "[Country!]!"
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
                        "returnType": "Continent!"
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
                        "returnType": "[Language!]!"
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
                        "returnType": "[State!]!"
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
                        "returnType": "Continent"
                    },
{
                        "fieldName": "continents",
                        "returnType": "[Continent!]!"
},
{
                        "fieldName": "countries",
                        "returnType": "[Country!]!"
},
{
                        "fieldName": "country",
                        "returnType": "Country"
},
{
                        "fieldName": "language",
                        "returnType": "Language"
},
{
                        "fieldName": "languages",
                        "returnType": "[Language!]!"
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
                        "returnType": "Country!"
},
{
                        "fieldName": "name",
                        "returnType": "String!"
}
                ]
            }
        ]
    }
}