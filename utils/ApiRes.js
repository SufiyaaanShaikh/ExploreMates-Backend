export class ApiRes {
  constructor(
    statusCode = 200,
    data = null,
    success = true,
    message = "",
    otherData = null
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.success = success;
    this.message = message;
    this.otherData = otherData;
  }
}
