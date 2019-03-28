const receiveItems = require("express").Router();
const moment = require("moment");
const ReceiveItem = require("../../models/ReceiveItem");

receiveItems.get("/", (req, res) => {
  ReceiveItem.find()
    .populate("item purchaseOrder measuringType createdBy updatedBy")
    .exec(async (err, items) => {
      if (err) return res.json({ success: false, error: err });

      for await (const receiveItem of items) {
        /* const fileName = `stocks_${receiveItem.purchaseOrder.code}_${
                receiveItem.item.code
              }_${moment(receiveItem.createdAt).format("YYMMDD")}.csv`; */
        let stockCodes = [];
        for (let i = 1; i <= receiveItem.units; i++) {
          const stockCode = `${receiveItem.purchaseOrder.code}${
            receiveItem.item.code
          }${moment(receiveItem.createdAt).format("YYMMDD")}${i}`;
          const stockCodeItem = {
            poNumber: receiveItem.purchaseOrder.code,
            itemCode: receiveItem.item.code,
            receiveDate: moment(receiveItem.createdAt).format("YYMMDD"),
            running: i,
            code: stockCode
          };
          stockCodes.push(stockCodeItem);
        }
        receiveItem._doc.stockCodes = stockCodes;
      }
      return res.json({ success: true, data: items });
    });
});

module.exports = receiveItems;
