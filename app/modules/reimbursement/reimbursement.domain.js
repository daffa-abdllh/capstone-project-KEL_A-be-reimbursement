import { DataTypes, UUID } from "sequelize"
import { sequelize } from "../../config/config.js"
import User from "../user/user.domain.js"
import Category from "../category/category.domain.js"

const Reimbursement = sequelize.define("reimburses", {
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
    category_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    notas: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },
    proof_of_payments: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    timestamps: true,
    indexes: [
        {
            name: "idx_reimbursement",
            unique: true,
            fields: ["category_id", "user_id"]
        }
    ]
})

Reimbursement.belongsTo(User, { foreignKey: "user_id" })
User.hasMany(Reimbursement, { foreignKey: "user_id" })

Reimbursement.belongsTo(Category, { foreignKey: "category_id" })
Category.hasMany(Reimbursement, { foreignKey: "category_id" })

export default Reimbursement