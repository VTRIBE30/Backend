const Admin = require("../../models/admin");
const { generateHash } = require("../../utils/bcrypt");
const { validateSubAdminSignUp, validateUpdateSubAdmin, validateAdminId } = require("../../utils/validation");

exports.addSubAdmin = async (req, res, next) => {
  // console.log(req.admin);
  try {
    // Check if the requester is a super admin
    const requesterAdmin = await Admin.findById(req.admin.adminId);
    if (requesterAdmin.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        status: false,
        error: "Access denied. Only super-admin can add sub-admins.",
      });
    }

    const trimmedBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => {
        if (key === "email") {
          return [key, value?.trim().toLowerCase()];
        } else if (typeof value === "string") {
          return [key, value.trim()];
        }
        return [key, value];
      })
    );

    const { error } = validateSubAdminSignUp(trimmedBody);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const {
      email,
      password: req_password,
      firstName,
      lastName,
      phoneNumber,
      role,
      permissions,
    } = trimmedBody;
    const existingEmailUser = await Admin.findOne({ email });
    if (existingEmailUser) {
      return res.status(409).json({
        status: false,
        error: "User with this email already exists",
      });
    }

    const hashedPassword = generateHash(req_password);

    const newSubAdmin = new Admin({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      permissions,
    });

    await newSubAdmin.save();

    return res.status(201).json({
      status: true,
      message: "Sub-admin registered successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSubAdmin = async (req, res, next) => {
  try {
    // Check if the requester is a super admin
    const requesterAdmin = await Admin.findById(req.admin.adminId);
    if (requesterAdmin.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        status: false,
        error: "Access denied. Only super-admin can update sub-admins.",
      });
    }

    // Trim and validate the request body
    const trimmedBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => {
        if (key === "email") {
          return [key, value?.trim().toLowerCase()];
        } else if (typeof value === "string") {
          return [key, value.trim()];
        }
        return [key, value];
      })
    );

    const { error } = validateUpdateSubAdmin({ ...trimmedBody, ...req.params });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Find the sub-admin by ID
    const subAdminId = req.params.adminId;
    const subAdmin = await Admin.findById(subAdminId);

    if (!subAdmin) {
      return res.status(404).json({
        status: false,
        error: "Sub-admin not found",
      });
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
      permissions,
    } = trimmedBody;

    // Check if the new email is already taken by another admin
    if (email && email !== subAdmin.email) {
      const existingEmailUser = await Admin.findOne({ email });
      if (existingEmailUser) {
        return res.status(409).json({
          status: false,
          error: "User with this email already exists",
        });
      }
    }

    // Hash the password if it's being updated
    if (password) {
      subAdmin.password = generateHash(password);
    }

    // Update the sub-admin's details
    subAdmin.firstName = firstName || subAdmin.firstName;
    subAdmin.lastName = lastName || subAdmin.lastName;
    subAdmin.email = email || subAdmin.email;
    subAdmin.phoneNumber = phoneNumber || subAdmin.phoneNumber;
    subAdmin.role = role || subAdmin.role;
    subAdmin.permissions = permissions || subAdmin.permissions;

    // Save the updated sub-admin details
    await subAdmin.save();

    return res.status(200).json({
      status: true,
      message: "Sub-admin information updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.disableSubAdmin = async (req, res, next) => {
  try {
    // Check if the requester is a super admin
    const requesterAdmin = await Admin.findById(req.admin.adminId);
    if (requesterAdmin.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        status: false,
        error: "Access denied. Only super-admins can disable sub-admins.",
      });
    }

    const { error } = validateAdminId(req.params);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Find the sub-admin by ID
    const subAdminId = req.params.adminId;
    const subAdmin = await Admin.findById(subAdminId);

    if (!subAdmin) {
      return res.status(404).json({
        status: false,
        error: "Sub-admin not found",
      });
    }

    // Check if the sub-admin is already disabled
    if (subAdmin.isDisabled) {
      return res.status(400).json({
        status: false,
        message: "Sub-admin is already disabled.",
      });
    }

    // Disable the sub-admin
    subAdmin.isDisabled = true;
    await subAdmin.save();

    return res.status(200).json({
      status: true,
      message: "Sub-admin disabled successfully",
    });
  } catch (err) {
    next(err);
  }
};

