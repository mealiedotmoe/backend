module.exports = function(sequelize, DataTypes){ 
    var Question = sequelize.define('question', {
        text: {
        type: DataTypes.STRING,
        allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
        },
        multiple_options: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        admin_abuse: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    });
    Question.prototype.getResponses = function() {
        responses = []
        var choicesList = this.getChoices();
        choicesList.forEach(choice => {
            var votes = choice.getVotes
            responses.push(votes)
        })
        return JSON.stringify({
            "responses": responses
        })
    }
    return Question;
};