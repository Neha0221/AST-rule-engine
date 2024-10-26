# Rule Engine with AST

## Overview

This project is a simple Rule Engine built to determine user eligibility based on the user's attributes, such as age, department, income, spend, etc. The core component is based on an **Abstract Syntax Tree (AST)** to dynamically create, combine, and evaluate rules efficiently.

The application is designed in three layers (API, Backend, and Data). It exposes easy-to-use RESTful APIs for creating and managing rules, combining them, and evaluating incoming user data against the specified rules.

#### Key Features:

- Dynamic rule creation using Abstract Syntax Tree (AST).
- Combination of multiple rules into one.
- Modular design for easy rule modification and extension.
- Error handling and validation mechanisms for robust rule processing.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Example Requests](#example-requests)
- [Testing](#testing)
- [Rule Engine Data Storage Documentation](#testing)
- [Project Structure](#project-structure)

## Features

1. **Create Rule:** Parse and construct an AST from a string rule.
2. **Combine Rules:** Combine multiple ASTs into one.
3. **Evaluate Rule:** Evaluate the rule's AST against user data to determine eligibility.
4. **Error Handling:** Invalid syntax and input handling through custom exceptions.
5. **Validation:** Validation for attributes to be part of a catalog.

## Tech Stack

- **Node.js**: The runtime environment for server-side application logic.
- **Express**: The framework for building the RESTful API.
- **JavaScript ES6**: The programming language used.
- **MongoDB** (or any preferred NoSQL DB): For storing rules and rule-metadata.
- **Mongoose**: ODM for MongoDB.

## Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js**: `>= 12.x`
- **MongoDB**: `>= 4.x`
- **npm**: `>= 6.x`

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Neha0221/AST-rule-engine.git
   cd AST-rule-engine
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Ensure your MongoDB is running locally or via a managed service if MongoDB URI is provided.

4. Set up the environment variables (Check [Environment Variables](#environment-variables)).

## Environment Variables

Make sure to create a `.env` file with the following environment variables:

```
# Application environment
PORT=3000

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/rule_engine
```

## Usage

### API Endpoints

#### Create Rule

- **POST** `/create_rule`
  - Description: Creates a rule and returns the AST representation.
  - Request Body:
    ```json
    {
      "rule": "((age > 30 AND department!='sales') OR (age < 25 AND department = 'Marketing manager'))"
    }
    ```
  - Response:
    ```json
    {
      "type": "operator",
      "value": "OR",
      "left": {
        "type": "operator",
        "value": "AND",
        "left": {
          "type": "operand",
          "value": {
            "field": "age",
            "operator": ">",
            "value": 30
          },
          "left": null,
          "right": null
        },
        "right": {
          "type": "operand",
          "value": {
            "field": "department",
            "operator": "!=",
            "value": "sales"
          },
          "left": null,
          "right": null
        }
      },
      "right": {
        "type": "operator",
        "value": "AND",
        "left": {
          "type": "operand",
          "value": {
            "field": "age",
            "operator": "<",
            "value": 25
          },
          "left": null,
          "right": null
        },
        "right": {
          "type": "operand",
          "value": {
            "field": "department",
            "operator": "=",
            "value": "Marketing manager"
          },
          "left": null,
          "right": null
        }
      }
    }
    ```

#### Combine Rules

- **POST** `/combine_rules`
  - Description: Combines multiple rules into a single AST.
  - Request Body:
    ```json
    {
      "rules": [
        "(age > 30 AND department!='sales')",
        "(age < 25 AND department = 'Marketing manager')"
      ]
    }
    ```
  - Response:
    ```json
    {
      "type": "operator",
      "value": "AND",
      "left": {
        "type": "operator",
        "value": "AND",
        "left": {
          "type": "operand",
          "value": {
            "field": "age",
            "operator": ">",
            "value": 30
          },
          "left": null,
          "right": null
        },
        "right": {
          "type": "operand",
          "value": {
            "field": "department",
            "operator": "!=",
            "value": "sales"
          },
          "left": null,
          "right": null
        }
      },
      "right": {
        "type": "operator",
        "value": "AND",
        "left": {
          "type": "operand",
          "value": {
            "field": "age",
            "operator": "<",
            "value": 25
          },
          "left": null,
          "right": null
        },
        "right": {
          "type": "operand",
          "value": {
            "field": "department",
            "operator": "=",
            "value": "Marketing manager"
          },
          "left": null,
          "right": null
        }
      }
    }
    ```

#### Evaluate Rule

- **POST** `/evaluate_rule`
  - Description: Evaluates a rule against user data and returns True or False.
  - Request Body:
    ```json
    {
      "rule": "((age > 30 AND department!='sales') OR (age < 25 AND department = 'Marketing manager'))",
      "data": {
        "department": "hello"
      }
    }
    ```
  - Response:
    ```json
    {
      "result": true
    }
    ```

### Example Requests

#### 1. Create Rule

```bash
curl --location 'http://localhost:3000/create_rule' \
--header 'Content-Type: application/json' \
--data '{
    "rule": "((age > 30 AND department!='\''sales'\'') OR (age < 25 AND department = '\''Marketing manager'\''))"
}'
```

#### 2. Combine Rules

```bash
curl --location 'http://localhost:3000/combine_rules' \
--header 'Content-Type: application/json' \
--data '{
    "rules": [
        "(age > 30 AND department!='\''sales'\'')",
        "(age < 25 AND department = '\''Marketing manager'\'')"
    ]
}'
```

#### 3. Evaluate Rule

```bash
curl --location 'http://localhost:3000/evaluate_rule' \
--header 'Content-Type: application/json' \
--data '{
    "rule": "((age > 30 AND department!='\''sales'\'') OR (age < 25 AND department = '\''Marketing manager'\''))",
    "data": {
        "department": "hello"
    }
}'
```

## Testing

1. You can run tests by running the `test.py` file after setting up everything:
   ```bash
   node test.py
   ```

---

## Rule Engine Data Storage Documentation

### 1. Choice of Database

**Database Chosen: MongoDB**

#### Rationale

- **Flexibility**: MongoDB provides a schema-less structure that is highly flexible, allowing easy updates to data models without downtime or migrations.
- **Scalability**: As a NoSQL database, MongoDB is designed for handling large-scale data applications, allowing horizontal scaling.
- **Nestable Data**: MongoDB's document-based storage system is perfect for representing complex, nested structures like Abstract Syntax Trees (AST).
- **Rich Query Language**: Offers robust query capabilities, which are beneficial for dynamic rule evaluation and manipulation.

### 2. Database Schema

The application uses MongoDB to store rules and their associated AST nodes. Here are the collections and their schemas:

#### Collection: `rules`

Each document in this collection represents a rule with its metadata.

##### Schema

```json
{
    "_id": ObjectId("..."),        // Unique identifier for the rule.
    "rule_string": "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing'))",
                                    // The human-readable representation of the rule.
    "root_node_id": ObjectId("..."),// The unique identifier for the root node of the AST.
    "created_at": ISODate("2023-10-01T12:00:00Z"),  // Timestamp of when the rule was created.
    "updated_at": ISODate("2023-10-01T12:00:00Z")   // Timestamp when the rule was last updated.
}
```

````
#### Collection: `astNodes`

Each document in this collection represents a single node within an AST.

##### Operator Node Schema

```json
{
    "_id": ObjectId("..."),         // Unique identifier for the AST node.
    "type": "operator",             // Specifies the type of node ("operator").
    "value": "AND",                 // The logical operator, e.g., AND, OR.
    "left_node_id": ObjectId("..."),// Reference to the left child node.
    "right_node_id": ObjectId("..."),// Reference to the right child node.
    "created_at": ISODate("2023-10-01T12:00:00Z"),  // Timestamp of node creation.
    "updated_at": ISODate("2023-10-01T12:00:00Z")   // Timestamp of node update.
}
````

##### Operand Node Schema

```json
{
    "_id": ObjectId("..."),         // Unique identifier for the AST node.
    "type": "operand",              // Specifies the type of node ("operand").
    "value": { "attribute": "age", "operator": ">", "value": 30 },
                                    // Dictionary defining the condition.
    "left_node_id": null,           // Operands usually don't have children.
    "right_node_id": null,          // Operands usually don't have children.
    "created_at": ISODate("2023-10-01T12:00:00Z"),  // Timestamp of node creation.
    "updated_at": ISODate("2023-10-01T12:00:00Z")   // Timestamp of node update.
}
```

### Example of Storing a Rule and AST Nodes

1. **Store the Rule in `rules` Collection**: Insert the rule with its string representation and root node ID.
2. **Store Each Node in `astNodes` Collection**: Insert nodes representing the logic and conditions of the rule, linking them with node IDs.

#### Sample Rule Structure:

- **Rule String**: `(age > 30 AND department = 'Sales') OR (salary > 50000)`
- **AST Representation**: Stored as linked nodes in `astNodes`.

This schema provides a structured and scalable approach to storing, retrieving, and managing rules and their logical representations using MongoDB.


## Project Structure

The project follows a modular structure with clean separation of concerns.

```

.
├── CODE_OF_CONDUCT.md
├── LICENSE
├── app.js # Main entry point of the application
├── config
│ └── database.js # MongoDB connection configuration
├── models
│ ├── ast_node.js # Mongoose schema for AST node
│ ├── operator.js # Schema for operators (AND/OR etc.)
│ └── operator_value.js # Schema for operator's values
├── services
│ ├── ast_builder.js # Service to build AST from string
│ ├── ast_evaluator.js # Service to evaluate AST against user data
│ └── ast_manager.js # Manages overall rule-flow
├── test.py # Test cases
└── utils
├── custom_exception.js # Custom error handling
└── utils.js # Helper utilities

```
