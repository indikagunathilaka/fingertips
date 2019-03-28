const materialRequests = require("express").Router();

const MaterialRequest = require("../../models/MaterialRequest");
const RequestItem = require("../../models/RequestItem");

materialRequests.get("/", (req, res) => {
  MaterialRequest.find()
    .populate({ path: "items", populate: { path: "item measuringType" } })
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
    materialItem.totalQuantity = materialItem.unitWeight * materialItem.units;
    materialItem.createdBy = req.user.id;
    materialItemIds.push(materialItem._id);

    materialItem.save(err => {
      if (err) return console.log(err);
    });
  });

  material.items = materialItemIds;
  material.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

materialRequests.get("/:id", (req, res) => {
  MaterialRequest.findById(req.params.id)
    .populate({ path: "items", populate: { path: "item measuringType" } })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error, err });
      return res.json({ success: true, data: data });
    });
});

materialRequests.delete("/:id", (req, res) => {
  MaterialRequest.findByIdAndDelete(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    data.items.forEach(item => {
      RequestItem.findByIdAndDelete(item._id, (err, item) => {
        if (err) console.log("Material request item deletion failed.", err);
      });
    });
    return res.json({ success: true, data: data });
  });
});

module.exports = materialRequests;
