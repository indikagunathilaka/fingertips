const materialRequests = require("express").Router();

const MaterialRequest = require("../../models/MaterialRequest");
const RequestItem = require("../../models/RequestItem");
const BinStock = require("../../models/BinStock");

materialRequests.get("/", (req, res) => {
  let searchParam = {};
  if (req.query.status) {
    searchParam.status = { $in: req.query.status.split(",") };
  }
  MaterialRequest.find(searchParam)
    .populate({ path: "items", populate: { path: "item stockItems" } })
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

materialRequests.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  MaterialRequest.find(queryData)
    .populate({ path: "items", populate: { path: "item stockItems" } })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

materialRequests.post("/", (req, res) => {
  let material = new MaterialRequest(req.body);
  material.createdBy = req.user.id;
  const materialItemIds = [];

  req.body.items.forEach(obj => {
    let materialItem = new RequestItem(obj);
    materialItem.materialRequest = material._id;
    //materialItem.totalQuantity = materialItem.unitWeight * materialItem.units;
    materialItem.createdBy = req.user.id;
    materialItemIds.push(materialItem._id);

    materialItem.save(err => {
      if (err) return console.log(err);
    });
  });

  material.items = materialItemIds;
  material.save((err, data) => {
    if (err) return res.json({ success: false, error: err });
    BinStock.updateMany(
      { _id: { $in: req.body.stockItems } },
      { $set: { status: "RESERVED" } },
      (err, binStock) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data });
      }
    );
    //return res.json({ success: true });
  });
});

materialRequests.get("/:id", (req, res) => {
  MaterialRequest.findById(req.params.id)
    .populate({
      path: "items",
      populate: [
        { path: "item" },
        { path: "stockItems", populate: { path: "orderItem bin" } }
      ]
    })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error, err });
      return res.json({ success: true, data: data });
    });
});

materialRequests.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  //console.log("Update:", req.body, ", ID:", req.params.id);
  MaterialRequest.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  );
  /* MaterialRequest.findById(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    data.status = req.body.status;
    data.updatedBy = req.user.id;
    data.save((err, item) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: item });
    });
  }); */
});

materialRequests.delete("/:id", async (req, res) => {
  //const deliveryList = await Delivery.find({ materialRequests: { $in: [req.params.id] }});
  //console.log("Deliveries:", deliveryList);
  MaterialRequest.findByIdAndDelete(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    data.items.forEach(item => {
      BinStock.updateMany(
        { _id: { $in: item.stockItems } },
        { $set: { status: "AVAILABLE" } }
      ).exec();

      RequestItem.findByIdAndDelete(item._id, (err, item) => {
        if (err) console.log("Material request item deletion failed.", err);
      });
    });
    return res.json({ success: true, data: data });
  });
});

module.exports = materialRequests;
