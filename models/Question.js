module.exports = async function(sequelize, DataTypes){ 
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
    Question.getResponses = async function() {
        responses = []
        var choicesList = await this.getChoices();
        console.log(choicesList)
        choicesList.forEach(async choice => {
            var votes = await choice.getVotes
            responses.push(votes)
        })
        return JSON.stringify({
            "responses": responses
        })
    }
    return Question;
};