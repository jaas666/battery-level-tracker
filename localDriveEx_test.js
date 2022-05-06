let chai = require("chai");
let chaiHttp = require("chai-http");
let server = "http://localhost:3000";

//Assertion Style
chai.should();
chai.use(chaiHttp);

describe("API", () => {
  //Test get users
  describe("GET /users", () => {
    it("It should get all users", (done) => {
      chai
        .request(server)
        .get("/users")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.user.should.be.a("array");
          //response.body.user.length.should.be.eq(3);
          done();
        });
    });
  });
});
