# dev server
for frontend developers
> it's like firebase for docker :-)

Just fire up the server and database with:
```
$ npm install
$ docker-compose up
```

## endpoints
POST
{"name": "John Smith"} ->
http://localhost:4000/school/students

... will create the database "school" and the collection "students" with John added

GET
http://localhost:4000/school/students

... will get all items in the students collection

POST {"name": "John Smith"} ->
http://localhost:4000/school/students/find

... will find students named John Smith

## schema support
POST
``` json
{
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "name",
            "address.city",
            "address.street"
        ],
        "properties": {
            "name": {
                "bsonType": "string",
                "description": "must be a string and is required"
            },
            "gender": {
                "bsonType": "string",
                "description": "must be a string and is not required"
            },

            "address.city": {
                "bsonType": "string",
                "description": "must be a string and is required"
            },
            "address.street": {
                "bsonType": "string",
                "description": "must be a string and is required for sure"
            }
        }
    }
}
``` 
to:
http://localhost:4000/school/students/schema

... will define a $jsonSchema for the students collection

(see: https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/)

GET
http://localhost:4000/school/students/schema

... will get the schema