// * Function to create an error
const createError = (statusCode: Number = 500, errorMessage: string = 'Something went wrong') => {

  const err = new Error();
  err.status = statusCode;
  err.message = errorMessage;
  
  return err;
};

export {
  createError,
}