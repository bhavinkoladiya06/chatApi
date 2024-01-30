const sessionInToUsermap = new Map();
console.log("🚀 ~ sessionInToUsermap:", sessionInToUsermap);

function setUser(id, user) {
  sessionInToUsermap.set(id, user);
}
function getUser(id) {
  return sessionInToUsermap.get(id);
}

module.exports = {
  setUser,
  getUser,
};