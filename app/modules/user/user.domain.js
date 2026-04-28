import { DataTypes } from "sequelize"
import { sequelize } from "../../config/config.js"

const User = sequelize.define("users", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: "username",
            msg: "Username already exists."
        }
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    bank_account: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        unique: {
            name: "phone_number",
            msg: "Phone Number already exists."
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        unique: {
            name: "email",
            msg: "Email already exists."
        }
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: true,
    indexes: [
        {
            name: "idx_users",
            unique: true,
            fields: ["username", "email", "phone_number"]
        }
    ]
})

export default User