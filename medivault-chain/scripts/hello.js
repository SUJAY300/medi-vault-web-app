module.exports = async function (callback) {
  try {
    const HelloBlockchain = artifacts.require("HelloBlockchain");
    const hello = await HelloBlockchain.deployed();

    console.log("Initial message:", await hello.message());

    await hello.updateMessage("Blockchain via script!");
    console.log("Updated message:", await hello.message());

  } catch (err) {
    console.error(err);
  }
  callback();
};
