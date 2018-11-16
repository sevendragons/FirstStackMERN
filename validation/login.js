const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }
  // if (Validator.isLength(data.email, {min:0, max: 0})) {
  //   errors.email = 'Email field is required';
  // }
  else if (!Validator.isEmail(data.email)) {
    errors.email = 'Email login field is invalid';
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }
  if (!Validator.isLength(data.password, {min: 7, max: 30})) {
    errors.password = 'Password login must be between 7 and 30 characters';
  }

  return{
    errors,
    isValid: isEmpty(errors)
  };
};
