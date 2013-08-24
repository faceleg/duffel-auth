function single(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status
  };
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