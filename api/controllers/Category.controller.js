import { handleError } from "../helpers/handleError.js";
import Category from "../models/category.model.js";
export const addCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return next(handleError(400, "Name and slug are required."));
    }

    const category = new Category({
      name,
      slug,
    });

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category added successfully.",
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};
export const showCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;
    const category = await Category.findById(categoryid);
    if (!category) {
      return next(handleError(404, "Data not found."));
    }
    res.status(200).json({
      category,
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const { categoryid } = req.params;
    const category = await Category.findByIdAndUpdate(
      categoryid,
      {
        name,
        slug,
      },
      { new: true }
    );

    if (!category) {
      return next(handleError(404, "Category not found."));
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const { categoryid } = req.params;
    await Category.findByIdAndDelete(categoryid);
    res.status(200).json({
      success: true,
      message: "Category Deleted successfully.",
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};
export const getAllCategory = async (req, res, next) => {
  try {
    const category = await Category.find().sort({ name: 1 }).lean().exec();
    res.status(200).json({
      category,
    });
  } catch (error) {
    return next(handleError(500, error.message));
  }
};
