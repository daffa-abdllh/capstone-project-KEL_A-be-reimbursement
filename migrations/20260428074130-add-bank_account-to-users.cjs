'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.addColumn("users", "bank_account", {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
      })
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeColumn("users", "bank_account")
    })
  }
};
