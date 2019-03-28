const shipmentModes = require("express").Router();

const ShipmentMode = require("../../models/ShipmentMode");

shipmentModes.get("/", (req, res) => {
  ShipmentMode.find({ parent: null })
    .populate("children")
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

shipmentModes.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  ShipmentMode.find(queryData)
    .populate("children")
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

shipmentModes.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  ShipmentMode.create(req.body, (err, data) => {
    if (req.body.parent) {
      ShipmentMode.findById(req.body.parent, (err, parentMode) => {
        if (err) res.json({ success: false, error: err });
        parentMode.children.push(data._id);
        console.log("Parent Mode: ", parentMode);
        parentMode.save((err, parentMode) => {
          if (err) return res.json({ success: false, error: err });
          console.log("Updated Parent Mode: ", parentMode);
          return res.json({ success: true, data: data });
        });
        /* ShipmentMode.updateOne(
          parentMode._id,
          parentMode,
          { new: true, upsert: true },
          (err, updatedParentMode) => {
            console.log("Updated Parent Mode: ", updatedParentMode, "Error: ", err);
            if (err) return res.json({ success: false, error: err });
            console.log("Updated Parent Mode: ", updatedParentMode);
            return res.json({ success: true, data: data });
          }
        ); */
      });
    } else {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  });
});

shipmentModes.get("/:id", (req, res) => {
  ShipmentMode.findById(req.params.id, (err, mode) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: mode });
  });
});

shipmentModes.put("/:id", (req, res) => {
  req.body.updatedBy = req.user;
  ShipmentMode.findByIdAndUpdate(req.params.id, req.body, (err, mode) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: mode });
  });
});

shipmentModes.delete("/:id", (req, res) => {
  ShipmentMode.findByIdAndDelete(req.params.id, (err, mode) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: mode });
  });
});

module.exports = shipmentModes;
