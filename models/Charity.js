const{DataTypes} =require('sequelize')
const sequelize = require('../config/db')

const Charity = sequelize.define('charities',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
        len: [10, 15], // optional length validation
        },
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true,
    },
     mission: {
        type: DataTypes.TEXT,
        allowNull: true
    },
     category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    donationGoal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    currentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
     isApproved: {
       type: DataTypes.BOOLEAN,
       defaultValue: false
    },
     website: {
       type: DataTypes.STRING,
       allowNull: true,
       validate: { isUrl: true }
    },
    role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'charity'
  }

})


module.exports = Charity;