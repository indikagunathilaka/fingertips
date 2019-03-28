const packingTypes = require("express").Router();

const PackingType = require("../../models/PackingType");

packingTypes.get("/", (req, res) => {
  PackingType.find()
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

packingTypes.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  PackingType.find(queryData)
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

packingTypes.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  PackingType.create(req.body, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

packingTypes.get("/:id", (req, res) => {
  PackingType.findById(req.params.id, (err, type) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: type });
  });
});

packingTypes.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  PackingType.findByIdAndUpdate(req.params.id, req.body, (err, type) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: type });
  });
});

packingTypes.delete("/:id", (req, res) => {
  PackingType.findByIdAndDelete(req.params.id, (err, type) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: type });
  });
});

module.exports = packingTypes;
