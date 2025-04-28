import { ApiRes } from "../utils/ApiRes.js";

export const asyncWrapper = (reqHandler) => async (req, res, next) => {
  try {
    await reqHandler(req, res, next);
  } catch (error) {
    return res
      .status(error.statusCode || 500)  // Add default status code
      .json(new ApiRes(error.statusCode || 500, error.data, error.success, error.message));
    // Remove next(error) as it's unreachable and would cause errors if it was reached
  }
};

// export const asyncWrapper = (reqHandler) => async (req, res, next) => {
//   Promise.resolve(reqHandler(req, res, next)).catch(() => {
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   });
// };

export default asyncWrapper;
