const express = require('express');
const dotenv = require('dotenv');
const ASTBuilder = require('./services/ast_builder')
const ASTEvaluator = require('./services/ast_evaluator')
const ASTManager = require('./services/ast_manager')
const connectDB = require('./config/database')

dotenv.config();

const app = express();
app.use(express.json());

const astBuilder = new ASTBuilder();
const astEvaluator = new ASTEvaluator();
const astManager = new ASTManager(astBuilder, astEvaluator);

// Route for creating a rule
app.post('/create_rule', (req, res) => {
    const { rule } = req.body;
    if (!rule) {
        return res.status(400).send("Rule is required.");
    }

    try {
        const astNode = astManager.createRule(rule);
        res.json(astNode);
    } catch (error) {
        res.status(500).send(`Error creating rule: ${error.message}`);
    }
});

// Route for combining rules
app.post('/combine_rules', (req, res) => {
    const { rules } = req.body;
    if (!Array.isArray(rules) || rules.length === 0) {
        return res.status(400).send("A list of rules is required.");
    }

    try {
        const combinedAstNode = astManager.combineRules(rules);
        res.json(combinedAstNode);
    } catch (error) {
        res.status(500).send(`Error combining rules: ${error.message}`);
    }
});

// Route for evaluating a rule
app.post('/evaluate_rule', (req, res) => {
    const { rule, data } = req.body;
    if (!rule || !data) {
        return res.status(400).send("Rule and data are required.");
    }

    try {
        const result = astManager.evaluate(rule, data);
        res.json({ result });
    } catch (error) {
        res.status(500).send(`Error evaluating rule: ${error.message}`);
    }
});

// Main function to connect to DB and start server
const startServer = async () => {
    try {
        // Block execution until the database is connected
        await connectDB();

        // Once connected, start the server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
    }
};

// Run the startServer function
startServer();