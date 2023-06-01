//To check a password between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter

function CheckPassword(inputtxt) {
  var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  if (inputtxt.value.match(passw)) {
    return true;
  } else {
    return false;
  }
}

module.exports = { CheckPassword };