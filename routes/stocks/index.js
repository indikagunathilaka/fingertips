const stocks = require("express").Router();

const BinStock = require("../../models/BinStock");

stocks.delete("/:id", (req, res) => {
  BinStock.findByIdAndDelete(req.params.id, (err, stock) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: stock });
  });
});

module.exports = stocks;
