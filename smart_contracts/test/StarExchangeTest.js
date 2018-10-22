let StarExchange = artifacts.require("StarExchange");

contract("StarExchange", async (accounts) => {
  let instance;
  let star1Id;
  let star2Id;
  let owner = accounts[0];
  let rafa = accounts[1];
  let vitalik = accounts[2];
  let satoshi = accounts[3];
  let ra = 'ra_032.155';
  let dec = 'dec_121.874';
  let mag = 'mag_245.978';
  let price = web3.toWei(.01, "ether");

  beforeEach(async () => {
    instance = await StarExchange.new();
    await instance.createStar('First Star', 'Story Star', ra, dec, mag, { from: rafa });
    star1Id = 1;

    let id2 = await instance.createStar('Second Star', 'Story Star', 'ra_1234', dec, mag, { from: satoshi });
    star2Id = 2;
  });

 describe("putStarUpForSale", async () => {
   it("should put star for sale at specified price", async () => {
     await instance.putStarUpForSale(star1Id, price, { from: rafa });
     let sale = await instance.starsForSale(star1Id);

     assert.equal(sale, price);
   });

   it("should forbidden unauthorized account", async () => {
     let error = null;

     try {
      await instance.putStarUpForSale(star1Id, price, { from: vitalik });
     } catch(err) {
       error = err.message;
     }

     assert.equal(error, "VM Exception while processing transaction: revert you are not authorized to put this token for sale");
   });
 });

 describe("starsForSale", async () => {
  it("should return the stars price", async () => {
    await instance.putStarUpForSale(star1Id, price, { from: rafa });

    let starPrice = await instance.starsForSale(star1Id);

    assert.equal(price, starPrice);
  });
 });

 describe("buyStar", async () => {
   beforeEach( async () => {
     await instance.putStarUpForSale(star1Id, price, { from: rafa });
   });

   it("should allow vitalik to buy rafa star for requested price", async () => {
     await instance.buyStar(star1Id, {from: vitalik, value: price, gasPrice: 0});

     assert.equal(await instance.ownerOf(star1Id), vitalik);
   });

   it("should return overpaid amount to sender", async () => {
    let overpaidAmount = web3.toWei(.05, 'ether')
    const balanceBeforeTransaction = web3.eth.getBalance(vitalik);

    await instance.buyStar(star1Id, {from: vitalik, value: overpaidAmount, gasPrice: 0});

    const balanceAfterTransaction = web3.eth.getBalance(vitalik);

    assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), price);
   });
 });
});