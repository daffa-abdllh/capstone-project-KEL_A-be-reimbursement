import { DataTypes } from "sequelize"
import { sequelize } from "../../config/config.js"

const Category = sequelize.define("categories", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: "name",
            msg: "Category name already exists."
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true,
    defaultScope: { where: {} },
    scopes: {
        active: { where: { status: true } },
        nonActive: { where: { status: false } }
    },
    indexes: [
        {
            name: "idx_categories",
            unique: true,
            fields: ["name"]
        }
    ]
})

export default Category