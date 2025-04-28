import { ApiError } from "./ApiError.js";
import { ApiRes } from "./ApiRes.js";

export const globalErrorHandler = (error, req, res, next) => {
  console.error("Global Error:", error);
  if (!(error instanceof ApiError)) {
    res
      .status(500)
      .json(
        new ApiRes(
          500,
          null,
          false,
          error._message ?? error.message ?? "Internal Server Error"
        )
      );
  }
  res
    .status(error.statusCode)
    .json(
      new ApiRes(error.statusCode, error.data, error.success, error.message)
    );
};
