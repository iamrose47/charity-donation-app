const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')


const User = sequelize.define('users',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    role:{
        type:DataTypes.STRING,
        defaultValue:'user'
    },
     phone: {
        type: DataTypes.STRING, 
        allowNull: true
    },
     address: {
       type: DataTypes.STRING, 
       allowNull: true
    }



});

module.exports = User;