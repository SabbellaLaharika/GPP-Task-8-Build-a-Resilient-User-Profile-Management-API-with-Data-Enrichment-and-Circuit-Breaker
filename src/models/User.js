const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    registrationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'registration_date' // Map to snake_case column in DB
    }
}, {
    tableName: 'users',
    timestamps: false // We are managing registration_date manually/via default
});

module.exports = User;
