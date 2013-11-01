function single(user) {
  if (!user) {
    throw new Error('User must be provided');
  }

  return user.getPublicValues();
}

function list(users) {

  var outputUsers = [];
  users.forEach(function(user) {
    outputUsers.push(single(user));
  });
  return outputUsers;
}

module.exports = {
  single: single,
  list: list
}
