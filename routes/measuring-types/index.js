const measuringTypes = require("express").Router();
const diffHistory = require("mongoose-diff-history/diffHistory");

const MeasuringType = require("../../models/MeasuringType");

measuringTypes.get("/", (req, res) => {
  MeasuringType.find()
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

measuringTypes.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  MeasuringType.create(req.body, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

measuringTypes.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  MeasuringType.find(queryData)
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

measuringTypes.get("/:id/histories", (req, res) => {
  MeasuringType.findById(req.params.id, (err, type) => {
    if (err) return res.json({ success: false, error: err });

    diffHistory.getHistories(
      "MeasuringType",
      type._id,
      ["name"],
      (err, histories) => {
        if (err) return res.json({ success: false, error: err });
        res.json({ success: true, data: histories });
      }
    );
  });
});

measuringTypes.get("/:id", (req, res) => {
  MeasuringType.findById(req.params.id, (err, type) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: type });
  });
});

measuringTypes.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  MeasuringType.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, __user: req.user.id, __reason: `${req.user.name} updated` },
    (err, type) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: type });
    }
  );
});

measuringTypes.delete("/:id", (req, res) => {
  MeasuringType.findByIdAndDelete(req.params.id, (err, type) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: type });
  });
});

module.exports = measuringTypes;
