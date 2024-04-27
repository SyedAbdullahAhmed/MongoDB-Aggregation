// Download data from their and save to compass or atlas
// in 3 collections ,users,authors,books
//https://gist.github.com/hiteshchoudhary/a80d86b50a5d9c591198a23d79e1e467

//Q1:How many users are active?
[
	// match isActive fields true and gather all docs
  {
    $match: {
      isActive: true 
    }
  },
  // count docs
  {
    $count: 'activeUsers'
  }
]

//Q2:What is average age of all users?
[
  {
    $group: {
      _id: "$gender", // make group wrt gender
      averageAge: {
        $avg: "$age" // calculate average wrt age
      }
    }
  }
]

[
  {
    $group: {
      _id: null, // select whole collection
      averageAge: {
        $avg: "$age" // calculate average wrt age
      }
    }
  }
]
//Q3:List top 5 most common favourite fruits amoung the users?
[
  {
    $group: {
      _id: "$favoriteFruit", // group wrt fruits
      count: {
        $sum: 1 // sum each group
      }
    }
  },
  {
    $sort: {
      count: -1 // descending order
    }
  },
  {
    $limit: 2 // need only top 2 doc
  }
]
//Q4:Find total numbers of males and females?
[
  {
    $group: {
      _id: "$gender",
      count: {
        $sum: 1
      }
    }
  }
]
//Q5:Which country has highest users?
[
  {
    $group: {
      _id: "$company.location.country",
      count: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      count: -1
    }
  },
  {
    $limit: 1
  }
]
//Q6:List all unique eyecolor?
[
  {
    $group: {
      _id: "$eyeColor",
    }
  }
]
//Q7:Calculate average of no. of tags used by users?
// 1st way
[
  {
    $unwind: "$tags" // if arr has length 3, for each value in arr it creates a diff document, now there are 3 docs in total
  },
  {
    $group: {
      _id: "$_id",
      noOfTags: {$sum: 1}
    }
  },
  {
    $group: {
      _id: null,
      averageNoOfTags: {
        $avg: "$noOfTags"
      }
    }
  }
]
// 2nd way
[
  {
    $addFields: {
      numberOfTags: {
        $size: { // return size of array
          $ifNull: ["$tags", []], // if null value return []
        },
      },
    },
  },
  {
    $group: {
      _id: null,
      averageNumberOfTags: {$avg: "$numberOfTags"}
    }
  }
]

//Q8:How many users have enim as one of their tags?
[
  {
    $unwind: "$tags"
  },
  {
    $match: {
      tags: "enim"
    }
  },
  {
    $count: 'total'
  }
]

//or
[
  {
    $match: {
      tags: "enim"
    }
  },
  {
    $count: 'usersWithenimTags'
  }
]

//Q9:What are names and age of users who are inactive and have 'velit' as a tag?
[
  {
    "$match": {
      "$and": [
        {"tags": "velit"},
        {"isActive": false}
      ]
    }
  },
  {
    $project: {
      name: 1,
      age: 1
    }
  }
]

// or
[
  {
    "$match": {
       "tags": "velit","isActive": false
    }
  },
  {
    $project: {
      name: 1,
      age: 1
    }
  }
]

// Q10: How many users have a phone number starting with '+1(q40)'
[
  { 
    $match: { 
    "company.phone": /^\+1 \(940\)/ 
  	} 
  },
  {
    $count: 'phoneNumbers'
  }
]
//Q11: Who has regsitered most recently?
[
  { 
    $sort: { 
     registered: -1
  	} 
  },
  {
    $limit: 2
  },
  {
    $project: {
      name: 1,
      registered: 1,
      favoriteFruit: 1
    }
  }
]

//Q: Categorized user names by their favoriteFruit?
[
  {
    $group: {
      _id: "$favoriteFruit",
      users: { $push: "name" },
    },
  },
]
//QHow many users have 'ad' as 2nd tag in their list of tags?
[
  {
    $match: {
      "tags.1" : "ad"
    }
  },
  {
    $count: 'users'
  }
]

// Q Find users who have both enim and id as their tags
[
  {
    $match: {
      tags: {$all: ["enim","id"]}
    }
  },
  {
    $count: 'users'
  }
]
// or
[
  {
    "$match": {
      "$and": [
        {
          "tags": {
            "$in": ["id", "$tags"]
          }
        },
        {
          "tags": {
            "$in": ["enim", "$tags"]
          }
        }
      ]
    }
  },
  {
    $count: 'string'
  }
]

// Q List all companies located in USA with their corresponding user count.
[
  {
    $match: {
      "company.location.country": "USA"
    }
  },
  {
    $group: {
      _id: "$company.title",
      users: {$sum:1}
    }
  }
]

// Lookup 2 collections
[
  {
    "$lookup": {
      "from": "authors",
      "localField": "author_id",
      "foreignField": "_id",
      "as": "author_details"
    }
  },
  { // return 1st value of arr so frontend developer use easily
    "$addFields": {
      "author_detail": { "$arrayElemAt": ["$author_details", 0] }
    }
  },
  { // convert nested object to normal fields
   	"$addFields": {
   	  "name": "$author_detail.name",
   	  "birth_year": "$author_detail.birth_year"
   	} 
  },
  {
    "$project": {
      "author_details": 0,
      "author_detail": 0
    }
  },
]
// or
[
  {
    "$lookup": {
      "from": "authors",
      "localField": "author_id",
      "foreignField": "_id",
      "as": "author_details"
    }
  },
  {
    "$addFields": {
      "author_detail": { "$arrayElemAt": ["$author_details", 0] }
    }
  },
  {
    "$project": {
      "author_details": 0
    }
  }
]
