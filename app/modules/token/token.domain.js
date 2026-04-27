import { DataTypes } from "sequelize"
import { sequelize } from "../../config/config.js"
import User from "../user/user.domain.js"

const Token = sequelize.define("tokens", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: {
            name: "token",
            msg: "Token already exists."
        }
    },
    user_agent: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usage: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["user_id", "token"]
        }
    ]
})

Token.belongsTo(User, { foreignKey: "user_id" })
User.hasMany(Token, { foreignKey: "user_id" })

export default Token