import cloudinary from "../config/cloudinary.js";
import { handleError } from "../helpers/handleError.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

export const getUser = async (req, res, next) => {
  try {
    const { userid } = req.params;
    const user = await User.findOne({ _id: userid }).lean().exec();

    if (!user) {
      return next(handleError(404, "User not found."));
    }

    res.status(200).json({
      success: true,
      message: "User data found.",
      user,
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data);
    const { userid } = req.params;

    const user = await User.findById(userid);

    if (!user) {
      return next(handleError(404, "User not found."));
    }

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.bio !== undefined) user.bio = data.bio;

    if (data.currentPassword || data.newPassword) {
      if (!data.currentPassword) {
        return next(handleError(400, "Current password is required to set a new password."));
      }
      if (!data.newPassword || data.newPassword.length < 8) {
        return next(handleError(400, "New password must be at least 8 characters."));
      }

      const isMatch = bcryptjs.compareSync(data.currentPassword, user.password || "");
      if (!isMatch) {
        return next(handleError(400, "Current password is incorrect."));
      }

      user.password = bcryptjs.hashSync(data.newPassword, 10);
    }

    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "raw-words-db",
          resource_type: "auto",
        });

        user.avatar = uploadResult.secure_url;
      } catch (cloudError) {
        return next(handleError(500, cloudError.message));
      }
    }

    await user.save();

    const newUser = user.toObject({ getters: true });
    delete newUser.password;
    res.status(200).json({
      success: true,
      message: "Data updated.",
      user: newUser,
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};

export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();

    const sanitizedUsers = users.map((user) => ({
      ...user,
      avatar: user.avatar || "",
    }));

    res.status(200).json({
      success: true,
      user: sanitizedUsers,
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(handleError(404, "User not found."));
    }

    res.status(200).json({
      success: true,
      message: "User deleted.",
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};
